import type { I_LoadtestApiK6, I_LoadtestApiRequestItemBase } from "../types/request";

export const getResponseCheck = (flow: I_LoadtestApiRequestItemBase, req_var: string) => {
  const { response } = flow
  if (!response?.check?.length) return ''

  const checkItems: string[] = []
  response?.check?.forEach((check) => {
    checkItems.push(
      `'${check?.name || check?.path}': (r) => ${check?.path?.replace('$', 'r')?.replace('$value', check?.value)}`
    )
  })

  return `
    k6.check(${req_var}, {
      ${checkItems.join(',\n')}
    })
  `
}
  