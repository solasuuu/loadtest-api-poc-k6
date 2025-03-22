import type { I_LoadtestApiK6 } from "../types/request"
import { f } from "../utils/helper"

export const setup = (_flow: I_LoadtestApiK6) => {
  return f(`
    export function setup() {
      console.log('[Setup]: Starting test execution');
    }
  `)
}
