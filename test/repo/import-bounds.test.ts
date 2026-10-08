import { test } from "node:test";
import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { ESLint } from "eslint";

const ROOT = resolve(import.meta.dirname, "..", "..");
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });

const reports = async (lines: readonly string[], path: string, rules: readonly string[]): Promise<number[]> => {
  const [result] = await eslint.lintText(lines.join("\n"), { filePath: join(ROOT, path) });
  assert.deepEqual(
    result!.messages.filter((m) => m.fatal).map((m) => m.message),
    [],
    `the plant at ${path} does not parse, so no rule read it`,
  );
  return result!.messages.filter((m) => rules.includes(m.ruleId ?? "")).map((m) => m.line);
};

const PHILOLOGY_IMPORTS = [
  'import { glossName } from "../society/philology.ts";',
  'export const a = () => import("../society/philology.ts");',
  'export * from "../society/philology-lexicon.ts";',
  'export const b = new URL("../society/philology.ts", import.meta.url);',
  "// the philology module, named in a comment",
  'export const c = "philology, named in prose";',
  'import { tongueName } from "../society/names.ts";',
];

test("world generation reaches the philologist's glass by no module source, static, dynamic or by URL, and a mention is not a reach (Issue #124)", async () => {
  const rule = ["vellum/world-no-philology"];
  assert.deepEqual(await reports(PHILOLOGY_IMPORTS, "src/world/generate.ts", rule), [1, 2, 3, 4]);
  assert.deepEqual(await reports(PHILOLOGY_IMPORTS, "src/society/names.ts", rule), [1, 2, 3, 4], "the society's half");
  assert.deepEqual(await reports(PHILOLOGY_IMPORTS, "src/society/philology.ts", rule), [], "the glass itself");
  assert.deepEqual(await reports(PHILOLOGY_IMPORTS, "src/render/place-card.ts", rule), [], "the card reads it");
});

test("the philologist's glass reads no source of randomness: no rng by any name or path, no Math.random however reached (Issue #124)", async () => {
  const plant = [
    'import { createRng } from "../core/rng.ts";',
    "export const a = (): number => Math.random();",
    "export const b = (): number => globalThis.Math.random();",
    'export const c = (): number => Math["random"]();',
    "export const d = (rng: () => number): number => rng();",
    "export const e = (deps: { rng: () => number }): number => deps.rng();",
    "export const f = Math.floor(2.5);",
    "// rng and Math.random, named in a comment",
    'export const g = "rng";',
  ];
  const rule = ["vellum/philology-no-entropy"];
  assert.deepEqual(await reports(plant, "src/society/philology.ts", rule), [1, 2, 3, 4, 5, 5, 6]);
  assert.deepEqual(await reports(plant, "src/society/names.ts", rule), [], "the rule reaches the glass alone");
});

test("home's client modules import nothing build-time, and the build-time pair is exempt (Issue #456)", async () => {
  const plant = [
    'import { homeStage } from "./stage-data.ts";',
    'import { STATIONS } from "./stations.ts";',
    'export const a = () => import("../../world/generate.ts");',
    'export * from "../../render/place-manifest.ts";',
    'import type { World } from "../../world/types.ts";',
    'import { clamp } from "./camera-math.ts";',
    "// imports ./stage-data.ts, named in a comment",
  ];
  const rule = ["vellum/home-client-no-engine"];
  assert.deepEqual(await reports(plant, "src/site/home/camera.ts", rule), [1, 2, 3, 4]);
  assert.deepEqual(await reports(plant, "src/site/home/valve.ts", rule), [1, 2, 3, 4], "a module the old list missed");
  for (const exempt of ["src/site/home/stage-data.ts", "src/site/home/stations.ts"])
    assert.deepEqual(await reports(plant, exempt, rule), [], `${exempt} is the build-time pair`);
});

test("home's pure modules read no document and no window, however the global is reached (Issue #458)", async () => {
  const plant = [
    'export const a = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;',
    "export const b = (): string => document.title;",
    "export const c = (): string => globalThis.document.title;",
    "export const d = (): unknown => self.window;",
    "export const e = 1;",
  ];
  const rules = ["no-restricted-globals", "no-restricted-properties"];
  for (const pure of [
    "drift.ts",
    "station-flight.ts",
    "stations.ts",
    "camera.ts",
    "ceremony.ts",
    "coords.ts",
    "valve.ts",
  ])
    assert.deepEqual(await reports(plant, `src/site/home/${pure}`, rules), [1, 2, 3, 4], pure);
  assert.deepEqual(await reports(plant, "src/site/home/app.ts", rules), [], "the conductor owns the DOM");
});

const HUNT_PLANT = [
  "declare const el: HTMLElement; declare const opts: object;",
  'import { createZoomController } from "../shared/zoom-controller.ts";',
  'import * as zoom from "../shared/zoom-controller.ts";',
  "export const a = createZoomController({ viewportEl: el, targetEl: el });",
  "export const b = createZoomController({ viewportEl: el, onSettle: () => {} });",
  "export const c = zoom.createZoomController({ onApply: () => {} });",
  "export const d = createZoomController(opts);",
  "export const e = createZoomController({ ...opts });",
  'export const f = createZoomController({ ["onSettle"]: () => {} });',
  'const make = createZoomController; export const g = make({ "onApply": () => {} });',
  "export const h = createZoomController.call(null, { onSettle: () => {} });",
  "export const i = [createZoomController];",
  'export const j = () => import("../explorer/lod-controller.ts");',
  'export const k = new globalThis.Worker("./region-worker.ts");',
  'export const l = new URL("./worker.ts", import.meta.url);',
  'export { createZoomController as z } from "../shared/zoom-controller.ts";',
  'import def from "../shared/zoom-controller.ts";',
  'export const m = import.meta.glob("./regions/*.ts");',
  "export const n = zoom;",
  "// a comment naming ../explorer/lod-controller.ts",
  'export const o = "a region, named in prose";',
  "export const p = def;",
];

test("the Hunt stays a fixed world: no module source naming a finer survey, a region or a worker, and its zoom controller takes no redraft hook in any form this rule cannot read (Issue #161)", async () => {
  assert.deepEqual(
    await reports(HUNT_PLANT, "src/site/seed-of-the-day/app.ts", ["vellum/hunt-fixed-world"]),
    [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
  );
  assert.deepEqual(
    await reports(HUNT_PLANT, "src/site/explorer/app.ts", ["vellum/hunt-fixed-world"]),
    [],
    "the rule reaches the Hunt's modules alone",
  );
});
