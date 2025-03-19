import { gzip } from 'zlib'
import { promisify } from 'util';
const gzipPromise = promisify(gzip)

const report_file_name = 'summary.json';

// Read the JSON file content
const json_file = Bun.file(report_file_name);
const json_content = JSON.parse(await json_file.text());
// Compress the JSON data
const gzip_buffer = await gzipPromise(JSON.stringify(json_content));

// Save the compressed data
const save = Bun.file(`${report_file_name}.gz`);
await save.write(gzip_buffer);
console.log('File successfully compressed and saved as summary.json.gz');