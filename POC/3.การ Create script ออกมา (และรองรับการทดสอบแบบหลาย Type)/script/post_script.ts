import { gzip } from 'zlib';
import { promisify } from 'util';
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
  const [testSummary, testDetail, reportHtml] = await Promise.all([
    readJsonFile('./summary.json'),
    readJsonFile('./result.json', true),
    readTextFile('./report.html')
  ]);
  
  // Prepare merged report
  const mergedReport = {
    ...testSummary.content,
    test_detail: testDetail.content
  };
  
  // Compress and save files concurrently
  await Promise.all([
    compressAndSave(mergedReport, 'test-result.json.gz'),
    compressAndSave(reportHtml.content, 'report.html.gz')
  ]);
}

async function readTextFile(filePath: string): Promise<FileData> {
  const fileData: FileData = { file: null, content: null };
  
  try {
    fileData.file = Bun.file(filePath);
    fileData.content = await fileData.file.text();
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    fileData.content = '';
  }
  
  return fileData;
}

// Execute the main function
main().catch(error => {
  console.error('[ERROR]: An unexpected error occurred:', error);
  process.exit(1);
});