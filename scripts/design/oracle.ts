import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { BUNDLE_ENTRIES } from "../build-app-bundles.ts";
import { shootAll, type Shot, type ShotResult } from "./shoot.ts";

/** The screenshot sweep (the Issue #465 closing review's oracle, ported by Issue #706): every built page at a desktop and a true phone viewport, for comparing two builds through `scripts/design/compare.ts`; the method is `handbook/specs/settle-doctrine.md`'s. */

export type Mode = "full" | "head" | "view";

const VIEWPORTS = [
  { width: 1280, height: 800, mobile: false },
  { width: 390, height: 844, mobile: true },
] as const;
export const BAND = 122;
const HEAD_WAIT_MS = 4500;
const PAGE_WAIT_MS = 2500;
const PIN_WAIT_MS = 200;
const MODE_ORDER: readonly Mode[] = ["full", "head", "view"];

const CAPTION_MS = /\d+\s*ms/;
const PIN_SELECTORS = `[id$="-status"], .status, .rf-status, #pressed, #folio-sub`;
export const PIN = `(() => { const re = new RegExp(${JSON.stringify(CAPTION_MS.source)}, "g"); for (const el of document.querySelectorAll(${JSON.stringify(PIN_SELECTORS)})) { const t = el.textContent; const n = t.replace(re, "NNNms"); if (n !== t) el.textContent = n; } return true; })()`;
export const PROBE = `JSON.stringify({ cw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight })`;

export function routesOf(dist: string): string[] {
  return readdirSync(dist, { recursive: true, encoding: "utf8" })
    .filter((p) => p === "index.html" || p.endsWith(`${sep}index.html`))
    .map((p) => {
      const dir = dirname(p).split(sep).join("/");
      return dir === "." ? "/" : `/${dir}/`;
    })
    .sort();
}

const routeOfTwin = (twin: string): string => (dirname(twin) === "." ? "/" : `/${dirname(twin)}/`);
const APP_ROUTES: ReadonlySet<string> = new Set(BUNDLE_ENTRIES.map(({ twin }) => routeOfTwin(twin)));
const KEPT_MODES: Readonly<Record<string, Mode>> = { "/": "full", "/specimen/": "view" };

export const modeOf = (route: string): Mode => KEPT_MODES[route] ?? (APP_ROUTES.has(route) ? "head" : "full");

const shotName = (route: string, width: number, mode: Mode): string =>
  `${route === "/" ? "home" : route.replace(/\//g, "")}-${width}${mode === "head" ? "-head" : ""}.png`;

type PlannedShot = Shot & { readonly route: string; readonly mode: Mode; readonly name: string };

export function planSweep(routes: readonly string[], out: string): PlannedShot[] {
  const ordered = MODE_ORDER.flatMap((m) => routes.filter((r) => modeOf(r) === m));
  const named = new Map<string, string>();
  for (const route of ordered) {
    const name = shotName(route, VIEWPORTS[0].width, modeOf(route));
    const other = named.get(name);
    if (other !== undefined) throw new Error(`${other} and ${route} would both be shot as ${name}, so one page would go unphotographed`);
    named.set(name, route);
  }
  return VIEWPORTS.flatMap(({ width, height, mobile }) =>
    ordered.map((route) => {
      const mode = modeOf(route);
      const name = shotName(route, width, mode);
      return {
        route, mode, name, url: route, width, height, mobile, out: join(out, name),
        waitMs: mode === "head" ? HEAD_WAIT_MS : PAGE_WAIT_MS, script: PIN, scriptWaitMs: PIN_WAIT_MS, probe: PROBE,
        full: mode === "full", ...(mode === "head" ? { clip: { x: 0, y: 0, width, height: BAND } } : {}),
      };
    }),
  );
}

type ManifestRow = { readonly name: string; readonly route: string; readonly w: number; readonly mode: Mode } & Omit<ShotResult, "out" | "url">;

async function sweep(dist: string, out: string, options: { readonly label?: string | undefined; readonly reducedMotion: boolean }): Promise<ManifestRow[]> {
  const plan = planSweep(routesOf(resolve(dist)), out);
  mkdirSync(out, { recursive: true });
  rmSync(join(out, "manifest.json"), { force: true });
  const results = await shootAll(plan, { site: dist, reducedMotion: options.reducedMotion });
  const rows = plan.map((s, i) => {
    const r = results[i]!;
    return { name: s.name, route: s.route, w: s.width, mode: s.mode, viewport: r.viewport, probe: r.probe, http4xx: r.http4xx, consoleErrors: r.consoleErrors };
  });
  for (const r of rows) console.log(`${options.label ?? ""} ${r.name} ${r.probe ?? ""}`.trim());
  writeFileSync(join(out, "manifest.json"), `${JSON.stringify(rows, null, 1)}\n`);
  return rows;
}

type SweepArgs = { readonly dist: string; readonly out: string; readonly label: string | undefined; readonly reducedMotion: boolean };

export function parseSweepArgs(args: readonly string[]): SweepArgs {
  const usage = "usage: node scripts/design/oracle.ts <dist-dir> <out-dir> [label] [--motion]";
  const flags = args.filter((a) => a.startsWith("--"));
  const [dist, out, label, ...extra] = args.filter((a) => !a.startsWith("--"));
  if (dist === undefined || out === undefined || extra.length > 0 || flags.some((f) => f !== "--motion")) throw new Error(usage);
  return { dist, out, label, reducedMotion: !args.includes("--motion") };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const { dist, out, label, reducedMotion } = parseSweepArgs(process.argv.slice(2));
    sweep(dist, out, { label, reducedMotion }).catch((err: unknown) => {
      console.error(err instanceof Error ? err.message : err);
      process.exitCode = 1;
    });
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 2;
  }
}
