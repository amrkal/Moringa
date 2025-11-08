import sharp from 'sharp';
import path from 'path';
import { promises as fs } from 'fs';

export interface IconGenerationOptions {
  sourcePath: string; // absolute path to master logo
  publicDir?: string; // override public dir
  background?: { r: number; g: number; b: number; alpha: number };
}

const VARIANTS: Array<{ out: string; size: number }> = [
  { out: 'icon-192x192.png', size: 192 },
  { out: 'icon-512x512.png', size: 512 },
  { out: 'apple-touch-icon.png', size: 180 }
];

export async function generatePwaIcons(opts: IconGenerationOptions) {
  const publicDir = opts.publicDir || path.join(process.cwd(), 'public');
  await fs.mkdir(publicDir, { recursive: true });
  for (const variant of VARIANTS) {
    await sharp(opts.sourcePath)
      .resize({ width: variant.size, height: variant.size, fit: 'contain', background: opts.background || { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, variant.out));
  }
  return VARIANTS.map(v => v.out);
}
