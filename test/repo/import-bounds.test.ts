import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { Linter } from "eslint";
import tseslint from "typescript-eslint";
import importBounds, { ROOMS_UNDER_THE_EXPLORER, TOOLING_ROOTS } from "../../scripts/lint/import-bounds.ts";
import { lintTsRoots } from "../../test-support/lint-roots.ts";
import { WITNESSES } from "../../test-support/lint-witnesses.ts";
import { eslint, plantMessages } from "../../test-support/source-shape-reports.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");

const reports = async (lines: readonly string[], path: string, rules: readonly string[]): Promise<number[]> =>
  (await plantMessages(lines, path)).filter((m) => rules.includes(m.ruleId ?? "")).map((m) => m.line);

const PHILOLOGY_IMPORTS = [
  'import { glossName } from "../society/philology.ts";',
  'export const a = () => import("../society/philology.ts");',
  'export * from "../society/philology-lexicon.ts";',
  'export const b = new URL("../society/philology.ts", import.meta.url);',
  "// the philology module, named in a comment",
  'export const c = "philology, named in prose";',
  'import { tongueName } from "../society/names.ts";',
  'const spec = "../society/philology.ts"; export const load = () => import(spec);',
];

test("world generation reaches the philologist's glass by no module source, static, dynamic, by URL or held in a string, and a mention is not a reach (Issue #124)", async () => {
  const rule = ["vellum/world-no-philology"];
  assert.deepEqual(
    await reports(PHILOLOGY_IMPORTS, "src/world/generate.ts", rule),
    [1, 2, 3, 4, 8],
    "BLIND SPOTS, declared, erring toward passing: a specifier assembled at run time from pieces (a piece may name the glass, as `philology` does, without the path the rule reads), and a module that reaches the glass through another, as `src/render/place-card.ts` imports it",
  );
  assert.deepEqual(
    await reports(PHILOLOGY_IMPORTS, "src/society/names.ts", rule),
    [1, 2, 3, 4, 8],
    "the society's half",
  );
  for (const closure of [
    "src/hydrology/basins.ts",
    "src/core/bfs-distance.ts",
    "src/terrain/contours.ts",
    "src/climate/biomes.ts",
    "src/noise/fbm.ts",
  ])
    assert.deepEqual(
      await reports(PHILOLOGY_IMPORTS, closure, rule),
      [1, 2, 3, 4, 8],
      `${closure}, in generateWorld's closure`,
    );
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
    "const { random } = Math;",
    "const M = globalThis.Math; export const h = (): number => M.random();",
    "export const i = { Math: 1 };",
    "export const j = (): string => crypto.randomUUID();",
    "export const k = (): number => Date.now();",
    "export const l = (): number => globalThis.performance.now();",
  ];
  const rule = ["vellum/philology-no-entropy"];
  assert.deepEqual(await reports(plant, "src/society/philology.ts", rule), [1, 2, 3, 4, 5, 5, 6, 10, 11, 13, 14, 15]);
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
    'const m = "./stage-data.ts"; export const load = () => import(m);',
  ];
  const rule = ["vellum/home-client-no-engine"];
  assert.deepEqual(
    await reports(plant, "src/site/home/camera.ts", rule),
    [1, 2, 3, 4, 5, 8],
    "BLIND SPOTS, declared, erring toward passing: a specifier assembled at run time from pieces, and a module whose name hides that it imports the engine",
  );
  assert.deepEqual(
    await reports(plant, "src/site/home/valve.ts", rule),
    [1, 2, 3, 4, 5, 8],
    "a module the old list missed",
  );
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
    "const g = globalThis; export const t = g.document.title;",
    "export const u = (): string => parent.document.title;",
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
    assert.deepEqual(
      await reports(plant, `src/site/home/${pure}`, rules),
      [1, 2, 3, 3, 4, 4, 6, 6, 7],
      `${pure}. BLIND SPOT, declared, erring toward passing: a bare global the page gives (matchMedia, innerWidth, requestAnimationFrame, location, navigator, localStorage), which names neither document nor window; node --test runs these modules and throws on one it reaches`,
    );
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
  'export const q = () => import("../shared/zoom-controller.ts");',
  'export * from "../shared/zoom-controller.ts";',
  'export const r = new SharedWorker("./region-worker.ts");',
  'const spec = "../explorer/lod-controller.ts"; export const s = () => import(spec);',
  "const held = `../explorer/region-detail.ts`; export const t = () => import(held);",
  'import { bindZoomRoom } from "../shared/zoom-room.ts";',
  'export const u = () => import("../shared/zoom-room.ts");',
  'export { bindZoomRoom as w } from "../shared/zoom-room.ts";',
  'const room = "../shared/zoom-room.ts"; export const v = () => import(room);',
  'export const x = "the zoom-room, named in prose";',
];

test("the Hunt stays a fixed world: no module source naming a finer survey, a region or a worker, and its zoom controller takes no redraft hook in any form this rule cannot read, nor reaches zoom-room.ts, whose controller carries one (Issue #161)", async () => {
  assert.deepEqual(
    await reports(HUNT_PLANT, "src/site/seed-of-the-day/app.ts", ["vellum/hunt-fixed-world"]),
    [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 23, 24, 25, 26, 27, 28, 29, 30, 31],
    "BLIND SPOTS, declared, erring toward passing: a specifier assembled at run time from pieces, and a module whose name hides what it imports (the import closure, a handbook/errata/guards.md row)",
  );
  assert.deepEqual(
    await reports(HUNT_PLANT, "src/site/explorer/app.ts", ["vellum/hunt-fixed-world"]),
    [],
    "the rule reaches the Hunt's modules alone",
  );
});

const GLASS_KEYS_PLANT = [
  'import { bindGlassKeys } from "../../shared/glass-keys.ts";',
  'export const z = (root: ParentNode) => root.querySelectorAll("[data-zoom]");',
  "export const y = bindGlassKeys;",
  'import { bindZoomRoom } from "../../shared/zoom-room.ts";',
  "export const w = bindZoomRoom;",
];

test("the glass-keys ban spares the Portfolio's own folder under the Explorer and no other, so the Explorer's own modules at any depth stay inside it (Issue #767)", () => {
  const rulesAt = (path: string): number[] =>
    new Linter({ cwd: ROOT })
      .verify(
        GLASS_KEYS_PLANT.join("\n"),
        [
          {
            files: ["**/*.ts"],
            plugins: { vellum: importBounds },
            languageOptions: { parser: tseslint.parser },
            rules: { "vellum/explorer-no-glass-keys": "error" },
          },
        ],
        { filename: join(ROOT, path) },
      )
      .map((m) => m.line);
  assert.deepEqual(rulesAt("src/site/explorer/portfolio/app.ts"), [], "the Portfolio binds the kit's keys on purpose");
  for (const path of [
    "src/site/explorer/app.ts",
    "src/site/explorer/nested/deeper/part.ts",
    "src/site/explorer/portfolio-zz/app.ts",
    "src/site/explorer/nested/src/site/explorer/portfolio/app.ts",
  ])
    assert.deepEqual(rulesAt(path), [1, 2, 4], `${path} stays under the ban`);
  assert.deepEqual(
    ROOMS_UNDER_THE_EXPLORER,
    ["src/site/explorer/portfolio/"],
    "the exemption names the Portfolio's folder and no other",
  );
  for (const room of ROOMS_UNDER_THE_EXPLORER) assert.ok(existsSync(join(ROOT, room)), `${room} exists on disk`);
});

const TOOLING_RULE = "vellum/src-no-tooling-import";
const TOOLING_FILES = [
  "src/cli/main.ts",
  "src/world/generate.ts",
  "src/site/explorer/place-fetch.ts",
  "src/site/explorer/worker.ts",
  "src/site/shared/living-chart/voyage.ts",
];
const TOOLING_BLIND_SPOTS =
  "BLIND SPOTS, declared, erring toward passing: a specifier assembled at run time from pieces none of which is itself a path into those folders, relative or root-absolute (a path join, a concatenation); an import.meta.glob pattern whose folder segment is a wildcard; a module that reaches them through another module; a triple-slash reference path, which TypeScript reads and this rule does not; and a page, a layout or a sheet under src/, which this TypeScript lint never reads. Erring toward refusing: a module source or an import.meta.glob pattern opening with / is read from the repo root, as the site's bundler reads it; a relative string anywhere in src/ that lands in one of the folders is refused though nothing imports it; and a root-absolute piece inside an assembled source, import(`./${x}/test/part.ts`) or import(base + '/scripts/x.ts'), is read as a root path though it lands under src/ or nowhere, which no src/ file does today. An import alias (import x = require) is refused first by npm run check (TS1294).";

const toolingPlant = (file: string): string[] => {
  const up = "../".repeat(file.split("/").length - 1);
  return [
    `import { placeFile } from "${up}scripts/place-files.ts";`,
    `import type { WITNESSES } from "${up}test-support/lint-witnesses.ts";`,
    `export * from "${up}e2e/harness.ts";`,
    `export type { Plant } from "${up}test/repo/fixture.ts";`,
    `export const a = () => import("${up}scripts/delivery/main.ts");`,
    `export const b = new URL("${up}e2e/harness.ts", import.meta.url);`,
    `export type C = typeof import("${up}scripts/place-files.ts");`,
    `export type D = import("${up}test-support/lint-witnesses.ts").Witnesses;`,
    `import "/scripts/kit-fonts.ts";`,
    `const spec = "${up}test/repo/fixture.ts"; export const load = () => import(spec);`,
    "export const e = (name: string) => import(`" + up + "e2e/suites/${name}.ts`);",
    `// imports ${up}scripts/place-files.ts, named in a comment`,
    `export const f = "scripts/ holds the commands, named in prose";`,
    `export const g = "/scripts/";`,
    `import { createRng } from "${up}src/core/rng.ts";`,
    `export const h = () => import("./test/part.ts");`,
    `export const i = () => import("${up}scripts-archive/x.ts");`,
    `export * from "${up}test-support";`,
    `export const j = import.meta.glob("/scripts/*.ts");`,
    `export const k = import.meta.glob(["/src/core/*.ts", "/e2e/**", "/test-support/*.ts"]);`,
    `export const l = import.meta.glob("${up}scripts/*.ts");`,
    `export const m = import.meta.glob("/src/core/*.ts");`,
    `declare const fs: { glob: (pattern: string) => void }; fs.glob("/scripts/*.ts");`,
  ];
};

test("src/ reaches scripts/, test/, test-support/ and e2e/ by no module source and no type import, static, dynamic, by URL, by glob, from the root or held in a string, and a mention, a site path, src/ itself, a folder of src/ named test and a sibling folder are not a reach (Issue #1132)", async () => {
  for (const file of TOOLING_FILES)
    assert.deepEqual(
      await reports(toolingPlant(file), file, [TOOLING_RULE]),
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 18, 19, 20, 21],
      `${file}. ${TOOLING_BLIND_SPOTS}`,
    );
});

const resolvedRule = async (file: string): Promise<unknown> =>
  ((await eslint.calculateConfigForFile(file)) as { rules?: Record<string, unknown> }).rules?.[TOOLING_RULE];

test("the src/ import rule resolves at error on every file under src/, a room not yet written too, and on no other TypeScript root, whose files import from scripts/ freely; and its four folders are the ruled four and stand on disk (Issue #1132)", async () => {
  for (const file of [WITNESSES["src/**/*.ts"]!, "src/site/zz-new-room/part.ts"])
    assert.deepEqual(await resolvedRule(file), [2], `${TOOLING_RULE} does not resolve at error on ${file}`);
  const roots = lintTsRoots();
  assert.ok(
    roots.includes("src") && roots.length > 1,
    "the lint reads no TypeScript root but src, so the sweep below reads nothing",
  );
  for (const root of roots.filter((r) => r !== "src")) {
    const witness = WITNESSES[`${root}/**/*.ts`];
    assert.ok(witness !== undefined, `${root} has no witness in test-support/lint-witnesses.ts`);
    assert.equal(
      await resolvedRule(witness),
      undefined,
      `${TOOLING_RULE} reaches ${witness}, code that may import scripts/`,
    );
  }
  assert.deepEqual(
    TOOLING_ROOTS,
    ["e2e", "scripts", "test", "test-support"],
    "the guarded folders are the four ruled: the tooling around the product",
  );
  for (const root of TOOLING_ROOTS) assert.ok(existsSync(join(ROOT, root)), `${root} does not exist on disk`);
});
