import { gzip } from 'zlib';
import { promisify } from 'util';
import { existsSync } from 'fs';
const gzipPromise = promisify(gzip);

interface FileData {
  file: any;
  content: any;
}

async function readJsonFile(filePath: string, isArray: boolean = false): Promise<FileData> {
  const fileData: FileData = { file: null, content: null };
  
  try {
    fileData.file = Bun.file(filePath);
    let textContent = await fileData.file.text();
    
    if (isArray) {
      // Format non-standard JSON to valid JSON array
      if (!textContent.trim().startsWith('[')) {
        // Replace any trailing comma after the last object (if exists)
        textContent = textContent.replace(/,\s*$/, '');
        // Wrap individual JSON objects in array brackets
        textContent = '[' + textContent.replace(/}\s*{/g, '},{') + ']';
      }
    }
    
    fileData.content = JSON.parse(textContent);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    fileData.content = isArray ? [] : {};
  }
  
  return fileData;
}

async function compressAndSave(data: any, outputPath: string): Promise<void> {
  try {
    const gzipBuffer = await gzipPromise(typeof data === 'string' ? data : JSON.stringify(data));
    const outputFile = Bun.file(outputPath);
    await outputFile.write(gzipBuffer);
    console.info(`[INFO]: Created ${outputPath} successfully`);
  } catch (error) {
    console.error(`[ERROR]: Failed to create ${outputPath}:`, error);
  }
}

async function main() {
  // Run file processing tasks concurrently
  const [testSummary, testDetail] = await Promise.all([
    readJsonFile('./summary.json'),
    readJsonFile('./result.json', true)
  ]);
  
  // Check if report.html exists and read it, otherwise create a fallback HTML
  const reportFilePath = './report.html';
  let reportHtmlContent;
  
  if (existsSync(reportFilePath)) {
    const reportHtml = await readTextFile(reportFilePath);
    reportHtmlContent = reportHtml.content;
  } else {
    console.warn('[WARN]: report.html not found, creating a fallback HTML');
    reportHtmlContent = createFallbackHtml();
  }
  
  // Prepare merged report
  const mergedReport = {
    ...testSummary.content,
    test_detail: testDetail.content
  };
  
  // Compress and save files concurrently
  await Promise.all([
    compressAndSave(mergedReport, 'test-result.json.gz'),
    compressAndSave(reportHtmlContent, 'report.html.gz')
  ]);
}

async function readTextFile(filePath: string): Promise<FileData> {
  const fileData: FileData = { file: null, content: null };
  
  try {
    if (!existsSync(filePath)) {
      throw new Error(`File ${filePath} does not exist`);
    }
    
    fileData.file = Bun.file(filePath);
    fileData.content = await fileData.file.text();
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    fileData.content = '';
  }
  
  return fileData;
}

/**
 * Creates a simple HTML page with a message indicating the report was not found
 */
function createFallbackHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>K6 Report Not Found</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background-color: #f5f5f5;
    }
    .message {
      text-align: center;
      padding: 40px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #e53935;
    }
    p {
      color: #555;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="message">
    <h1>Not found html report</h1>
    <p>The k6 HTML report was not generated. This usually happens when the test run was too short.</p>
  </div>
</body>
</html>`;
}

// Execute the main function
main().catch(error => {
  console.error('[ERROR]: An unexpected error occurred:', error);
  process.exit(1);
});