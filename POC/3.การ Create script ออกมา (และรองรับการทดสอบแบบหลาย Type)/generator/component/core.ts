import type { I_LoadtestApiK6 } from "../types/request"
import { f } from "../utils/helper"

export const core = (_flow: I_LoadtestApiK6) => {
  return f(`
    export default function () {
      const res = http.get('https://jsonplaceholder.typicode.com/users');
      k6.check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 400ms': (r) => r.timings.duration < 400,
      });
    }
  `)
}