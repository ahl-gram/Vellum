// A 1:1 (and magnified) crop of the head cluster, because glance properties only exist at full scale and glyph
// choices only exist up close: a still that shows the cluster 14px tall cannot settle whether a separator reads
// as a path or as a list. Each job: url|w|h|mobile|scale|out. The clip is taken from the cluster's own rect plus
// whatever the direction seated under it, read in the page, so it never needs hand-measured coordinates.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BRAVE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const [, , ...jobs] = process.argv;
const port = 9833 + Math.floor(Math.random() * 400);
const dir = mkdtempSync(join(tmpdir(), 'nav-crop-'));
const brave = spawn(BRAVE, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`,
  '--disable-gpu', '--hide-scrollbars', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(250);
  try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page'); } catch { /* not up yet */ }
}
if (!target) { brave.kill(); throw new Error('no debug target'); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0; const waiters = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && waiters.has(m.id)) { waiters.get(m.id)(m); waiters.delete(m.id); } };
const send = (method, params = {}) => new Promise((res, rej) => {
  const i = ++id; waiters.set(i, (m) => (m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result)));
  ws.send(JSON.stringify({ id: i, method, params }));
});
await send('Page.enable'); await send('Runtime.enable');

// The clip is in DOCUMENT coordinates, not viewport coordinates, so the page scroll is added back in; a clip
// read straight off getBoundingClientRect crops the wrong strip on any scrolled page.
const RECT = `(() => {
  const parts = ['header.chrome', '.rank', '.trail', '.also', '.atelier-press'].map((s) => document.querySelector(s)).filter(Boolean);
  const r = parts.map((e) => e.getBoundingClientRect());
  const x = Math.min(...r.map((b) => b.left)), y = Math.min(...r.map((b) => b.top));
  const right = Math.max(...r.map((b) => b.right)), bottom = Math.max(...r.map((b) => b.bottom));
  return JSON.stringify({ x: x + scrollX - 10, y: y + scrollY - 10, width: right - x + 20, height: bottom - y + 20 });
})()`;

// try/finally, because a throw anywhere below used to skip the kill and leak a headless browser per failed run:
// thirty were found alive hours later, and a starved machine stalls a run nobody touched rather than failing it.
try {
for (const job of jobs) {
  const [url, w, h, mobile, scale, out] = job.split('|');
  await send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: 1, mobile: mobile === '1' });
  await send('Page.navigate', { url });
  await sleep(2400);
  const box = JSON.parse((await send('Runtime.evaluate', { expression: RECT, returnByValue: true })).result.value);
  const shot = await send('Page.captureScreenshot', { format: 'png', clip: { ...box, scale: +scale } });
  writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log(out, JSON.stringify(box));
}
} finally {
  ws.close(); brave.kill();
}
