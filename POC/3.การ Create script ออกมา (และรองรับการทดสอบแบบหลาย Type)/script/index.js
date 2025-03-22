import k6 from 'k6';
import http from 'k6/http';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'

  
export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data),
    'stdout': textSummary(data, { indent: ' ', enableColors: true })
  };
}

  
export function setup() {
  console.log('[Setup]: Starting test execution');
}

  
export function teardown() {
  console.log('[Teardown]: Test execution completed');
}

  
export default function () {
  const res = http.get('https://jsonplaceholder.typicode.com/users');
  k6.check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 400ms': (r) => r.timings.duration < 400,
  });
}