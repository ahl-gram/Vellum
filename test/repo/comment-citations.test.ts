import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

// #296: this project deliberately keeps invariants in a comment at the line that
// breaks, so comments here get read and trusted. That makes a citation which no
// longer resolves worse than no citation at all: it sends a grep confidently to
// the wrong place. #260 renamed the browser code .js -> .ts and left 69 comment
// mentions of the old names behind, and two file:line citations drifted onto
// unrelated code (`map-renderer.ts:87-88` named the alt-text builder). Both
// classes came from a MECHANICAL mass change, not from ordinary editing, which
// is why the fix is a mechanical check rather than a discipline.
//
// What these guards do NOT check is the CLAIM wrapped around a citation. A
// comment saying "#181's ratified behavior" stays right only until #181 is
// superseded, and no test will ever catch that. Green here means the citations
// resolve, never that the prose is current.

const REPO = resolve(import.meta.dirname, "..", "..");
const CODE_ROOTS = ["src", "test", "test-support", "scripts"];
const SKIP_DIRS = new Set(["node_modules", "dist", "out", ".git", ".claude"]);

// The gitignored Vite twins are the only real .js artifacts the tree produces
// (scripts/build-app-bundles.ts BUNDLE_ENTRIES), so naming them is legitimate.
// Any other .js name is a leftover: no .js source has existed since #260.
const isBuildArtifact = (name: string): boolean => /(^|\.)bundle\.js$/.test(name);

// The ratified citation form (#296, 2026-07-26): `symbol` in `repo/relative/path`.
// Line numbers are deliberately absent. Code movement cannot drift this, and it
// breaks only on a rename or a deletion, which is exactly when it should. The
// backticks are load-bearing: they are what separates a citation from the
// English word "in", so a bare `foo in src/x.ts` is not checked and not honored.
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

/** Every file whose comments this guard reads: source, tests, scripts, and the served CSS. */
function scannedFiles(): string[] {
  const code = CODE_ROOTS.flatMap((r) => walk(resolve(REPO, r))).filter((f) => /\.(ts|mjs)$/.test(f));
  const css = walk(resolve(REPO, "public")).filter((f) => f.endsWith(".css"));
  return [...code, ...css];
}

/**
 * Comment lines as [lineNumber, text]. Line-based rather than a real parser: a
 * `//` inside a string literal reads as a comment here, which costs a false
 * positive at worst and never a miss. CSS carries only block comments, and the
 * block branch below already handles those.
 */
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

/**
 * Contiguous comment lines joined into one string, with the leading markers
 * stripped, reported against the line the run starts on. Citations MUST be
 * matched against this rather than against single lines: a citation long enough
 * to wrap ("`createProjection` in\n * `src/render/map-renderer.ts`") is invisible
 * to a line-based matcher, so the guard would skip exactly the longest and most
 * load-bearing ones and still report green. Three of this sweep's own citations
 * wrap, which is how the gap was found.
 */
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
        // APPEARS-in-file, not DECLARED-in-file: citations routinely point at a
        // call site, and `createProjection` is imported into map-renderer.ts
        // rather than declared there. A declaration-only check fails a good
        // citation, which is the exact trap this guard exists to avoid.
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
