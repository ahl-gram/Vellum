import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { dirname, resolve, join, relative, sep } from "node:path";
import { tmpdir } from "node:os";
import ts from "typescript";
import { ROMAN } from "../../src/prospect/letter/face-roman.ts";
import { CAPS } from "../../src/prospect/letter/face-caps.ts";
import { ITALIC } from "../../src/prospect/letter/face-italic.ts";
import { NUMERO } from "../../src/prospect/letter/numero.ts";
import type { FaceTable } from "../../src/prospect/letter/face.ts";

// One press (Issue #208): one multi-entry Vite build covers every app page, and the worker spawn is the static import-URL form Vite rewrites.

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");

test("the hand-coded shells retired with the re-shell (#254): routes and the build-output folder stay disjoint", () => {
  // Sub 1 constraint 9: Astro documents no collision precedence between a public-folder file and a same-path route, so the routes must be the only claimants of these URLs.
  for (const shell of [
    "generated/explorer/index.html",
    "generated/print-room/index.html",
    "generated/reading-room/index.html",
    "generated/seed-of-the-day/index.html",
  ]) {
    assert.ok(!existsSync(resolve(REPO, shell)), `${shell} must not exist: its route renders through BaseLayout`);
  }
});

test("the press bundles from the src/site TypeScript entries (#260)", async () => {
  const { BUNDLE_ENTRIES } = await import("../../scripts/build-app-bundles.ts");
  assert.deepEqual(
    BUNDLE_ENTRIES.map(({ entry, twin }) => ({ entry, twin })),
    [
      { entry: "src/site/explorer/app.ts", twin: "explorer/app.bundle.js" },
      { entry: "src/site/print-room/app.ts", twin: "print-room/app.bundle.js" },
      { entry: "src/site/explorer/portfolio/app.ts", twin: "explorer/portfolio/app.bundle.js" },
      { entry: "src/site/seed-of-the-day/app.ts", twin: "seed-of-the-day/app.bundle.js" },
      { entry: "src/site/reading-room/app.ts", twin: "reading-room/app.bundle.js" },
      { entry: "src/site/prospect/app.ts", twin: "prospect/app.bundle.js" },
      { entry: "src/site/ribbon/app.ts", twin: "ribbon/app.bundle.js" },
      { entry: "src/site/specimen/app.ts", twin: "specimen/app.bundle.js" },
      { entry: "src/site/home/app.ts", twin: "app.bundle.js" },
    ],
    "entries are the TS sources; twins keep their served names untouched",
  );
});

test("nothing in the build-output folder or the retired public/ is tracked, and the ignore file names the folder whole and nothing beneath it (#260, Issue #768)", () => {
  // 2026-10-18: this git ls-files answers in under 10 ms on a Mac; thirty seconds is a cap on a hang, not a budget.
  const tracked = execFileSync("git", ["ls-files", "--", "generated", "public"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 30_000,
  })
    .split("\n")
    .filter(Boolean);
  assert.deepEqual(
    tracked,
    [],
    "a tracked file under generated/ is deleted by every build, and one under public/ is served by nothing",
  );
  const lines = read(".gitignore").split("\n");
  assert.ok(lines.includes("/generated/"), ".gitignore should carry the exact line /generated/");
  assert.deepEqual(
    lines.filter((line) => /^\/?(public|generated)\/./.test(line)),
    [],
    "a line naming a path beneath the build-output folder, or under the retired public/, is a one-by-one entry the whole-folder line replaced",
  );
});

test("the tsc engine emit retired: no browser tsconfig, astro:generate is clean-bundle-showcases (#260)", () => {
  assert.ok(!existsSync(resolve(REPO, "tsconfig.browser.json")), "tsconfig.browser.json retires with the emit");
  const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
  assert.equal(
    pkg.scripts["astro:generate"],
    "node scripts/clean-generated.ts && node scripts/kit-fonts.ts && node scripts/place-files.ts && node scripts/build-app-bundles.ts && node scripts/generate-showcases.ts && node scripts/generate-discovery.ts",
    "no tsc step: Vite compiles the engine graph from src/ directly",
  );
});

test("one bundler: vite is the devDep, esbuild is gone (#208)", () => {
  const pkg = JSON.parse(read("package.json")) as {
    devDependencies: Record<string, string>;
    dependencies: Record<string, string>;
  };
  assert.ok(pkg.devDependencies.vite, "vite must be an explicit devDependency (the press imports it)");
  assert.equal(pkg.devDependencies.esbuild, undefined, "esbuild retires with the fold");
  assert.equal(pkg.dependencies.esbuild, undefined, "esbuild must not hide in dependencies either");
});

// Characterization of the press on a hermetic fixture, one knob per check.

async function withFixture<T>(run: (dir: string) => T | Promise<T>): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), "vellum-bundle-"));
  try {
    // The entry pulls a relative module, awaits at top level, and carries a non-ASCII glyph: each exercises one press knob.
    mkdirSync(join(dir, "lib"));
    writeFileSync(join(dir, "lib", "greet.js"), `export const greet = (n) => "salut " + n;\n`);
    writeFileSync(
      join(dir, "entry.js"),
      `import { greet } from "./lib/greet.js";\n` +
        `export const ready = await Promise.resolve(true);\n` +
        `export const line = greet("Laukuwelua café");\n`,
    );
    // await inside the try so cleanup runs only after the bundle has read the dir
    return await run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const bundleToString = async (absEntry: string): Promise<string> =>
  (await import("../../scripts/build-app-bundles.ts")).bundleToString(absEntry);

test("the press inlines relative imports into a self-contained bundle (#208)", async () => {
  const out = await withFixture((dir) => bundleToString(resolve(dir, "entry.js")));
  assert.doesNotMatch(out, /\bimport\b[^\n]*\bfrom\b/);
  assert.doesNotMatch(out, /\bimport\s*\(/);
  assert.match(out, /salut /);
});

test("the press preserves top-level await (format es) and non-ASCII glyphs (#208)", async () => {
  const out = await withFixture((dir) => bundleToString(resolve(dir, "entry.js")));
  // Top-level await only survives an ESM-format bundle (iife/cjs would have thrown at build time), so its presence proves format stayed es.
  assert.match(out, /await Promise\.resolve/);
  assert.match(out, /café/);
  assert.doesNotMatch(out, /caf\\u00e9/);
});

test("the press is byte-reproducible for identical input (#208)", async () => {
  const [a, b] = await withFixture(async (dir) => {
    const entry = resolve(dir, "entry.js");
    return [await bundleToString(entry), await bundleToString(entry)];
  });
  assert.equal(a, b, "two bundles of the same source must be byte-identical");
});

type Edge = "static" | "late" | "spawn";
type Edges = ReadonlyArray<{ readonly kind: Edge; readonly to: string }>;
const STATIC: ReadonlySet<Edge> = new Set(["static"]);
const ON_DEMAND: ReadonlySet<Edge> = new Set(["static", "late"]);
const longestOutline = (face: FaceTable): string =>
  Object.values(face.glyphs)
    .map((g) => g[5])
    .reduce((a, b) => (b.length > a.length ? b : a));
const OUTLINES: ReadonlyArray<readonly [string, string]> = [
  ["roman", longestOutline(ROMAN)],
  ["caps", longestOutline(CAPS)],
  ["italic", longestOutline(ITALIC)],
  ["numero", NUMERO[5]],
];
const PLATE_MODULE =
  /^\/\/#region (src\/prospect\/\S+|src\/atlas\/compose\.ts|src\/site\/explorer\/prospect-job\.ts)$/gm;
const SHARED_WITH_PAGES: ReadonlySet<string> = new Set([
  "src/prospect/dress/context.ts",
  "src/prospect/dress/glyphs.ts",
]);
const JOB_ENTRIES = ["src/site/explorer/prospect-job.ts", "src/atlas/compose.ts", "src/prospect/finished.ts"] as const;

type Pressed = {
  readonly root: string;
  readonly twins: readonly string[];
  readonly text: (file: string) => string;
  readonly edges: (file: string) => Edges;
};
let pressed: Promise<Pressed> | null = null;
after(async () => {
  if (pressed) rmSync((await pressed).root, { recursive: true, force: true });
});

const readEdges = (root: string, file: string, text: string): Edges => {
  const out: Array<{ kind: Edge; to: string }> = [];
  const target = (spec: string): string => {
    assert.match(spec, /^(\.{1,2})?\//, `${relative(root, file)} names ${spec}, which no walk here can follow`);
    return spec.startsWith("/") ? join(root, spec) : resolve(dirname(file), spec);
  };
  const visit = (node: ts.Node): void => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    )
      out.push({ kind: "static", to: target(node.moduleSpecifier.text) });
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const spec = node.arguments[0];
      assert.ok(
        spec && ts.isStringLiteralLike(spec),
        `${relative(root, file)} imports a computed address, which no walk here can follow`,
      );
      out.push({ kind: "late", to: target(spec.text) });
    }
    if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "Worker") {
      const url = node.arguments?.[0];
      const spec = url && ts.isNewExpression(url) ? url.arguments?.[0] : undefined;
      assert.ok(
        spec && ts.isStringLiteralLike(spec),
        `${relative(root, file)} spawns a worker this walk cannot locate`,
      );
      out.push({ kind: "spawn", to: target(spec.text) });
    }
    ts.forEachChild(node, visit);
  };
  visit(ts.createSourceFile(file, text, ts.ScriptTarget.Latest, false, ts.ScriptKind.JS));
  return out;
};

const press = (): Promise<Pressed> =>
  (pressed ??= (async () => {
    const { bundleAppSurfaces, BUNDLE_ENTRIES } = await import("../../scripts/build-app-bundles.ts");
    const root = mkdtempSync(join(tmpdir(), "vellum-press-801-"));
    await bundleAppSurfaces(root);
    const texts = new Map<string, string>();
    const text = (file: string): string => {
      const known = texts.get(file);
      if (known !== undefined) return known;
      assert.ok(existsSync(file), `${relative(root, file)} is imported but was never emitted`);
      const read = readFileSync(file, "utf8");
      texts.set(file, read);
      return read;
    };
    const memo = new Map<string, Edges>();
    const edges = (file: string): Edges => {
      const known = memo.get(file);
      if (known !== undefined) return known;
      const found = readEdges(root, file, text(file));
      memo.set(file, found);
      return found;
    };
    return { root, twins: BUNDLE_ENTRIES.map(({ twin }) => join(root, twin)), text, edges };
  })());

const reach = (p: Pressed, starts: Iterable<string>, kinds: ReadonlySet<Edge>): Set<string> => {
  const seen = new Set<string>();
  const stack = [...starts];
  for (let f = stack.pop(); f !== undefined; f = stack.pop()) {
    if (seen.has(f)) continue;
    seen.add(f);
    for (const e of p.edges(f)) if (kinds.has(e.kind)) stack.push(e.to);
  }
  return seen;
};
const spawned = (p: Pressed, files: Iterable<string>): string[] =>
  [...files].flatMap((f) =>
    p
      .edges(f)
      .filter((e) => e.kind === "spawn")
      .map((e) => e.to),
  );

function checkWorkerReachesPlate(
  p: Pressed,
  workers: ReadonlySet<string>,
  rel: (f: string) => string,
  carrying: (files: Iterable<string>) => string[],
  plateModules: (files: Iterable<string>) => Set<string>,
): void {
  const worker = reach(p, workers, ON_DEMAND);
  for (const [face, outline] of OUTLINES)
    assert.ok(
      [...worker].some((f) => p.text(f).includes(outline)),
      `the worker cannot reach the ${face} outlines even on demand`,
    );
  for (const entry of JOB_ENTRIES)
    assert.ok(
      plateModules(worker).has(entry),
      `the worker cannot reach ${entry} even on demand, or the press no longer marks its modules`,
    );
  for (const f of carrying([...reach(p, p.twins, ON_DEMAND), ...worker]))
    assert.match(
      p.text(f),
      /SIL Open Font License/,
      `${rel(f)} carries the plate face's outlines without its OFL notice`,
    );
}

test("no page downloads the plate's code before it draws a plate, and the page and the worker each reach it on demand, its licence beside it (Issue #801)", async () => {
  const p = await press();
  const rel = (f: string): string => relative(p.root, f);
  const carrying = (files: Iterable<string>): string[] =>
    [...files].filter((f) => OUTLINES.some(([, outline]) => p.text(f).includes(outline)));
  const plateModules = (files: Iterable<string>): Set<string> =>
    new Set([...files].flatMap((f) => [...p.text(f).matchAll(PLATE_MODULE)].map((m) => m[1]!)));
  const workers = new Set(p.twins.flatMap((twin) => spawned(p, reach(p, [twin], STATIC))));
  assert.ok(workers.size > 0, "no page spawns the worker, so the worker's half of this guard reads nothing");
  for (const twin of p.twins) {
    const page = reach(p, [twin], STATIC);
    const atLoad = new Set([...page, ...reach(p, spawned(p, page), STATIC)]);
    assert.deepEqual(
      carrying(atLoad).map(rel),
      [],
      `${rel(twin)} downloads the plate's glyph outlines when it opens, before any plate is drawn`,
    );
    assert.deepEqual(
      [...plateModules(atLoad)].filter((m) => !SHARED_WITH_PAGES.has(m)).sort(),
      [],
      `${rel(twin)} downloads the plate's drawing code when it opens, before any plate is drawn`,
    );
    if (spawned(p, page).length === 0) continue;
    const onDemand = reach(p, [twin], ON_DEMAND);
    for (const [face, outline] of OUTLINES)
      assert.ok(
        [...onDemand].some((f) => p.text(f).includes(outline)),
        `${rel(twin)} cannot reach the ${face} outlines even on demand, so its backup copy cannot letter a plate`,
      );
    for (const entry of JOB_ENTRIES)
      assert.ok(
        plateModules(onDemand).has(entry),
        `${rel(twin)} cannot reach ${entry} even on demand, or the press no longer marks its modules, so the drawing-code check above reads nothing`,
      );
  }
  checkWorkerReachesPlate(p, workers, rel, carrying, plateModules);
});

test("the worker's build and the pages' build share no file, so neither overwrites a file of the other's (Issue #801)", async () => {
  const p = await press();
  const pages = reach(p, p.twins, ON_DEMAND);
  const workers = spawned(p, pages);
  assert.ok(workers.length > 0, "no page spawns the worker, so there is no second build to keep apart");
  const worker = reach(p, workers, ON_DEMAND);
  assert.ok(
    worker.size > 1,
    "the worker reaches no file beyond its own bundle, so nothing here could collide and this guard reads nothing",
  );
  assert.deepEqual(
    [...pages].filter((f) => worker.has(f)).map((f) => relative(p.root, f)),
    [],
    "a file is reached from both builds: the press lets one build's file overwrite the other's of the same name, so one side now runs the other's code",
  );
});

test("the press lands only what it built: every file in the root it builds into is a twin or a chunk (#208, Issue #768)", async () => {
  const p = await press();
  assert.deepEqual(
    p.twins.filter((twin) => !existsSync(twin)).map((twin) => relative(p.root, twin)),
    [],
    "the press landed no twin, so an empty root would pass the sweep below",
  );
  const twins = new Set(p.twins.map((twin) => relative(p.root, twin).split(sep).join("/")));
  const landed = readdirSync(p.root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(p.root, join(entry.parentPath, entry.name)).split(sep).join("/"));
  assert.deepEqual(
    landed.filter((f) => !twins.has(f) && f !== "explorer/worker.bundle.js" && !f.startsWith("explorer/chunks/")),
    [],
    "the press copied a folder into the root it builds into, over the files a build would serve",
  );
});
