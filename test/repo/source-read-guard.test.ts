import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import {
  callerFile,
  covers,
  isFiltered,
  isSource,
  verdict,
  watching,
  type Verdict,
} from "../../test-support/source-read-guard.ts";
import { SOURCE_READS, type ReadKind, type SourceRead } from "../../test-support/source-read-list.ts";
import { spawnSync } from "node:child_process";

const ROOT = resolve(import.meta.dirname, "..", "..");
const GUARD = join(ROOT, "test-support/source-read-guard.ts");

test("isSource names code under src, e2e and scripts, the pages and the authored sheets, and nothing generated, built or configured", () => {
  const source = [
    "src/site/explorer/app.ts",
    "src/pages/index.astro",
    "e2e/harness.ts",
    "scripts/lint/source-shape.ts",
    "public/house.css",
    "public/explorer/broadside.css",
  ];
  const other = [
    "public/gallery/index.css",
    "public/charts/chart-42-antique.svg",
    "public/og.png",
    "package.json",
    ".github/workflows/ci.yml",
    "eslint.config.ts",
    "test/site/room.test.ts",
    "test-support/element-shim.ts",
    "design/kit/fonts.css",
    "dist/index.html",
    "public/page.astro",
    "dist/index.astro",
  ];
  for (const rel of source) assert.equal(isSource(rel), true, `${rel} is source`);
  for (const rel of other) assert.equal(isSource(rel), false, `${rel} is not source`);
});

test("a folder entry covers every file at any depth under it and nothing beside it", () => {
  assert.equal(covers("e2e/**", "e2e/a.ts"), true);
  assert.equal(covers("e2e/**", "e2e/suites/b/c.ts"), true);
  assert.equal(covers("e2e/**", "e2ex/a.ts"), false);
  assert.equal(covers("src/site/**", "src/sitex/a.ts"), false);
  assert.equal(covers("public/house.css", "public/house.css"), true);
  assert.equal(covers("public/house.css", "public/house.css.map"), false);
});

const SELF = "/r/test-support/source-read-guard.ts";
const stack = (...frames: string[]): string => ["Error", ...frames.map((f) => `    at ${f}`)].join("\n");
const GUARD_FRAME = `wrap (file://${SELF}:9:3)`;
const TEST_FRAME = "file:///r/test/site/x.test.ts:5:2";

test("the caller is the frame that called the read, after the guard's own and any frame with no path; Node's own reads have none", () => {
  assert.equal(
    callerFile(stack(GUARD_FRAME, "read (file:///r/test/site/x.test.ts:3:9)"), SELF),
    "/r/test/site/x.test.ts",
    "a test frame after the guard's own",
  );
  assert.equal(
    callerFile(stack(GUARD_FRAME, "Array.map (<anonymous>)", TEST_FRAME), SELF),
    "/r/test/site/x.test.ts",
    "a frame with no path is passed over",
  );
  assert.equal(
    callerFile(
      stack(
        GUARD_FRAME,
        "readFileSync (node:internal/modules/helpers:1:1)",
        "#loadSync (node:internal/modules/esm/translators:2:2)",
        `x (${TEST_FRAME})`,
      ),
      SELF,
    ),
    null,
    "Node's own read, with a test's import further down",
  );
  assert.equal(
    callerFile(stack(GUARD_FRAME, "x (/r/node_modules/eslint/lib/x.js:1:1)"), SELF),
    "/r/node_modules/eslint/lib/x.js",
    "a library's frame is returned as it stands",
  );
  assert.equal(callerFile(stack(GUARD_FRAME, GUARD_FRAME), SELF), null, "the guard's frames only");
});

test("a run filtered by name, by a skip pattern or to only-tests reads no entry as stale; a sharded run does", () => {
  for (const filtered of [["--test-name-pattern=x"], ["--test-skip-pattern=y"], ["--test-only"]])
    assert.equal(isFiltered(filtered), true, `${filtered.join(" ")} filters a run`);
  for (const whole of [["--test-shard=1/4"], []])
    assert.equal(isFiltered(whole), false, `${whole.join(" ") || "no flag"} runs every test of the file`);
});

const ENTRIES: readonly SourceRead[] = [
  { reads: "src/a.ts", kind: "data" },
  { reads: "e2e/**", kind: "witness" },
  { reads: "public/x.css", kind: "kept" },
];

test("the verdict names every unlisted read, and in a whole run every entry no read used", () => {
  const reads = new Set(["src/a.ts", "e2e/s/t.ts", "src/b.ts"]);
  const whole: Verdict = verdict(reads, ENTRIES, false);
  assert.deepEqual(whole.unlisted, ["src/b.ts"], "the read no entry covers");
  assert.deepEqual(whole.unused, [ENTRIES[2]], "the entry no read is covered by");
  assert.deepEqual(verdict(reads, ENTRIES, true).unused, [], "a filtered run cannot call an entry stale");
});

// A cap on a hang, never a budget (2026-10-13: a planted run took about 0.1 s on a Mac).
const CHILD_TIMEOUT_MS = 60_000;

interface Plant {
  readonly body: string;
  readonly list?: readonly SourceRead[];
  readonly nodeFlags?: readonly string[];
  readonly testFlags?: readonly string[];
}
interface Ran {
  readonly status: number | null;
  readonly out: string;
}

const FILES: Readonly<Record<string, string>> = {
  "package.json": '{"type":"module"}',
  "src/a.ts": "export const a = 1;\n",
  "src/reader.ts":
    'import { readFileSync } from "node:fs";\nexport const text = (): string => readFileSync(new URL("./a.ts", import.meta.url), "utf8");\n',
  "public/house.css": "a {}\n",
  "test-support/reader.ts":
    'import { readFileSync } from "node:fs";\nexport const readVia = (p: string): string => readFileSync(p, "utf8");\n',
};
const HEAD = 'import { test } from "node:test";\n';

const plantRun = (plant: Plant): Ran => {
  const dir = mkdtempSync(join(tmpdir(), "source-read-guard-"));
  try {
    const files: Record<string, string> = {
      ...FILES,
      "test-support/source-read-list.ts": `export const SOURCE_READS = ${JSON.stringify({ "test/plant.test.ts": plant.list ?? [] })};\n`,
      "test/plant.test.ts": HEAD + plant.body,
    };
    for (const [rel, text] of Object.entries(files)) {
      mkdirSync(dirname(join(dir, rel)), { recursive: true });
      writeFileSync(join(dir, rel), text);
    }
    const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => k !== "NODE_TEST_CONTEXT"));
    const ran = spawnSync(
      process.execPath,
      [
        ...(plant.nodeFlags ?? []),
        "--import",
        GUARD,
        "--test",
        "--test-reporter=tap",
        ...(plant.testFlags ?? []),
        "test/plant.test.ts",
      ],
      { cwd: dir, env: { ...env, VELLUM_SOURCE_READ_ROOT: dir }, encoding: "utf8", timeout: CHILD_TIMEOUT_MS },
    );
    return { status: ran.status, out: `${ran.stdout}${ran.stderr}` };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

const BLIND_SPOTS =
  "BLIND SPOTS, declared, each erring toward a pass: a new source-text test in a listed file that reads a path its entries already cover (per file, not per test); a read a library or a repo module under src, scripts or e2e makes for the test, and a read by a child process; fs.openSync, fs.createReadStream and a descriptor, and a read reached through a Node built-in (promisify(fs.readFile), a timer handed readFileSync, a FileHandle, a copy of the file); a run outside npm test or under --test-isolation=none; and two entries on one path, which cannot be told apart";

const verdictOf = (ran: Ran, status: 0 | 1, message: string): void => {
  assert.equal(ran.status, status, `${message}\n${ran.out}`);
  assert.match(ran.out, /# pass 1\b/, `the plant's own test ran and passed\n${ran.out}`);
  assert.match(ran.out, status === 1 ? /# fail 1\b/ : /# fail 0\b/, `${message}\n${ran.out}`);
  assert.doesNotMatch(ran.out, /run\(\) is being called recursively/, "the child ran as a nested runner");
};

const READS_A = 'import { readFileSync } from "node:fs";\n';
const DATA_A: readonly SourceRead[] = [{ reads: "src/a.ts", kind: "data" }];

test("(a) a test that reads a source file no entry names fails its file, naming the read", () => {
  const ran = plantRun({ body: READS_A + 'test("plant", () => { readFileSync("src/a.ts", "utf8"); });\n' });
  verdictOf(ran, 1, `an unlisted read passed. ${BLIND_SPOTS}`);
  assert.match(ran.out, /test\/plant\.test\.ts reads src\/a\.ts/, "the verdict names the file and the read");
});

test("(b) the same read, listed, passes", () => {
  const body = READS_A + 'test("plant", () => { readFileSync("src/a.ts", "utf8"); });\n';
  verdictOf(plantRun({ body, list: DATA_A }), 0, "a listed read failed");
});

test("(c) a read the test swallows in an empty catch still fails its file", () => {
  const body = READS_A + 'test("plant", () => { try { readFileSync("src/a.ts", "utf8"); } catch {} });\n';
  verdictOf(plantRun({ body }), 1, "a swallowed read passed");
});

test("(d) an entry the file no longer reads fails a whole run and not a filtered one", () => {
  const body = 'test("plant", () => {});\n';
  const list: readonly SourceRead[] = [{ reads: "public/house.css", kind: "data" }];
  const whole = plantRun({ body, list });
  verdictOf(whole, 1, "a stale entry passed a whole run");
  assert.match(whole.out, /no longer reads public\/house\.css \(data\)/, "the verdict names the entry");
  verdictOf(
    plantRun({ body, list, testFlags: ["--test-name-pattern=plant"] }),
    0,
    "a filtered run failed on a stale entry",
  );
});

test("(e) a read through a helper in test-support is the test's own", () => {
  const body = 'import { readVia } from "../test-support/reader.ts";\ntest("plant", () => { readVia("src/a.ts"); });\n';
  verdictOf(plantRun({ body }), 1, "a read through a test-support helper passed");
});

test("(f) a read a repo module under src makes is not the test's", () => {
  const body = 'import { text } from "../src/reader.ts";\ntest("plant", () => { text(); });\n';
  verdictOf(plantRun({ body }), 0, "a read made by src code was counted against the test");
});

test("(g) a read of a file that is not source is not counted", () => {
  const body = READS_A + 'test("plant", () => { readFileSync("package.json", "utf8"); });\n';
  verdictOf(plantRun({ body }), 0, "a read of package.json failed");
});

test("(h) a promises read counts as a read", () => {
  const body =
    'import { readFile } from "node:fs/promises";\ntest("plant", async () => { await readFile("public/house.css", "utf8"); });\n';
  verdictOf(plantRun({ body }), 1, "an unlisted promises read passed");
});

test("(i) a module load, static or dynamic, is Node's read and not the test's, however deep the stack is kept", () => {
  const body =
    'import { a } from "../src/a.ts";\ntest("plant", async () => { await import("../src/a.ts"); void a; });\n';
  verdictOf(plantRun({ body, nodeFlags: ["--stack-trace-limit=100"] }), 0, "a module load was counted as a read");
});

const KINDS: readonly ReadKind[] = ["data", "witness", "kept"];

test("the list names only test files that exist, source it can read, and kinds the spec names", () => {
  assert.ok(Object.keys(SOURCE_READS).length > 0, "the list is empty, so every claim below holds of nothing");
  for (const [file, entries] of Object.entries(SOURCE_READS)) {
    assert.ok(file.startsWith("test/") && file.endsWith(".test.ts"), `${file} is not a test file`);
    assert.ok(existsSync(join(ROOT, file)), `${file} does not exist`);
    for (const { reads, kind } of entries) {
      assert.ok(KINDS.includes(kind), `${file}: ${kind} is not a kind`);
      if (reads.endsWith("/**")) {
        const dir = join(ROOT, reads.slice(0, -3));
        assert.ok(existsSync(dir) && statSync(dir).isDirectory(), `${file}: ${reads} names no folder`);
      } else {
        assert.ok(existsSync(join(ROOT, reads)), `${file}: ${reads} does not exist`);
        assert.ok(isSource(reads), `${file}: ${reads} is not source the guard reads`);
      }
    }
  }
});

const KEPT_AT_CLOSE: ReadonlyArray<readonly [string, string]> = [
  ["test/site/chart-drawer.test.ts", "src/site/explorer/app.ts"],
  ["test/site/desk-notice.test.ts", "public/shell.css"],
  ["test/site/home-cluster.test.ts", "public/index.css"],
  ["test/site/house-style.test.ts", "public/house.css"],
  ["test/site/landfall-doors.test.ts", "public/index.css"],
  ["test/site/landfall-doors.test.ts", "src/pages/index.astro"],
  ["test/site/print-room-room.test.ts", "src/site/print-room/bound-atlas.ts"],
  ["test/site/reading-room-room.test.ts", "src/site/reading-room/app.ts"],
  ["test/site/region-detail-wiring.test.ts", "src/site/explorer/worker.ts"],
  ["test/site/sheet-height.test.ts", "e2e/**"],
  ["test/site/sheet-height.test.ts", "src/site/home/camera.ts"],
  ["test/site/shell-css-ground.test.ts", "public/shell.css"],
  ["test/site/shell-css.test.ts", "public/shell.css"],
];

test("the kept reads only shrink: the change that moves one to a lint rule or a browser check removes it here and from the list", () => {
  const kept = Object.entries(SOURCE_READS)
    .flatMap(([file, entries]) => entries.filter((e) => e.kind === "kept").map((e) => [file, e.reads] as const))
    .sort((x, y) => (x.join() < y.join() ? -1 : 1));
  assert.deepEqual(kept, KEPT_AT_CLOSE, "the kept reads are not the thirteen the close of Issue #779 left");
});

test("the guard watches a test file of this repo", () => {
  assert.equal(watching, true, "the guard installed nothing in this process, so npm test checks no read at all");
});
