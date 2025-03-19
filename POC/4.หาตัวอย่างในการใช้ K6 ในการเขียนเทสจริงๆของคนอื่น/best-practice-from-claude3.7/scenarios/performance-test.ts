import { group, sleep } from 'k6';
import http from 'k6/http';
import { Options } from 'k6/options';
import { Trend } from 'k6/metrics';

import { currentEnv } from '../config/environments';
import { getAuthHeaders } from '../helpers/auth';
import { checkResponse } from '../helpers/checks';

// Custom metrics to capture detailed performance data
const apiLatency = new Trend('api_latency');
const databaseQueryTime = new Trend('database_query_time');
const renderTime = new Trend('render_time');
const networkTime = new Trend('network_time');
const ttfb = new Trend('time_to_first_byte');

// Configuration for performance test
export const options: Options = {
  // Consistent load to measure baseline performance
  scenarios: {
    // API performance testing
    api_performance: {
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
      exec: 'testApiPerformance',
    },
    // Frontend performance testing
    frontend_performance: {
      executor: 'constant-vus',
      vus: 20,
      duration: '5m',
      exec: 'testFrontendPerformance',
    },
  },
  thresholds: {
    'api_latency': ['p(95)<200', 'p(99)<500'],
    'database_query_time': ['p(95)<100'],
    'render_time': ['p(95)<300'],
    'network_time': ['p(95)<50'],
    'http_req_duration{name:critical_api}': ['p(95)<150'],
    'http_req_duration{name:home_page}': ['p(95)<1000'],
    'time_to_first_byte': ['p(95)<200', 'max<1000'],
  },
};

export function testApiPerformance() {
  const baseUrl = currentEnv.baseUrl;
  const authHeaders = getAuthHeaders(`perf_user_${__VU}@example.com`, 'perftest123');
  
  group('API Performance - Critical Path', function() {
    // Test critical API endpoints
    group('User Profile API', function() {
      const start = new Date().getTime();
      
      const profileRes = http.get(
        `${baseUrl}/api/user/profile`,
        { 
          headers: authHeaders,
          tags: { name: 'critical_api' }
        }
      );
      
      checkResponse(profileRes);
      
      // Detailed timing metrics - some from K6, some from response headers
      const end = new Date().getTime();
      apiLatency.add(end - start);
      
      // Database time (if the API reports it in headers)
      if (profileRes.headers['X-DB-Time']) {
        databaseQueryTime.add(parseFloat(profileRes.headers['X-DB-Time']));
      }
      
      sleep(1);
    });
    
    group('Search API', function() {
      const start = new Date().getTime();
      
      const searchRes = http.get(
        `${baseUrl}/api/search?q=performance&limit=20`,
        { 
          headers: authHeaders,
          tags: { name: 'search_api' }
        }
      );
      
      checkResponse(searchRes);
      
      const end = new Date().getTime();
      apiLatency.add(end - start);
      
      if (searchRes.headers['X-DB-Time']) {
        databaseQueryTime.add(parseFloat(searchRes.headers['X-DB-Time']));
      }
      
      sleep(1);
    });
    
    // Test batch processing performance
    group('Batch Processing', function() {
      const batchSize = 50;
      const items = Array(batchSize).fill().map((_, idx) => ({
        id: `item-${__VU}-${idx}`,
        action: 'process'
      }));
      
      const start = new Date().getTime();
      
      const batchRes = http.post(
        `${baseUrl}/api/batch`,
        JSON.stringify({ items }),
        { 
          headers: authHeaders,
          tags: { name: 'batch_api' }
        }
      );
      
      checkResponse(batchRes);
      
      const end = new Date().getTime();
      apiLatency.add(end - start);
      
      // Calculate per-item processing time
      apiLatency.add((end - start) / batchSize, { detail: 'per_item' });
      
      sleep(2);
    });
  });
}

export function testFrontendPerformance() {
  const baseUrl = currentEnv.baseUrl;
  
  group('Frontend Performance', function() {
    // Test home page load performance
    group('Home Page Load', function() {
      const start = new Date().getTime();
      
      const homeRes = http.get(
        `${baseUrl}/`,
        { tags: { name: 'home_page' } }
      );
      
      checkResponse(homeRes, 200, {
        'page contains title': (r) => r.body.includes('<title>')
      });
      
      // Extract various performance metrics
      const end = new Date().getTime();
      const total = end - start;
      
      // Time to First Byte
      ttfb.add(homeRes.timings.waiting);
      
      // Network time (connecting + TLS + sending + receiving)
      networkTime.add(
        homeRes.timings.connecting + 
        homeRes.timings.tls_handshaking +
        homeRes.timings.sending + 
        homeRes.timings.receiving
      );
      
      // Render time (if the server injects this in a response header)
      if (homeRes.headers['X-Render-Time']) {
        renderTime.add(parseFloat(homeRes.headers['X-Render-Time']));
      }
      
      sleep(2);
    });
    
    // Test product page performance
    group('Product Page', function() {
      const productId = Math.floor(Math.random() * 1000) + 1;
      const start = new Date().getTime();
      
      const productRes = http.get(
        `${baseUrl}/products/${productId}`,
        { tags: { name: 'product_page' } }
      );
      
      checkResponse(productRes);
      
      ttfb.add(productRes.timings.waiting);
      
      if (productRes.headers['X-Render-Time']) {
        renderTime.add(parseFloat(productRes.headers['X-Render-Time']));
      }
      
      sleep(1);
    });
  });
}

export default function() {
  // This default function will run if we don't specify a scenario
  if (Math.random() > 0.3) {
    testApiPerformance();
  } else {
    testFrontendPerformance();
  }
}
