export type T_LoadtestApiRequestType = 'load_testing'|'stress_testing'|'performance_testing'
export type T_LoadtestApiRequestItemType = 'api'|'db'
export type T_LoadtestApiRequestMethod = 'GET'|'POST'|'PATCH'|'PUT'|'DELETE'
export type T_LoadtestApiRequestResponseType = 'text'|'json'
export type T_LoadtestApiRequestAuthType = 'bearer'|'basic'
export type T_LoadtestApiRequestOptions = { // required[G1+G2, G1+G3, stages]
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
export type T_LoadtestApiRequestBase = {
  key: string;
  value: string;
}
export type T_LoadtestApiRequestTags = {
  name: string,   
  stage: string,
}
export type T_LoadtestApiRequestAuthData= {
  type: string;  // "string"|"number"
  key: string;  // "username"|"password"
  value: string;  // "BM0555.UAT"|"Express@1234"
}  
export type T_LoadtestApiRequestAuth = {
  type: T_LoadtestApiRequestAuthType,
  data: T_LoadtestApiRequestAuthData[]
}
export type T_LoadtestApiRequestBody = {
  [key: string]: any;
}
export type T_LoadtestApiRequestResponseCheck = {
  rule: string;  // "not_null,string"
  ref: string;  // "$.access_token"
}
export type T_LoadtestApiRequestSetVariable = {
  name: string;  // "token"
  from: keyof Omit<I_LoadtestApiRequestItemBase, 'type'|'set_variable'>;  // "request"|"response"
  ref: string;  // "$.access_token" <- path from response json data
}


export interface I_LoadtestApiRequestItemBase {
  type: T_LoadtestApiRequestItemType,
  sleep?: number,  // in seconds default 1
  set_variable?: T_LoadtestApiRequestSetVariable[],
  request: {
    tags?: T_LoadtestApiRequestTags[],  // "login_page"|"product_page"|"search"
    timeout?: number,  // in seconds default undefined
    endpoint: string,
    method: T_LoadtestApiRequestMethod,
    auth?: T_LoadtestApiRequestAuth,
    headers?: T_LoadtestApiRequestBase[],
    params?: T_LoadtestApiRequestBase[]
    body?: T_LoadtestApiRequestBody,
  },
  response?: {
    status: number
    type: T_LoadtestApiRequestResponseType
    check?: T_LoadtestApiRequestResponseCheck[]
  },
}

export interface I_LoadtestApiRequestGroup {
  name: string;
  steps: I_LoadtestApiRequestItemBase[];
}


export interface T_LoadtestApiRequest {
  type: T_LoadtestApiRequestType;
  options: T_LoadtestApiRequestOptions;
  precondition?: I_LoadtestApiRequestItemBase[];
  postcondition?: I_LoadtestApiRequestItemBase[];
  items: I_LoadtestApiRequestGroup[]
}