import fs from 'fs-extra'

export const f = (s: string) => s?.split('\n')?.map((x) => x.replace('  ', ''))?.join('\n') ?? ''

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