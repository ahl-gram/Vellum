// e2e harness: the static file server (with the worker-block toggle for the
// fallback test), the headless-browser launch, the CDP/websocket client, and the
// poll/evaluate/screenshot helpers. `start(opts)` brings the page up and returns a
// `ctx` the check suites use; `cleanup()` tears everything down and is module-level
// so the runner's trailing .then/.catch can call it even if start() throws partway.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import http from "node:http";
import { readFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { existsSync, writeFileSync } from "node:fs";
import { join, resolve, sep, extname } from "node:path";
import { tmpdir } from "node:os";

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
// fallback can be exercised without ever mutating the working tree on disk. The
// fallback suite flips this same object via ctx.serverState.
const serverState = { blockWorker: false };
function startServer(SITE, PORT) {
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
let OUT_DIR = "";
export function cleanup() {
  try { ws?.close(); } catch {}
  try { brave?.kill("SIGKILL"); } catch {}
  try { server?.close(); } catch {}
  try { if (userDataDir) rm(userDataDir, { recursive: true, force: true }); } catch {}
}

async function getPageTarget(DPORT) {
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

// The computed accessible description of the first element matching `selector`
// (a button), via the Accessibility domain. Used to prove the #53 card body is
// reachable AND readable through aria-describedby, not just that the attr is set.
async function axDescription(selector) {
  const doc = await send("DOM.getDocument", { depth: -1 });
  const { nodeId } = await send("DOM.querySelector", { nodeId: doc.root.nodeId, selector });
  if (!nodeId) return null;
  const ax = await send("Accessibility.getPartialAXTree", { nodeId, fetchRelatives: false });
  const node = ax.nodes.find((n) => n.role && n.role.value === "button");
  return node && node.description ? node.description.value : null;
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
// waitTurned / armTurnWatch: shared by the sheet-turn (suite-turn) and the verso flip
// (suite-verso), which test each other's turn-vs-flip races. A turn clears "Drafting…"
// immediately (no 900ms status hang), so waitSettled resolves mid-turn; waitTurned waits
// for the leaf to actually LAND (status clear, .sheet not turning, a chart present).
// armTurnWatch arms a MutationObserver recording whether .sheet ever carried .turning, so
// a check can tell a real 3D turn from an instant swap.
async function waitTurned(label = "") {
  for (let i = 0; i < 240; i++) {
    if (await evaluate(`(()=>{const s=document.getElementById("status").textContent;const t=document.querySelector(".sheet.turning");return s==="" && !t && !!document.querySelector("#map svg");})()`)) return;
    await sleep(50);
  }
  throw new Error("waitTurned timeout " + label);
}
function armTurnWatch() {
  return evaluate(`(()=>{window.__turned=false;if(window.__turnMo)window.__turnMo.disconnect();window.__turnMo=new MutationObserver(()=>{if(document.querySelector(".sheet.turning"))window.__turned=true;});window.__turnMo.observe(document.getElementById("sheet"),{subtree:true,attributes:true,attributeFilter:["class"]});return true;})()`);
}

async function shoot(file) {
  const h = await evaluate(`Math.min(16000, Math.ceil(document.body.scrollHeight))`);
  const r = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: 1280, height: h, scale: 1 },
  });
  writeFileSync(join(OUT_DIR, file), Buffer.from(r.data, "base64"));
  console.log(`  shot -> ${join(OUT_DIR, file)} (${h}px tall)`);
}

// Spawn the headless browser and wait for its DevTools page target, retrying a few
// times with a fresh profile. A cold Chrome on a CI runner intermittently comes up
// but never binds the remote-debugging port (a transient dbus/crashpad hiccup; the
// process stays alive, so getPageTarget just times out). One attempt reds the whole
// run for a flake, so retry. A genuine break (bad binary, missing lib, the browser
// exits) still fails after the last attempt, with the captured browser output.
async function launchBrowser(browser, DPORT) {
  const MAX_ATTEMPTS = 3;
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    browserExit = null;
    browserOut = "";
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
    try {
      return await getPageTarget(DPORT);
    } catch (err) {
      lastErr = err;
      try { brave.kill("SIGKILL"); } catch {}
      try { await rm(userDataDir, { recursive: true, force: true }); } catch {}
      if (attempt < MAX_ATTEMPTS) {
        console.log(`  e2e: browser launch attempt ${attempt}/${MAX_ATTEMPTS} exposed no devtools target; retrying with a fresh profile...`);
      }
    }
  }
  throw lastErr;
}

// Bring the page up: server, browser, CDP socket, domains enabled, navigated. The
// passed-in results/consoleErrors/http4xx arrays are pushed to BY REFERENCE (the
// ws handler + check close over them) so the runner's trailing tally sees them.
export async function start({ browser, SITE, OUT, PORT, DPORT, PAGE, results, consoleErrors, http4xx }) {
  OUT_DIR = OUT;
  await mkdir(OUT, { recursive: true });
  server = await startServer(SITE, PORT);
  const target = await launchBrowser(browser, DPORT);
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
  await send("DOM.enable");
  await send("Accessibility.enable"); // #53: read the computed AX description of a hit
  // Treat the headless page as focused so element.focus() fires real focus events
  // (and :focus-visible applies). Without this, the #53 keyboard-focus card path
  // silently no-ops under --headless. Best-effort: older builds may not support it.
  try { await send("Emulation.setFocusEmulationEnabled", { enabled: true }); } catch {}
  await send("Page.navigate", { url: PAGE });

  const check = (name, ok, detail = "") => {
    results.push({ name, ok: !!ok });
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
  };

  return {
    evaluate, send, check, shoot, sleep,
    waitSettled, waitAtlas, waitReady, waitTurned, armTurnWatch, axDescription,
    serverState, cleanup, consoleErrors, http4xx, PORT,
  };
}
