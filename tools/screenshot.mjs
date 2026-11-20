// Usage: node tools/screenshot.mjs "#/page-slug" [more routes...]
// Serves the site locally (with .doc-additions.txt merged in) and saves desktop + phone screenshots to /tmp/shots.
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  fs.readFile(p, (e, b) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); res.end(b); });
}).listen(4173);
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ['#/'];
fs.mkdirSync('/tmp/shots', { recursive: true });
const browser = await chromium.launch();
for (const [w, h, tag] of [[1366, 900, 'desktop'], [390, 844, 'phone']]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  for (const r of routes) {
    await page.goto('http://localhost:4173/?local=1' + r, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const file = `/tmp/shots/${tag}-${(r.replace(/[^a-z0-9]+/gi, '-') || 'home')}.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log('saved', file);
  }
  if (errors.length) console.log('PAGE ERRORS:', errors.join(' | '));
}
await browser.close(); server.close();
