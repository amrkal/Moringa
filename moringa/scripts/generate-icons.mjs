import { promises as fs } from 'fs';
import path from 'path';
import { generatePwaIcons } from '../src/lib/icons.js';

const root = path.resolve(process.cwd());
const publicDir = path.join(root, 'public');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}


async function main() {
  await ensureDir(publicDir);

  // Prefer logo.jpg; fallback to logo.png/svg if needed
  const candidates = ['logo.jpg', 'logo.png', 'logo.svg'];
  let source = null;
  for (const c of candidates) {
    try {
      await fs.access(path.join(publicDir, c));
      source = c;
      break;
    } catch {}
  }

  if (!source) {
    console.error('No logo found in /public (looked for logo.jpg|logo.png|logo.svg).');
    process.exit(1);
  }

  const sourcePath = path.join(publicDir, source);
  await generatePwaIcons({ sourcePath, publicDir });
  console.log('✓ Generated PWA icons');
}

main();
