import type { I_LoadtestApiK6 } from "../types/request"
import { k6_globals } from "../config"

export const handle = (_flow: I_LoadtestApiK6) => {
  // 'summary.json': JSON.stringify(data),
  return `
    export function handleSummary(data) {
      return {
        '${k6_globals?.docker_dir ? `${k6_globals?.docker_dir}/` : ''}summary.json': JSON.stringify(data),
        'stdout': textSummary(data, { indent: ' ', enableColors: true })
      }
    }
  `
}