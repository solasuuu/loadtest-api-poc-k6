import type { I_LoadtestApiK6 } from "../types/request"
import { f } from "../utils/helper"

export const teardown = (_flow: I_LoadtestApiK6) => {
  return f(`
    export function teardown() {
      console.log('[Teardown]: Test execution completed');
    }
  `)
}