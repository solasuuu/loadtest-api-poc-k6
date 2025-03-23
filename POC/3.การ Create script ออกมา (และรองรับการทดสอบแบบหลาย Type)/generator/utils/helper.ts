import path from 'path'
import tar from 'tar-fs'
import fs from 'fs-extra'
import ignore from 'ignore'
import beautify from 'js-beautify'
import { promisify } from 'util'
import { gzip, createGzip } from 'zlib'
import { pipeline } from 'stream/promises'

const gzipPromise = promisify(gzip);

export const f = (s: string) => beautify.js(s, { indent_size: 2, preserve_newlines: false })?.toString()?.toString()?.replace(/export/g, '\nexport')

export const copyFolder = async (source_dir: string, destination_dir: string) => {
  try {
    // Remove the destination directory if it exists
    if (await fs.pathExists(destination_dir)) {
      await fs.remove(destination_dir);
    }
    
    // Check if .gitignore exists in the source directory
    const gitignorePath = path.join(source_dir, '.gitignore');
    let ignoreFilter = ignore();
    
    // If .gitignore exists, read and parse it
    if (await fs.pathExists(gitignorePath)) {
      const gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
      // Add node_modules explicitly along with .gitignore content
      ignoreFilter = ignore().add(gitignoreContent).add('node_modules/**');
    } else {
      // Default to ignoring node_modules if no .gitignore is found
      ignoreFilter = ignore().add('node_modules/**');
    }
    
    // Copy with filter based on .gitignore rules
    await fs.copy(source_dir, destination_dir, {
      filter: (src, dest) => {
        // Get the relative path from source directory
        const relativePath = path.relative(source_dir, src);
        
        // Always copy the root directory
        if (relativePath === '') {
          return true;
        }
        
        // Explicitly check for node_modules path
        if (relativePath === 'node_modules' || relativePath.startsWith('node_modules/') || relativePath.includes('/node_modules/')) {
          return false;
        }
        
        // Check if the path should be ignored according to .gitignore rules
        return !ignoreFilter.ignores(relativePath);
      }
    });
    
    console.info(`[INFO]: Folder copied from ${source_dir} to ${destination_dir} (excluding node_modules)`);
  } catch (err) {
    console.error('Error copying folder:', err);
  }
}

export const compressAndSaveToGzip = async (data: any, outputPath: string) => {
  try {
    const gzipBuffer = await gzipPromise(typeof data === 'string' ? data : JSON.stringify(data));
    const outputFile = fs.createWriteStream(outputPath);
    outputFile.write(gzipBuffer);
    console.info(`[INFO]: Created ${outputPath} successfully`);
  } catch (error) {
    console.error(`[ERROR]: Failed to create ${outputPath}:`, error);
  }
}

export const compressFolderToGzip = async (sourceDir: string, outputPath: string) => {
  try {
    // Make sure outputPath is a file, not a directory
    const finalOutputPath = outputPath.endsWith('.tar.gz') ? outputPath : `${outputPath}.tar.gz`;
    
    // Get the directory part of the output path
    const outputDir = path.dirname(finalOutputPath);
    
    // Skip directory creation if it's the parent directory or it already exists
    if (outputDir !== '.' && outputDir !== '..' && !fs.existsSync(outputDir)) {
      await fs.ensureDir(outputDir);
    }
    
    // Create read stream for the directory using tar-fs
    const tarStream = tar.pack(sourceDir);
    
    // Create gzip transform stream
    const gzipStream = createGzip();
    
    // Create write stream for output file
    const outputStream = fs.createWriteStream(finalOutputPath);
    
    // Pipe streams together: tar -> gzip -> file
    await pipeline(tarStream, gzipStream, outputStream);
    
    console.info(`[INFO]: Directory ${sourceDir} compressed to ${finalOutputPath} successfully`);
  } catch (error) {
    console.error(`[ERROR]: Failed to compress directory ${sourceDir}:`, error);
  }
}