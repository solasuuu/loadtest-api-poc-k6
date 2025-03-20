import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend } from 'k6/metrics';

// เมตริกที่กำหนดเอง
const loginTrend = new Trend('login_time');
const searchTrend = new Trend('search_time');
const checkoutTrend = new Trend('checkout_time');

export const options = {
  vus: 50,  // โหลดที่สมจริงปานกลาง (50) // คือจำนวน Virtual Users ที่จะสร้างขึ้นมาในการทดสอบ
  duration: '1m',
  thresholds: {
    'login_time': ['p(95)<500'],     // การเข้าสู่ระบบต้องรวดเร็ว
    'search_time': ['p(95)<800'],    // การค้นหามีเวลาที่ผ่อนปรนมากขึ้น
    'checkout_time': ['p(95)<1000'], // การชำระเงินสามารถช้าได้เล็กน้อย
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // เปลี่ยนเป็น API สาธารณะที่พร้อมใช้งาน
  const baseUrl = 'https://jsonplaceholder.typicode.com';
  let userId: string;
  
  group('Login Flow', function () {
    const start = new Date();
    // ใช้การดึงข้อมูลผู้ใช้แทนการล็อกอิน
    const loginRes = http.get(`${baseUrl}/users/${__VU % 10 + 1}`);
    
    loginTrend.add(new Date().getTime() - start.getTime());
    
    check(loginRes, {
      'login successful': (r) => r.status === 200,
      // @ts-ignore
      'user data returned': (r) => r.json().id !== undefined,
    });
    
    const user = loginRes?.json() as { id: string };
    userId = user.id;
  });
  
  sleep(1);
  
  group('Search Products', function () {
    const start = new Date();
    // ใช้การเรียกดูโพสต์แทนการค้นหาสินค้า
    const searchRes = http.get(`${baseUrl}/posts?userId=${userId}`);
    
    searchTrend.add(new Date().getTime() - start.getTime());
    
    check(searchRes, {
      'search successful': (r) => r.status === 200,
      // @ts-ignore
      'results returned': (r) => r.json().length > 0,
    });
  });
  
  sleep(2);
  
  group('Checkout Process', function () {
    const start = new Date();
    // ใช้การส่งความคิดเห็นแทนการชำระเงิน
    const checkoutRes = http.post(`${baseUrl}/comments`, JSON.stringify({
      postId: 1,
      name: `User ${__VU}`,
      email: `user_${__VU}@example.com`,
      body: "This is a test comment for performance testing"
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    checkoutTrend.add(new Date().getTime() - start.getTime());
    
    check(checkoutRes, {
      'checkout successful': (r) => r.status === 201,
      // @ts-ignore
      'comment created': (r) => r.json().id !== undefined,
    });
  });
  
  sleep(3);
}