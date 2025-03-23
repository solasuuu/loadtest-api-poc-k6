import type { I_LoadtestApiRequestItemBase, T_LoadtestApiAuthTypeK6, T_LoadtestApiBaseK6, T_LoadtestApiKeysReplaceRequestK6, T_LoadtestApiMethodK6 } from "../types/request";
import { f } from "../utils/helper";
import { getResponseCheck } from "./response";
import { setVariable } from "./variable";

// shorthand
type T_Req = T_LoadtestApiKeysReplaceRequestK6


export const getRequestHeaderWithReplace = (step: I_LoadtestApiRequestItemBase, step_use_form_data: boolean|undefined) => {
  const { request } = step

  return f(`
    auth: ${(['basic', 'digest', 'ntlm'] as T_LoadtestApiAuthTypeK6[])?.includes(request?.auth?.type as T_LoadtestApiAuthTypeK6) ? `'${request?.auth?.type}'` : 'undefined'},
    headers: ${request?.headers?.length ? '$headers_obj' as T_Req : 'undefined'},
    cookies: ${request?.cookies?.length ? '$cookies_obj' as T_Req : 'undefined'},
    ${step_use_form_data ? '' : 
      `body: ${request?.body ? '$body' as T_Req : 'undefined'}`},
    tags: ${request?.tags?.length ? '$tags_obj' as T_Req : 'undefined'},
    timeout: ${request?.timeout ? '$timeout' as T_Req : 'undefined'},
    jar: ${'undefined'},
    redirects: ${'undefined'},
    compression: ${'undefined'},
    responseType: ${'undefined'},
    responseCallback: ${'undefined'},
  `)
}


export const getRequestTemplateFollowMethod = (parame: {
  group_index?: number,
  step: I_LoadtestApiRequestItemBase, 
  step_index: number
}) => {
  const { step, group_index, step_index } = parame

  if (!(['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] as T_LoadtestApiMethodK6[]).includes(step?.request?.method?.toUpperCase() as T_LoadtestApiMethodK6)) {
    throw new Error('UNSUPPORTED METHOD')
  }

  const step_use_form_data = step?.request?.headers?.some(header => header?.key?.toLowerCase() === 'content-type' && header?.value?.toLowerCase() === 'application/x-www-form-urlencoded')
  const add_on_request = getRequestHeaderWithReplace(step, step_use_form_data)
  const add_on_request_without_undefined = add_on_request?.split('\n').filter(item => !item.includes('undefined')).join('\n')

  const req_var = `req_${group_index || group_index === 0 ? `${group_index}_${step_index}` : `${step_index}`}`

  return f(`
    ${step?.response?.check?.length || step?.set_variable?.length ? `const ${req_var} = ` : ''}http.${step?.request?.method?.toLowerCase()}(\`$endpoint$query\`,
      ${step_use_form_data ? `$form_data,` : ''}
      {${add_on_request_without_undefined}}
    )
    ${getResponseCheck(step, req_var)}
    ${setVariable(step, req_var)}
  `)
}


export const getRequestWithReplaceItems = (step: I_LoadtestApiRequestItemBase): T_LoadtestApiBaseK6<T_LoadtestApiKeysReplaceRequestK6>[] => {
  const step_use_form_data = step?.request?.headers?.some(header => header?.key?.toLowerCase() === 'content-type' && header?.value?.toLowerCase() === 'application/x-www-form-urlencoded')
  return [
    {
      key: '$endpoint',
      value: // with params  [NEED-TO-VALIDATE]: endpoint should match :[a-zA-Z0-9]+ in url
        (() => {
          const url = step?.request?.params?.length ? step?.request?.endpoint?.match(/:[a-zA-Z0-9]+/g)?.reduce((acc, item) => {
            const key = item.replace(':', '')
            const value = step?.request?.params?.find(param => param.key === key)?.value
            return acc?.replace(item, value)
          }, step?.request?.endpoint) : step?.request?.endpoint || ''
          return url?.replace(/\/$/, '')
        })()
    },
    {
      key: '$query',
      value: step?.request?.query?.length ? `?${step?.request?.query?.map(query => `${query.key}=${query.value}`).join('&')}` : ''
    },
    {
      key: '$cookies_obj',
      value: step?.request?.cookies?.length ? `{ ${step?.request?.cookies?.map(cookie => `${cookie.key}: '${cookie.value}'`).join(', ')} }` : ''
    },
    {
      key: step_use_form_data ? '$form_data' : '$body',
      value: step?.request?.body ? f(`{
          ${
            (() => {
              return step?.request?.body ? Object.keys(step?.request?.body ?? {}).map(key => `'${key}': '${step?.request?.body?.[key]}'`).join(', ') : ''
            })()
          }
        }`) : ''
    },
    {
      key: '$headers_obj',
      value: step?.request?.headers?.length ? f(`{
        ${
          (() => {
            const bearerRequest = step?.request?.auth?.type?.toLowerCase() === 'bearer'
            return `
              ${bearerRequest ? `'Authorization': \`Bearer ${step?.request?.auth?.data?.[0]?.value}\`, ` : ''}
              ${step?.request?.headers?.map(header => `'${header.key}': \`${header.value}\``).join(', ')}
              `
          })()
        }
      }`) : ''
    },
    {
      key: '$tags_obj',
      value: step?.request?.tags?.length ? `{ ${step?.request?.tags?.map(tag => `name: '${tag.name}'`).join(', ')} }` : ''
    },
    {
      key: '$timeout',
      value: step?.request?.timeout
    },
  ]
}
  

export const replaceRequestValueTemplate = (parame: {
  step: I_LoadtestApiRequestItemBase, 
  template: string
}) => {
  const { step } = parame
  let { template } = parame

  getRequestWithReplaceItems(step)?.forEach(item => {
    template = template?.replace(item.key, item?.value as string || '')
  })

  return template
}