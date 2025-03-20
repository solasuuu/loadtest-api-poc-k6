import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [ // in reallity use s to m
    { duration: '1s', target: 10 },  // ช่วงเพิ่มจำนวนผู้ใช้ (100 user in 10 min)
    { duration: '8s', target: 10 },   // คงจำนวนผู้ใช้ไว้ที่เป้าหมายเป็นเวลา 8 ชั่วโมง (100 user in 8 hours)
    { duration: '1s', target: 0 },    // ช่วงลดจำนวนผู้ใช้ (0 user in 10 min)
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'], // < 500
    http_req_failed: ['rate<0.01'],    // อัตราความผิดพลาดที่เข้มงวดมากขึ้นสำหรับการทดสอบความทนทาน
  },
};

export default function () {
  const responses = http.batch([
    // ตรวจสอบการทำงานของระบบโดยรวม:
    ['GET', 'https://jsonplaceholder.typicode.com/users'],
    ['GET', 'https://jsonplaceholder.typicode.com/todos'],
    ['GET', 'https://jsonplaceholder.typicode.com/posts'],
  ]);
  
  // ตรวจสอบแต่ละการตอบสนอง
  responses.forEach((res, index) => {
    check(res, {
      'status is 200': (r) => r.status === 200,
    });
  });
  
  sleep(3); // ระยะเวลาพักที่นานขึ้นเพื่อจำลองพฤติกรรมผู้ใช้ที่สมจริง
}