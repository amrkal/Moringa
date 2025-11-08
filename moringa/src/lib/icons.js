import sharp from 'sharp';
import path from 'path';
import { promises as fs } from 'fs';

const VARIANTS = [
  { out: 'icon-192x192.png', size: 192 },
  { out: 'icon-512x512.png', size: 512 },
  { out: 'apple-touch-icon.png', size: 180 }
];

export async function generatePwaIcons({ sourcePath, publicDir, background }) {
  const outDir = publicDir || path.join(process.cwd(), 'public');
  await fs.mkdir(outDir, { recursive: true });
  for (const variant of VARIANTS) {
    await sharp(sourcePath)
      .resize({ width: variant.size, height: variant.size, fit: 'contain', background: background || { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(outDir, variant.out));
  }
  return VARIANTS.map(v => v.out);
}
