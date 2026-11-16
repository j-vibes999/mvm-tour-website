#!/usr/bin/env node
// Download only licensed source photography and produce local responsive WebP derivatives.
// Requires cwebp and ffprobe on PATH. Existing valid derivatives are kept; use --refresh to replace them.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { photos } from '../dist/content.js';
import { extraPhotos } from '../dist/media-catalog.js';
const exec = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist/assets/images/photos');
const catalogPath = path.join(root, 'dist/media-catalog.js');
const cache = await fs.mkdtemp(path.join(os.tmpdir(), 'mvm-photo-cache-'));
const refresh = process.argv.includes('--refresh');
const entries = Object.entries({ ...photos, ...extraPhotos });
const generated = {};
const userAgent = 'MVMGroupWebsiteAssetBuilder/1.0 (licensed Commons photography)';
await fs.mkdir(output, { recursive: true });
async function exists(file) { try { return (await fs.stat(file)).size > 100; } catch { return false; } }
async function download(url, file) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(url, { headers: { 'User-Agent': userAgent }, signal: AbortSignal.timeout(45000) });
    if ((response.status === 429 || response.status >= 500) && attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2500));
      continue;
    }
    if (!response.ok) throw new Error(`${response.status} downloading ${url}`);
    const type = response.headers.get('content-type') || '';
    if (!type.startsWith('image/')) throw new Error(`Unexpected content type ${type}`);
    await fs.writeFile(file, Buffer.from(await response.arrayBuffer()));
    return;
  }
}
try {
  // Sequential requests respect Commons rate limits and avoid concurrent source-image downloads.
  for (const [key, photo] of entries) {
    if (!/^[a-z0-9-]+$/.test(key)) throw new Error(`Unsafe photo key: ${key}`);
    const max = Math.min(1600, photo.w);
    const widths = [...new Set([480, 960, max].filter(width => width <= max))].sort((a, b) => a - b);
    const files = widths.map(width => path.join(output, `${key}-${width}.webp`));
    const complete = (await Promise.all(files.map(exists))).every(Boolean);
    if (refresh || !complete) {
      const input = path.join(cache, `${key}.source`);
      // Commons standard derivatives are 330/960/1920; resize the1920 source locally, with no upscale.
      const source = photo.src.replace('/960px-', '/1920px-');
      await download(source, input);
      const probe = JSON.parse((await exec('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height', '-of', 'json', input])).stdout).streams[0];
      if (probe.width < max) throw new Error(`${key}: source ${probe.width}px is narrower than declared ${max}px`);
      for (let index = 0; index < widths.length; index++) {
        await exec('cwebp', ['-quiet', '-q', '78', '-m', '6', '-resize', String(widths[index]), '0', '-metadata', 'none', input, '-o', files[index]]);
      }
      // Be polite even where no retry is necessary.
      await new Promise(resolve => setTimeout(resolve, 350));
    }
    const paths = widths.map(width => `assets/images/photos/${key}-${width}.webp`);
    generated[key] = {
      src: paths[widths.findIndex(width => width >= 960) < 0 ? widths.length - 1 : widths.findIndex(width => width >= 960)],
      srcset: widths.map((width, i) => `${paths[i]} ${width}w`).join(', '),
      w: photo.w, h: photo.h, widths,
      derivative: 'Resized and converted to WebP; display may crop to fit.',
    };
    console.log(`${key}: ${widths.join('/')}px`);
  }
  const source = await fs.readFile(catalogPath, 'utf8');
  const replacement = `// BEGIN GENERATED LOCAL PHOTOS\nexport const localPhotos = ${JSON.stringify(generated, null, 2)};\n// END GENERATED LOCAL PHOTOS`;
  if (!source.includes('// BEGIN GENERATED LOCAL PHOTOS')) throw new Error('Missing catalog generation marker');
  await fs.writeFile(catalogPath, source.replace(/\/\/ BEGIN GENERATED LOCAL PHOTOS[\s\S]*?\/\/ END GENERATED LOCAL PHOTOS/, replacement));
  console.log(`Cached ${entries.length} licensed photos.`);
} finally {
  await fs.rm(cache, { recursive: true, force: true });
}
