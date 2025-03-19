export const thresholds = {
  // HTTP errors should be less than 1%
  http_req_failed: ['rate<0.01'],
  
  // 90% of requests should be below these response times
  http_req_duration: ['p(90)<400', 'p(95)<500', 'p(99)<1000'],
  
  // Specific endpoint thresholds
  'http_req_duration{name:login}': ['p(95)<300'],
  'http_req_duration{name:get_user_profile}': ['p(95)<200'],
  'http_req_duration{name:update_profile}': ['p(95)<500'],
  
  // Custom metrics
  'database_queries': ['avg<5'],
};

// Export different threshold presets based on test type
export const loadTestThresholds = {
  ...thresholds,
  http_req_duration: ['p(95)<400'],
};

export const stressTestThresholds = {
  ...thresholds,
  http_req_duration: ['p(95)<800'],
  http_req_failed: ['rate<0.05'], // Allow higher error rate in stress conditions
};

export const soakTestThresholds = {
  ...thresholds,
  http_req_failed: ['rate<0.001'], // Stricter error rate for long-running tests
};
