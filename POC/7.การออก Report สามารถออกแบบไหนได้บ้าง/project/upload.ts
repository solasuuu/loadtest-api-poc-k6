import { gzip } from 'zlib'
import { promisify } from 'util';
const gzipPromise = promisify(gzip)


const test_summary: any = {
  file: null,
  content: null
}

const test_detail: any = {
  file: null,
  content: null
}

test_summary.file = Bun.file('summary.json');
test_summary.content = JSON.parse(await test_summary?.file?.text());

test_detail.file = Bun.file('result.json');
const make_valid_json = await test_detail?.file?.text();

// Convert the non-standard JSON format to a valid JSON array
let validJsonString = make_valid_json;
// First, check if it's already a valid JSON array
if (!validJsonString.trim().startsWith('[')) {
  // Replace any trailing comma after the last object (if exists)
  validJsonString = validJsonString.replace(/,\s*$/, '');
  // Wrap individual JSON objects in array brackets
  validJsonString = '[' + validJsonString.replace(/}\s*{/g, '},{') + ']';
}

try {
  test_detail.content = JSON.parse(validJsonString);
} catch (error) {
  console.error('Error parsing JSON:', error);
  test_detail.content = []; // Default to empty array if parsing fails
}

const merged_report = {
  ...test_summary.content,
  test_detail: test_detail.content
}

// Compress the JSON data
const gzip_buffer = await gzipPromise(JSON.stringify(merged_report));

// Save the compressed data
const save = Bun.file(`result.json.gz`);
await save.write(gzip_buffer);
console.log('File successfully compressed and saved as summary.json.gz');