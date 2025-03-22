import type { I_LoadtestApiK6 } from "../types/request";
import { f } from "../utils/helper";

export const handle = (_flow: I_LoadtestApiK6) => {
  // 'summary.json': JSON.stringify(data),
  return `
    export function handleSummary(data) {
      return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true })
      };
    }
  `
}