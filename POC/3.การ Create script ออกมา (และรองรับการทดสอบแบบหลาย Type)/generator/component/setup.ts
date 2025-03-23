import type { I_LoadtestApiK6 } from "../types/request"
import { getRequestTemplateFollowMethod, replaceRequestValueTemplate } from "../handler/request"
import { f } from "../utils/helper"

export const setup = (flow: I_LoadtestApiK6) => {
  const { precondition } = flow
  return f(`
    export function setup() {
      console.log('[Setup]: Starting test execution');
      ${
        precondition?.map((step, index) => {
          const template = getRequestTemplateFollowMethod({
            step: step,
            step_index: index
          })
          const template_with_replaces = replaceRequestValueTemplate({
            step: step,
            template: template
          })
          return template_with_replaces
        })
      }
    }
  `)
}
