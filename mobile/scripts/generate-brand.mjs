// Regenerate launcher/splash/favicon PNGs and the React Native path from the SVG master.
// Uses the same local Chrome installation as the web smoke checks; no extra dependencies.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const svg = readFileSync(join(root, 'assets/spartan-pin.svg'), 'utf8');
const path = svg.match(/ d="([^"]+)"/)[1];
writeFileSync(join(root, 'src/brand.ts'), `// Generated from assets/spartan-pin.svg by scripts/generate-brand.mjs.\nexport const spartanPinPath = ${JSON.stringify(path)};\n`);
const specs = [
  ['icon.png', 1024, 780, '#173B58', '#E5A823'],
  ['android-icon-foreground.png', 1024, 620, null, '#E5A823'],
  ['android-icon-monochrome.png', 1024, 620, null, '#000000'],
  ['android-icon-background.png', 1024, 0, '#173B58', '#E5A823'],
  ['splash-icon.png', 512, 450, null, '#E5A823'],
  ['favicon.png', 48, 42, '#173B58', '#E5A823'],
];
const dir = mkdtempSync(join(tmpdir(), 'spartanspot-brand-'));
try {
  const html = `<html><body><script>
  const specs = ${JSON.stringify(specs)}, path = new Path2D(${JSON.stringify(path)});
  const images = specs.map(([name, size, markSize, background, color]) => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (background) { ctx.fillStyle = background; ctx.fillRect(0, 0, size, size); }
    ctx.translate((size - markSize) / 2, (size - markSize) / 2);
    ctx.scale(markSize / 100, markSize / 100); ctx.fillStyle = color; ctx.fill(path, 'evenodd');
    return [name, canvas.toDataURL('image/png').split(',')[1]];
  }); document.body.textContent = JSON.stringify(images);
  </script></body></html>`;
  const file = join(dir, 'brand.html'); writeFileSync(file, html);
  const dom = execFileSync(process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ['--headless=new', '--disable-gpu', '--no-first-run', `--user-data-dir=${join(dir, 'profile')}`, '--dump-dom', pathToFileURL(file).href],
    { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  const images = JSON.parse(dom.match(/<body>([\s\S]*?)<\/body>/)[1]);
  for (const [name, data] of images) writeFileSync(join(root, 'assets', name), Buffer.from(data, 'base64'));
  console.log(`Generated ${images.length} brand images and src/brand.ts.`);
} finally { rmSync(dir, { recursive: true, force: true }); }
