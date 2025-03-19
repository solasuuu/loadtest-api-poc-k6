import { group, sleep } from 'k6';
import http from 'k6/http';
import { Options } from 'k6/options';
import { Counter, Rate, Trend } from 'k6/metrics';

import { currentEnv } from '../config/environments';
import { getAuthHeaders } from '../helpers/auth';
import { checkResponse } from '../helpers/checks';

// Custom metrics for scalability assessment
const throughputCounter = new Counter('operations_throughput');
const responseTimeByLoad = new Trend('response_time_by_load');
const errorRateByLoad = new Rate('error_rate_by_load');

// Configuration for scalability test
export const options: Options = {
  // Step-load pattern to test how system scales with increasing load
  stages: [
    // Baseline
    { duration: '1m', target: 50 },
    { duration: '4m', target: 50 },
    // Test scalability by adding load in steps
    { duration: '1m', target: 100 },
    { duration: '4m', target: 100 },
    { duration: '1m', target: 200 },
    { duration: '4m', target: 200 },
    { duration: '1m', target: 400 },
    { duration: '4m', target: 400 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1500'], 
    'operations_throughput': ['value>100'],
  },
};

export default function() {
  const baseUrl = currentEnv.baseUrl;
  const currStage = getCurrentLoadStage();
  
  group('API Scalability Test', function() {
    const username = `user_${__VU}@example.com`;
    const password = 'password';
    const authHeaders = getAuthHeaders(username, password);
    
    group('Data Query', function() {
      // Simulate database query operation
      const queryParams = {
        userId: __VU,
        limit: 50,
        includeDetails: true
      };
      
      const startTime = new Date().getTime();
      
      const queryRes = http.get(
        `${baseUrl}/data`,
        {
          params: queryParams,
          headers: authHeaders,
          tags: { name: 'data_query', stage: currStage }
        }
      );
      
      const success = checkResponse(queryRes);
      
      // Record metrics with load stage context
      const duration = new Date().getTime() - startTime;
      responseTimeByLoad.add(duration, { stage: currStage });
      errorRateByLoad.add(!success, { stage: currStage });
      
      if (success) {
        throughputCounter.add(1);
      }
      
      sleep(1);
    });
    
    group('Data Processing', function() {
      // Simulate data processing operation
      const payload = JSON.stringify({
        action: 'process',
        items: Array(10).fill().map((_, i) => ({
          id: `item-${__VU}-${i}`,
          quantity: Math.floor(Math.random() * 10) + 1
        }))
      });
      
      const startTime = new Date().getTime();
      
      const processRes = http.post(
        `${baseUrl}/process`,
        payload,
        {
          headers: authHeaders,
          tags: { name: 'data_processing', stage: currStage }
        }
      );
      
      const success = checkResponse(processRes);
      
      // Record metrics with load stage context
      const duration = new Date().getTime() - startTime;
      responseTimeByLoad.add(duration, { stage: currStage });
      errorRateByLoad.add(!success, { stage: currStage });
      
      if (success) {
        throughputCounter.add(1);
      }
      
      sleep(Math.random() * 2 + 1);
    });
  });
}

// Helper to identify which load stage we're in
function getCurrentLoadStage(): string {
  const elapsedTime = (__ENV.TEST_START_TIME) 
    ? (new Date().getTime() - parseInt(__ENV.TEST_START_TIME)) / 1000
    : __ITER;
    
  if (elapsedTime < 300) return 'baseline_50';
  if (elapsedTime < 600) return 'load_100';
  if (elapsedTime < 900) return 'load_200';
  return 'load_400';
}
