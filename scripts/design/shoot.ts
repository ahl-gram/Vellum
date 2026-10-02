import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { findBrowser, NO_BROWSER } from "../../src/cli/raster.ts";
import { cleanup, start } from "../../e2e/harness.ts";
import { dropExpectedCancellations } from "../../e2e/support/console.ts";
import { makeSettle } from "../../e2e/support/settle.ts";
import type { SuiteContext } from "../../e2e/types.ts";

/** The shared camera for design work: one browser per call, every shot at a TRUE layout viewport set through device metrics, captured once. */

const REPO = fileURLToPath(new URL("../..", import.meta.url));

export type ShotClip = { readonly x: number; readonly y: number; readonly width: number; readonly height: number; readonly scale?: number };

export type Shot = {
  readonly url: string;
  readonly width: number;
  readonly height: number;
  readonly mobile: boolean;
  readonly out: string;
  readonly waitMs?: number;
  readonly script?: string;
  readonly scriptWaitMs?: number;
  readonly probe?: string;
  readonly full?: boolean;
  readonly clip?: ShotClip;
};

export type ShotResult = {
  readonly out: string;
  readonly url: string;
  readonly viewport: { readonly innerWidth: number; readonly innerHeight: number };
  readonly probe: string | null;
  readonly http4xx: readonly string[];
  readonly consoleErrors: readonly string[];
};

export type CaptureParams = {
  readonly format: "png";
  readonly captureBeyondViewport: boolean;
  readonly clip: { readonly x: number; readonly y: number; readonly width: number; readonly height: number; readonly scale: number };
};

export const FULL_PAGE_CAP = 16000;
const DEFAULT_WAIT_MS = 2600;
const DEFAULT_SCRIPT_WAIT_MS = 600;

export function captureParams(shot: Shot, documentHeight: number): CaptureParams {
  if (shot.full === true) {
    return { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: shot.width, height: Math.min(FULL_PAGE_CAP, documentHeight), scale: 1 } };
  }
  const c = shot.clip ?? { x: 0, y: 0, width: shot.width, height: shot.height };
  const x = Math.max(0, c.x), y = Math.max(0, c.y);
  return { format: "png", captureBeyondViewport: false, clip: { x, y, width: c.width - (x - c.x), height: c.height - (y - c.y), scale: c.scale ?? 1 } };
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const positiveInt = (v: unknown): boolean => Number.isInteger(v) && (v as number) > 0;
const optional = (v: unknown, ok: (x: unknown) => boolean): boolean => v === undefined || ok(v);
const text = (v: unknown): boolean => typeof v === "string" && v.length > 0;
const finite = (v: unknown): boolean => typeof v === "number" && Number.isFinite(v);
const clipOk = (v: unknown): boolean =>
  isRecord(v) && finite(v["x"]) && finite(v["y"]) && positiveInt(v["width"]) && positiveInt(v["height"]) && optional(v["scale"], (s) => finite(s) && (s as number) > 0);

function shotProblem(s: Record<string, unknown>): string | null {
  if (!text(s["url"])) return "url must be a non-empty string";
  if (!positiveInt(s["width"]) || !positiveInt(s["height"])) return "width and height must be positive integers";
  if (typeof s["mobile"] !== "boolean") return "mobile must be true or false";
  if (!text(s["out"])) return "out must be a non-empty path";
  if (!optional(s["waitMs"], (v) => Number.isInteger(v) && (v as number) >= 0)) return "waitMs must be a whole number of milliseconds";
  if (!optional(s["scriptWaitMs"], (v) => Number.isInteger(v) && (v as number) >= 0)) return "scriptWaitMs must be a whole number of milliseconds";
  if (!optional(s["script"], text) || !optional(s["probe"], text)) return "script and probe must be non-empty strings";
  if (!optional(s["full"], (v) => typeof v === "boolean")) return "full must be true or false";
  if (!optional(s["clip"], clipOk)) return "clip must carry finite x and y, positive integer width and height, and a positive finite scale if any";
  if (s["full"] === true && s["clip"] !== undefined) return "a full-page shot takes no clip";
  return null;
}

export function parseShots(json: unknown): Shot[] {
  if (!Array.isArray(json)) throw new Error("the shot list must be a JSON array");
  return json.map((s: unknown, i) => {
    const problem = isRecord(s) ? shotProblem(s) : "each shot must be an object";
    if (problem) throw new Error(`shot ${i}: ${problem}`);
    return s as Shot;
  });
}

export function readProbe(value: unknown, out: string): string {
  if (value === undefined) throw new Error(`the probe for ${out} handed back nothing, so this row would be measured as undefined`);
  return typeof value === "string" ? value : JSON.stringify(value);
}

const freePort = (): Promise<number> =>
  new Promise((res, rej) => {
    const server = createServer();
    server.once("error", rej);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address !== null ? address.port : 0;
      server.close(() => res(port));
    });
  });

async function freePorts(): Promise<[number, number]> {
  const a = await freePort();
  let b = await freePort();
  while (b === a) b = await freePort();
  return [a, b];
}

export const servedUrl = (url: string, port: number): string => (url.startsWith("/") ? `http://127.0.0.1:${port}${url}` : new URL(url).href);

// 2026-10-02: the slowest commit over the thirteen built pages at both viewports was 611 ms (the Seed of the Day); 600 tries of 50 ms is a cap on a hang, some fifty times that.
const COMMIT_TRIES = 600;

export const withoutHash = (href: string): string => href.split("#")[0]!;

export function assertLaidOutAt(shot: Shot, innerWidth: number): void {
  if (innerWidth !== shot.width) {
    throw new Error(`${shot.out} laid out ${innerWidth}px wide, not the ${shot.width}px asked for; under phone emulation a page with no viewport meta tag lays out 980px wide`);
  }
}

export const withoutFavicon = (responses: readonly string[]): string[] => responses.filter((u) => !/favicon/i.test(u));

async function committed(ctx: SuiteContext, href: string): Promise<void> {
  const settle = makeSettle(ctx);
  await settle<{ href: string; ready: string; fonts: string }>(
    `({ href: location.href, ready: document.readyState, fonts: document.fonts ? document.fonts.status : "loaded" })`,
    (d) => withoutHash(d.href) === withoutHash(href) && d.ready === "complete" && d.fonts === "loaded",
    `the page at ${href} never committed`,
    COMMIT_TRIES,
  );
}

async function takeShot(ctx: SuiteContext, shot: Shot, port: number): Promise<ShotResult> {
  const errBase = ctx.consoleErrors.length, httpBase = ctx.http4xx.length;
  const url = servedUrl(shot.url, port);
  await ctx.send("Emulation.setDeviceMetricsOverride", { width: shot.width, height: shot.height, deviceScaleFactor: 1, mobile: shot.mobile });
  await ctx.send("Page.navigate", { url: "about:blank" });
  await ctx.send("Page.navigate", { url });
  await committed(ctx, url);
  await ctx.sleep(shot.waitMs ?? DEFAULT_WAIT_MS);
  if (shot.script !== undefined) {
    await ctx.evaluate(shot.script, true);
    await ctx.sleep(shot.scriptWaitMs ?? DEFAULT_SCRIPT_WAIT_MS);
  }
  const documentHeight = await ctx.evaluate<number>("Math.ceil(document.documentElement.scrollHeight)");
  const png = await ctx.send<{ data: string }>("Page.captureScreenshot", captureParams(shot, documentHeight));
  mkdirSync(dirname(resolve(shot.out)), { recursive: true });
  writeFileSync(resolve(shot.out), Buffer.from(png.data, "base64"));
  const viewport = await ctx.evaluate<{ innerWidth: number; innerHeight: number }>("({ innerWidth, innerHeight })");
  assertLaidOutAt(shot, viewport.innerWidth);
  const probe = shot.probe === undefined ? null : readProbe(await ctx.evaluate<unknown>(shot.probe, true), shot.out);
  const http4xx = withoutFavicon(ctx.http4xx.slice(httpBase));
  return { out: shot.out, url, viewport, probe, http4xx, consoleErrors: dropExpectedCancellations(ctx.consoleErrors.slice(errBase)) };
}

export type ShootOptions = { readonly site?: string; readonly reducedMotion?: boolean };

export async function shootAll(shots: readonly Shot[], options: ShootOptions = {}): Promise<ShotResult[]> {
  const browser = findBrowser();
  if (!browser) throw new Error(NO_BROWSER);
  const [PORT, DPORT] = await freePorts();
  try {
    const ctx = await start({
      browser, SITE: resolve(options.site ?? REPO), OUT: resolve(REPO, "out"), PORT, DPORT, PAGE: "about:blank",
      results: [], consoleErrors: [], http4xx: [], skippedGroups: [],
    });
    if (options.reducedMotion === true) {
      await ctx.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    }
    const results: ShotResult[] = [];
    for (const shot of shots) results.push(await takeShot(ctx, shot, PORT));
    return results;
  } finally {
    cleanup();
  }
}

function flag(args: readonly string[], name: string): string | undefined {
  const at = args.indexOf(name);
  return at === -1 ? undefined : args[at + 1];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const list = args[0];
  if (list === undefined) {
    console.error("usage: node scripts/design/shoot.ts <shots.json> [--site <dir>] [--reduced-motion]");
    process.exit(2);
  }
  shootAll(parseShots(JSON.parse(readFileSync(list, "utf8"))), { site: flag(args, "--site"), reducedMotion: args.includes("--reduced-motion") })
    .then((results) => console.log(JSON.stringify(results, null, 1)))
    .catch((err: unknown) => {
      console.error(err instanceof Error ? err.message : err);
      process.exitCode = 1;
    });
}
