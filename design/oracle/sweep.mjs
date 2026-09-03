// The #465 screenshot oracle sweep (issue body item 2): serves a built dist/ and shoots every route at 1280x800 desktop and a TRUE 390x844 phone (mobile device metrics, so the page lays out at 390), full page for the content pages, the head box (0,0,w,band) for the app surfaces whose live SVG never byte-compares, plus the specimen at both. Usage: node sweep.mjs <dist-dir> <out-dir> [label]
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile, mkdtemp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, extname } from "node:path";

const [,, DIST, OUT, LABEL = ""] = process.argv;
if (!DIST || !OUT) { console.error("usage: node sweep.mjs <dist> <out> [label]"); process.exit(2); }
const BRAVE = "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json", ".png": "image/png", ".woff2": "font/woff2", ".ico": "image/x-icon", ".txt": "text/plain", ".xml": "application/xml" };
const CONTENT = ["/", "/faq/", "/glossary/", "/gallery/"];
const APP = ["/explorer/", "/reading-room/", "/print-room/", "/prospect/", "/ribbon/", "/seed-of-the-day/"];
const SPECIMEN = ["/specimen/"];
const BAND = 122; // the head cluster's band, 7.6rem
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const dist = resolve(DIST);
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const f = resolve(dist, "." + p);
  if (!f.startsWith(dist) || !existsSync(f)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { "content-type": MIME[extname(f)] ?? "application/octet-stream" }).end(await readFile(f));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const PORT = server.address().port;

const port = 9400 + Math.floor(Math.random() * 400);
const dir = await mkdtemp(join(tmpdir(), "oracle-"));
const brave = spawn(BRAVE, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--no-first-run", "--window-size=1280,800", "about:blank"], { stdio: "ignore" });
let target;
for (let i = 0; i < 60 && !target; i++) { await sleep(250); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page"); } catch {} }
if (!target) throw new Error("no debug target");
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0; const waiters = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && waiters.has(m.id)) { waiters.get(m.id)(m); waiters.delete(m.id); } };
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; waiters.set(i, (m) => (m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result))); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value;
await send("Page.enable"); await send("Runtime.enable");
await mkdir(OUT, { recursive: true });

// The Explorer's live "drawn in NNNms" caption is pinned (body item 2) so the head box compares; the Reading Room's status line likewise.
const PIN = `(()=>{for(const el of document.querySelectorAll('[id$="-status"], .status, .rf-status, #pressed, #folio-sub')){if(/\\d+\\s*ms/.test(el.textContent))el.textContent=el.textContent.replace(/\\d+\\s*ms/g,"NNNms");} return true;})()`;

const shots = [];
async function shoot(route, w, h, mobile, mode) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile });
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}${route}` });
  await sleep(mode === "head" ? 4500 : 2500);
  await evaluate(PIN);
  await sleep(200);
  const full = mode === "full" ? Math.min(16000, await evaluate("Math.ceil(document.documentElement.scrollHeight)")) : null;
  const clip = mode === "head" ? { x: 0, y: 0, width: w, height: BAND, scale: 1 } : { x: 0, y: 0, width: w, height: full ?? h, scale: 1 };
  // captureBeyondViewport only for a scrolling full page: it drops a chart room's bottom-left furniture (measured 2026-09-03, AE 505 on /specimen/).
  const r = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: mode === "full", clip });
  const name = `${route === "/" ? "home" : route.replace(/\//g, "")}-${w}${mode === "head" ? "-head" : ""}.png`;
  await writeFile(join(OUT, name), Buffer.from(r.data, "base64"));
  const probe = await evaluate(`JSON.stringify({cw:document.documentElement.clientWidth,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight})`);
  shots.push({ name, route, w, mode, probe });
  console.log(`${LABEL} ${name} ${probe}`);
}
for (const [w, h, mobile] of [[1280, 800, false], [390, 844, true]]) {
  for (const r of CONTENT) await shoot(r, w, h, mobile, "full");
  for (const r of APP) await shoot(r, w, h, mobile, "head");
  for (const r of SPECIMEN) await shoot(r, w, h, mobile, "view");
}
await writeFile(join(OUT, "manifest.json"), JSON.stringify(shots, null, 1));
ws.close(); brave.kill(); server.close(); await sleep(500); try { await rm(dir, { recursive: true, force: true, maxRetries: 5 }); } catch {}
