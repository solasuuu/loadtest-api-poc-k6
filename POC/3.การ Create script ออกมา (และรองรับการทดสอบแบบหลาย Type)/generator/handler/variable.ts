import { globals } from "../config";
import type { I_LoadtestApiRequestItemBase } from "../types/request";

export const setVariable = (flow: I_LoadtestApiRequestItemBase, req_var: string) => {
  const { set_variable } = flow

  if (!set_variable?.length) return ''

  const set_varaible_items: string[] = []
  set_variable?.map((item) => {
    switch (item?.from) {
      case 'response':
        globals.variables.push({
          name: item?.name,
          value: req_var,
          path: item?.path,
          from: 'response'
        })
        set_varaible_items.push(`${globals.variable_name}.${item?.name} = ${item?.path?.replace('$', req_var)}`)
        break;
    }
  })

  return set_varaible_items.join('\n')
}

export const replaceUseVariable = (template: string) => {
  // Case 1: Replace ${token} with variables.token
  let result = template.replace(/\${(\w+)}/g, (match, variableName) => {
    return `variables.${variableName}`;
  });
  
  // Case 2: Replace $token with variables.token
  result = result.replace(/\$(\w+)/g, (match, variableName) => {
    const make_var = `${globals.variable_name}.${variableName}`
    return `\$\{${make_var}\}`;
  });
  
  return result;
}