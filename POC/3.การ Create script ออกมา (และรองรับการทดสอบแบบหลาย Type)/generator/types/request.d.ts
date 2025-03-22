export type T_LoadtestApiTypeK6 = 'load_testing'|'stress_testing'|'performance_testing'
export type T_LoadtestApiItemTypeK6 = 'api'|'db'
export type T_LoadtestApiMethodK6 = 'GET'|'POST'|'PATCH'|'PUT'|'DELETE'
export type T_LoadtestApiResponseTypeK6 = 'text'|'json'
export type T_LoadtestApiAuthTypeK6 = 'bearer'|'basic'
export type T_LoadtestApiOptionsK6 = { // required[G1+G2, G1+G3, stages]
  vus?: number;  // จำนวนผู้ใช้ที่ต้องการทดสอบ  // [G1] Virtual Users การระบุจำนวน VUs คงที่ตลอดการทดสอบ
  duration?: string;  // ระยะเวลาที่ต้องการทดสอบ เช่น "30s", "2m", "1h"  // [G2] Duration การระบุระยะเวลาที่ต้องการทดสอบร่วมกับจำนวน VUs ([G1+G2])
  iterations?: number;  // จำนวนรอบการทดสอบ  // [G3] Iterations ใช้เมื่อต้องการทดสอบโดยวัดจากจำนวนรอบที่ทำ ไม่ใช่เวลา ([G1+G3])
  stages?: { // ใช้เมื่อต้องการจำลองสถานการณ์ที่มีการเพิ่ม/ลดจำนวนผู้ใช้งาน
    duration: string;  // ระยะเวลาที่ต้องการทดสอบ เช่น "30s", "2m", "1h"
    target: number;  // จำนวนผู้ใช้ที่ต้องการทดสอบ
  }[]
  thresholds?: {
    // HTTP-related metrics
    'http_req_duration'?: string[];
    'http_req_failed'?: string[];
    'http_req_receiving'?: string[];
    'http_req_sending'?: string[];
    'http_req_blocked'?: string[];
    'http_req_connecting'?: string[];
    'http_req_tls_handshaking'?: string[];
    'http_req_waiting'?: string[];
    
    // Iteration-related metrics
    'iterations'?: string[];
    'iteration_duration'?: string[];
    
    // Check-related metrics
    'checks'?: string[];
    
    // VU-related metrics
    'vus'?: string[];
    'vus_max'?: string[];
    
    // Data-related metrics
    'data_received'?: string[];
    'data_sent'?: string[];
    
    // Error metrics
    'errors'?: string[];
    
    // Group duration metrics
    'group_duration'?: string[];
    
    // Allow custom metrics with the format 'metric_name{tag:value}'
    [key: string]: string[] | undefined;
  }
}
export type T_LoadtestApiBaseK6 = {
  key: string;
  value: any;
}
export type T_LoadtestApiTagsK6 = {
  name: string,   
  stage: string,
}
export type T_LoadtestApiAuthK6 = {
  type: T_LoadtestApiAuthTypeK6,
  data: (T_LoadtestApiBaseK6 & {
    type: string; // "string"|"number"|"boolean"
  })[]
}
export type T_LoadtestApiBodyK6 = {
  [key: string]: any;
}
export type T_LoadtestApiResponseValidateK6 = {
  rule: string;  // "not_null,string"
  ref: string;  // "$.access_token"
}
export type T_LoadtestApiResponseCheckK6 = T_LoadtestApiBaseK6 & {
  replace_command: string;  // "$.access_token"  
}
export type T_LoadtestApiSetVariableK6 = {
  name: string;  // "token"
  from: keyof Omit<I_LoadtestApiRequestItemBase, 'type'|'set_variable'>;  // "request"|"response"
  ref: string;  // "$.access_token" <- path from response json data
}


export interface I_LoadtestApiRequestItemBase {
  type: T_LoadtestApiItemTypeK6,
  sleep?: number,  // in seconds default 1
  set_variable?: T_LoadtestApiSetVariableK6[],
  request: {
    tags?: T_LoadtestApiTagsK6[],  // "login_page"|"product_page"|"search"
    timeout?: number,  // in seconds default undefined
    endpoint: string,
    method: T_LoadtestApiMethodK6,
    auth?: T_LoadtestApiAuthK6,
    headers?: T_LoadtestApiBaseK6[],
    params?: T_LoadtestApiBaseK6[]
    body?: T_LoadtestApiBodyK6,
  },
  response?: {
    type: T_LoadtestApiResponseTypeK6
    validate?: T_LoadtestApiResponseValidateK6[]
    check?: T_LoadtestApiResponseCheckK6[]
  },
}

export interface I_LoadtestApiRequestGroup {
  name: string;
  steps: I_LoadtestApiRequestItemBase[];
}


export interface I_LoadtestApiK6 {
  type: T_LoadtestApiTypeK6;
  options: T_LoadtestApiOptionsK6;
  precondition?: I_LoadtestApiRequestItemBase[];
  postcondition?: I_LoadtestApiRequestItemBase[];
  items: I_LoadtestApiRequestGroup[]
}