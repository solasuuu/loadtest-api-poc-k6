# Load Testing Script Examples with k6

เอกสารนี้แสดงตัวอย่างสคริปต์สำหรับการทดสอบประสิทธิภาพแบบต่างๆ โดยใช้ k6 กับ TypeScript

## 1. Load Testing

**วัตถุประสงค์**: ทดสอบว่าระบบทำงานได้อย่างไรภายใต้การใช้งานปกติที่คาดหวังไว้โดยมีจำนวนผู้ใช้ที่เพิ่มขึ้น

**ข้อมูลที่จำเป็นสำหรับการทดสอบ**:

- จำนวนผู้ใช้เป้าหมาย (VUs) (`options.stages[].target`)
- ช่วงเวลาในการเพิ่มจำนวนผู้ใช้ (`options.stages[].duration`)
- ระยะเวลาการทดสอบ (`options.stages[].duration`)
- จุดปลายทาง (Endpoint) ที่ต้องการทดสอบ (`http.get`)

```typescript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // เพิ่มผู้ใช้เป็น 100 คนในเวลา 2 นาที
    { duration: '5m', target: 100 }, // คงจำนวนผู้ใช้ที่ 100 คนเป็นเวลา 5 นาที
    { duration: '2m', target: 0 },   // ลดจำนวนผู้ใช้เป็น 0 คน
  ],
  thresholds: {
    http_req_duration: ['p95<500'], // 95% ของการร้องขอต้องเสร็จสิ้นภายใน 500 มิลลิวินาที
    'http_req_duration{staticAsset:yes}': ['p95<100'], // 95% ของการร้องขอไฟล์สถิตต้องเสร็จสิ้นภายใน 100 มิลลิวินาที
  },
};

export default function () {
  const res = http.get('https://api.example.com/users');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 400ms': (r) => r.timings.duration < 400,
  });
  
  sleep(1);
}
```

## 2. Stress Testing

**วัตถุประสงค์**: ทดสอบว่าระบบทำงานได้อย่างไรภายใต้สภาวะที่รุนแรง เกินกว่าโหลดสูงสุดที่คาดไว้

**ข้อมูลที่จำเป็นสำหรับการทดสอบ**:

- จำนวน VU สูงสุด (สูงกว่าปกติมาก) (`options.stages[].target`)
- ช่วงเวลาการเพิ่มจำนวนผู้ใช้ที่สั้น (`options.stages[].duration`)
- ระยะเวลาการทดสอบ (`options.stages[].duration`)
- เกณฑ์ความผิดพลาดที่ยอมรับได้ (`options.thresholds.http_req_failed`)

```typescript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // โหลดปกติ
    { duration: '5m', target: 1000 },  // เพิ่มไปถึงระดับความเครียด (10x ของปกติ)
    { duration: '2m', target: 2000 },  // ความเครียดสูงสุด
    { duration: '5m', target: 0 },     // ช่วงการฟื้นตัว
  ],
  thresholds: {
    http_req_duration: ['p95<2000'], // เกณฑ์ที่ผ่อนปรนกว่าสำหรับการทดสอบความเครียด
    http_req_failed: ['rate<0.1'],   // อัตราความผิดพลาดน้อยกว่า 10%
  },
};

export default function () {
  const res = http.get('https://api.example.com/resource');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  // ระยะเวลาพักสั้นลงเพื่อเพิ่มความเข้มข้นของโหลด
  sleep(0.3);
}
```

## 3. Endurance Testing (Soak Testing)

**วัตถุประสงค์**: ทดสอบว่าระบบทำงานได้อย่างไรในระยะเวลานานเพื่อระบุปัญหาเช่นการรั่วไหลของหน่วยความจำ

**ข้อมูลที่จำเป็นสำหรับการทดสอบ**:

- จำนวน VU ปานกลาง (`options.stages[].target`)
- ระยะเวลาการทดสอบที่ยาวนาน (หลายชั่วโมง) (`options.stages[].duration`)
- ตัวชี้วัดการใช้หน่วยความจำ (`options.thresholds.http_req_failed`)

```typescript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10m', target: 100 },  // ช่วงเพิ่มจำนวนผู้ใช้
    { duration: '8h', target: 100 },   // คงจำนวนผู้ใช้ไว้ที่เป้าหมายเป็นเวลา 8 ชั่วโมง
    { duration: '10m', target: 0 },    // ช่วงลดจำนวนผู้ใช้
  ],
  thresholds: {
    http_req_duration: ['p95<500'],
    http_req_failed: ['rate<0.01'],    // อัตราความผิดพลาดที่เข้มงวดมากขึ้นสำหรับการทดสอบความทนทาน
  },
};

export default function () {
  const responses = http.batch([
    ['GET', 'https://api.example.com/users'],
    ['GET', 'https://api.example.com/products'],
    ['GET', 'https://api.example.com/orders'],
  ]);
  
  // ตรวจสอบแต่ละการตอบสนอง
  responses.forEach((res, index) => {
    check(res, {
      'status is 200': (r) => r.status === 200,
    });
  });
  
  sleep(3); // ระยะเวลาพักที่นานขึ้นเพื่อจำลองพฤติกรรมผู้ใช้ที่สมจริง
}
```

## 4. Spike Testing

**วัตถุประสงค์**: ทดสอบว่าระบบจัดการกับการเพิ่มขึ้นของโหลดอย่างกะทันหันและจำนวนมากได้อย่างไร

**ข้อมูลที่จำเป็นสำหรับการทดสอบ**:

- จำนวน VU พื้นฐาน (`options.stages[].target`)
- จำนวน VU สูงสุด (สูงมาก) (`options.stages[].target`)
- ช่วงเวลาเพิ่มจำนวนผู้ใช้ที่สั้นมาก (`options.stages[].duration`)
- ช่วงเวลาการฟื้นตัว (`options.stages[].duration`)

```typescript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },    // โหลดปกติ
    { duration: '10s', target: 1000 }, // เพิ่มเป็น 1000 ผู้ใช้ในเวลาเพียง 10 วินาที
    { duration: '3m', target: 1000 },  // คงที่ที่ระดับสูงสุด
    { duration: '1m', target: 50 },    // ลดกลับสู่ระดับปกติ
    { duration: '3m', target: 50 },    // โหลดปกติอีกครั้งเพื่อดูการฟื้นตัว
  ],
  thresholds: {
    http_req_failed: ['rate<0.15'], // อนุญาตให้มีอัตราข้อผิดพลาดที่สูงขึ้นในช่วงการเพิ่มโหลดแบบกะทันหัน
  },
};

export default function () {
  const res = http.get('https://api.example.com/critical-path');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
  });
  
  sleep(0.5);
}
```

## 5. Scalability Testing

**วัตถุประสงค์**: ทดสอบว่าระบบสามารถขยายตัวรองรับการเพิ่มขึ้นของโหลดได้ดีแค่ไหน โดยค่อยๆ เพิ่มจำนวนผู้ใช้

**ข้อมูลที่จำเป็นสำหรับการทดสอบ**:

- ระดับของโหลดที่เพิ่มขึ้นหลายระดับ (`options.stages[].target`)
- ตัวชี้วัดประสิทธิภาพในแต่ละระดับ (`responseTimeByLevel`)
- ระยะเวลาที่เพียงพอในแต่ละระดับเพื่อวัดสถานะคงที่ (`options.stages[].duration`)

```typescript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

// เมตริกที่กำหนดเองเพื่อติดตามประสิทธิภาพที่ระดับโหลดต่างๆ
const responseTimeByLevel = new Trend('response_time_by_level');

export const options = {
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
    http_req_duration: ['p95<1000'], // เกณฑ์ประสิทธิภาพโดยรวม
  },
};

export default function () {
  const startTime = new Date().getTime();
  
  // ระบุระดับปัจจุบันจากจำนวน VU
  let currentLevel = 1;
  if (__VU > 100) currentLevel = 2;
  if (__VU > 200) currentLevel = 3;
  if (__VU > 300) currentLevel = 4;
  
  const res = http.get('https://api.example.com/scalability-test');
  
  // บันทึกเวลาตอบสนองสำหรับระดับโหลดปัจจุบัน
  responseTimeByLevel.add(res.timings.duration, { level: currentLevel });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  sleep(1);
}
```

## 6. Concurrency Testing

**วัตถุประสงค์**: ทดสอบว่าระบบจัดการกับการที่ผู้ใช้หลายคนเข้าถึงหรือแก้ไขทรัพยากรเดียวกันพร้อมกันได้อย่างไร

**ข้อมูลที่จำเป็นสำหรับการทดสอบ**:

- จำนวน VU สูง (`options.vus`)
- ทรัพยากรที่ใช้ร่วมกันที่กำลังถูกเข้าถึง/แก้ไข (`resourceId`)
- การตรวจสอบที่เหมาะสมเพื่อยืนยันความถูกต้องของข้อมูล (`check`)

```typescript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const options = {
  vus: 100,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p95<1000'],
    http_req_failed: ['rate<0.01'],  // เข้มงวดเรื่องข้อผิดพลาดสำหรับปัญหาการทำงานพร้อมกัน
  },
};

export default function () {
  // ทุก VU พยายามเข้าถึงทรัพยากรเดียวกัน
  const resourceId = '12345';
  
  // สร้างข้อมูลที่ไม่ซ้ำกันสำหรับ VU นี้
  const itemData = {
    id: uuidv4(),
    vu: __VU,
    timestamp: new Date().toISOString(),
  };
  
  // พยายามอัปเดตทรัพยากรเดียวกันพร้อมกัน
  const res = http.put(`https://api.example.com/resources/${resourceId}`, JSON.stringify(itemData), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'resource updated': (r) => JSON.parse(r.body).updated === true,
    'no concurrency errors': (r) => !r.body.includes('conflict'),
  });
  
  // ตรวจสอบว่าการอัปเดตสำเร็จ
  const checkRes = http.get(`https://api.example.com/resources/${resourceId}`);
  
  check(checkRes, {
    'can retrieve updated resource': (r) => r.status === 200,
  });
  
  sleep(0.5);
}
```

## 7. Performance Testing

**วัตถุประสงค์**: ทดสอบเวลาตอบสนองของระบบโดยรวม ปริมาณงานที่ทำได้ และการใช้ทรัพยากรภายใต้โหลดที่กำหนด

**ข้อมูลที่จำเป็นสำหรับการทดสอบ**:

- จำนวนผู้ใช้ที่เป็นตัวแทน (`options.vus`)
- ขั้นตอนการใช้งานแบบทั่วไปของผู้ใช้ (`group`)
- เกณฑ์ประสิทธิภาพเฉพาะ (`options.thresholds`)

```typescript
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend } from 'k6/metrics';

// เมตริกที่กำหนดเอง
const loginTrend = new Trend('login_time');
const searchTrend = new Trend('search_time');
const checkoutTrend = new Trend('checkout_time');

export const options = {
  vus: 50,  // โหลดที่สมจริงปานกลาง
  duration: '5m',
  thresholds: {
    'login_time': ['p95<500'],     // การเข้าสู่ระบบต้องรวดเร็ว
    'search_time': ['p95<800'],    // การค้นหามีเวลาที่ผ่อนปรนมากขึ้น
    'checkout_time': ['p95<1000'], // การชำระเงินสามารถช้าได้เล็กน้อย
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const baseUrl = 'https://api.example.com';
  let sessionToken;
  
  group('Login Flow', function () {
    const start = new Date();
    const loginRes = http.post(`${baseUrl}/auth/login`, JSON.stringify({
      username: `user_${__VU}@example.com`,
      password: 'testPassword123',
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    loginTrend.add(new Date() - start);
    
    check(loginRes, {
      'login successful': (r) => r.status === 200,
    });
    
    sessionToken = loginRes.json('token');
  });
  
  sleep(1);
  
  group('Search Products', function () {
    const start = new Date();
    const searchRes = http.get(`${baseUrl}/products?query=popular&limit=10`, {
      headers: { 'Authorization': `Bearer ${sessionToken}` },
    });
    
    searchTrend.add(new Date() - start);
    
    check(searchRes, {
      'search successful': (r) => r.status === 200,
      'products returned': (r) => JSON.parse(r.body).products.length > 0,
    });
  });
  
  sleep(2);
  
  group('Checkout Process', function () {
    const start = new Date();
    const checkoutRes = http.post(`${baseUrl}/orders/checkout`, JSON.stringify({
      productId: 'prod-123',
      quantity: 1,
      paymentMethod: 'credit_card',
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
    });
    
    checkoutTrend.add(new Date() - start);
    
    check(checkoutRes, {
      'checkout successful': (r) => r.status === 200,
      'order created': (r) => JSON.parse(r.body).orderId !== undefined,
    });
  });
  
  sleep(3);
}
```

## 8. Smoke Testing

**วัตถุประสงค์**: ทดสอบอย่างรวดเร็วเพื่อตรวจสอบว่าจุดปลายทาง API ทำงานได้ก่อนที่จะทำการทดสอบที่เข้มข้นมากขึ้น

**ข้อมูลที่จำเป็นสำหรับการทดสอบ**:

- รายการของจุดปลายทางที่สำคัญ (`endpoints`)
- จำนวน VU ขั้นต่ำ (`options.vus`)

```typescript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate=0'], // ไม่อนุญาตให้มีข้อผิดพลาดในการทดสอบแบบ smoke test
  },
};

export default function () {
  const baseUrl = 'https://api.example.com';
  
  // ตรวจสอบจุดปลายทางที่สำคัญ
  const endpoints = [
    '/health',
    '/users',
    '/products',
    '/orders',
    '/auth/status',
  ];
  
  for (const endpoint of endpoints) {
    const res = http.get(`${baseUrl}${endpoint}`);
    
    check(res, {
      [`${endpoint} returns 200`]: (r) => r.status === 200,
      [`${endpoint} responds quickly`]: (r) => r.timings.duration < 500,
    });
    
    sleep(1);
  }
}
```

## 9. Failover Testing

**วัตถุประสงค์**: ทดสอบความสามารถของระบบในการจัดการกับความล้มเหลวของส่วนประกอบและการสลับไปใช้ระบบสำรอง

**ข้อมูลที่จำเป็นสำหรับการทดสอบ**:

- รายละเอียดของกลไกการสลับไปใช้ระบบสำรอง (`FAILOVER_START_TIME`, `FAILOVER_DURATION`)
- วิธีการที่ใช้ในการกระตุ้นความล้มเหลว (`timeInTest`)
- ความคาดหวังในการฟื้นตัว (`check`)

```typescript
import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // โหลดปกติ
    { duration: '5m', target: 50 },   // โหลดคงที่ระหว่างการสลับไปใช้ระบบสำรอง
    { duration: '2m', target: 0 },    // ช่วงลดจำนวนผู้ใช้
  ],
  thresholds: {
    http_req_failed: ['rate<0.10'],   // อนุญาตให้มีข้อผิดพลาดบางส่วนในระหว่างการสลับไปใช้ระบบสำรอง
  },
};

// จำลองตัวกระตุ้นภายนอกสำหรับการสลับไปใช้ระบบสำรอง (ในความเป็นจริงจะถูกกระตุ้นจากภายนอก k6)
const FAILOVER_START_TIME = 120; // วินาทีในการทดสอบ
const FAILOVER_DURATION = 60;    // วินาที

export default function () {
  const timeInTest = exec.scenario.iterationInTest / 1000;
  let endpoint = 'https://api.example.com';
  
  // ตรวจสอบว่าเราอยู่ในช่วงเวลาการสลับไปใช้ระบบสำรองหรือไม่
  if (timeInTest > FAILOVER_START_TIME && timeInTest < (FAILOVER_START_TIME + FAILOVER_DURATION)) {
    console.log('ทดสอบในช่วงการจำลองสถานการณ์การสลับไปใช้ระบบสำรอง');
  }
  
  const res = http.get(`${endpoint}/status`);
  
  check(res, {
    'still responds during failover': (r) => r.status < 500, // อาจจะคืนค่า 200-499 แต่ไม่ควรเป็นข้อผิดพลาดของเซิร์ฟเวอร์
    'recovery time acceptable': (r) => r.timings.duration < 2000, // อนุญาตให้มีความล่าช้ามากขึ้นระหว่างการสลับไปใช้ระบบสำรอง
  });
  
  sleep(1);
}
```

## 10. Capacity Testing

**วัตถุประสงค์**: กำหนดความสามารถสูงสุดก่อนที่ประสิทธิภาพจะลดลง

**ข้อมูลที่จำเป็นสำหรับการทดสอบ**:

- ระดับโหลดที่เพิ่มขึ้นอย่างต่อเนื่อง (`options.stages[].target`)
- เกณฑ์ประสิทธิภาพที่ชัดเจน (`options.thresholds`)
- ตัวชี้วัดเพื่อกำหนดจุดอิ่มตัว (`responseTimeByVU`)

```typescript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const responseTimeByVU = new Trend('response_time_by_vu_count');

export const options = {
  stages: [
    // เพิ่มโหลดอย่างต่อเนื่องเพื่อหาจุดแตกหัก
    { duration: '2m', target: 100 },
    { duration: '3m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '3m', target: 200 },
    { duration: '2m', target: 300 },
    { duration: '3m', target: 300 },
    { duration: '2m', target: 400 },
    { duration: '3m', target: 400 },
    { duration: '2m', target: 500 },
    { duration: '3m', target: 500 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  const res = http.get('https://api.example.com/capacity-test-endpoint');
  
  // บันทึกเวลาตอบสนองพร้อมกับจำนวน VU ปัจจุบัน
  responseTimeByVU.add(res.timings.duration, { vus: __VU });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  // ติดตามอัตราข้อผิดพลาดเนื่องจากเป็นตัวบ่งชี้ความจุที่สำคัญ
  if (res.status >= 400) {
    console.warn(`ตรวจพบข้อผิดพลาดที่ระดับ VU: ${__VU}, สถานะ: ${res.status}`);
  }
  
  sleep(1);
}
```

## Best Practices for k6 API Load Testing

1. **เริ่มต้นด้วย Smoke Tests**: ควรเริ่มต้นด้วยการทดสอบแบบ smoke test เพื่อให้แน่ใจว่า API ของคุณทำงานได้ก่อนที่จะทำการทดสอบที่เข้มข้น
2. **กำหนดเกณฑ์ที่สมจริง**: กำหนดเกณฑ์ที่เหมาะสมตาม SLA หรือเป้าหมายประสิทธิภาพ
3. **ติดตามการใช้ทรัพยากร**: ดูเมตริกของเซิร์ฟเวอร์ควบคู่ไปกับเมตริกของ k6 เพื่อระบุคอขวด
4. **ใช้การรับรองความถูกต้องที่เหมาะสม**: ตรวจสอบว่าสคริปต์ทดสอบของคุณจัดการกับการรับรองความถูกต้องอย่างเหมาะสมหากทดสอบจุดปลายทางที่มีการรักษาความปลอดภัย
5. **ความสัมพันธ์ของข้อมูล**: ดึงค่าจากการตอบสนองและใช้ในคำขอถัดไปเมื่อจำเป็น
6. **พารามิเตอร์ข้อมูลทดสอบ**: ใช้ไฟล์ CSV หรือแหล่งข้อมูลภายนอกอื่นๆ สำหรับชุดข้อมูล