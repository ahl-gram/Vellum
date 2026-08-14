import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

// #384: #378 ratified "comments are the exception" as prose in CLAUDE.md and prose lost twice, so the SHAPE half is mechanical here. A mid-file comment runs to at most TWO lines, because restating a tested behavior takes room while an untestable gotcha usually fits in one or two. ONE line was measured first and rejected: it needs 285 blocks grandfathered against this repo, which is the codebase rather than a debt list, and a guard that reds on ordinary compliant code gets worked around.
// What this CANNOT see, all of it vellum-pr-skeptic's half: whether a one or two line comment restates a test, a paragraph written as blank-separated one-liners (a blank splits a run here, because joining across blanks flags two genuinely separate compliant one-liners just as readily), and .yml, .css, .md, .js or anything outside CODE_ROOTS, including astro.config.ts at the repo root.

const REPO = resolve(import.meta.dirname, "..", "..");
const CODE_ROOTS = ["src", "test", "test-support", "scripts"];
const SKIP_DIRS = new Set(["node_modules", "dist", "out", ".git", ".claude"]);
const SOURCE = /\.(ts|mjs|astro)$/;

// Each grandfathered block is named by its OPENING TEXT, never by a line number (which drifts) and never by a per-file ceiling (which would let a brand new block of the same size ride the old one's allowance forever, the #384 skeptic's finding 6). A block whose wording changes reds, which is the right moment to ask whether it still earns the room.
const MAX_MIDFILE_RUN = 2;

const LEGACY_BLOCKS: Readonly<Record<string, readonly string[]>> = {
  "src/atlas/document.ts": [
    "Exactly the shape `serializableAtlas` in `src/site/explorer/serializable-atlas.ts` produce",
    "The shared inner atlas CSS, scoped under `.atlas-sheet` so any host can inject it without ",
    "The self-contained download's plates, linked at load (#368, ratified 2026-08-13). A plain ",
    "`plateSrc` decides how a plate is embedded: a filename (CLI, with anchor:true) or a data U",
  ],
  "src/cli/e2e-suites.ts": [
    "Coverage floor of a smoke-green PR (#266), measured at 125 of 331 checks: every bundled pa",
  ],
  "src/layouts/BaseLayout.astro": [
    "The one shared shell (#203, ratified in the Sub 1 decision doc comment on #202): head meta",
    "#329: prefetch the sibling shells so a first click commits instantly even while this page'",
    "#288: the room is the page's h1, so the heading outline a screen reader walks names the ro",
  ],
  "src/site/explorer/draw-ceremony.ts": [
    "#170: the redraft's shorter ceremony: the same ink-draw on the incoming inset's coastline ",
  ],
  "src/site/explorer/survey-arm.ts": [
    "One rAF to reach the frame the click produced, then a task, which runs AFTER that frame is",
  ],
  "src/site/explorer/verso.ts": [
    "#174: the ghost is a snapshot of the chart as the WORKER drew it, so the client voyage tra",
  ],
  "src/site/living-chart/chronicle.ts": [
    "Paint one year onto the chart: each settlement glyph's visibility and the roads. #155 the ",
  ],
  "src/site/living-chart/place-overlay.ts": [
    "After each draw: lay invisible focusable hit-targets over the baked glyphs (the chart expo",
  ],
  "src/site/living-chart/voyage-log-panel.ts": [
    "Build the log and render the margin panel: every port a row up front (dimmed), the signatu",
  ],
  "src/site/living-chart/voyage-session.ts": [
    "INVARIANT (#364): on every path that APPENDS, the mount is left holding exactly ONE overla",
  ],
  "src/site/seed-of-the-day/app.ts": [
    "#167: the SAME shared zoom controller as the Explorer, bound to the STABLE #map-viewport (",
  ],
  "test/atlas/document.test.ts": [
    "A minimal, deterministic stand-in for a composed atlas: one plate per section plus the thr",
    "The plate lift under the hand, scoped to plates that GO SOMEWHERE (#368 ruling): the gestu",
    "Exactly the browser surface PLATE_LINK_SCRIPT touches, and nothing else. Not a DOM and del",
  ],
  "test/cli/e2e-ports.test.ts": [
    "Sweep the class: EVERY non-default port must get its own directory, not just one sampled p",
  ],
  "test/repo/constant-contracts.test.ts": [
    "The margin mirrors accept either the duplicated literal (which must equal MARGIN_FRACTION)",
  ],
  "test/site/reading-frame.test.ts": [
    "The Reading Room's frame (#219): host-agnostic, the first non-Explorer host of the #191 en",
  ],
};

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

const sourceFiles = (): string[] =>
  CODE_ROOTS.flatMap((root) => walk(join(REPO, root))).filter((f) => SOURCE.test(f));

interface ScanState {
  readonly inBlock: boolean;
  readonly inTemplate: boolean;
  readonly inStyle: boolean;
}

// Advances the lexer across ONE line, skipping the bodies of comments and of every kind of string. A backtick inside a comment or a quoted string must not toggle template state: the #384 guard-prover proved one odd backtick silently blinded this parser for the rest of a file, which is the worst failure a guard can have.
function scanLine(line: string, prior: ScanState, markup: boolean): ScanState {
  let { inBlock, inTemplate, inStyle } = prior;
  // Only .astro carries a real <style> element. In .ts the same text is a string, a regex or prose, and a lone mention used to blind the rest of the file (#384 skeptic finding 2); CSS in .ts lives in template literals, which the backtick tracking already covers.
  if (markup && !inTemplate && !inBlock && /<style[\s>]/.test(line)) inStyle = true;
  if (inStyle) {
    if (line.includes("</style>")) inStyle = false;
    return { inBlock, inTemplate, inStyle };
  }
  let i = 0;
  while (i < line.length) {
    const pair = line.slice(i, i + 2);
    if (inBlock) {
      if (pair === "*/") { inBlock = false; i += 2; continue; }
      i += 1;
      continue;
    }
    if (inTemplate) {
      if (line[i] === "\\") { i += 2; continue; }
      if (line[i] === "`") { inTemplate = false; i += 1; continue; }
      i += 1;
      continue;
    }
    if (pair === "//") break;
    if (pair === "/*") { inBlock = true; i += 2; continue; }
    if (line[i] === "`") { inTemplate = true; i += 1; continue; }
    if (line[i] === '"' || line[i] === "'") {
      const quote = line[i];
      i += 1;
      while (i < line.length && line[i] !== quote) i += line[i] === "\\" ? 2 : 1;
      i += 1;
      continue;
    }
    i += 1;
  }
  return { inBlock, inTemplate, inStyle };
}

// `{/* ... */}` is the house's Astro comment form, so an opener is not always at the start of the line (#384 skeptic finding 9).
const OPENS_COMMENT = /^(\/\/|\/\*|\{\s*\/\*)/;

interface LineKinds {
  readonly comment: boolean[];
  readonly code: boolean[];
  readonly unterminated: boolean;
}

function classifyLines(source: string, markup: boolean): LineKinds {
  const comment: boolean[] = [];
  const code: boolean[] = [];
  let state: ScanState = { inBlock: false, inTemplate: false, inStyle: false };
  for (const line of source.split("\n")) {
    const text = line.trim();
    const quoted = state.inTemplate || state.inStyle;
    const isComment = state.inBlock || (!quoted && OPENS_COMMENT.test(text));
    comment.push(isComment);
    // The .astro frontmatter fence is not code, so a head block sitting under it is still a head block (#384 skeptic finding 8).
    code.push(!isComment && text !== "" && text !== "---");
    state = scanLine(line, state, markup);
  }
  return { comment, code, unterminated: state.inTemplate || state.inBlock || state.inStyle };
}

const keyOf = (lines: readonly string[]): string =>
  lines
    .map((l) => l.trim().replace(/^\{?\s*(\/\*\*?|\*\/|\*|\/\/)/, "").replace(/\*\/\}?$/, "").trim())
    .filter((l) => l !== "")
    .join(" ")
    .replace(/\s+/g, " ")
    .slice(0, 90);

interface Run {
  readonly len: number;
  readonly line: number;
  readonly key: string;
}

// Only CODE closes a run, never a blank line: the same paragraph written with blank lines between its sentences was the first evasion the #384 guard-prover found. A run with no code above it anywhere is the file head, whose job is orienting a reader rather than annotating a line.
function midFileRuns(source: string, markup: boolean): { runs: Run[]; unterminated: boolean } {
  const { comment, code, unterminated } = classifyLines(source, markup);
  const lines = source.split("\n");
  const runs: Run[] = [];
  let seenCode = false;
  let start = -1;
  let members: string[] = [];
  const close = () => {
    if (start !== -1 && seenCode && members.length > 1) {
      runs.push({ len: members.length, line: start + 1, key: keyOf(members) });
    }
    start = -1;
    members = [];
  };
  comment.forEach((isComment, i) => {
    if (isComment) {
      if (start === -1) start = i;
      members.push(lines[i]);
      return;
    }
    close();
    if (code[i]) seenCode = true;
  });
  close();
  return { runs, unterminated };
}

const measured = (): Map<string, { runs: Run[]; unterminated: boolean }> => {
  const out = new Map<string, { runs: Run[]; unterminated: boolean }>();
  for (const file of sourceFiles()) {
    out.set(relative(REPO, file), midFileRuns(readFileSync(file, "utf8"), file.endsWith(".astro")));
  }
  return out;
};

// Every other test here reads the parser's own output over the whole tree, so none of them can see a parser bug. These fixtures are the only place the parser meets input it did not produce.
test("the parser survives the shapes that would blind it", () => {
  const runs = (src: string, markup = false) => midFileRuns(src, markup).runs;
  const longest = (src: string, markup = false) =>
    runs(src, markup).reduce((n, r) => Math.max(n, r.len), 0);
  assert.equal(longest("const a = 1;\n// one\n// two\n"), 2, "a plain two-line run");
  // KNOWN GAP, accepted deliberately: a blank line splits a run, so a paragraph written as blank-separated one-liners evades this guard. Joining across blanks was measured and flags two genuinely separate compliant one-liners just as readily, which would red compliant code. That case goes to vellum-pr-skeptic.
  assert.equal(longest("const a = 1;\n// one\n\n// two\n\n// three\n"), 0, "a blank line splits a run, the accepted gap");
  assert.equal(longest("const a = 1;\n// one\nconst b = 2;\n// two\n"), 0, "code DOES split a run");
  assert.equal(longest("const a = 1;\n// uses `foo here\n// second\n// third\n"), 3, "an odd backtick in a comment must not flip template state");
  assert.equal(longest('const s = "a ` in a string";\n// one\n// two\n'), 2, "nor one inside a quoted string");
  assert.equal(longest("const t = `\n/* css comment */\n/* still css */\n`;\n"), 0, "a template literal is not code comment");
  assert.equal(longest("const a = 1;\n/** one\n * two\n * three\n */\n"), 4, "a doc block is a run");
  assert.equal(longest("// head\n// still head\nconst a = 1;\n"), 0, "the file head is exempt");
  assert.equal(longest("---\nimport x from 'y';\n---\nconst a = 1;\n// one\n// two\n"), 2, "astro frontmatter still has code in it");
  assert.equal(longest("---\n// head under the fence\n// second line\n---\n", true), 0, "an astro head block sits under the frontmatter fence");
  assert.equal(longest("const a = 1;\n{/* one\n  two */}\n"), 2, "the astro {/* */} form is a comment");
  assert.equal(longest('const a = 1;\nconst s = "// not a comment";\n// real\n'), 0, "a comment marker inside a string is not a comment");
  assert.equal(midFileRuns("const t = `unterminated\n// one\n", false).unterminated, true, "an unterminated span is reported, not silently trusted");
  assert.equal(midFileRuns("const a = 1;\n// one\n", false).unterminated, false);
  assert.notEqual(
    runs("const a = 1;\n// alpha here\n// second\n")[0].key,
    runs("const a = 1;\n// beta here\n// second\n")[0].key,
    "two different blocks must not share a key, or one would grandfather the other",
  );
});

test("a mid-file comment runs to at most two lines, outside the blocks grandfathered at #384", () => {
  const offenders: string[] = [];
  for (const [rel, { runs }] of measured()) {
    const allowed = LEGACY_BLOCKS[rel] ?? [];
    for (const run of runs) {
      if (run.len > MAX_MIDFILE_RUN && !allowed.includes(run.key)) offenders.push(`  ${rel}:${run.line} (${run.len} lines) ${JSON.stringify(run.key)}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `Comment doctrine (#378, #384): these mid-file comment blocks run past one line. Compress each ` +
      `to one line, or move what it says into the test that pins the behavior. If it is a genuine ` +
      `untestable gotcha that needs the room, add its opening text to LEGACY_BLOCKS deliberately and ` +
      `say why in the PR:\n${offenders.join("\n")}`,
  );
});

test("the grandfather roster only ever shrinks", () => {
  const found = measured();
  const stale: string[] = [];
  for (const [rel, keys] of Object.entries(LEGACY_BLOCKS)) {
    const here = found.get(rel);
    if (!here) {
      stale.push(`  ${rel} is no longer a source file, so its entries are dead`);
      continue;
    }
    for (const key of keys) {
      if (!here.runs.some((r) => r.key === key)) stale.push(`  ${rel} no longer has the block ${JSON.stringify(key)}`);
    }
  }
  assert.deepEqual(
    stale,
    [],
    `The roster records blocks that exist. A block that was swept, reworded or moved must lose its ` +
      `entry in the same change, or the allowance silently stays open for the next comment written ` +
      `there:\n${stale.join("\n")}`,
  );
});

test("the guard reads the whole tree it claims to, and this file obeys its own rule", () => {
  const files = measured();
  // Measured 351 at #384 (src 176, test 136, scripts 33, test-support 6). A bare total cannot see a dropped root, since deleting even src leaves 175, so each root carries its own floor.
  const FLOOR: Readonly<Record<string, number>> = { src: 120, test: 100, scripts: 20, "test-support": 4 };
  assert.deepEqual(Object.keys(FLOOR).sort(), CODE_ROOTS.slice().sort(), "a root lost its floor, so it could vanish unseen");
  for (const root of CODE_ROOTS) {
    const seen = [...files.keys()].filter((f) => f.startsWith(root + "/")).length;
    assert.ok(seen >= FLOOR[root], `${root} contributed ${seen} files, under its floor of ${FLOOR[root]}`);
  }
  const broken = [...files].filter(([, m]) => m.unterminated).map(([rel]) => rel);
  assert.deepEqual(broken, [], `the parser hit EOF inside a comment or template here, so the result is not trustworthy:\n${broken.join("\n")}`);
  const self = "test/repo/comment-doctrine.test.ts";
  assert.ok(files.has(self), "the guard does not scan itself");
  assert.ok(!(self in LEGACY_BLOCKS), "the guard grandfathered itself, which is the one file that cannot");
});
