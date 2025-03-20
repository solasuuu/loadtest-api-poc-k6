import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [ // in reallity use s to m
    { duration: '10s', target: 5 },    // โหลดปกติ (50 user in 1 min)
    { duration: '1m', target: 10 }, // เพิ่มเป็น 1000 ผู้ใช้ในเวลาเพียง 10 วินาที (1000 user in 10 sec)
    { duration: '3s', target: 10 },  // คงที่ที่ระดับสูงสุด (1000 user in 3 min)
    { duration: '1s', target: 5 },    // ลดกลับสู่ระดับปกติ (50 user in 1 min)
    { duration: '3s', target: 5 },    // โหลดปกติอีกครั้งเพื่อดูการฟื้นตัว (50 user in 3 min)
  ],
  thresholds: {
    http_req_failed: ['rate<0.15'], // อนุญาตให้มีอัตราข้อผิดพลาดที่สูงขึ้นในช่วงการเพิ่มโหลดแบบกะทันหัน
  },
};

export default function () {
  const res = http.get('https://jsonplaceholder.typicode.com/users');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
  });
  
  sleep(0.5);
};