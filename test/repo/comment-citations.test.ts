import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

// #296: comments in this project get read and trusted, so a citation which no longer resolves is worse than none. Both drift classes came from a MECHANICAL mass change (#260), which is why the fix is a mechanical check rather than a discipline.
// These guards do NOT check the CLAIM wrapped around a citation: green means the citations resolve, never that the prose is current.

const REPO = resolve(import.meta.dirname, "..", "..");
const CODE_ROOTS = ["src", "test", "test-support", "scripts"];
const SKIP_DIRS = new Set(["node_modules", "dist", "out", ".git", ".claude"]);

// The gitignored Vite twins are the only real .js artifacts the tree produces (scripts/build-app-bundles.ts BUNDLE_ENTRIES); any other .js name is a leftover, since no .js source has existed since #260.
const isBuildArtifact = (name: string): boolean => /(^|\.)bundle\.js$/.test(name);

// The ratified citation form (#296, 2026-07-26): backtick-symbol in repo/relative/path, line numbers deliberately absent. The backticks are load-bearing: a bare "foo in src/x.ts" is not checked and not honored.
const CITATION =
  /`([A-Za-z_]\w*)`\s+in\s+`?((?:src|test|scripts|test-support|public)\/[\w./-]+\.(?:ts|mjs|astro|css))`?/g;

const JS_NAME = /\b[A-Za-z][\w.-]*\.js\b/g;

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

/** Contiguous comment lines joined into one run: a citation long enough to WRAP is invisible to a line-based matcher, and three of this sweep's own citations wrapped, which is how the gap was found. */
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

test("no comment names a .js module: nothing but the build artifacts is .js since #260", () => {
  const offenders = scannedFiles().flatMap((file) =>
    commentLines(file).flatMap(([n, text]) =>
      [...new Set(text.match(JS_NAME) ?? [])]
        .filter((name) => !isBuildArtifact(name))
        .map((name) => `${rel(file)}:${n} names "${name}"  |  ${text.slice(0, 90)}`),
    ),
  );
  assert.deepEqual(
    offenders,
    [],
    `${offenders.length} comment mention(s) of a .js module that does not exist. Since #260 the ` +
      `browser code is TypeScript under src/site/; only the gitignored *.bundle.js twins are real. ` +
      `Rename to the .ts module (correct the TARGET too where the referent moved), or, if the file ` +
      `is genuinely gone, name its successor.\n  ` + offenders.join("\n  "),
  );
});

test("every `symbol` in `path` citation resolves: the file exists and names the symbol", () => {
  const failures = scannedFiles().flatMap((file) =>
    commentRuns(file).flatMap(([n, text]) =>
      [...text.matchAll(CITATION)].flatMap(([, symbol, path]) => {
        const target = resolve(REPO, path);
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
