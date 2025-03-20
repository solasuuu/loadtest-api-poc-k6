import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';


// เมตริกที่กำหนดเองเพื่อติดตามประสิทธิภาพที่ระดับโหลดต่างๆ
const responseTimeByLevel = new Trend('response_time_by_level');

export const options = {
  stages: [ // in reallity use s to m
    { duration: '3s', target: 1 },   // ระดับที่ 1 (3m, 100)
    { duration: '5s', target: 1 },   // (5m, 100)
    { duration: '3s', target: 2 },   // ระดับที่ 2
    { duration: '5s', target: 2 },   // (5m, 200)
    { duration: '3s', target: 3 },   // ระดับที่ 3 (3m, 300)
    { duration: '5s', target: 3 },   // (5m, 300)
    { duration: '3s', target: 4 },   // ระดับที่ 4 (3m, 400)
    { duration: '5s', target: 4 },   // (5m, 400)
    { duration: '3s', target: 0 },     // ช่วงลดจำนวนผู้ใช้ (3m, 0)
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // เกณฑ์ประสิทธิภาพโดยรวม
  },
};

export default function () {
  // ระบุระดับปัจจุบันจากจำนวน VU
  let currentLevel = 1;
  if (__VU > 100) currentLevel = 2;
  if (__VU > 200) currentLevel = 3;
  if (__VU > 300) currentLevel = 4;
  
  const res = http.get('https://jsonplaceholder.typicode.com/posts');
  
  // บันทึกเวลาตอบสนองสำหรับระดับโหลดปัจจุบัน
  // Convert currentLevel to string to fix the type error
  responseTimeByLevel.add(res.timings.duration, { level: String(currentLevel) });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  sleep(1);
}