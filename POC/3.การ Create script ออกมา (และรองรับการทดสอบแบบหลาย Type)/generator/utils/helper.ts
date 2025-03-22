import fs from 'fs-extra'
import beautify from 'js-beautify';

export const f = (s: string) => beautify.js(s, { indent_size: 2, preserve_newlines: false })?.toString()?.toString()?.replace(/export/g, '\nexport')

export const copyFolder = async (source_dir: string, destination_dir: string) => {
  try {
    // Remove the destination directory if it exists
    if (await fs.pathExists(destination_dir)) {
      await fs.remove(destination_dir);
    }
    await fs.copy(source_dir, destination_dir)
  } catch (err) {
    console.error('Error copying folder:', err);
  }
}