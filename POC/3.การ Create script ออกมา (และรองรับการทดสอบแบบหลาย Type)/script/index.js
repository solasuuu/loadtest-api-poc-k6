import k6 from 'k6';
import {
  textSummary
} from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'
$VARIABLE

export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data),
    'stdout': textSummary(data, {
      indent: ' ',
      enableColors: true
    })
  };
}

export function setup() {
  console.log('[Setup]: Starting test execution');
}

export default function() {
  group('login_page', function() {
    const req_0_0 = k6.http.get(`https://posadminapi-automate.cjexpress.io/storm/stock/stock-count?limit=10&page=1&branchCode=0555&startDate=2025-03-07T17:00:00.000Z&endDate=2025-03-21T16:59:59.999Z`, {
      headers: {
        Authorization: 'Bearer $token',
        branch: '0555'
      },
    })
  })
}