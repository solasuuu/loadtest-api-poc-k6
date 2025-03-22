import { getRequestTemplateFollowMethod, replaceRequestValueTemplate } from "../handler/request"
import type { I_LoadtestApiK6 } from "../types/request"
import { f } from "../utils/helper"

export const main = (flow: I_LoadtestApiK6) => {
  // need validate duplicate group name
  const main_script = f(`
    export default function () {
      ${flow.items.map((group, group_index) => {
        return `
          k6.group('${group?.name || `group-${group_index}`}', function () {
            ${group.steps?.map((step, step_index) => {
              const template = getRequestTemplateFollowMethod({
                group_index: group_index,
                step: step,
                step_index: step_index
              })
              const template_with_replaces = replaceRequestValueTemplate({
                step: step,
                template: template
              })
              return template_with_replaces
            })
          }})`
        })
      }
    }
  `)
  console.log(main_script)

  // note todo next: replace_variable

  return main_script
}