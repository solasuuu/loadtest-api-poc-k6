import type { I_LoadtestApiK6 } from "../types/request"

export const setup = (flow: I_LoadtestApiK6) => {
  if (!flow.precondition?.length) return ''

  return `
    export function setup() {
      console.log('[Setup]: Starting test execution');
      
    }
  `
}
