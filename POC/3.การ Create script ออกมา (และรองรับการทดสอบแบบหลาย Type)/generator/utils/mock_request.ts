import type { I_LoadtestApiK6 } from '../types/request';

// default downgrade 1 step unit m to s or h to m, normally use for m.
export const mockOptionStage: {
  [key: string]: I_LoadtestApiK6['options']
} = {
  debug: {
    stages: [
      { duration: '1s', target: 1 }, // เพิ่มผู้ใช้เป็น 100 คนในเวลา 2 นาที
      { duration: '2s', target: 2 }, // คงจำนวนผู้ใช้ที่ 100 คนเป็นเวลา 5 นาที
      { duration: '1s', target: 0 },   // ลดจำนวนผู้ใช้เป็น 0 คน
    ],
    thresholds: {
      http_req_duration: ['p(95)<500'], // 95% ของการร้องขอต้องเสร็จสิ้นภายใน 500 มิลลิวินาที
    }
  },
  load_testing: {
    // stages: [ // default
    //   { duration: '2m', target: 100 }, // เพิ่มผู้ใช้เป็น 100 คนในเวลา 2 นาที
    //   { duration: '5m', target: 100 }, // คงจำนวนผู้ใช้ที่ 100 คนเป็นเวลา 5 นาที
    //   { duration: '2m', target: 0 },   // ลดจำนวนผู้ใช้เป็น 0 คน
    // ],
    // thresholds: {
    //   http_req_duration: ['p(95)<500'], // 95% ของการร้องขอต้องเสร็จสิ้นภายใน 500 มิลลิวินาที
    //   'http_req_duration{staticAsset:yes}': ['p(95)<100'], // 95% ของการร้องขอไฟล์สถิตต้องเสร็จสิ้นภายใน 100 มิลลิวินาที
    // }
    stages: [
      { duration: '2s', target: 1 }, // เพิ่มผู้ใช้เป็น 100 คนในเวลา 2 นาที
      { duration: '5s', target: 1 }, // คงจำนวนผู้ใช้ที่ 100 คนเป็นเวลา 5 นาที
      { duration: '2s', target: 0 },   // ลดจำนวนผู้ใช้เป็น 0 คน
    ],
    thresholds: {
      http_req_duration: ['p(95)<500'], // 95% ของการร้องขอต้องเสร็จสิ้นภายใน 500 มิลลิวินาที
      'http_req_duration{staticAsset:yes}': ['p(95)<100'], // 95% ของการร้องขอไฟล์สถิตต้องเสร็จสิ้นภายใน 100 มิลลิวินาที
    }
  },
  stress_testing: {
    // stages: [ // default
    //   { duration: '2m', target: 100 },   // โหลดปกติ
    //   { duration: '5m', target: 1000 },  // เพิ่มไปถึงระดับความเครียด (10x ของปกติ)
    //   { duration: '2m', target: 2000 },  // ความเครียดสูงสุด
    //   { duration: '5m', target: 0 },     // ช่วงการฟื้นตัว
    // ],
    // thresholds: {
    //   http_req_duration: ['p(95)<2000'], // เกณฑ์ที่ผ่อนปรนกว่าสำหรับการทดสอบความเครียด
    //   http_req_failed: ['rate<0.1'],   // อัตราความผิดพลาดน้อยกว่า 10%
    // }
    stages: [
      { duration: '2s', target: 1 },   // โหลดปกติ
      { duration: '5s', target: 1 },  // เพิ่มไปถึงระดับความเครียด (10x ของปกติ)
      { duration: '2s', target: 2 },  // ความเครียดสูงสุด
      { duration: '5s', target: 0 },     // ช่วงการฟื้นตัว
    ],
    thresholds: {
      http_req_duration: ['p(95)<2000'], // เกณฑ์ที่ผ่อนปรนกว่าสำหรับการทดสอบความเครียด
      http_req_failed: ['rate<0.1'],   // อัตราความผิดพลาดน้อยกว่า 10%
    }
  },
  endurance_testing_soak: {
    stages: [
      { duration: '10s', target: 10 },  // ช่วงเพิ่มจำนวนผู้ใช้
      { duration: '8m', target: 10 },   // คงจำนวนผู้ใช้ไว้ที่เป้าหมายเป็นเวลา 8 ชั่วโมง
      { duration: '10s', target: 0 },    // ช่วงลดจำนวนผู้ใช้
    ],
    thresholds: {
      http_req_duration: ['p(95)<500'],
      http_req_failed: ['rate<0.01'],
    }
  },
  spike_testing: {
    // stages: [ // default
    //   { duration: '1m', target: 50 },    // โหลดปกติ
    //   { duration: '10s', target: 1000 }, // เพิ่มเป็น 1000 ผู้ใช้ในเวลาเพียง 10 วินาที
    //   { duration: '3m', target: 1000 },  // คงที่ที่ระดับสูงสุด
    //   { duration: '1m', target: 50 },    // ลดกลับสู่ระดับปกติ
    //   { duration: '3m', target: 50 },    // โหลดปกติอีกครั้งเพื่อดูการฟื้นตัว
    // ],
    // thresholds: {
    //   http_req_failed: ['rate<0.15'], // อนุญาตให้มีอัตราข้อผิดพลาดที่สูงขึ้นในช่วงการเพิ่มโหลดแบบกะทันหัน
    // }
    stages: [
      { duration: '10s', target: 5 },    // โหลดปกติ
      { duration: '1s', target: 50 }, // เพิ่มเป็น 1000 ผู้ใช้ในเวลาเพียง 10 วินาที
      { duration: '30s', target: 50 },  // คงที่ที่ระดับสูงสุด
      { duration: '10s', target: 5 },    // ลดกลับสู่ระดับปกติ
      { duration: '30s', target: 5 },    // โหลดปกติอีกครั้งเพื่อดูการฟื้นตัว
    ],
    thresholds: {
      http_req_failed: ['rate<0.15'], // อนุญาตให้มีอัตราข้อผิดพลาดที่สูงขึ้นในช่วงการเพิ่มโหลดแบบกะทันหัน
    }
  },
  scalability_testing: {
    // stages: [ // default
    //   { duration: '3m', target: 100 },   // ระดับที่ 1
    //   { duration: '5m', target: 100 },
    //   { duration: '3m', target: 200 },   // ระดับที่ 2
    //   { duration: '5m', target: 200 },
    //   { duration: '3m', target: 300 },   // ระดับที่ 3
    //   { duration: '5m', target: 300 },
    //   { duration: '3m', target: 400 },   // ระดับที่ 4
    //   { duration: '5m', target: 400 },
    //   { duration: '3m', target: 0 },     // ช่วงลดจำนวนผู้ใช้
    // ],
    // thresholds: {
    //   http_req_duration: ['p(95)<500'],
    //   http_req_failed: ['rate<0.01'],
    // }
    stages: [
      { duration: '3s', target: 1 },   // ระดับที่ 1
      { duration: '5s', target: 1 },
      { duration: '3s', target: 2 },   // ระดับที่ 2
      { duration: '5s', target: 2 },
      { duration: '3s', target: 3 },   // ระดับที่ 3
      { duration: '5s', target: 3 },
      { duration: '3s', target: 4 },   // ระดับที่ 4
      { duration: '5s', target: 4 },
      { duration: '3s', target: 0 },     // ช่วงลดจำนวนผู้ใช้
    ],
    thresholds: {
      http_req_duration: ['p(95)<500'],
      http_req_failed: ['rate<0.01'],
    }
  },
  performance_testing: {
    // vus: 50,  // โหลดที่สมจริงปานกลาง // default
    // duration: '5m',
    // thresholds: {
    //   'login_time': ['p(95)<500'],     // การเข้าสู่ระบบต้องรวดเร็ว
    //   'search_time': ['p(95)<800'],    // การค้นหามีเวลาที่ผ่อนปรนมากขึ้น
    //   'checkout_time': ['p(95)<1000'], // การชำระเงินสามารถช้าได้เล็กน้อย
    //   http_req_failed: ['rate<0.01'],
    // },
    vus: 5,  // โหลดที่สมจริงปานกลาง
    duration: '5s',
    thresholds: {
      'login_time': ['p(95)<500'],     // การเข้าสู่ระบบต้องรวดเร็ว
      'search_time': ['p(95)<800'],    // การค้นหามีเวลาที่ผ่อนปรนมากขึ้น
      'checkout_time': ['p(95)<1000'], // การชำระเงินสามารถช้าได้เล็กน้อย
      http_req_failed: ['rate<0.01'],
    },
  }
}


export const mockLoadtestApiRequest: I_LoadtestApiK6 = {
  type: "load_testing",
  options: mockOptionStage.debug,
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