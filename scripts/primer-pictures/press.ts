import { spawn, type ChildProcess } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  LAUNCH_TUNING,
  launchWithRetry,
  type LaunchAttempt,
  type LaunchDeps,
  type LaunchTuning,
} from "../../e2e/support/launch.ts";
import { svgDimensions } from "../../src/cli/raster.ts";
import { freePort } from "../free-port.ts";

export interface Pressing {
  readonly svg: string;
  readonly out: string;
}
export interface PressOptions {
  readonly pixelWidth: number;
  readonly quality: number;
  readonly replyMs: number;
}
export interface Pressed {
  readonly product: string;
  readonly bytes: number;
}
export interface Launched {
  readonly port: number;
  readonly url: string;
  close(): Promise<void>;
}
export type Launch = (deps: LaunchDeps<string>, tuning: LaunchTuning) => Promise<string>;

const PROFILE_PREFIX = "vellum-primer-pictures-";
// 2026-11-24, Issue #1255: a chart loaded in about 40 ms and a browser was gone 12 to 15 ms after its kill on this Mac, and none of the 336 loads in fourteen GitHub proof builds at 0f1dfa8f (runs 45305657670 and 45306297095) reached LOAD_MS; each cap is a hang's cost, not a budget.
const LOAD_MS = 10_000;
const EXIT_MS = 5_000;

interface Target {
  readonly type?: string;
  readonly webSocketDebuggerUrl?: string;
}

interface Live {
  readonly child: ChildProcess;
  readonly profile: string;
  readonly gone: Promise<void>;
}

async function pageTarget(port: number): Promise<string> {
  const list = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()) as readonly Target[];
  const page = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl !== undefined);
  if (page?.webSocketDebuggerUrl === undefined) throw new Error(`/json had ${list.length} targets, none a page`);
  return page.webSocketDebuggerUrl;
}

async function stop(live: Live): Promise<void> {
  live.child.kill();
  let timer: NodeJS.Timeout | undefined;
  await Promise.race([live.gone, new Promise<void>((done) => (timer = setTimeout(done, EXIT_MS)))]);
  clearTimeout(timer);
  rmSync(live.profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}

// 2026-11-24, Issue #1255: the press starts a build's first browser, and on GitHub's runners a first start took 0.6 to 56.4 s over 240 CI lane jobs from 2026-11-17 to 2026-11-24 and passed 15 s in 2 of 16 proof builds at 0f1dfa8f (runs 45305657670 and 45306297095), so it waits and retries as the e2e harness does.
export async function launchPress(
  browser: string,
  tuning: LaunchTuning = { ...LAUNCH_TUNING, polls: 120 },
  launch: Launch = launchWithRetry,
): Promise<Launched> {
  const port = await freePort();
  const lives: Live[] = [];
  const close = async (): Promise<void> => {
    for (const live of lives) await stop(live);
  };
  const attempt = (): Promise<LaunchAttempt> => {
    const profile = mkdtempSync(join(tmpdir(), PROFILE_PREFIX));
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
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    const gone = new Promise<void>((done) => {
      child.once("exit", () => done());
      child.once("error", () => done());
    });
    lives.push({ child, profile, gone });
    return Promise.resolve({
      child,
      discard: () => rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }).catch(() => {}),
    });
  };
  try {
    const url = await launch(
      {
        preflight: () => Promise.resolve(),
        spawn: attempt,
        probe: () => pageTarget(port),
        log: (line) => console.error(line),
      },
      tuning,
    );
    return { port, url, close };
  } catch (err) {
    await close();
    throw new Error(
      `${browser} opened no page to press with; point VELLUM_BROWSER at a Chromium-family browser that runs headless\n${err instanceof Error ? err.message : String(err)}`,
      { cause: err },
    );
  }
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
  const launched = await launchPress(browser);
  let socket: WebSocket | null = null;
  try {
    const product = await fetch(`http://127.0.0.1:${launched.port}/json/version`)
      .then((r) => r.json() as Promise<{ readonly Browser?: string }>)
      .then((v) => v.Browser ?? "unnamed browser");
    const cdp = await connect(launched.url);
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
    await launched.close();
  }
}
