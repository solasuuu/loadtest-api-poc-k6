import { group, sleep } from 'k6';
import http from 'k6/http';
import { Options } from 'k6/options';
import { Rate } from 'k6/metrics';

import { currentEnv } from '../config/environments';
import { stressTestThresholds } from '../config/thresholds';
import { getAuthHeaders } from '../helpers/auth';
import { checkResponse } from '../helpers/checks';

// Custom metrics
const errorRate = new Rate('business_error_rate');

// Configuration for stress test
export const options: Options = {
  stages: [
    // Ramp up to normal load
    { duration: '2m', target: 100 },
    // Hold at normal load
    { duration: '5m', target: 100 },
    // Stress phase: ramp up to breaking point
    { duration: '5m', target: 500 },
    // Extreme stress phase
    { duration: '3m', target: 1000 },
    // Recovery phase
    { duration: '5m', target: 100 },
    // Scale back down
    { duration: '2m', target: 0 }
  ],
  thresholds: stressTestThresholds,
};

export default function() {
  const baseUrl = currentEnv.baseUrl;
  const username = `user_${__VU}@example.com`;
  const password = 'testpassword';
  
  group('API heavy operations', function() {
    // Get authentication for API calls
    const authHeaders = getAuthHeaders(username, password);
    
    // Simulate a complex search operation
    group('Complex Search', function() {
      const searchParams = {
        query: 'test product',
        filters: JSON.stringify({
          price: { min: 10, max: 100 },
          categories: [1, 3, 5],
          rating: 4
        }),
        sort: 'relevance',
        page: 1,
        limit: 50
      };
      
      const searchRes = http.get(
        `${baseUrl}/products/search`, 
        { 
          params: searchParams,
          headers: authHeaders,
          tags: { name: 'complex_search' } 
        }
      );
      
      checkResponse(searchRes);
      
      // Record business errors (successful HTTP but business logic errors)
      const responseBody = JSON.parse(searchRes.body);
      if (responseBody.results && responseBody.results.length === 0) {
        errorRate.add(true); // Count as business error
      } else {
        errorRate.add(false);
      }
      
      sleep(1);
    });
    
    // Simulate an analytics dashboard data fetch
    group('Dashboard Data', function() {
      const dashboardRes = http.get(
        `${baseUrl}/dashboard/metrics`, 
        { 
          headers: authHeaders,
          tags: { name: 'dashboard_metrics' } 
        }
      );
      
      checkResponse(dashboardRes);
      sleep(1);
    });
    
    // Simulate a heavy data processing operation
    group('Data Processing', function() {
      const dataPayload = JSON.stringify({
        reportType: 'sales',
        dateRange: {
          start: '2023-01-01',
          end: '2023-12-31'
        },
        groupBy: ['product', 'region', 'month'],
        calculations: ['sum', 'average', 'percentChange']
      });
      
      const processingRes = http.post(
        `${baseUrl}/reports/generate`, 
        dataPayload,
        { 
          headers: authHeaders,
          tags: { name: 'report_generation' } 
        }
      );
      
      // Report generation can sometimes return 202 if async
      checkResponse(processingRes, processingRes.status === 202 ? 202 : 200);
      
      sleep(2);
    });
  });
  
  // Random sleep to make the test more realistic
  sleep(Math.random() * 2 + 1);
}
