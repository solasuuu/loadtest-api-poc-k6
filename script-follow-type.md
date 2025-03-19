# Load Testing Script Examples with k6

This document provides script examples for different types of performance testing using k6 with TypeScript.

## 1. Load Testing

**Purpose**: Test how the system performs under expected normal usage with increasing numbers of users.

**Required Test Data**:

- Target user count (VUs)
- Ramp-up period
- Test duration
- Endpoint(s) to test

```typescript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp-up to 100 users over 2 minutes
    { duration: '5m', target: 100 }, // Stay at 100 users for 5 minutes
    { duration: '2m', target: 0 },   // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p95<500'], // 95% of requests must complete below 500ms
    'http_req_duration{staticAsset:yes}': ['p95<100'], // 95% of static asset requests must complete below 100ms
  },
};

export default function () {
  const res = http.get('https://api.example.com/users');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 400ms': (r) => r.timings.duration < 400,
  });
  
  sleep(1);
}
```

## 2. Stress Testing

**Purpose**: Test how the system performs under extreme conditions, beyond expected peak load.

**Required Test Data**:

- Maximum VU count (much higher than normal)
- Short ramp-up period
- Test duration
- Error thresholds

```typescript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Normal load
    { duration: '5m', target: 1000 },  // Ramp to stress level (10x normal)
    { duration: '2m', target: 2000 },  // Peak stress
    { duration: '5m', target: 0 },     // Recovery
  ],
  thresholds: {
    http_req_duration: ['p95<2000'], // Less strict threshold for stress test
    http_req_failed: ['rate<0.1'],   // Error rate under 10%
  },
};

export default function () {
  const res = http.get('https://api.example.com/resource');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  // Shorter sleep to increase load intensity
  sleep(0.3);
}
```

## 3. Endurance Testing (Soak Testing)

**Purpose**: Test how the system performs over an extended period to identify issues like memory leaks.

**Required Test Data**:

- Moderate VU count
- Extended test duration (hours)
- Memory usage metrics

```typescript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10m', target: 100 },  // Ramp-up
    { duration: '8h', target: 100 },   // Stay at target for 8 hours
    { duration: '10m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p95<500'],
    http_req_failed: ['rate<0.01'],    // Stricter error rate for endurance
  },
};

export default function () {
  const responses = http.batch([
    ['GET', 'https://api.example.com/users'],
    ['GET', 'https://api.example.com/products'],
    ['GET', 'https://api.example.com/orders'],
  ]);
  
  // Check each response
  responses.forEach((res, index) => {
    check(res, {
      'status is 200': (r) => r.status === 200,
    });
  });
  
  sleep(3); // Longer sleep to represent realistic user behavior
}
```

## 4. Spike Testing

**Purpose**: Test how the system handles sudden, large increases in load.

**Required Test Data**:

- Baseline VU count
- Peak VU count (very high)
- Very short ramp-up period
- Recovery period

```typescript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },    // Normal load
    { duration: '10s', target: 1000 }, // Spike to 1000 users in just 10 seconds
    { duration: '3m', target: 1000 },  // Stay at spike level
    { duration: '1m', target: 50 },    // Scale back to normal
    { duration: '3m', target: 50 },    // Normal load again to see recovery
  ],
  thresholds: {
    http_req_failed: ['rate<0.15'], // Allow higher error rate during spike
  },
};

export default function () {
  const res = http.get('https://api.example.com/critical-path');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
  });
  
  sleep(0.5);
}
```

## 5. Scalability Testing

**Purpose**: Test how well the system scales with increasing load by gradually adding users.

**Required Test Data**:

- Multiple increasing load levels
- Performance metrics at each level
- Enough duration at each level to measure steady state

```typescript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

// Custom metrics to track performance at different load levels
const responseTimeByLevel = new Trend('response_time_by_level');

export const options = {
  stages: [
    { duration: '3m', target: 100 },   // Level 1
    { duration: '5m', target: 100 },
    { duration: '3m', target: 200 },   // Level 2
    { duration: '5m', target: 200 },
    { duration: '3m', target: 300 },   // Level 3
    { duration: '5m', target: 300 },
    { duration: '3m', target: 400 },   // Level 4
    { duration: '5m', target: 400 },
    { duration: '3m', target: 0 },     // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p95<1000'], // Overall performance threshold
  },
};

export default function () {
  const startTime = new Date().getTime();
  
  // Get current level based on VU count
  let currentLevel = 1;
  if (__VU > 100) currentLevel = 2;
  if (__VU > 200) currentLevel = 3;
  if (__VU > 300) currentLevel = 4;
  
  const res = http.get('https://api.example.com/scalability-test');
  
  // Record response time for current load level
  responseTimeByLevel.add(res.timings.duration, { level: currentLevel });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  sleep(1);
}
```

## 6. Concurrency Testing

**Purpose**: Test how the system handles multiple users accessing or modifying the same resource simultaneously.

**Required Test Data**:

- High VU count
- Shared resource being accessed/modified
- Proper assertions to verify data integrity

```typescript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const options = {
  vus: 100,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p95<1000'],
    http_req_failed: ['rate<0.01'],  // Strict on errors for concurrency issues
  },
};

export default function () {
  // All VUs attempting to access the same resource
  const resourceId = '12345';
  
  // Generate unique data for this VU
  const itemData = {
    id: uuidv4(),
    vu: __VU,
    timestamp: new Date().toISOString(),
  };
  
  // Try to update the same resource concurrently
  const res = http.put(`https://api.example.com/resources/${resourceId}`, JSON.stringify(itemData), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'resource updated': (r) => JSON.parse(r.body).updated === true,
    'no concurrency errors': (r) => !r.body.includes('conflict'),
  });
  
  // Verify the update was successful
  const checkRes = http.get(`https://api.example.com/resources/${resourceId}`);
  
  check(checkRes, {
    'can retrieve updated resource': (r) => r.status === 200,
  });
  
  sleep(0.5);
}
```

## 7. Performance Testing

**Purpose**: Test overall system response times, throughput, and resource utilization under a specific load.

**Required Test Data**:

- Representative user count
- Typical user flows
- Specific performance thresholds

```typescript
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend } from 'k6/metrics';

// Custom metrics
const loginTrend = new Trend('login_time');
const searchTrend = new Trend('search_time');
const checkoutTrend = new Trend('checkout_time');

export const options = {
  vus: 50,  // Moderate, realistic load
  duration: '5m',
  thresholds: {
    'login_time': ['p95<500'],     // Login must be fast
    'search_time': ['p95<800'],    // Search has more time allowance
    'checkout_time': ['p95<1000'], // Checkout can be slightly slower
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const baseUrl = 'https://api.example.com';
  let sessionToken;
  
  group('Login Flow', function () {
    const start = new Date();
    const loginRes = http.post(`${baseUrl}/auth/login`, JSON.stringify({
      username: `user_${__VU}@example.com`,
      password: 'testPassword123',
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    loginTrend.add(new Date() - start);
    
    check(loginRes, {
      'login successful': (r) => r.status === 200,
    });
    
    sessionToken = loginRes.json('token');
  });
  
  sleep(1);
  
  group('Search Products', function () {
    const start = new Date();
    const searchRes = http.get(`${baseUrl}/products?query=popular&limit=10`, {
      headers: { 'Authorization': `Bearer ${sessionToken}` },
    });
    
    searchTrend.add(new Date() - start);
    
    check(searchRes, {
      'search successful': (r) => r.status === 200,
      'products returned': (r) => JSON.parse(r.body).products.length > 0,
    });
  });
  
  sleep(2);
  
  group('Checkout Process', function () {
    const start = new Date();
    const checkoutRes = http.post(`${baseUrl}/orders/checkout`, JSON.stringify({
      productId: 'prod-123',
      quantity: 1,
      paymentMethod: 'credit_card',
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
    });
    
    checkoutTrend.add(new Date() - start);
    
    check(checkoutRes, {
      'checkout successful': (r) => r.status === 200,
      'order created': (r) => JSON.parse(r.body).orderId !== undefined,
    });
  });
  
  sleep(3);
}
```

## 8. Smoke Testing

**Purpose**: Quick test to verify the API endpoints are operational before more intensive testing.

**Required Test Data**:

- List of critical endpoints
- Minimal number of VUs

```typescript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate=0'], // No errors allowed in smoke test
  },
};

export default function () {
  const baseUrl = 'https://api.example.com';
  
  // Check critical endpoints
  const endpoints = [
    '/health',
    '/users',
    '/products',
    '/orders',
    '/auth/status',
  ];
  
  for (const endpoint of endpoints) {
    const res = http.get(`${baseUrl}${endpoint}`);
    
    check(res, {
      [`${endpoint} returns 200`]: (r) => r.status === 200,
      [`${endpoint} responds quickly`]: (r) => r.timings.duration < 500,
    });
    
    sleep(1);
  }
}
```

## 9. Failover Testing

**Purpose**: Test the system's ability to handle component failures and switch to backups.

**Required Test Data**:

- Details of failover mechanism
- Methods to trigger failure
- Recovery expectation

```typescript
import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Normal load
    { duration: '5m', target: 50 },   // Steady load during failover
    { duration: '2m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.10'],   // Allow some errors during failover
  },
};

// Simulate external trigger for failover (in reality this would be triggered outside k6)
const FAILOVER_START_TIME = 120; // seconds into the test
const FAILOVER_DURATION = 60;    // seconds

export default function () {
  const timeInTest = exec.scenario.iterationInTest / 1000;
  let endpoint = 'https://api.example.com';
  
  // Check if we're in the failover window
  if (timeInTest > FAILOVER_START_TIME && timeInTest < (FAILOVER_START_TIME + FAILOVER_DURATION)) {
    console.log('Testing during simulated failover period');
  }
  
  const res = http.get(`${endpoint}/status`);
  
  check(res, {
    'still responds during failover': (r) => r.status < 500, // May return 200-499 but should not be server error
    'recovery time acceptable': (r) => r.timings.duration < 2000, // Allow higher latency during failover
  });
  
  sleep(1);
}
```

## 10. Capacity Testing

**Purpose**: Determine maximum capacity before performance degrades.

**Required Test Data**:

- Incrementally increasing load levels
- Clear performance thresholds
- Metrics to determine saturation points

```typescript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const responseTimeByVU = new Trend('response_time_by_vu_count');

export const options = {
  stages: [
    // Incrementally increase load to find breaking point
    { duration: '2m', target: 100 },
    { duration: '3m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '3m', target: 200 },
    { duration: '2m', target: 300 },
    { duration: '3m', target: 300 },
    { duration: '2m', target: 400 },
    { duration: '3m', target: 400 },
    { duration: '2m', target: 500 },
    { duration: '3m', target: 500 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  const res = http.get('https://api.example.com/capacity-test-endpoint');
  
  // Record response time with current VU count
  responseTimeByVU.add(res.timings.duration, { vus: __VU });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  // Track error rate as that's a key capacity indicator
  if (res.status >= 400) {
    console.warn(`Error detected at VU level: ${__VU}, status: ${res.status}`);
  }
  
  sleep(1);
}
```

## Best Practices for k6 API Load Testing

1. **Start with Smoke Tests**: Always begin with smoke tests to make sure your API is working before running intensive tests.
2. **Set Realistic Thresholds**: Define appropriate thresholds based on SLAs or performance goals.
3. **Monitor Resource Usage**: Watch server metrics alongside k6 metrics to identify bottlenecks.
4. **Use Proper Authentication**: Ensure your test scripts handle authentication properly if testing secured endpoints.
5. **Data Correlation**: Extract values from responses and use them in subsequent requests when needed.
6. **Parameterize Test Data**: Use CSV files or other external data sources for large test data sets.
7. **Gradually Increase Load**: Don't jump straight to maximum load; gradually increase to identify exact breaking points.
8. **Mind Local Resources**: Remember that k6 itself consumes resources, which can affect test results when run locally.
