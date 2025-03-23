import { globals } from "../config"
import type { I_LoadtestApiK6 } from "../types/request"
import { f } from "../utils/helper"

export const teardown = (flow: I_LoadtestApiK6) => {
  const { postcondition } = flow
  return f(`
    export function teardown(${globals.variable_name}) {
      console.info('[Teardown]: Test execution completed');
    }
  `)
}