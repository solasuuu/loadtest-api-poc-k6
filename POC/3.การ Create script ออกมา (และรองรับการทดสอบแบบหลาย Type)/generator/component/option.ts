import type { I_LoadtestApiK6 } from "../types/request";
import { f } from "../utils/helper";

export const option = (flow: I_LoadtestApiK6) => {
  return f(`export const options = ${JSON.stringify(flow.options, null, 2)}`)
}