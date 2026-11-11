import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { COMPARISON_RULE } from "../../scripts/still-judge/compare.ts";
import { pngHeader } from "../../test-support/still-judge-fixtures.ts";

const MAIN = resolve(import.meta.dirname, "..", "..", "scripts", "still-judge", "main.ts");
// 2026-11-11, Issue #1309: ten runs over header-only PNGs took under 0.2 s each on the Mac (the three tests in 1.0 s together); a minute holds three hundred times the slowest.
const RUN_MS = 60_000;

const NO_KEY = "TYPESAFE_API_KEY is not set and ~/.config/typesafe/key holds no key";
const TOO_BIG = "1680 by 2478 pixels: each side must be 280 to 1568";

const judge = (
  args: readonly string[],
  inside: (dir: string) => void = () => {},
): { status: number | null; stdout: string; stderr: string } => {
  const dir = mkdtempSync(join(tmpdir(), "still-judge-"));
  const home = mkdtempSync(join(tmpdir(), "still-judge-home-"));
  try {
    writeFileSync(join(dir, "a.png"), pngHeader(1500, 1158));
    writeFileSync(join(dir, "big.png"), pngHeader(1680, 2478));
    const env = Object.fromEntries(Object.entries(process.env).filter(([name]) => name !== "TYPESAFE_API_KEY"));
    const r = spawnSync(process.execPath, [MAIN, ...args], {
      cwd: dir,
      env: { ...env, HOME: home },
      encoding: "utf8",
      timeout: RUN_MS,
    });
    inside(dir);
    return { status: r.status, stdout: r.stdout, stderr: r.stderr };
  } finally {
    rmSync(dir, { recursive: true, force: true });
    rmSync(home, { recursive: true, force: true });
  }
};

test("a comparison asked with no key exits 1 and says why, and the same comparison in a dry run exits 0", () => {
  const run = judge(["compare", "sheet", "a.png", "a.png"]);
  assert.equal(run.status, 1, run.stderr);
  assert.ok(run.stdout.includes(`a.png: not compared: skipped: ${NO_KEY}`), run.stdout);
  assert.ok(run.stdout.includes(COMPARISON_RULE), run.stdout);
  const dry = judge(["compare", "sheet", "a.png", "a.png", "--dry-run"]);
  assert.equal(dry.status, 0, dry.stderr);
  assert.ok(dry.stdout.includes("a.png: not compared: skipped: dry run: nothing was sent"), dry.stdout);
});

test("a picture outside the limits is refused unsent, and the run exits 1", () => {
  const run = judge(["compare", "crop", "a.png", "big.png"]);
  assert.equal(run.status, 1, run.stderr);
  assert.ok(run.stdout.includes(`big.png: not compared: refused unsent: ${TOO_BIG}`), run.stdout);
  const alone = judge(["compare", "crop", "big.png", "big.png"]);
  assert.equal(alone.status, 1, alone.stderr);
  assert.ok(alone.stdout.includes("2 pictures, 0 answered, 2 refused unsent, 0 skipped"), alone.stdout);
});

test("a comparison given --out writes each request it built with its image named by path and hash, and each reply", () => {
  const run = judge(["compare", "sheet", "a.png", "a.png", "--dry-run", "--out", "kept"], (dir) => {
    const header = pngHeader(1500, 1158);
    const asset = {
      path: "a.png",
      sha256: createHash("sha256").update(header).digest("hex"),
      bytes: 33,
      width: 1500,
      height: 1158,
    };
    const requests = readFileSync(join(dir, "kept", "requests.jsonl"), "utf8")
      .trim()
      .split("\n");
    assert.equal(requests.length, 2);
    for (const [n, line] of requests.entries()) {
      const row = JSON.parse(line) as { n: number; path: string; request: { assets: unknown; questions: object } };
      assert.equal(row.n, n);
      assert.equal(row.path, "a.png");
      assert.deepEqual(row.request.assets, { [`still-${asset.sha256.slice(0, 16)}`]: asset });
      assert.deepEqual(Object.keys(row.request.questions), ["realm_names_read", "title_reads_first"]);
    }
    const replies = readFileSync(join(dir, "kept", "replies.jsonl"), "utf8")
      .trim()
      .split("\n");
    assert.deepEqual(
      replies.map((line) => JSON.parse(line) as unknown),
      [0, 1].map((n) => ({ n, path: "a.png", reply: { ok: false, reason: "dry run: nothing was sent" } })),
    );
  });
  assert.equal(run.status, 0, run.stderr);
});

test("a command the usage does not name exits 2 and prints the usage", () => {
  for (const args of [
    ["bogus"],
    ["compare"],
    ["compare", "sheet", "a.png"],
    ["compare", "page", "a.png", "a.png"],
    ["ask", "sheet", "a.png"],
    ["trial"],
    ["trial", "x", "--out", "o"],
    ["bogus", "sheet", "a.png", "a.png"],
    ["bogus", "--out", "o"],
  ]) {
    const run = judge(args);
    assert.equal(run.status, 2, `${args.join(" ")}: ${run.stderr}`);
    assert.ok(
      run.stderr.startsWith("usage: npm run still-judge -- compare <sheet|rainfall|crop> <today.png> <other.png>..."),
      run.stderr,
    );
  }
});
