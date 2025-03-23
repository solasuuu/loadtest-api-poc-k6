import type { I_LoadtestApiK6 } from '../types/request';

export const mockOptionStage: {
  [key: string]: I_LoadtestApiK6['options']
} = {
  load_testing: {
    stages: [
      { duration: '2m', target: 100 }, // เพิ่มผู้ใช้เป็น 100 คนในเวลา 2 นาที
      { duration: '5m', target: 100 }, // คงจำนวนผู้ใช้ที่ 100 คนเป็นเวลา 5 นาที
      { duration: '2m', target: 0 },   // ลดจำนวนผู้ใช้เป็น 0 คน
    ],
    thresholds: {
      http_req_duration: ['p95<500'], // 95% ของการร้องขอต้องเสร็จสิ้นภายใน 500 มิลลิวินาที
      'http_req_duration{staticAsset:yes}': ['p95<100'], // 95% ของการร้องขอไฟล์สถิตต้องเสร็จสิ้นภายใน 100 มิลลิวินาที
    }
  },
  stress_testing: {
    stages: [
      { duration: '2m', target: 100 },   // โหลดปกติ
      { duration: '5m', target: 1000 },  // เพิ่มไปถึงระดับความเครียด (10x ของปกติ)
      { duration: '2m', target: 2000 },  // ความเครียดสูงสุด
      { duration: '5m', target: 0 },     // ช่วงการฟื้นตัว
    ],
    thresholds: {
      http_req_duration: ['p95<2000'], // เกณฑ์ที่ผ่อนปรนกว่าสำหรับการทดสอบความเครียด
      http_req_failed: ['rate<0.1'],   // อัตราความผิดพลาดน้อยกว่า 10%
    }
  },
  endurance_testing_soak: {
    stages: [
      { duration: '10m', target: 100 },  // ช่วงเพิ่มจำนวนผู้ใช้
      { duration: '8h', target: 100 },   // คงจำนวนผู้ใช้ไว้ที่เป้าหมายเป็นเวลา 8 ชั่วโมง
      { duration: '10m', target: 0 },    // ช่วงลดจำนวนผู้ใช้
    ],
    thresholds: {
      http_req_duration: ['p95<500'],
      http_req_failed: ['rate<0.01'],
    }
  },
  spike_testing: {
    stages: [
      { duration: '1m', target: 50 },    // โหลดปกติ
      { duration: '10s', target: 1000 }, // เพิ่มเป็น 1000 ผู้ใช้ในเวลาเพียง 10 วินาที
      { duration: '3m', target: 1000 },  // คงที่ที่ระดับสูงสุด
      { duration: '1m', target: 50 },    // ลดกลับสู่ระดับปกติ
      { duration: '3m', target: 50 },    // โหลดปกติอีกครั้งเพื่อดูการฟื้นตัว
    ],
    thresholds: {
      http_req_failed: ['rate<0.15'], // อนุญาตให้มีอัตราข้อผิดพลาดที่สูงขึ้นในช่วงการเพิ่มโหลดแบบกะทันหัน
    }
  },
  scalability_testing: {
    stages: [
      { duration: '3m', target: 100 },   // ระดับที่ 1
      { duration: '5m', target: 100 },
      { duration: '3m', target: 200 },   // ระดับที่ 2
      { duration: '5m', target: 200 },
      { duration: '3m', target: 300 },   // ระดับที่ 3
      { duration: '5m', target: 300 },
      { duration: '3m', target: 400 },   // ระดับที่ 4
      { duration: '5m', target: 400 },
      { duration: '3m', target: 0 },     // ช่วงลดจำนวนผู้ใช้
    ],
    thresholds: {
      http_req_duration: ['p95<500'],
      http_req_failed: ['rate<0.01'],
    }
  }
}


export const mockLoadtestApiRequest: I_LoadtestApiK6 = {
  type: "load_testing",
  options: mockOptionStage?.load_testing,
  precondition: [
    {
      type: "api",
      request: {
        endpoint: "https://cj-auth-internal-qa.cjexpress.io/auth/realms/cjexpress/protocol/openid-connect/token",
        method: "POST",
        headers: [
          {
            key: "Content-Type",
            value: "application/x-www-form-urlencoded"
          }
        ],
        body: {
          username: "BM0555.UAT",
          password: "Express@1234",
          client_id: "web.posback-hq",
          grant_type: "password"
        },
      },
      response: {
        type: "json",
        validate: [
          {
            ref: "$.access_token",
            rule: "not_null,string"
          }
        ]
      },
      set_variable: [
        {
          name: "token",
          from: "response",
          path: "$.json().access_token"
        }
      ],
    }
  ],
  postcondition: [],
  items: [
    {
      name: "login_page",
      steps: [
        {
          type: "api",
          request: {
            method: "GET",
            endpoint: "https://posadminapi-automate.cjexpress.io/storm/stock/stock-count",
            query: [
              {
                key: "limit",
                value: "10"
              },
              {
                key: "page",
                value: "1"
              },
              {
                key: "branchCode",
                value: "0555"
              },
              {
                key: "startDate",
                value: "2025-03-07T17:00:00.000Z"
              },
              {
                key: "endDate",
                value: "2025-03-21T16:59:59.999Z"
              }
            ],
            auth: {
              type: "bearer",
              data: [
                {
                  key: "",
                  value: "$token",
                  type: "string"
                }
              ]
            },
            headers: [
              {
                key: 'branch',
                value: '0555'
              }
            ],
          },
          response: {
            type: 'json',
            check: [
              {
                name: "status is 200",
                path: "$.status === $value",
                value: 200,
              },
              {
                name: "response time < 4000ms",
                path: "$.timings.duration < $value",
                value: 4000,
              }
            ],
          },
          // set_variable: [
          //   {
          //     name: "user_id",
          //     from: "response",
          //     path: "$.json().user_id"
          //   }
          // ],
        }
      ]
    }
  ]
}