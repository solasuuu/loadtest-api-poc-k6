# K6 Load Testing Best Practices

This folder contains examples of common load testing types using K6 with TypeScript, following industry best practices.

## Project Structure

```
project/
├── config/               # Configuration files (ไฟล์กำหนดค่า)
│   ├── environments.ts   # Environment-specific settings (การตั้งค่าเฉพาะสภาพแวดล้อม)
│   └── thresholds.ts     # Performance thresholds (เกณฑ์ประสิทธิภาพ)
├── scenarios/            # Test scenarios (สถานการณ์การทดสอบ)
│   ├── load-test.ts      # Standard load test (การทดสอบโหลดมาตรฐาน)
│   ├── stress-test.ts    # Stress testing (การทดสอบความเครียด)
│   ├── soak-test.ts      # Endurance/soak testing (การทดสอบความทนทาน/แช่)
│   ├── spike-test.ts     # Spike testing (การทดสอบการเพิ่มขึ้นอย่างรวดเร็ว)
│   ├── scalability-test.ts  # Scalability testing (การทดสอบความสามารถในการปรับขนาด)
│   ├── concurrency-test.ts  # Concurrency testing (การทดสอบการทำงานพร้อมกัน)
│   └── performance-test.ts  # Performance testing (การทดสอบประสิทธิภาพ)
├── data/                 # Test data (ข้อมูลการทดสอบ)
│   ├── users.json        # User credentials (ข้อมูลประจำตัวผู้ใช้)
│   └── payloads.json     # Request payload templates (แม่แบบ payload ของคำขอ)
├── helpers/              # Utility functions (ฟังก์ชันยูทิลิตี้)
│   ├── auth.ts           # Authentication helpers (ตัวช่วยการตรวจสอบสิทธิ์)
│   ├── checks.ts         # Response validation (การตรวจสอบการตอบกลับ)
│   └── utils.ts          # Common utilities (ยูทิลิตี้ทั่วไป)
├── types/                # TypeScript definitions (นิยาม TypeScript)
│   └── index.ts          # Common types (ประเภททั่วไป)
├── tsconfig.json         # TypeScript configuration (การกำหนดค่า TypeScript)
└── package.json          # Project dependencies (การพึ่งพาโครงการ)
```

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Run a specific test:
```bash
k6 run scenarios/load-test.ts
```

## Examples Overview

- **Load Testing**: Tests system behavior under expected load
- **Stress Testing**: Tests system limits under extreme load
- **Soak Testing**: Tests stability over extended periods
- **Spike Testing**: Tests response to sudden load spikes
- **Scalability Testing**: Tests ability to scale with increased load
- **Concurrency Testing**: Tests handling of simultaneous users
- **Performance Testing**: Tests response times and throughput
