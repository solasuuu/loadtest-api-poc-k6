import type { I_LoadtestApiK6 } from "../types/request"
import { globals } from "../config"

export const handle = (_flow: I_LoadtestApiK6) => {
  // 'summary.json': JSON.stringify(data),
  return `
    export function handleSummary(data) {
      return {
        '${globals?.docker_dir ? `${globals?.docker_dir}/` : ''}summary.json': JSON.stringify(data),
        'stdout': textSummary(data, { indent: ' ', enableColors: true })
      }
    }
  `
}