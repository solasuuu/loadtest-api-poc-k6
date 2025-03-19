import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // ใช้ stages - จะรันตามระยะเวลาที่กำหนด (comment ไว้เพื่อแสดงความแตกต่าง)
  stages: [
    { duration: '2s', target: 5 },
    { duration: '2s', target: 10 },
    { duration: '1s', target: 0 },
  ],
  
  // สามารถใช้ร่วมกับ thresholds ได้เหมือนเดิม
  thresholds: { // metrics ที่จะต้องทำการตรวจสอบ
    // เกณฑ์สำหรับ response time
    http_req_duration: [
      'p(95)<500',     // 95% ของ requests ต้องเร็วกว่า 500ms
      'p(99)<1000',    // 99% ของ requests ต้องเร็วกว่า 1000ms
      'max<1500',      // request ที่ช้าที่สุดต้องไม่เกิน 1500ms
      'med<300',       // ค่า median ของ request ต้องไม่เกิน 300ms
      'avg<400',       // ค่าเฉลี่ยของ request ต้องไม่เกิน 400ms
    ],
    
    // เกณฑ์สำหรับอัตราข้อผิดพลาด
    http_req_failed: ['rate<0.01'],   // อัตราข้อผิดพลาดต้องน้อยกว่า 1%
    
    // เกณฑ์สำหรับ requests ต่อวินาที
    // http_reqs: ['rate>5'],          // ต้องจัดการ requests ได้มากกว่า 5 req/s
    
    // เกณฑ์สำหรับ endpoint เฉพาะ
    'http_req_duration{name:login}': ['p(95)<300'],   // endpoint login ต้องเร็วเป็นพิเศษ
    'http_req_duration{name:search}': ['p(95)<600'],
  },
};

export default function (data_from_setup: any) {
  const res = http.get('https://jsonplaceholder.typicode.com/users');


  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 400ms': (r) => r.timings.duration < 400,
  });

  sleep(1);
}