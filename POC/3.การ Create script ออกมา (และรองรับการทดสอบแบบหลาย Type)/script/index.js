import k6 from 'k6';
import http from 'k6/http';
import {
  textSummary
} from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'
var varaibles = {}

export const options = {
  vus: 1,
  duration: '1s'
};

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, {
      indent: ' ',
      enableColors: true
    })
  };
}

export function setup() {
  console.log('[Setup]: Starting test execution');
  const req_0 = http.post(`https://cj-auth-internal-qa.cjexpress.io/auth/realms/cjexpress/protocol/openid-connect/token`, {
    'username': 'BM0555.UAT',
    'password': 'Express@1234',
    'client_id': 'web.posback-hq',
    'grant_type': 'password'
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  })
  varaibles.token = req_0.json().access_token
}

export function teardown() {
  console.log('[Teardown]: Test execution completed');
}

export default function() {
  k6.group('login_page', function() {
    const req_0_0 = http.get(`https://posadminapi-automate.cjexpress.io/storm/stock/stock-count?limit=10&page=1&branchCode=0555&startDate=2025-03-07T17:00:00.000Z&endDate=2025-03-21T16:59:59.999Z`, {
      headers: {
        'Authorization': 'Bearer $token',
        'branch': '0555'
      },
    })
    k6.check(req_0_0, {
      'status is 200': (r) => r.status === 200,
      'response time < 400ms': (r) => r.response_time < 400
    })
  })
}