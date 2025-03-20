import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [ // in reallity use s to m
    { duration: '2s', target: 1 },   // โหลดปกติ (100 virtual users)
    { duration: '5s', target: 10 },  // เพิ่มไปถึงระดับความเครียด (10x ของปกติ) (1000 virtual users)
    { duration: '2s', target: 20 },  // ความเครียดสูงสุด (20x ของปกติ) (2000 virtual users)
    { duration: '5s', target: 0 },     // ช่วงการฟื้นตัว (หยุดการทดสอบ)
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // เกณฑ์ที่ผ่อนปรนกว่าสำหรับการทดสอบความเครียด
    http_req_failed: ['rate<0.1'],   // อัตราความผิดพลาดน้อยกว่า 10%
  },
};

export default function () {
  const res = http.get('https://jsonplaceholder.typicode.com/users');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  // ระยะเวลาพักสั้นลงเพื่อเพิ่มความเข้มข้นของโหลด
  sleep(0.3);
}
