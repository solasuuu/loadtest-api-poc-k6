# load_testing


**Prepare**
- Required Bun
- Required K6 Engine (CLI)
```bash
npm install
```


**Execution**
```bash
npm run start
# OR -> K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=report.html k6 run --out json=result.json index.ts
```