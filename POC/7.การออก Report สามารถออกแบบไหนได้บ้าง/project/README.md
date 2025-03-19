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
k6 run --out json=result group.ts 
(merge json to gzip and uploaded to obs)
