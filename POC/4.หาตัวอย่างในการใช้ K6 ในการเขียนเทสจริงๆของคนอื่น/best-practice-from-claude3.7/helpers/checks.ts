import { check, fail } from 'k6';
import { RefinedResponse, ResponseType } from 'k6/http';

// Standard response checks for JSON API endpoints
export function checkResponse(
  res: RefinedResponse<ResponseType>,
  expectedStatus = 200, 
  additionalChecks = {}
) {
  const checks = {
    [`status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
    'response is JSON': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json'),
    ...additionalChecks,
  };

  const checkResult = check(res, checks);
  
  // If the response isn't what we expect, log details for debugging
  if (!checkResult) {
    console.log(`Failed request: ${res.request.method} ${res.request.url}`);
    console.log(`Status: ${res.status}`);
    console.log(`Body: ${res.body}`);
  }

  return checkResult;
}

// Critical checks that should abort the test if they fail
export function criticalCheck(
  res: RefinedResponse<ResponseType>,
  expectedStatus = 200,
  message = "Critical check failed"
) {
  const checkResult = check(res, {
    [`${message} - status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
  });
  
  if (!checkResult) {
    fail(message);
  }
  
  return checkResult;
}
