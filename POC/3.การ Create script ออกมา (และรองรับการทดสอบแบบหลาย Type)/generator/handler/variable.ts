import { configs } from "../config";
import type { I_LoadtestApiRequestItemBase } from "../types/request";

export const setVariable = (flow: I_LoadtestApiRequestItemBase, req_var: string) => {
  const { response, set_variable } = flow

  if (!set_variable?.length) return ''

  const set_varaible_items: string[] = []
  set_variable?.map((item) => {
    switch (item?.from) {
      case 'response':
        set_varaible_items.push(`${configs.global_variable_name}.${item?.name} = ${item?.path?.replace('$', req_var)}`)
    }
  })

  return set_varaible_items.join(',\n')
}