// e2e harness: the static file server, headless-browser launch, CDP client, and the poll/evaluate/screenshot helpers every suite shares; cleanup() is module-level so the runner can tear down even if start() throws partway.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import http from "node:http";
import net from "node:net";
import { readFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { dirname, join, resolve, sep, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import type { BrowserProcess, CdpMessage, Clip, Payload, StartOptions, SuiteContext, TouchPoint } from "./types.ts";
import { E2E_PORT_VAR, debugPortConflictMessage } from "../../src/cli/e2e-ports.ts";

const MIME: Record<string, string | undefined> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const httpGet = (url: string): Promise<string> =>
  new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve(d));
      })
      .on("error", reject);
  });

// blockWorker 404s the ONE shared Vite-emitted worker chunk (since the #208 fold both pages spawn it), so the inline fallback is exercised without mutating the working tree.
const serverState = { blockWorker: false };
const BLOCKED_WORKERS = new Set(["/explorer/worker.bundle.js"]);

// In-page oracle: suites import engine modules IN THE BROWSER (same JS engine, no cross-engine float drift); since #260 the harness answers /explorer/engine/*.js by type-stripping src/*.ts on demand and rewriting .ts specifiers. e2e-only serving.
const SRC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "src");
const ENGINE_MODULE = /^\/explorer\/engine\/(.+)\.js$/;
function serveEngineModule(pathname: string, res: import("node:http").ServerResponse): boolean | Promise<boolean> {
  const m = pathname.match(ENGINE_MODULE);
  if (!m) return false;
  const tsPath = resolve(SRC_DIR, `${m[1]}.ts`);
  if (!tsPath.startsWith(SRC_DIR + sep) || !existsSync(tsPath)) {
    res.writeHead(404).end("no such engine module");
    return true;
  }
  return readFile(tsPath, "utf8").then((source) => {
    const js = stripTypeScriptTypes(source, { mode: "strip" }).replace(
      /(["'])(\.\.?\/[^"']+)\.ts\1/g,
      "$1$2.js$1",
    );
    res.writeHead(200, { "content-type": MIME[".js"] }).end(js);
    return true;
  });
}

function startServer(SITE: string, PORT: number): Promise<import("node:http").Server> {
  const server = createServer((req, res) => { void (async () => {
    try {
      // @ts-expect-error a server-side request always carries its url, which Node types as possibly undefined
      const url = new URL(req.url, "http://127.0.0.1");
      let pathname = decodeURIComponent(url.pathname);
      if (serverState.blockWorker && BLOCKED_WORKERS.has(pathname)) {
        res.writeHead(404).end("worker blocked for fallback test");
        return;
      }
      if (await serveEngineModule(pathname, res)) return;
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
  })(); });
  return new Promise((res, rej) => {
    server.on("error", (err: NodeJS.ErrnoException) =>
      rej(
        err.code === "EADDRINUSE"
          ? new Error(
              `port ${PORT} is already in use, so this run cannot serve the site. ` +
                `Another e2e run or dev server likely holds it; set ${E2E_PORT_VAR}=<free port> to run beside it.`,
            )
          : err,
      ),
    );
    server.listen(PORT, "127.0.0.1", () => res(server));
  });
}

// #339: getPageTarget attaches to whatever answers /json, so an orphaned browser holding the port would be adopted in SILENCE; a plain TCP connect also catches a non-browser squatter.
function probeDebugPort(DPORT: number, timeoutMs = 300): Promise<boolean> {
  return new Promise((res) => {
    const socket = net.connect({ host: "127.0.0.1", port: DPORT });
    const settle = (listening: boolean) => {
      socket.destroy();
      res(listening);
    };
    socket.setTimeout(timeoutMs, () => settle(false));
    socket.on("connect", () => settle(true));
    socket.on("error", () => settle(false));
  });
}

async function debugPortIdentity(DPORT: number, timeoutMs = 1000): Promise<string | undefined> {
  try {
    const body = await new Promise<string>((res, rej) => {
      const req = http.get(`http://127.0.0.1:${DPORT}/json/version`, { timeout: timeoutMs }, (r) => {
        let d = "";
        r.on("data", (c) => (d += c));
        r.on("end", () => res(d));
      });
      req.on("timeout", () => req.destroy(new Error("timeout")));
      req.on("error", rej);
    });
    return (JSON.parse(body) as { Browser?: string }).Browser || undefined;
  } catch {
    return undefined;
  }
}

async function assertDebugPortFree(DPORT: number): Promise<void> {
  const listening = await probeDebugPort(DPORT);
  const identity = listening ? await debugPortIdentity(DPORT) : undefined;
  const conflict = debugPortConflictMessage(DPORT, { listening, identity });
  if (conflict) throw new Error(conflict);
}

let server: import("node:http").Server | undefined, brave: BrowserProcess | undefined, ws: WebSocket | undefined, userDataDir: string | undefined;
let browserOut = "";
let browserExit: { code: number | null; signal: NodeJS.Signals | null } | null = null;
let OUT_DIR = "";
export function cleanup(): void {
  try { ws?.close(); } catch {}
  try { brave?.kill("SIGKILL"); } catch {}
  try { server?.close(); } catch {}
  // rmSync, not the promise rm: cleanup() is synchronous and every caller exits right after it, so an unawaited promise
  // never lands and the profile survives. Measured 2026-09-08: 446 leaked profiles, 20GB, which starved the machine until
  // a full lane stalled mid-suite with no failure to show for it.
  try { if (userDataDir) rmSync(userDataDir, { recursive: true, force: true }); } catch {}
}

async function getPageTarget(DPORT: number): Promise<{ webSocketDebuggerUrl: string }> {
  let lastErr = "";
  for (let i = 0; i < 160; i++) {
    if (browserExit) break;
    try {
      const list = JSON.parse(await httpGet(`http://127.0.0.1:${DPORT}/json`)) as { type: string; webSocketDebuggerUrl?: string }[];
      const page = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      // @ts-expect-error find() cannot narrow the url the predicate just proved present
      if (page) return page;
      lastErr = `/json had ${list.length} targets, none a page`;
    } catch (e) {
      // @ts-expect-error a caught value is unknown to the checker; the || falls back to the value itself when it carries no message
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
const waiters = new Map<number, { resolve(value: unknown): void; reject(reason: Error): void }>();
function send<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    waiters.set(id, { resolve, reject });
    // @ts-expect-error start() opens the socket before any send, which the checker cannot see across functions
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate<T = unknown>(expression: Payload<T>, awaitPromise = false): Promise<NoInfer<T>> {
  const r = await send<{ result: { value: T }; exceptionDetails?: { text: string; exception?: { description?: string } } }>("Runtime.evaluate", { expression, awaitPromise, returnByValue: true });
  if (r.exceptionDetails) {
    throw new Error("eval exception: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  }
  return r.result.value;
}

// 5s is 100x the headroom a settle leaves: it polls evaluate every 50ms right up to the moment it throws, so a page that just failed a wait has been answering within 50ms. The direction it errs is toward calling a WEDGED page dead, which is the exit 2 such a page already produced.
const ALIVE_TIMEOUT_MS = 5000;
function alive(): Promise<boolean> {
  const answered = evaluate<number>("1").then(() => true, () => false);
  const gaveUp = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), ALIVE_TIMEOUT_MS).unref());
  return Promise.race([answered, gaveUp]);
}

async function axDescription(selector: string): Promise<string | null> {
  const doc = await send<{ root: { nodeId: number } }>("DOM.getDocument", { depth: -1 });
  const { nodeId } = await send<{ nodeId: number }>("DOM.querySelector", { nodeId: doc.root.nodeId, selector });
  if (!nodeId) return null;
  const ax = await send<{ nodes: { role?: { value: string }; description?: { value: string } }[] }>("Accessibility.getPartialAXTree", { nodeId, fetchRelatives: false });
  const node = ax.nodes.find((n) => n.role && n.role.value === "button");
  return node && node.description ? node.description.value : null;
}

async function waitSettled(label = ""): Promise<void> {
  for (let i = 0; i < 200; i++) {
    // The settle probe keys on #verso-turn's disabled flag (#199: it has the exact draw lifecycle the retired #bind button had).
    const s = await evaluate<{ status: string; dis: boolean; map: boolean }>(
      `({status:document.getElementById("status").textContent,dis:document.getElementById("verso-turn").disabled,map:!!document.querySelector("#map svg")})`,
    );
    if (s.status === "" && s.dis === false && s.map) return;
    await sleep(50);
  }
  throw new Error("waitSettled timeout " + label);
}
async function waitReady(): Promise<boolean> {
  for (let i = 0; i < 200; i++) {
    if (await evaluate<boolean>(`typeof window.__vellumUsesWorker==="function" && !!document.querySelector("#map svg") && document.getElementById("status").textContent===""`)) return true;
    await sleep(75);
  }
  return false;
}
// A turn clears "Drafting..." immediately, so waitSettled resolves MID-turn; waitTurned waits for the leaf to LAND, and armTurnWatch records whether .sheet ever carried .turning (a real 3D turn vs an instant swap).
async function waitTurned(label = ""): Promise<void> {
  for (let i = 0; i < 240; i++) {
    if (await evaluate<boolean>(`(()=>{const s=document.getElementById("status").textContent;const t=document.querySelector(".sheet.turning");return s==="" && !t && !!document.querySelector("#map svg");})()`)) return;
    await sleep(50);
  }
  throw new Error("waitTurned timeout " + label);
}
function armTurnWatch(): Promise<unknown> {
  return evaluate<boolean>(`(()=>{window.__turned=false;if(window.__turnMo)window.__turnMo.disconnect();window.__turnMo=new MutationObserver(()=>{if(document.querySelector(".sheet.turning"))window.__turned=true;});window.__turnMo.observe(document.getElementById("sheet"),{subtree:true,attributes:true,attributeFilter:["class"]});return true;})()`);
}

// Real browser input, not synthetic DOM events. d3-zoom binds touch listeners only if navigator.maxTouchPoints is truthy at bind time, so setTouch()/setMobileViewport() must be in effect BEFORE the navigate that boots the page.

// Negative deltaY zooms IN (d3's wheelDelta is -deltaY * 0.002 at deltaMode 0), matching a user scrolling up.
function wheel(x: number, y: number, deltaY: number, deltaX = 0): Promise<unknown> {
  return send("Input.dispatchMouseEvent", { type: "mouseWheel", x, y, deltaX, deltaY });
}

// Per CDP, touchStart/touchMove carry the currently-down points and touchEnd/touchCancel MUST pass [] (CDP diffs against the prior event to end every active point).
function touch(type: string, points: readonly TouchPoint[]): Promise<unknown> {
  return send("Input.dispatchTouchEvent", { type, touchPoints: points });
}

// d3 pans by the screen delta; at k=1 the constrain snaps it home, so the caller must be zoomed first.
async function touchPan(x0: number, y0: number, x1: number, y1: number): Promise<void> {
  await touch("touchStart", [{ x: x0, y: y0, id: 0 }]);
  await touch("touchMove", [{ x: x1, y: y1, id: 0 }]);
  await touch("touchEnd", []);
}

// One move suffices: d3 sets k to k_old * (to/from) about the centroid, scaling against the touchstart spread rather than incrementally.
async function pinch(cx: number, cy: number, from: number, to: number): Promise<void> {
  const s = from / 2, e = to / 2;
  await touch("touchStart", [{ x: cx - s, y: cy, id: 0 }, { x: cx + s, y: cy, id: 1 }]);
  await touch("touchMove", [{ x: cx - e, y: cy, id: 0 }, { x: cx + e, y: cy, id: 1 }]);
  await touch("touchEnd", []);
}

function setTouch(enabled: boolean, maxTouchPoints = 5): Promise<unknown> {
  return send("Emulation.setTouchEmulationEnabled", { enabled, maxTouchPoints });
}

async function setMobileViewport(width: number, height: number): Promise<void> {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: true });
  await setTouch(true);
}

async function clearMobile(): Promise<void> {
  await send("Emulation.clearDeviceMetricsOverride");
  await setTouch(false);
}

// The default clip is the harness's 1280 width down the whole document, captured beyond the viewport; a suite that passes its own clip is shot INSIDE the viewport, because captureBeyondViewport drops a chart room's left-anchored fixed furniture (the chart folio, the legend row) from the frame (measured 2026-09-03 on /specimen/ at 1280x800: AE 505 between the two modes at the same instant, the right-anchored corners and the slip untouched).
async function shoot(file: string, clip?: Clip): Promise<void> {
  const h = await evaluate<number>(`Math.min(16000, Math.ceil(document.body.scrollHeight))`);
  const r = await send<{ data: string }>("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: clip === undefined,
    clip: clip ?? { x: 0, y: 0, width: 1280, height: h, scale: 1 },
  });
  writeFileSync(join(OUT_DIR, file), Buffer.from(r.data, "base64"));
  console.log(`  shot -> ${join(OUT_DIR, file)} (${clip ? `${clip.width}x${clip.height}` : `${h}px tall`})`);
}

// A cold Chrome on CI intermittently comes up but never binds the debugging port (a transient dbus/crashpad hiccup; the process stays alive), so retry with a fresh profile; a genuine break still fails after the last attempt with the captured output.
async function launchBrowser(browser: string, DPORT: number): Promise<{ webSocketDebuggerUrl: string }> {
  // Preflight once, ABOVE the retry loop: a SIGKILLed attempt does not release the port synchronously, so a per-attempt preflight would report our own dying browser as the stray.
  await assertDebugPortFree(DPORT);
  const MAX_ATTEMPTS = 3;
  let lastErr: unknown;
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

// results/consoleErrors/http4xx/skippedGroups are pushed to BY REFERENCE (the ws handler, check and makeStep close over them) so the runner's trailing tally sees them.
// eslint-disable-next-line max-lines-per-function
export async function start({ browser, SITE, OUT, PORT, DPORT, PAGE, results, consoleErrors, http4xx, skippedGroups }: StartOptions): Promise<SuiteContext> {
  OUT_DIR = OUT;
  await mkdir(OUT, { recursive: true });
  server = await startServer(SITE, PORT);
  const target = await launchBrowser(browser, DPORT);
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    // @ts-expect-error the socket was opened two lines up, which the checker forgets inside a closure over a module variable
    ws.addEventListener("open", res, { once: true });
    // @ts-expect-error the same socket, the same closure
    ws.addEventListener("error", rej, { once: true });
  });
  ws.addEventListener("message", (ev) => {
    const m = JSON.parse(ev.data as string) as CdpMessage;
    if (m.id && waiters.has(m.id)) {
      const w = waiters.get(m.id);
      waiters.delete(m.id);
      // @ts-expect-error has() in the enclosing if proved the waiter present, which get() cannot carry
      if (m.error) w.reject(new Error(JSON.stringify(m.error)));
      // @ts-expect-error has() in the enclosing if proved the waiter present, which get() cannot carry
      else w.resolve(m.result);
      return;
    }
    if (m.method === "Runtime.exceptionThrown") {
      consoleErrors.push("EXCEPTION: " + (m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text));
    } else if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
      consoleErrors.push("console.error: " + JSON.stringify(m.params.args.map((a: { value: unknown }) => a.value)));
    } else if (m.method === "Log.entryAdded" && m.params.entry.level === "error") {
      const t = m.params.entry.text || "";
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
  await send("Accessibility.enable");
  // Treat the headless page as focused so element.focus() fires real events and :focus-visible applies; without this the keyboard-focus card path silently no-ops under --headless. Best-effort: older builds may not support it.
  try { await send("Emulation.setFocusEmulationEnabled", { enabled: true }); } catch {}
  await send("Page.navigate", { url: PAGE });
  const check = (name: string, ok: unknown, detail = ""): void => {
    results.push({ name, ok: !!ok });
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
  };
  return {
    evaluate, send, check, shoot, sleep, alive,
    waitSettled, waitReady, waitTurned, armTurnWatch, axDescription,
    wheel, touch, touchPan, pinch, setTouch, setMobileViewport, clearMobile,
    serverState, cleanup, consoleErrors, http4xx, skippedGroups, PORT,
  };
}
