import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { svgDimensions } from "../../src/cli/raster.ts";
import { freePort } from "../free-port.ts";

export interface Pressing {
  readonly svg: string;
  readonly out: string;
}
export interface PressOptions {
  readonly pixelWidth: number;
  readonly quality: number;
}
export interface Pressed {
  readonly product: string;
  readonly bytes: number;
}

// 2026-11-23, Issue #1255: a launch took 298 to 393 ms and a chart's load about 40 ms on this Mac (the plan's out/1255-dry-run logs); each cap is far above any real run, so a hang costs seconds and not the job's cap.
const LAUNCH_MS = 15_000;
const LOAD_MS = 10_000;
const EXIT_MS = 5_000;
const POLL_MS = 50;

const sleep = (ms: number): Promise<void> => new Promise((done) => setTimeout(done, ms));

interface Target {
  readonly type?: string;
  readonly webSocketDebuggerUrl?: string;
}

async function pageSocket(port: number, failure: () => string | null): Promise<string> {
  const give = (what: string): string =>
    `${what}; point VELLUM_BROWSER at a Chromium-family browser that runs headless`;
  for (let waited = 0; waited < LAUNCH_MS; waited += POLL_MS) {
    const failed = failure();
    if (failed !== null) throw new Error(failed);
    const list = await fetch(`http://127.0.0.1:${port}/json/list`)
      .then((r) => r.json() as Promise<readonly Target[]>)
      .catch(() => [] as readonly Target[]);
    const page = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl !== undefined);
    if (page?.webSocketDebuggerUrl !== undefined) return page.webSocketDebuggerUrl;
    await sleep(POLL_MS);
  }
  throw new Error(give(`the browser opened no page to press with in ${LAUNCH_MS} ms`));
}

interface Reply {
  readonly id?: number;
  readonly method?: string;
  readonly result?: Record<string, unknown>;
  readonly error?: unknown;
}

function connect(url: string): Promise<{
  readonly socket: WebSocket;
  readonly send: (method: string, params?: object) => Promise<Record<string, unknown>>;
  readonly loaded: () => Promise<boolean>;
}> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    let next = 0;
    const replies = new Map<number, (reply: Reply) => void>();
    const loads: (() => void)[] = [];
    socket.addEventListener("error", () => reject(new Error(`could not open ${url}`)));
    socket.addEventListener("message", (event) => {
      const reply = JSON.parse(String(event.data)) as Reply;
      if (reply.id !== undefined) replies.get(reply.id)?.(reply);
      else if (reply.method === "Page.loadEventFired") loads.splice(0).forEach((done) => done());
    });
    socket.addEventListener("open", () =>
      resolve({
        socket,
        send: (method, params = {}) =>
          new Promise((done, fail) => {
            const id = ++next;
            replies.set(id, (reply) => {
              replies.delete(id);
              if (reply.error !== undefined) fail(new Error(`${method}: ${JSON.stringify(reply.error)}`));
              else done(reply.result ?? {});
            });
            socket.send(JSON.stringify({ id, method, params }));
          }),
        loaded: () =>
          new Promise((done) => {
            const timer = setTimeout(() => done(false), LOAD_MS);
            loads.push(() => {
              clearTimeout(timer);
              done(true);
            });
          }),
      }),
    );
  });
}

export async function pressPictures(
  browser: string,
  pressings: readonly Pressing[],
  options: PressOptions,
): Promise<Pressed> {
  const port = await freePort();
  const profile = mkdtempSync(join(tmpdir(), "vellum-primer-pictures-"));
  const child = spawn(
    browser,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  let spawnError: string | null = null;
  let exited: number | null | undefined;
  child.on("error", (err) => {
    spawnError = err.message;
  });
  const gone = new Promise<void>((done) =>
    child.once("exit", (code) => {
      exited = code;
      done();
    }),
  );
  let socket: WebSocket | null = null;
  try {
    const url = await pageSocket(port, () =>
      spawnError !== null
        ? `${browser} did not start: ${spawnError}`
        : exited !== undefined
          ? `${browser} exited (code ${exited}) before it opened a page to press with; point VELLUM_BROWSER at a Chromium-family browser that runs headless`
          : null,
    );
    const product = await fetch(`http://127.0.0.1:${port}/json/version`)
      .then((r) => r.json() as Promise<{ readonly Browser?: string }>)
      .then((v) => v.Browser ?? "unnamed browser");
    const cdp = await connect(url);
    socket = cdp.socket;
    await cdp.send("Page.enable");
    let bytes = 0;
    for (const pressing of pressings) {
      const { width, height } = svgDimensions(readFileSync(pressing.svg, "utf8"));
      await cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
      const load = cdp.loaded();
      await cdp.send("Page.navigate", { url: pathToFileURL(pressing.svg).href });
      if (!(await load)) throw new Error(`${pressing.svg} never loaded`);
      const shot = await cdp.send("Page.captureScreenshot", {
        format: "webp",
        quality: options.quality,
        clip: { x: 0, y: 0, width, height, scale: options.pixelWidth / width },
      });
      const bytesOut = Buffer.from(String(shot["data"]), "base64");
      writeFileSync(pressing.out, bytesOut);
      bytes += bytesOut.length;
    }
    return { product, bytes };
  } finally {
    socket?.close();
    child.kill();
    await Promise.race([gone, sleep(EXIT_MS)]);
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}
