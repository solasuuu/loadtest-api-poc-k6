**thresholds examples**
```javascript
// HTTP-related metrics
'http_req_duration': ['p(90) < 200', 'avg < 100'],
'http_req_failed': ['rate < 0.01', 'rate==0'],
'http_req_receiving': ['p(95) < 50', 'max < 100'],
'http_req_sending': ['avg < 10', 'p(99) < 50'],
'http_req_blocked': ['med < 5', 'p(90) < 10'],
'http_req_connecting': ['max < 50', 'p(95) < 30'],
'http_req_tls_handshaking': ['p(90) < 100', 'avg < 50'],
'http_req_waiting': ['med < 150', 'p(95) < 200'],

// Iteration-related metrics
'iterations': ['count > 100', 'rate > 10'],
'iteration_duration': ['avg < 200', 'max < 300'],

// Check-related metrics
'checks': ['rate > 0.9', 'rate == 1.0'],

// VU-related metrics
'vus': ['value == 50', 'value < 100'],
'vus_max': ['value == 100', 'value < 200'],

// Data-related metrics
'data_received': ['rate > 100', 'count > 10000'],
'data_sent': ['rate > 50', 'count > 5000'],

// Error metrics
'errors': ['count == 0', 'rate < 0.01'],

// Group duration metrics
'group_duration': ['avg < 300', 'p(90) < 500'],

// Custom metrics examples
'custom_metric{tag:value}': ['value > 10', 'count > 100'],
'response_time{status:200}': ['avg < 100', 'p(95) < 200']
```


**check examples**
```javascript
// Basic response status checks
check(response, {
  'status is 200': (r) => r.status === 200,
  'status is OK': (r) => r.status >= 200 && r.status < 300,
});

// Response time checks
check(response, {
  'response time < 200ms': (r) => r.timings.duration < 200,
  'response time < 500ms': (r) => r.timings.duration < 500,
});

// Response body content checks
check(response, {
  'body contains expected string': (r) => r.body.includes('success'),
  'body does not contain error': (r) => !r.body.includes('error'),
});

// JSON response structure checks
check(response, {
  'has valid JSON response': (r) => r.json() !== null,
  'has required fields': (r) => {
    const body = r.json();
    return body.id !== undefined && body.name !== undefined;
  },
  'data array is not empty': (r) => r.json().data.length > 0,
});

// JSON validation with specific values
check(response, {
  'user ID is correct': (r) => r.json().userId === 1,
  'status is "active"': (r) => r.json().status === 'active',
  'count is greater than 5': (r) => r.json().count > 5,
});

// Header checks
check(response, {
  'content-type is application/json': (r) => r.headers['Content-Type'].includes('application/json'),
  'cache-control header exists': (r) => r.headers['Cache-Control'] !== undefined,
});

// Size/length checks
check(response, {
  'response body size is less than 10KB': (r) => r.body.length < 10240,
  'array has expected length': (r) => r.json().items.length === 10,
});

// Response time component checks
check(response, {
  'connection time < 50ms': (r) => r.timings.connecting < 50,
  'TLS handshake < 100ms': (r) => r.timings.tls_handshaking < 100,
  'TTFB < 300ms': (r) => r.timings.waiting < 300,
});

// Logical combination of multiple conditions
check(response, {
  'business rule validation': (r) => {
    const body = r.json();
    return body.isSuccess === true && body.errorCode === 0 && body.data.length > 0;
  }
});

// Regex pattern checks
check(response, {
  'UUID format is valid': (r) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(r.json().id),
  'email format is valid': (r) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.json().email),
});
```