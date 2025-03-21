import { T_LoadtestApiK6 } from './../script/request.d';

export const loadtest_api_request: T_LoadtestApiK6 = {
  type: "load_testing",
  options: {
    thresholds: {
      http_req_failed: ['rate<0.15'], // อนุญาตให้มีอัตราข้อผิดพลาดที่สูงขึ้นในช่วงการเพิ่มโหลดแบบกะทันหัน
      http_req_duration: [
        'p(95)<500', // 95% ของ requests ต้องเร็วกว่า 500ms
        'p(99)<1000', // 99% ของ requests ต้องเร็วกว่า 1000ms
      ] 
    }
  },
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
          grant_type: "password",
          client_id: "web.posback-hq"
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
          ref: "$.access_token"
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
            endpoint: "https://posadminapi-automate.cjexpress.io/storm/stock/stock-count?limit=10&page=1&branchCode=0555&startDate=2025-03-07T17:00:00.000Z&endDate=2025-03-21T16:59:59.999Z",
            auth: {
              type: "bearer",
              data: [
                {
                  key: "",
                  value: "{{token}}",
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
                key: "status",
                value: 200,
                replace_command: "$.status === {{value}}"
              }
            ],
          }
        }
      ]
    }
  ]
}