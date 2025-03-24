# load_testing


**Prepare**
- Required Bun
- Required K6 Engine (CLI)
```bash
npm install
```


**Execution**
<!-- With nodejs (npm) -->
```bash
npm run start
# OR -> K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=report.html k6 run --out json=result.json index.js
# post script for merge report or etc...
npx -y bun run ./post_script.ts
```
<!-- With docker compose -->
```bash
docker-compose run --rm --remove-orphans k6 run --out json=/k6-script/result.json /k6-script/index.js
# post script for merge report or etc...
npx -y bun run ./post_script.ts
```
