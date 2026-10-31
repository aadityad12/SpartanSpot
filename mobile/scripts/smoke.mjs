// Render-check for the web build: serves an `expo export --platform web`
// output folder and loads each route in headless Chrome, failing if a route
// renders without the expected text (usually a crash or a blank screen).
//
// Usage: npm run export:web && npm run smoke -- "<route>=<expected text>" ...
// The export folder defaults to dist/; pass a folder as the first argument to override.
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const args = process.argv.slice(2);
const dir = args[0] && !args[0].includes('=') ? args.shift() : 'dist';
const checks = args;
if (checks.length === 0) {
  console.error('Usage: npm run smoke -- [exportDir] "<route>=<expected text>" ...');
  process.exit(2);
}

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.ttf': 'font/ttf', '.png': 'image/png' };
const server = createServer(async (request, response) => {
  const path = normalize(decodeURIComponent(new URL(request.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  try {
    const body = await readFile(join(dir, path));
    response.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream' }).end(body);
  } catch {
    // Single-page app fallback: every unknown path gets index.html.
    response.writeHead(200, { 'Content-Type': 'text/html' }).end(await readFile(join(dir, 'index.html')));
  }
});
await new Promise(resolve => server.listen(0, resolve));
const port = server.address().port;

const dump = url => new Promise(resolve => execFile(chrome,
  ['--headless=new', '--disable-gpu', '--no-first-run', '--window-size=430,932', '--virtual-time-budget=10000', '--dump-dom', url],
  { maxBuffer: 50 * 1024 * 1024, timeout: 60000 }, (error, stdout) => resolve(error ? '' : stdout)));

let failed = 0;
for (const check of checks) {
  const split = check.indexOf('=');
  const route = check.slice(0, split);
  const expected = check.slice(split + 1);
  const html = await dump(`http://localhost:${port}${route}`);
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/\s+/g, ' ');
  const ok = text.includes(expected);
  if (!ok) failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${route}  (expected "${expected}")`);
  if (!ok) console.log(`      rendered text: ${text.trim().slice(0, 300) || '<empty>'}`);
}
server.close();
process.exit(failed ? 1 : 0);
