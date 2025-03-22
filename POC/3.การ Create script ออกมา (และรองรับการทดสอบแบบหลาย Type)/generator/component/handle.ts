import type { I_LoadtestApiK6 } from "../types/request";
import { f } from "../utils/helper";

export const handle = (_flow: I_LoadtestApiK6) => {
  return `
    export function handleSummary(data) {
      return {
        'summary.json': JSON.stringify(data),
        'stdout': textSummary(data, { indent: ' ', enableColors: true })
      };
    }
  `
}