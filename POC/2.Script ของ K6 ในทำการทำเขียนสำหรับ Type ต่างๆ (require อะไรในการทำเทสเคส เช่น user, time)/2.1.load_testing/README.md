# load_testing

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.45. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.


<!-- report -->
k6 run --out json=test_results.json script.js

<!-- html -->
need to wait to script finish
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=pos-something.html k6 run index.ts