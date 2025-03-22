import type { I_LoadtestApiK6 } from "../types/request"
import { f } from "../utils/helper"

export const teardown = (flow: I_LoadtestApiK6) => {
  if (!flow.postcondition?.length) return ''

  return `
    export function teardown() {
      console.log('[Teardown]: Test execution completed');
    }
  `
}