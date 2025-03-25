import type { I_LoadtestApiK6 } from "../types/request"
import { getRequestTemplateFollowMethod, replaceRequestValueTemplate } from "../handler/request"
import { f } from "../utils/helper"
import { k6_globals } from "../config"

export const setup = (flow: I_LoadtestApiK6) => {
  const { precondition } = flow
  return f(`
    export function setup() {
      console.info('[Setup]: Starting test execution')
      const ${k6_globals?.variable_name} = {}
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
      return ${k6_globals.variable_name}
    }
  `)
}
