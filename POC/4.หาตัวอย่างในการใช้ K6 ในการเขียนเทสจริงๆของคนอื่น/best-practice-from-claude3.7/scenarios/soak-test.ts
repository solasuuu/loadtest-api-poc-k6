import { group, sleep } from 'k6';
import http from 'k6/http';
import { Options } from 'k6/options';
import { Counter } from 'k6/metrics';

import { currentEnv } from '../config/environments';
import { soakTestThresholds } from '../config/thresholds';
import { getAuthHeaders } from '../helpers/auth';
import { checkResponse } from '../helpers/checks';
import { logStats } from '../helpers/utils';

// Custom metrics
const memoryLeakIndicator = new Counter('potential_memory_leak');

// Configuration for soak test (endurance test)
export const options: Options = {
  stages: [
    // Ramp up to target load
    { duration: '5m', target: 50 },
    // Stay at target load for a long time - usually hours in real soak tests
    // We're using 30m here, but in real tests this would be much longer (12h+)
    { duration: '30m', target: 50 },
    // Ramp down
    { duration: '5m', target: 0 },
  ],
  thresholds: soakTestThresholds,
};

export default function() {
  const baseUrl = currentEnv.baseUrl;
  logStats(); // Log data at intervals
  
  // Track test progress for monitoring potential degradation
  const testStartTime = new Date().getTime();
  
  group('Session operations', function() {
    // Simulate user login and session activities
    const username = `soaktest_${__VU}@example.com`;
    const password = 'soakTestPassword';
    const authHeaders = getAuthHeaders(username, password);
    
    group('Profile Activities', function() {
      // Get user profile
      const profileRes = http.get(
        `${baseUrl}/user/profile`,
        { 
          headers: authHeaders,
          tags: { name: 'get_user_profile' }
        }
      );
      
      const profileStatus = checkResponse(profileRes);
      
      // Track increasing response times over time which might indicate memory leaks
      if (profileRes.timings.waiting > 500) {
        memoryLeakIndicator.add(1);
      }
      
      sleep(1);
      
      // Update user preferences
      const prefsData = JSON.stringify({
        notifications: Math.random() > 0.5,
        theme: Math.random() > 0.5 ? 'dark' : 'light',
        language: ['en', 'es', 'fr', 'de'][Math.floor(Math.random() * 4)]
      });
      
      const prefsRes = http.put(
        `${baseUrl}/user/preferences`,
        prefsData,
        { 
          headers: authHeaders,
          tags: { name: 'update_preferences' }
        }
      );
      
      checkResponse(prefsRes);
      
      sleep(2);
    });
    
    group('Content Browsing', function() {
      // Browse content items - simulating user reading articles, viewing products, etc.
      for (let i = 0; i < 3; i++) {
        const contentId = Math.floor(Math.random() * 1000) + 1;
        const contentRes = http.get(
          `${baseUrl}/content/${contentId}`,
          { 
            headers: authHeaders,
            tags: { name: 'view_content' }
          }
        );
        
        checkResponse(contentRes);
        
        // Simulate user engaging with the content (reading time)
        sleep(Math.random() * 5 + 2);
        
        // Occasionally add interaction with the content
        if (Math.random() > 0.7) {
          const interactionData = JSON.stringify({
            contentId: contentId,
            action: Math.random() > 0.5 ? 'like' : 'bookmark',
            timestamp: new Date().toISOString()
          });
          
          const interactRes = http.post(
            `${baseUrl}/content/${contentId}/interactions`,
            interactionData,
            { 
              headers: authHeaders,
              tags: { name: 'content_interaction' }
            }
          );
          
          checkResponse(interactRes, 201);
        }
      }
    });
  });
  
  // Calculate how long this test iteration took
  const iterationDuration = new Date().getTime() - testStartTime;
  
  // Add variable sleep to simulate realistic user behavior
  // This also helps prevent the "thundering herd" problem
  // where all VUs hit the system at the same time
  sleep(Math.random() * 3 + 1);
}
