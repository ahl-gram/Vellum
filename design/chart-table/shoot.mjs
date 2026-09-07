// Minimal CDP shooter (Node's global WebSocket): true device metrics, so a 390 shot LAYS OUT at 390 (the --window-size trap in memory).
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const BRAVE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const [,, ...jobs] = process.argv; // each job: url|w|h|mobile(0/1)|out
const port = 9333 + Math.floor(Math.random() * 500);
const dir = mkdtempSync(join(tmpdir(), 'mock-shoot-'));
const brave = spawn(BRAVE, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, '--disable-gpu', '--hide-scrollbars', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) { await sleep(250); try { const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); target = list.find((t) => t.type === 'page'); } catch {} }
if (!target) { brave.kill(); throw new Error('no debug target'); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0; const waiters = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && waiters.has(m.id)) { waiters.get(m.id)(m); waiters.delete(m.id); } };
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; waiters.set(i, (m) => m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result)); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable'); await send('Runtime.enable');
for (const job of jobs) {
  const [url, w, h, mobile, out, script, probeExpr] = job.split('|');
  await send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: 1, mobile: mobile === '1' });
  await send('Page.navigate', { url });
  await sleep(2600);
  if (script) { await send('Runtime.evaluate', { expression: script, awaitPromise: true }); await sleep(600); }
  const r = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(out, Buffer.from(r.data, 'base64'));
  const probe = await send('Runtime.evaluate', { expression: probeExpr || `(()=>{try{return JSON.stringify({cw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth, sheet: (document.getElementById('sheet')||document.querySelector('.sheet')).getBoundingClientRect().toJSON()})}catch(e){return String(e)}})()`, returnByValue: true });
  console.log(out, probe.result.value);
}
ws.close(); brave.kill();
