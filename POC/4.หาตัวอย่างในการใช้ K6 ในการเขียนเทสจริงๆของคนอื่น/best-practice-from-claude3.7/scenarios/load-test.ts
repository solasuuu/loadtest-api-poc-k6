import { group, sleep } from 'k6';
import http from 'k6/http';
import { Options } from 'k6/options';
import { Trend } from 'k6/metrics';

import { currentEnv } from '../config/environments';
import { loadTestThresholds } from '../config/thresholds';
import { getAuthHeaders } from '../helpers/auth';
import { checkResponse } from '../helpers/checks';
import { randomSleep } from '../helpers/utils';

// Custom metrics
const orderProcessingTime = new Trend('order_processing_time');

// Configuration for load test
export const options: Options = {
  stages: [
    // Ramp up to 100 users over 3 minutes
    { duration: '3m', target: 100 },
    // Stay at 100 users for 5 minutes (steady state)
    { duration: '5m', target: 100 },
    // Ramp down to 0 users over 2 minutes
    { duration: '2m', target: 0 },
  ],
  thresholds: loadTestThresholds,
  // Separate the test run into scenarios
  scenarios: {
    // Model regular website traffic
    browsing: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '3m', target: 70 },
        { duration: '5m', target: 70 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
      exec: 'browseProducts',
    },
    // Model checkout processes
    purchasing: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '3m', target: 30 },
        { duration: '5m', target: 30 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
      exec: 'completePurchase',
    },
  },
};

// Test scenario functions
export function browseProducts() {
  const baseUrl = currentEnv.baseUrl;
  
  group('Homepage', function() {
    const homeRes = http.get(`${baseUrl}/`, { tags: { name: 'homepage' } });
    checkResponse(homeRes);
    randomSleep(1, 3);
  });

  group('Product Listings', function() {
    const categoryId = Math.floor(Math.random() * 5) + 1;
    const productsRes = http.get(
      `${baseUrl}/products?category=${categoryId}`,
      { tags: { name: 'products_list' } }
    );
    checkResponse(productsRes);
    randomSleep(2, 5);
  });

  group('Product Details', function() {
    const productId = Math.floor(Math.random() * 100) + 1;
    const productRes = http.get(
      `${baseUrl}/products/${productId}`,
      { tags: { name: 'product_detail' } }
    );
    checkResponse(productRes);
    randomSleep(3, 8);
  });
}

export function completePurchase() {
  const baseUrl = currentEnv.baseUrl;
  const username = `user_${__VU}@example.com`;
  const password = 'testpassword';
  const authHeaders = getAuthHeaders(username, password);
  
  group('Login', function() {
    // Login happens in getAuthHeaders
    randomSleep(1, 2);
  });

  group('Add to Cart', function() {
    const productId = Math.floor(Math.random() * 100) + 1;
    const quantity = Math.floor(Math.random() * 3) + 1;
    
    const cartPayload = JSON.stringify({
      productId: productId,
      quantity: quantity
    });
    
    const cartRes = http.post(
      `${baseUrl}/cart/items`,
      cartPayload,
      { headers: authHeaders, tags: { name: 'add_to_cart' } }
    );
    
    checkResponse(cartRes, 201);
    randomSleep(1, 3);
  });

  group('Checkout', function() {
    const startTime = new Date().getTime();
    
    // Get cart contents
    const cartRes = http.get(
      `${baseUrl}/cart`,
      { headers: authHeaders, tags: { name: 'view_cart' } }
    );
    checkResponse(cartRes);
    
    // Place order
    const orderPayload = JSON.stringify({
      paymentMethod: 'credit_card',
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        zipCode: '12345',
      }
    });
    
    const orderRes = http.post(
      `${baseUrl}/orders`,
      orderPayload,
      { headers: authHeaders, tags: { name: 'place_order' } }
    );
    
    checkResponse(orderRes, 201);
    
    // Record how long the entire checkout process took
    const endTime = new Date().getTime();
    orderProcessingTime.add(endTime - startTime);
    
    randomSleep(3, 5);
  });
}

export default function() {
  // This function is needed if you run the test without scenarios
  // It will execute a mix of both scenarios
  if (Math.random() < 0.7) {
    browseProducts();
  } else {
    completePurchase();
  }
}
