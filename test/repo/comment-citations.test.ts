import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { lintTsRoots } from "../../test-support/lint-roots.ts";

// Comments in this project get read and trusted, so a citation which no longer resolves is worse than none; the check is mechanical because the drift that motivated it was.
// These guards do NOT check the CLAIM wrapped around a citation: green means the citations resolve, never that the prose is current.

const REPO = resolve(import.meta.dirname, "..", "..");
const CODE_ROOTS = ["src", "test", "test-support", "scripts", "e2e"];
const SKIP_DIRS = new Set(["node_modules", "dist", "out", ".git", ".claude"]);

// The ratified citation form (#296, 2026-07-26): backtick-symbol in repo/relative/path, line numbers deliberately absent. The backticks are load-bearing: a bare "foo in src/x.ts" is not checked and not honored.
const CITATION =
  /`([A-Za-z_]\w*)`\s+in\s+`?((?:src|test|scripts|e2e|test-support|public)\/[\w./-]+\.(?:ts|mjs|astro|css))`?/g;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

function scannedFiles(): string[] {
  const code = CODE_ROOTS.flatMap((r) => walk(resolve(REPO, r))).filter((f) => /\.(ts|mjs)$/.test(f));
  const css = walk(resolve(REPO, "public")).filter((f) => f.endsWith(".css"));
  return [...code, ...css];
}

/** Line-based rather than a real parser: a // inside a string literal reads as a comment here, which costs a false positive at worst and never a miss. */
function commentLines(file: string): ReadonlyArray<readonly [number, string]> {
  const out: Array<readonly [number, string]> = [];
  let inBlock = false;
  readFileSync(file, "utf8").split("\n").forEach((raw, i) => {
    const line = raw.trim();
    if (inBlock) {
      out.push([i + 1, line]);
      if (line.includes("*/")) inBlock = false;
      return;
    }
    if (line.startsWith("//")) {
      out.push([i + 1, line]);
      return;
    }
    if (line.startsWith("/*")) {
      out.push([i + 1, line]);
      if (!line.includes("*/")) inBlock = true;
    }
  });
  return out;
}

/** Contiguous comment lines joined into one run: a citation long enough to WRAP is invisible to a line-based matcher. */
function commentRuns(file: string): ReadonlyArray<readonly [number, string]> {
  const lines = commentLines(file);
  const runs: Array<readonly [number, string]> = [];
  let start = -1;
  let parts: string[] = [];
  const flush = (): void => {
    if (start > 0) runs.push([start, parts.join(" ")]);
    start = -1;
    parts = [];
  };
  for (const [n, text] of lines) {
    const body = text.replace(/^\/\*+|^\*+\/?|^\/\/+/, "").replace(/\*\/$/, "").trim();
    if (start > 0 && n !== start + parts.length) flush();
    if (start < 0) start = n;
    parts.push(body);
  }
  flush();
  return runs;
}

const rel = (file: string): string => file.slice(REPO.length + 1);

test("this guard reads every root the lint reads, and its citation form reads a path under each of them and under public/, so no citation there goes unchecked (Issue #679)", () => {
  const lintRoots = lintTsRoots();
  assert.ok(lintRoots.includes("src"), `read the lint's TypeScript roots as [${lintRoots.join(", ")}], so that reader has lost the config's shape`);
  assert.deepEqual(lintRoots.filter((r) => !CODE_ROOTS.includes(r)), [], "the lint reads a root this guard never walks, so a stale citation in a comment there stays green");
  for (const [root, ext] of [...CODE_ROOTS.map((r) => [r, "ts"] as const), ["public", "css"] as const]) {
    const read = [...`\`sym\` in \`${root}/x/y.${ext}\``.matchAll(CITATION)].map((m) => m[2]);
    assert.deepEqual(read, [`${root}/x/y.${ext}`], `a citation into ${root}/ is not read at all, so it is never checked`);
  }
});

test("every `symbol` in `path` citation resolves: the file exists and names the symbol", () => {
  const failures = scannedFiles().flatMap((file) =>
    commentRuns(file).flatMap(([n, text]) =>
      [...text.matchAll(CITATION)].flatMap(([, symbol, path]) => {
        const target = resolve(REPO, path!);
        if (!existsSync(target)) return [`${rel(file)}:${n} cites ${path}, which does not exist`];
        // APPEARS-in-file, not DECLARED-in-file: citations routinely point at a call site, and a declaration-only check fails a good citation, the exact trap this guard exists to avoid.
        const found = new RegExp(`\\b${symbol}\\b`).test(readFileSync(target, "utf8"));
        return found ? [] : [`${rel(file)}:${n} cites \`${symbol}\` in ${path}, which does not name it`];
      }),
    ),
  );
  assert.deepEqual(
    failures,
    [],
    `${failures.length} citation(s) no longer resolve. The form is \`symbol\` in \`repo/relative/path\`; ` +
      `fix the symbol or the path, and do not fall back to a line number.\n  ` + failures.join("\n  "),
  );
});
