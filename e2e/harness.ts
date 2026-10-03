// e2e harness: headless-browser launch, CDP client, and the poll/evaluate/screenshot helpers every suite shares; cleanup() is module-level so the runner can tear down even if start() throws partway.
import { spawn } from "node:child_process";
import http from "node:http";
import net from "node:net";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { BrowserProcess, CdpMessage, Clip, Payload, StartOptions, SuiteContext, TouchPoint } from "./types.ts";
import { debugPortConflictMessage } from "./support/ports.ts";
import { launchWithRetry } from "./support/launch.ts";
import type { LaunchAttempt, LaunchTuning } from "./support/launch.ts";
import { serverState, startServer } from "./site-server.ts";

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

// Issue #339: probePageTarget attaches to whatever answers /json, so an orphaned browser holding the port would be adopted in SILENCE; a plain TCP connect also catches a non-browser squatter.
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

async function probePageTarget(DPORT: number): Promise<{ webSocketDebuggerUrl: string }> {
  const list = JSON.parse(await httpGet(`http://127.0.0.1:${DPORT}/json`)) as { type: string; webSocketDebuggerUrl?: string }[];
  const page = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
  if (page) return page as { type: string; webSocketDebuggerUrl: string };
  throw new Error(`/json had ${list.length} targets, none a page`);
}

let nextId = 1;
const waiters = new Map<number, { resolve(value: unknown): void; reject(reason: Error): void }>();
function send<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    waiters.set(id, { resolve, reject });
    ws!.send(JSON.stringify({ id, method, params }));
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

async function spawnBrowser(browser: string, DPORT: number): Promise<LaunchAttempt> {
  const dir = await mkdtemp(join(tmpdir(), "vellum-e2e-"));
  userDataDir = dir;
  const child = spawn(
    browser,
    [
      "--headless=new",
      `--remote-debugging-port=${DPORT}`,
      `--user-data-dir=${dir}`,
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
  brave = child;
  return { child, discard: () => rm(dir, { recursive: true, force: true }).catch(() => {}) };
}

export async function launchBrowser(browser: string, DPORT: number, tuning?: LaunchTuning): Promise<{ webSocketDebuggerUrl: string }> {
  return launchWithRetry(
    {
      preflight: () => assertDebugPortFree(DPORT),
      spawn: () => spawnBrowser(browser, DPORT),
      probe: () => probePageTarget(DPORT),
      log: (line) => console.error(line),
    },
    tuning,
  );
}

function onCdpMessage(ev: MessageEvent, consoleErrors: string[], http4xx: string[]): void {
  const m = JSON.parse(ev.data as string) as CdpMessage;
  if (m.id && waiters.has(m.id)) {
    const w = waiters.get(m.id);
    waiters.delete(m.id);
    if (m.error) w!.reject(new Error(JSON.stringify(m.error)));
    else w!.resolve(m.result);
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
}

// results/consoleErrors/http4xx/skippedGroups are pushed to BY REFERENCE (the ws handler, check and makeStep hold them) so the runner's trailing tally sees them.
export async function start({ browser, SITE, OUT, PORT, DPORT, PAGE, results, consoleErrors, http4xx, skippedGroups }: StartOptions): Promise<SuiteContext> {
  OUT_DIR = OUT;
  await mkdir(OUT, { recursive: true });
  server = await startServer(SITE, PORT);
  const target = await launchBrowser(browser, DPORT);
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws!.addEventListener("open", res, { once: true });
    ws!.addEventListener("error", rej, { once: true });
  });
  ws.addEventListener("message", (ev) => onCdpMessage(ev, consoleErrors, http4xx));

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
