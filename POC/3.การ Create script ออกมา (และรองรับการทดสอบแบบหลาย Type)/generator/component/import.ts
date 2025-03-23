import type { I_LoadtestApiK6 } from "../types/request"

export const imports = (_flow: I_LoadtestApiK6) => {
  return `
    import k6 from 'k6'
    import http from 'k6/http'
    import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'
  `
}