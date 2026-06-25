// End-to-end verification for the Explorer render worker (#5), run via
// `npm run test:e2e`. Kept out of the `node --test` unit suite on purpose: it
// drives a real headless browser over CDP, so it is slower and needs a Chromium-
// family browser + free ports. It proves, in an actual browser:
//   - the worker runs (no silent fallback to the inline engine)
//   - worker output is byte-identical to the inline engine (draw + atlas, the
//     atlas exercising the locale-sensitive gazetteer)
//   - the worker draw matches the committed Node-built chart up to ~1 trig ULP
//   - the draw/bind race cannot show an atlas that disagrees with the chart
//   - the inline fallback works when the worker script is unavailable (served 404)
//   - no JS errors, the only 4xx is the benign favicon, the initial draw rendered
// It also covers the seed-of-the-day Daily Hunt (#56): the click-to-find flow on
// a real chart (miss reports warmer/colder, a correct click snaps to the quarry
// and reveals it), proving the click -> projection-inversion -> settlement-snap
// alignment that no unit test can reach, plus the win marker and per-device streak.
//
// Browser discovery reuses findBrowser() (Mac/Linux paths + VELLUM_BROWSER). With
// no browser it SKIPS (exit 0) so browserless environments stay green — unless
// VELLUM_REQUIRE_BROWSER is set (CI), where a missing browser fails loud instead.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import http from "node:http";
import { readFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { existsSync, writeFileSync } from "node:fs";
import { join, resolve, sep, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { findBrowser } from "../src/cli/raster.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url)); // scripts/
const REPO = resolve(HERE, "..");
// Serve the built deploy artifact (dist/) so the e2e validates exactly what gets
// published. Override with VELLUM_SITE_DIR. Run `npm run build` first to populate it.
const SITE = process.env["VELLUM_SITE_DIR"] ? resolve(process.env["VELLUM_SITE_DIR"]) : join(REPO, "dist");
const OUT = join(REPO, "out", "e2e");
const PORT = 8765;
const DPORT = 9222;
const PAGE = `http://127.0.0.1:${PORT}/explorer/`;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const browser = findBrowser();
if (!browser) {
  if (process.env["VELLUM_REQUIRE_BROWSER"]) {
    console.error(
      "FAIL: VELLUM_REQUIRE_BROWSER is set but no Chromium-family browser was found " +
        "(set VELLUM_BROWSER to a browser binary).",
    );
    process.exit(1);
  }
  console.log(
    "SKIP: no Chromium-family browser found — skipping Explorer e2e " +
      "(install Brave/Chrome or set VELLUM_BROWSER).",
  );
  process.exit(0);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const httpGet = (url) =>
  new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve(d));
      })
      .on("error", reject);
  });

// Mutable static file server. blockWorker flips worker.js to a 404 so the inline
// fallback can be exercised without ever mutating the working tree on disk.
const serverState = { blockWorker: false };
function startServer() {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://127.0.0.1");
      let pathname = decodeURIComponent(url.pathname);
      if (serverState.blockWorker && pathname === "/explorer/worker.js") {
        res.writeHead(404).end("worker blocked for fallback test");
        return;
      }
      if (pathname.endsWith("/")) pathname += "index.html";
      const filePath = resolve(SITE, "." + pathname);
      if (filePath !== SITE && !filePath.startsWith(SITE + sep)) {
        res.writeHead(403).end("forbidden");
        return;
      }
      if (!existsSync(filePath)) {
        res.writeHead(404).end("not found");
        return;
      }
      const body = await readFile(filePath);
      res.writeHead(200, { "content-type": MIME[extname(filePath)] ?? "application/octet-stream" });
      res.end(body);
    } catch (err) {
      res.writeHead(500).end(String(err));
    }
  });
  return new Promise((res) => server.listen(PORT, "127.0.0.1", () => res(server)));
}

let server, brave, ws, userDataDir;
let browserOut = "";
let browserExit = null;
const cleanup = () => {
  try { ws?.close(); } catch {}
  try { brave?.kill("SIGKILL"); } catch {}
  try { server?.close(); } catch {}
  try { if (userDataDir) rm(userDataDir, { recursive: true, force: true }); } catch {}
};

const results = [];
const consoleErrors = [];
const http4xx = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: !!ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
}

async function getPageTarget() {
  let lastErr = "";
  for (let i = 0; i < 160; i++) {
    if (browserExit) break; // browser died — stop polling, report below
    try {
      const list = JSON.parse(await httpGet(`http://127.0.0.1:${DPORT}/json`));
      const page = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return page;
      lastErr = `/json had ${list.length} targets, none a page`;
    } catch (e) {
      lastErr = String(e.message || e);
    }
    await sleep(125);
  }
  throw new Error(
    "no devtools page target" +
      (browserExit ? ` (browser exited code=${browserExit.code} signal=${browserExit.signal})` : ` (last: ${lastErr})`) +
      `\n--- browser output ---\n${browserOut.slice(0, 4000) || "(none captured)"}`,
  );
}

let nextId = 1;
const waiters = new Map();
function send(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    waiters.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression, awaitPromise = false) {
  const r = await send("Runtime.evaluate", { expression, awaitPromise, returnByValue: true });
  if (r.exceptionDetails) {
    throw new Error("eval exception: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  }
  return r.result.value;
}

async function waitSettled(label = "") {
  for (let i = 0; i < 200; i++) {
    const s = await evaluate(
      `({status:document.getElementById("status").textContent,dis:document.getElementById("bind").disabled,map:!!document.querySelector("#map svg")})`,
    );
    if (s.status === "" && s.dis === false && s.map) return;
    await sleep(50);
  }
  throw new Error("waitSettled timeout " + label);
}
async function waitAtlas(label = "") {
  for (let i = 0; i < 200; i++) {
    const n = await evaluate(`document.querySelectorAll("#atlas figure").length`);
    if (n > 0) return n;
    await sleep(50);
  }
  throw new Error("waitAtlas timeout " + label);
}
async function waitReady() {
  for (let i = 0; i < 200; i++) {
    if (await evaluate(`typeof window.__vellumUsesWorker==="function" && !!document.querySelector("#map svg") && document.getElementById("status").textContent===""`)) return true;
    await sleep(75);
  }
  return false;
}

async function shoot(file) {
  const h = await evaluate(`Math.min(16000, Math.ceil(document.body.scrollHeight))`);
  const r = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: 1280, height: h, scale: 1 },
  });
  writeFileSync(join(OUT, file), Buffer.from(r.data, "base64"));
  console.log(`  shot -> ${join(OUT, file)} (${h}px tall)`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  server = await startServer();
  userDataDir = await mkdtemp(join(tmpdir(), "vellum-e2e-"));
  brave = spawn(
    browser,
    [
      "--headless=new",
      `--remote-debugging-port=${DPORT}`,
      `--user-data-dir=${userDataDir}`,
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--window-size=1280,2400",
      "about:blank",
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  brave.stdout.on("data", (d) => (browserOut += d));
  brave.stderr.on("data", (d) => (browserOut += d));
  brave.on("exit", (code, signal) => (browserExit = { code, signal }));

  const target = await getPageTarget();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener("open", res, { once: true });
    ws.addEventListener("error", rej, { once: true });
  });
  ws.addEventListener("message", (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && waiters.has(m.id)) {
      const w = waiters.get(m.id);
      waiters.delete(m.id);
      m.error ? w.reject(new Error(JSON.stringify(m.error))) : w.resolve(m.result);
      return;
    }
    if (m.method === "Runtime.exceptionThrown") {
      consoleErrors.push("EXCEPTION: " + (m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text));
    } else if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
      consoleErrors.push("console.error: " + JSON.stringify(m.params.args.map((a) => a.value)));
    } else if (m.method === "Log.entryAdded" && m.params.entry.level === "error") {
      const t = m.params.entry.text || "";
      // resource-load failures are tracked precisely via the Network domain below
      if (!/favicon/i.test(t) && !/Failed to load resource/i.test(t)) consoleErrors.push("log.error: " + t);
    } else if (m.method === "Network.responseReceived" && m.params.response.status >= 400) {
      http4xx.push(`${m.params.response.status} ${m.params.response.url}`);
    }
  });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Network.enable");
  await send("Page.navigate", { url: PAGE });

  check("A0 page loaded + initial auto-draw rendered", await waitReady());
  check("A1 worker active (no silent fallback)", await evaluate(`window.__vellumUsesWorker()===true`));

  // A2: worker draw === inline draw, byte-for-byte, in the browser. Includes the
  // #52 place manifest: a new structured-cloneable field that must be identical
  // worker-vs-inline (same V8 runs both paths, so nx/ny are byte-identical).
  const a2 = await evaluate(
    `(async()=>{const m={kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}};const j=await window.__vellumRunJob(m);const i=window.__vellumRunInline(m);return{svg:j.svg===i.svg,title:j.title===i.title,mt:j.mapType===i.mapType,band:j.band===i.band,man:JSON.stringify(j.manifest)===JSON.stringify(i.manifest),places:j.manifest.places.length,len:j.svg.length};})()`,
    true,
  );
  check("A2 draw: worker bytes === inline bytes (svg + manifest)", a2.svg && a2.title && a2.mt && a2.band && a2.man, `${a2.len} code units, ${a2.places} places, manifest eq=${a2.man}`);

  // A3 — worker atlas === inline atlas, in the browser (gazetteer locale matches)
  const a3 = await evaluate(
    `(async()=>{const m={kind:"atlas",seed:42,overrides:{},width:1500};const j=await window.__vellumRunJob(m);const i=window.__vellumRunInline(m);return{eq:JSON.stringify(j.atlas)===JSON.stringify(i.atlas),themes:j.atlas.themes.length,regions:j.atlas.regions.length,gaz:j.atlas.gazetteerHtml.length};})()`,
    true,
  );
  check("A3 atlas: worker bytes === inline bytes (gazetteer incl.)", a3.eq, `${a3.themes} themes, ${a3.regions} regions, gaz ${a3.gaz}b`);

  // A4 — worker draw vs committed Node chart, normalized to absorb cross-engine
  // float ULPs. Transcendental math (sin/cos/atan2) is not IEEE-correctly-rounded,
  // so V8-in-node and V8-in-brave may differ by ~1 ULP in a coordinate; 6dp
  // normalization erases that while still catching a stale/wrong browser engine.
  const a4 = await evaluate(
    `(async()=>{const m={kind:"draw",seed:42,overrides:{},render:{style:"antique",legend:true}};const j=await window.__vellumRunJob(m);const c=await(await fetch("../charts/chart-42-antique.svg")).text();const norm=(s)=>s.replace(/-?\\d+\\.\\d+/g,(x)=>Number(x).toFixed(6));const bt=j.svg.match(/-?\\d+\\.\\d+/g)||[],ct=c.match(/-?\\d+\\.\\d+/g)||[];let tok=0;for(let k=0;k<Math.min(bt.length,ct.length);k++)if(bt[k]!==ct[k])tok++;return{rawEq:j.svg===c,normEq:norm(j.svg)===norm(c),tokens:bt.length,diffTok:tok};})()`,
    true,
  );
  check("A4 worker draw === committed Node chart (normalized, ULP-tolerant)", a4.normEq, `${a4.diffTok}/${a4.tokens} numeric tokens differ by ULP; raw-equal=${a4.rawEq}`);

  // --- normal bind (no race): atlas populates; artifact for the user ---
  await evaluate(`(()=>{const s=document.getElementById("seed");s.value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("draw").click();})()`);
  await waitSettled("draw-42");
  await evaluate(`document.getElementById("bind").click()`);
  const figs = await waitAtlas("normal-bind");
  check("A5 normal bind injects the atlas", figs > 0, `${figs} plate figures`);
  await shoot("explorer-worker-atlas.png");

  // --- A6 RACE: draw-then-bind (the bug the advisor flagged) ---
  const a6click = await evaluate(`(()=>{const s=document.getElementById("seed");s.value="100";document.getElementById("draw").click();const dis=document.getElementById("bind").disabled;document.getElementById("bind").click();return{dis};})()`);
  check("A6a bind disabled the instant a draw starts", a6click.dis === true);
  await waitSettled("draw-100");
  const a6 = await evaluate(`({figs:document.querySelectorAll("#atlas figure").length,map:!!document.querySelector("#map svg"),cap:document.getElementById("caption").textContent})`);
  check("A6b race draw->bind: atlas suppressed, chart advanced", a6.figs === 0 && a6.map && a6.cap.length > 0, `figs=${a6.figs}`);
  await evaluate(`document.getElementById("bind").click()`);
  const figs2 = await waitAtlas("post-race-bind");
  check("A6c post-settle bind works again", figs2 > 0, `${figs2} figures`);

  // --- A7 RACE: bind-then-draw (gen guard must drop the stale bind) ---
  await evaluate(`(()=>{document.getElementById("bind").click();const s=document.getElementById("seed");s.value="7";document.getElementById("draw").click();})()`);
  await waitSettled("draw-7");
  await sleep(400); // let any (wrongly) surviving bind inject before asserting emptiness
  const a7 = await evaluate(`document.querySelectorAll("#atlas figure").length`);
  check("A7 race bind->draw: stale bind discarded, atlas cleared", a7 === 0, `figs=${a7}`);

  // --- themed draw: worker theme path + artifact ---
  await evaluate(`(()=>{const s=document.getElementById("seed");s.value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="vegetation";document.getElementById("draw").click();})()`);
  await waitSettled("draw-theme");
  check("A8 worker renders a thematic (field) layer", await evaluate(`document.querySelector("#map svg").outerHTML.includes("layer-field")`));
  await shoot("explorer-worker-theme.png");

  // --- A11: the Tide Wheel (#55) — sea-level slider floods/drains in place ---
  // Placed before A9a so the console-health check also covers the slider gesture.
  const landPresent = await evaluate(`!!document.getElementById("land")`);
  if (!landPresent) {
    check("A11 sea-level slider present", false, "#land control missing");
  } else {
    // flood: low land value, fire input then change (the real drag gesture)
    await evaluate(`(()=>{
      document.getElementById("seed").value="42";
      document.getElementById("style").value="antique";
      document.getElementById("theme").value="";
      document.getElementById("type").value="";
      const l=document.getElementById("land");
      l.value="150";
      l.dispatchEvent(new Event("input",{bubbles:true}));
      l.dispatchEvent(new Event("change",{bubbles:true}));
    })()`);
    await waitSettled("land-flood");
    const a11a = await evaluate(`({hash:location.hash.includes("land="),map:!!document.querySelector("#map svg"),cap:document.getElementById("caption").textContent.length>0})`);
    check("A11a slider floods in place: fresh chart + land= in hash", a11a.hash && a11a.map && a11a.cap);

    // direction: the drain (high) end bakes a larger land-fraction than the flood (low) end
    await evaluate(`(()=>{const l=document.getElementById("land");l.value="650";l.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("land-drain");
    const drainLF = await evaluate(`Number(document.querySelector("#map svg").getAttribute("data-vellum-land-fraction"))`);
    await evaluate(`(()=>{const l=document.getElementById("land");l.value="150";l.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("land-flood2");
    const floodLF = await evaluate(`Number(document.querySelector("#map svg").getAttribute("data-vellum-land-fraction"))`);
    check("A11b flood waterline < drain waterline", Number.isFinite(floodLF) && Number.isFinite(drainLF) && floodLF < drainLF, `flood=${floodLF} drain=${drainLF}`);

    // auto-reset: changing map type drops the manual tide from the hash
    await evaluate(`(()=>{const t=document.getElementById("type");t.value="continent";t.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("land-typereset");
    const a11c = await evaluate(`({reset:!location.hash.includes("land="),hash:location.hash})`);
    check("A11c changing type resets the slider to auto (land= dropped)", a11c.reset, `hash=${a11c.hash}`);
  }

  // --- A12: the arms (heraldry) toggle (#44) — like the legend checkbox ---
  // Placed before A9a so the console-health check also covers the gesture.
  const armsPresent = await evaluate(`!!document.getElementById("arms")`);
  if (!armsPresent) {
    check("A12 arms checkbox present", false, "#arms control missing");
  } else {
    // start from a clean realm-bearing world, arms off
    await evaluate(`(()=>{
      document.getElementById("seed").value="42";
      document.getElementById("style").value="antique";
      document.getElementById("theme").value="";
      document.getElementById("type").value="";
      document.getElementById("arms").checked=false;
      document.getElementById("draw").click();
    })()`);
    await waitSettled("arms-off");
    const a12off = await evaluate(`({heraldry:document.querySelector("#map svg").outerHTML.includes("layer-heraldry"),hash:location.hash.includes("arms=0")})`);
    check("A12a arms off: no heraldry layer, arms=0 in hash", !a12off.heraldry && a12off.hash, `heraldry=${a12off.heraldry} hash=${a12off.hash}`);

    // toggle on via the change handler (the real gesture), expect heraldry + arms=1
    await evaluate(`(()=>{const a=document.getElementById("arms");a.checked=true;a.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("arms-on");
    const a12on = await evaluate(`({heraldry:document.querySelector("#map svg").outerHTML.includes("layer-heraldry"),hash:location.hash.includes("arms=1")})`);
    check("A12b arms on: heraldry layer drawn, arms=1 in hash", a12on.heraldry && a12on.hash, `heraldry=${a12on.heraldry} hash=${a12on.hash}`);
  }

  // --- console / network health for the whole worker run ---
  check("A9a no JS exceptions or console errors", consoleErrors.length === 0, consoleErrors.join(" | ") || "clean");
  const bad4xx = http4xx.filter((u) => !/favicon/i.test(u));
  check("A9b only the benign favicon 4xx (no real missing resources)", bad4xx.length === 0, http4xx.length ? http4xx.join(", ") : "no 4xx at all");

  // --- A10: inline FALLBACK path when the worker script is unavailable ---
  // Flip the server to 404 worker.js (faithfully simulating file://, a 404, or a
  // CSP block) and reload. No working-tree mutation — the file is untouched on
  // disk; only the served response changes. Restored in finally.
  try {
    await send("Network.clearBrowserCache"); // so the now-404 worker.js isn't served from cache
    await send("Network.setCacheDisabled", { cacheDisabled: true });
    await evaluate(`window.__preReload = true`); // sentinel: cleared once the fresh doc loads
    serverState.blockWorker = true;
    await send("Page.reload", { ignoreCache: true });
    // wait for the POST-reload document (sentinel gone) to become ready, so we never
    // assert against the pre-reload page that is still present during navigation
    let fresh = false;
    for (let i = 0; i < 220; i++) {
      let s = null;
      try {
        s = await evaluate(`({pre:typeof window.__preReload!=="undefined",uw:typeof window.__vellumUsesWorker==="function",map:!!document.querySelector("#map svg"),status:(document.getElementById("status")||{}).textContent})`);
      } catch {}
      if (s && !s.pre && s.uw && s.map && s.status === "") { fresh = true; break; }
      await sleep(75);
    }
    check("A10a fallback: page still renders without the worker", fresh);
    check("A10b fallback: __vellumUsesWorker()===false (inline path taken)", await evaluate(`window.__vellumUsesWorker()===false`));
    await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("theme").value="";document.getElementById("draw").click();})()`);
    await waitSettled("fallback-draw");
    await evaluate(`document.getElementById("bind").click()`);
    const fbFigs = await waitAtlas("fallback-bind");
    check("A10c fallback: inline draw + bind produce an atlas", fbFigs > 0, `${fbFigs} figures`);
  } finally {
    serverState.blockWorker = false;
    try { await send("Network.setCacheDisabled", { cacheDisabled: false }); } catch {}
  }

  // --- H: The Daily Hunt (#56) on the seed-of-the-day page ---
  // The page seed is new Date() in UTC, so the click targets are derived from
  // the browser's OWN world via dynamic import (immune to any node-side date
  // assumption). This is the only coverage of the click -> projection-inversion
  // -> nearest-settlement snap, which can silently break if widthPx/margin/the
  // projection change while the chart still renders perfectly.
  const huntErrBase = consoleErrors.length;
  const HUNT_PAGE = `http://127.0.0.1:${PORT}/seed-of-the-day/`;
  // The hunt shares the explorer's origin, so a prior solved state could linger
  // in localStorage. Clear it here (still on the same origin) so the hunt always
  // starts unsolved and H3/H4 exercise the live miss/hit path deterministically.
  try { await evaluate(`localStorage.removeItem("vellum.hunt.v1")`); } catch {}
  await send("Page.navigate", { url: HUNT_PAGE });
  let huntReady = false;
  for (let i = 0; i < 200; i++) {
    // evaluate may land in a context destroyed by the in-flight navigation;
    // swallow that and retry (same defensive pattern as A10's post-reload poll).
    let s = null;
    try { s = await evaluate(`(()=>{const h=document.getElementById("hunt");const c=document.getElementById("clues");return{hunt:h&&!h.hidden,clues:c?c.children.length:0,map:!!document.querySelector("#map svg")};})()`); } catch {}
    if (s && s.hunt && s.clues >= 3 && s.map) { huntReady = true; break; }
    await sleep(75);
  }
  check("H1 seed-of-the-day hunt card appears with >=3 clues over a rendered map", huntReady);

  const clueText = await evaluate(`Array.from(document.getElementById("clues").children).map((li)=>li.textContent).join(" | ")`);
  check("H2 clues never disclose ruin/abandon wording", !/ruin|abandon/i.test(clueText));

  // Derive miss (capital) and hit (quarry) click fractions from the browser's
  // own world, using the same engine + projection the page used to draw.
  const tgt = await evaluate(`(async()=>{
    const {defaultRecipe,generateWorld}=await import("../explorer/engine/world/generate.js");
    const {chooseQuarry}=await import("../explorer/engine/world/daily-hunt.js");
    const {createProjection}=await import("../explorer/engine/render/transform.js");
    const {seedForDate}=await import("../explorer/engine/world/seed-of-the-day.js");
    const seed=seedForDate(new Date());
    const world=generateWorld(defaultRecipe(seed));
    const q=chooseQuarry(world);
    const cap=world.settlements.find((s)=>s.kind==="capital")??world.settlements[0];
    const proj=createProjection(world.elev.w,world.elev.h,1500,Math.round(1500*0.045));
    const frac=(s)=>({fx:proj.px(s.x)/proj.widthPx,fy:proj.py(s.y)/proj.heightPx});
    return{seed,name:q.settlement.name,hit:frac(q.settlement),miss:frac(cap)};
  })()`, true);
  const clickHunt = (f) => evaluate(`(()=>{const svg=document.querySelector("#map svg");const r=svg.getBoundingClientRect();svg.dispatchEvent(new MouseEvent("click",{clientX:r.left+${f.fx}*r.width,clientY:r.top+${f.fy}*r.height,bubbles:true}));return{status:document.getElementById("hunt-status").textContent,solved:document.getElementById("map").classList.contains("solved")};})()`);

  const miss = await clickHunt(tgt.miss);
  check("H3 a miss reports warmer/colder prose and does not solve", miss.status.length > 0 && !miss.solved, JSON.stringify(miss));

  const won = await clickHunt(tgt.hit);
  check("H4 clicking the quarry snaps to it and solves the hunt", won.solved === true && /found it/i.test(won.status), JSON.stringify(won));

  const post = await evaluate(`(()=>{const rev=document.getElementById("reveal");const star=document.querySelector("#map .hunt-star");const share=document.getElementById("share");return{reveal:rev&&!rev.hidden,revealText:rev?rev.textContent:"",star:!!star,share:share&&!share.hidden,streak:document.getElementById("streak").textContent,ls:localStorage.getItem("vellum.hunt.v1")};})()`);
  check("H5 reveal names the found place and its founding year", post.reveal && post.revealText.includes(tgt.name) && /founded in the year/i.test(post.revealText), post.revealText.slice(0, 80));
  check("H6 a win marker overlays the map and the Share button appears", post.star && post.share);
  check("H7 streak + localStorage persist, keyed on the day's seed", /Streak: 1 day/.test(post.streak) && new RegExp(`"solved":${tgt.seed},"streak":1`).test(post.ls || ""), `${post.streak} | ${post.ls}`);
  await shoot("hunt-seed-of-the-day.png");

  await send("Page.navigate", { url: HUNT_PAGE });
  let huntRestored = false;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try { s = await evaluate(`(()=>{const star=document.querySelector("#map .hunt-star");const solved=document.getElementById("map").classList.contains("solved");return{star:!!star,solved,ls:localStorage.getItem("vellum.hunt.v1")};})()`); } catch {}
    if (s && s.star && s.solved) { huntRestored = /"streak":1/.test(s.ls || ""); break; }
    await sleep(75);
  }
  check("H8 reload restores the solved state without inflating the streak", huntRestored);
  check("H9 the hunt run logged no JS exceptions or console errors", consoleErrors.length === huntErrBase, consoleErrors.slice(huntErrBase).join(" | ") || "clean");
}

main()
  .then(() => {
    const passed = results.every((r) => r.ok);
    console.log(`\n${passed ? "ALL PASS" : "SOME FAILED"}  (${results.filter((r) => r.ok).length}/${results.length})`);
    cleanup();
    process.exit(passed ? 0 : 1);
  })
  .catch((e) => {
    console.error("HARNESS ERROR:", e);
    cleanup();
    process.exit(2);
  });
