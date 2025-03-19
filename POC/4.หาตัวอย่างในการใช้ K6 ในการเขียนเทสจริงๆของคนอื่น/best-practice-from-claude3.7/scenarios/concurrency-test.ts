import { group, sleep } from 'k6';
import http from 'k6/http';
import { Options } from 'k6/options';
import { Counter } from 'k6/metrics';
import exec from 'k6/execution';

import { currentEnv } from '../config/environments';
import { getAuthHeaders } from '../helpers/auth';
import { checkResponse } from '../helpers/checks';
import { generateRandomString } from '../helpers/utils';

// Custom metrics for concurrency issues
const concurrencyErrors = new Counter('concurrency_errors');
const racingWins = new Counter('racing_wins');

// Configuration for concurrency test
export const options: Options = {
  // Use constant VUs for a predictable concurrency level
  scenarios: {
    // Scenario that tests a shared resource
    sharedResource: {
      executor: 'constant-arrival-rate',
      rate: 50,              // 50 iterations per timeUnit
      timeUnit: '1s',        // 1 second
      duration: '3m',
      preAllocatedVUs: 50,
      maxVUs: 200,
    },
    // Scenario that tests race conditions
    raceCondition: {
      executor: 'constant-vus',
      vus: 100,
      duration: '3m',
      exec: 'testRaceCondition',
    }
  },
  thresholds: {
    'concurrency_errors': ['count<10'],
    'http_req_failed': ['rate<0.05'],
  },
};

export default function() {
  // This is the main test function for the default exec
  testSharedResource();
}

export function testSharedResource() {
  const baseUrl = currentEnv.baseUrl;
  const username = `user_${__VU}@example.com`;
  const password = 'testpassword';
  const authHeaders = getAuthHeaders(username, password);
  
  group('Shared Resource Access', function() {
    // Generate a random resource ID - for this test we want multiple users
    // to access the same resources, so we use a small range
    const resourceId = Math.floor(Math.random() * 10) + 1;
    
    // First, try to access a shared resource
    const getRes = http.get(
      `${baseUrl}/resources/${resourceId}`,
      { 
        headers: authHeaders,
        tags: { name: 'get_resource' }
      }
    );
    
    checkResponse(getRes);
    
    // Parse resource data
    let resourceData;
    try {
      resourceData = JSON.parse(getRes.body);
    } catch (e) {
      console.log(`Failed to parse resource data: ${getRes.body}`);
      concurrencyErrors.add(1);
      return;
    }
    
    // Simulate resource modification
    const updatedData = JSON.stringify({
      ...resourceData,
      lastUpdated: new Date().toISOString(),
      modifiedBy: `VU-${__VU}`,
      value: generateRandomString(10),
    });
    
    // Small sleep to increase chance of concurrent modifications
    sleep(0.1);
    
    // Update the shared resource
    const updateRes = http.put(
      `${baseUrl}/resources/${resourceId}`,
      updatedData,
      { 
        headers: authHeaders,
        tags: { name: 'update_resource' }
      }
    );
    
    // Check for version conflict or other concurrency errors
    if (updateRes.status === 409) {
      console.log(`Concurrency conflict for VU ${__VU} on resource ${resourceId}`);
      concurrencyErrors.add(1);
    } else if (!checkResponse(updateRes)) {
      concurrencyErrors.add(1);
    }
    
    sleep(Math.random() * 0.5); // Short random sleep
  });
}

export function testRaceCondition() {
  const baseUrl = currentEnv.baseUrl;
  const authHeaders = getAuthHeaders(`race_${__VU}@example.com`, 'racepass');
  
  group('Race Condition Test', function() {
    // Use a shared resource ID for all VUs to maximize race conditions
    const sharedId = 'limited-item';

    // Get current inventory count
    const inventoryRes = http.get(
      `${baseUrl}/inventory/${sharedId}`,
      { 
        headers: authHeaders,
        tags: { name: 'check_inventory' }
      }
    );
    
    checkResponse(inventoryRes);
    let inventory;
    try {
      inventory = JSON.parse(inventoryRes.body);
    } catch (e) {
      concurrencyErrors.add(1);
      return;
    }
    
    // If item is available, try to reserve it
    if (inventory.availableQuantity > 0) {
      // Introduce tiny random delay to create more realistic race conditions
      sleep(Math.random() * 0.05);
      
      const reservePayload = JSON.stringify({
        itemId: sharedId,
        quantity: 1,
        userId: `user-${__VU}`
      });
      
      const reserveRes = http.post(
        `${baseUrl}/inventory/reserve`,
        reservePayload,
        { 
          headers: authHeaders,
          tags: { name: 'reserve_item' }
        }
      );
      
      // Check for success or if someone else got it first
      if (reserveRes.status === 200) {
        racingWins.add(1);
      } else if (reserveRes.status === 409) {
        // 409 Conflict is expected in race conditions
        // This is a normal outcome, not an error
      } else {
        concurrencyErrors.add(1);
      }
    }
    
    sleep(Math.random() + 0.5);
  });
}
