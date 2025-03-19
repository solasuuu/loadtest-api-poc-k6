import { group, sleep } from 'k6';
import http from 'k6/http';
import { Options } from 'k6/options';
import { Gauge } from 'k6/metrics';

import { currentEnv } from '../config/environments';
import { getAuthHeaders } from '../helpers/auth';
import { checkResponse } from '../helpers/checks';

// Custom metrics
const serverRecoveryTime = new Gauge('server_recovery_time');

// Configuration for spike test
export const options: Options = {
  stages: [
    // Initial baseline load
    { duration: '1m', target: 50 },
    // Maintain baseline
    { duration: '2m', target: 50 },
    // Sharp spike to simulate sudden traffic surge
    { duration: '10s', target: 500 },
    // Maintain spike for short period
    { duration: '1m', target: 500 },
    // Quick drop back to baseline to observe recovery
    { duration: '10s', target: 50 },
    // Maintain baseline and observe system recovery
    { duration: '5m', target: 50 },
    // Ramp down
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.1'], // Allow up to 10% failures during spike
    http_req_duration: ['p(95)<2000'], // 95% of requests should be under 2s
    'http_req_duration{name:critical_operation}': ['p(99)<3000'], // Critical ops more lenient
  },
};

export default function() {
  const baseUrl = currentEnv.baseUrl;
  const startTime = new Date().getTime();
  let recoveryPhase = false;
  
  // Check if we're in the recovery phase (after the spike)
  // This would be after the 4m10s mark in our test
  if (__ITER > 0 && __VU <= 50 && startTime > (__ENV.TEST_START_TIME || 0) + 250000) {
    recoveryPhase = true;
  }
  
  group('Critical System Operations', function() {
    // Authentication
    const username = `spike_${__VU}@example.com`;
    const password = 'spiketestpass';
    const authHeaders = getAuthHeaders(username, password);
    
    // Simulate critical business operation (e.g., payment processing)
    group('Critical Operation', function() {
      const payload = JSON.stringify({
        transactionId: `tx-${__VU}-${__ITER}-${Date.now()}`,
        amount: Math.floor(Math.random() * 1000) + 1,
        currency: 'USD',
        method: 'credit_card'
      });
      
      const startOpTime = new Date().getTime();
      
      const criticalRes = http.post(
        `${baseUrl}/transactions/process`,
        payload,
        { 
          headers: authHeaders,
          tags: { name: 'critical_operation' },
          timeout: '10s', // Longer timeout for critical ops
        }
      );
      
      checkResponse(criticalRes, 200);
      
      // Measure operation time
      const opTime = new Date().getTime() - startOpTime;
      
      // If we're in recovery phase, measure how long the system takes to normalize
      if (recoveryPhase && opTime > 100) {
        serverRecoveryTime.add(opTime);
      }
      
      // Minimal sleep between critical operations
      sleep(0.5);
    });
  });
  
  // Secondary operations that users might do
  if (Math.random() > 0.7) {
    group('Secondary Operations', function() {
      const secondaryRes = http.get(
        `${baseUrl}/status`,
        { tags: { name: 'status_check' } }
      );
      
      checkResponse(secondaryRes);
      
      // Variable sleep to distribute load
      sleep(Math.random() * 2);
    });
  }
}
