import http from 'k6/http';
import { check, sleep } from 'k6';
// @ts-ignore
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'

export const options = {
  // รูปแบบ 1: ใช้ iterations - จะรัน 10 ครั้งแล้วจบ
  // iterations: 10,   // จะรันฟังก์ชันหลัก 10 ครั้งแล้วจบการทดสอบ
  // vus: 5,           // ใช้ virtual users 5 คนในการรัน 10 ครั้ง (ประมาณคนละ 2 รอบ)
  
  // รูปแบบ 2: ใช้ stages - จะรันตามระยะเวลาที่กำหนด (comment ไว้เพื่อแสดงความแตกต่าง)
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
    http_reqs: ['rate>5'],          // ต้องจัดการ requests ได้มากกว่า 5 req/s
    
    // เกณฑ์สำหรับ endpoint เฉพาะ
    'http_req_duration{name:login}': ['p(95)<300'],   // endpoint login ต้องเร็วเป็นพิเศษ
    'http_req_duration{name:search}': ['p(95)<600'],  // endpoint search อาจช้ากว่าได้
    
    // ตัวอย่าง custom metric
    // 'my_custom_metric': ['value<500'],
  },
};

export default function () { // parameter สามารถรับมาจาก setup ได้
  const res = http.get('https://jsonplaceholder.typicode.com/users');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 400ms': (r) => r.timings.duration < 400,
  });
  // console.log('\ndata_from_setup', data_from_setup)

  sleep(1);
}


// ฟังก์ชัน setup ทำงานก่อนการทดสอบเริ่ม
export function setup() {
  console.log('!! Starting test execution');
  return { startTime: new Date().toISOString() };
}

// // ฟังก์ชัน teardown ทำงานหลังจากการทดสอบเสร็จสิ้น (ก่อน handleSummary)
export function teardown(data: any) {
  console.log(`!! Test execution completed. Started at: ${data.startTime}`);
}


export function handleSummary(data: any) {
  return {
    'summary.json': JSON.stringify(data),
    'stdout': textSummary(data, { indent: ' ', enableColors: true })
  };
}