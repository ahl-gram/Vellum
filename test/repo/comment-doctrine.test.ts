// #384: #378 ratified "comments are the exception" as prose in CLAUDE.md and prose lost twice, so the SHAPE half is mechanical here. A mid-file comment runs to at most TWO lines, because restating a tested behavior takes room while an untestable gotcha usually fits in one or two. ONE line was measured first and rejected: it needs 285 blocks grandfathered against this repo, which is the codebase rather than a debt list, and a guard that reds on ordinary compliant code gets worked around.
// Comments are located by TypeScript's OWN parser, never by hand-rolled lexing. Two hand-written attempts were each silently blinded by input the real parser handles for free (a backtick inside a string or a regex literal, a <style> mention in prose), and a guard that goes quiet is worse than no guard.
// What this CANNOT see, all of it vellum-pr-skeptic's half: whether a one or two line comment restates a test, a paragraph written as blank-separated one-liners (a blank splits a run here, because joining across blanks flags two genuinely separate compliant one-liners just as readily), .astro (a template language the parser cannot read, and where both blinding holes lived), and .yml/.css/.md/.js or anything outside CODE_ROOTS.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import ts from "typescript";

const REPO = resolve(import.meta.dirname, "..", "..");
const CODE_ROOTS = ["src", "test", "test-support", "scripts"];
const SKIP_DIRS = new Set(["node_modules", "dist", "out", ".git", ".claude"]);
const SOURCE = /\.(ts|mjs)$/;

// Each grandfathered block is named by its OPENING TEXT, never by a line number (which drifts) and never by a per-file ceiling (which would let a brand new block of the same size ride the old one's allowance forever, the #384 skeptic's finding 6). A block whose wording changes reds, which is the right moment to ask whether it still earns the room.
const MAX_MIDFILE_RUN = 2;

const LEGACY_BLOCKS: Readonly<Record<string, readonly string[]>> = {
  "src/atlas/document.ts": [
    "Exactly the shape `serializableAtlas` in `src/site/explorer/serializable-atlas.ts` produce",
    "The shared inner atlas CSS, scoped under `.atlas-sheet` so any host can inject it without ",
    "The self-contained download's plates, linked at load (#368, ratified 2026-08-13). A plain ",
    "`plateSrc` decides how a plate is embedded: a filename (CLI, with anchor:true) or a data U",
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

interface LineKinds {
  readonly comment: boolean[];
  readonly code: boolean[];
}

// A line counts as a comment line when its first non-space character sits inside a comment TypeScript's parser found, so `code(); // note` is code and a "//" inside a string is neither. The parser rather than a bare scanner: resolving a regex literal from a division sign, or a template's ${} substitutions, needs parse context, and without it the CSS inside GALLERY_PAGE_CSS reads as code comments.
function commentSpans(source: string): Array<[number, number]> {
  const file = ts.createSourceFile("probe.ts", source, ts.ScriptTarget.ESNext, true);
  const spans = new Map<number, [number, number]>();
  const visit = (node: ts.Node): void => {
    for (const range of ts.getLeadingCommentRanges(source, node.pos) ?? []) {
      spans.set(range.pos, [range.pos, range.end]);
    }
    for (const child of node.getChildren(file)) visit(child);
  };
  visit(file);
  return [...spans.values()];
}

function classifyLines(source: string): LineKinds {
  const spans = commentSpans(source);
  const comment: boolean[] = [];
  const code: boolean[] = [];
  let offset = 0;
  for (const line of source.split("\n")) {
    const text = line.trim();
    const at = offset + (text === "" ? 0 : line.indexOf(text.charAt(0)));
    const isComment = text !== "" && spans.some(([a, b]) => at >= a && at < b);
    comment.push(isComment);
    code.push(!isComment && text !== "");
    offset += line.length + 1;
  }
  return { comment, code };
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
function midFileRuns(source: string): { runs: Run[] } {
  const { comment, code } = classifyLines(source);
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
  return { runs };
}

const measured = (): Map<string, { runs: Run[] }> => {
  const out = new Map<string, { runs: Run[] }>();
  for (const file of sourceFiles()) {
    out.set(relative(REPO, file), midFileRuns(readFileSync(file, "utf8")));
  }
  return out;
};

// Every other test here reads the parser's own output over the whole tree, so none of them can see a parser bug. These fixtures are the only place the parser meets input it did not produce.
test("the parser survives the shapes that would blind it", () => {
  const runs = (src: string) => midFileRuns(src).runs;
  const longest = (src: string) => runs(src).reduce((n, r) => Math.max(n, r.len), 0);
  assert.equal(longest("const a = 1;\n// one\n// two\n"), 2, "a plain two-line run");
  // KNOWN GAP, accepted deliberately: a blank line splits a run, so a paragraph written as blank-separated one-liners evades this guard. Joining across blanks was measured and flags two genuinely separate compliant one-liners just as readily, which would red compliant code. That case goes to vellum-pr-skeptic.
  assert.equal(longest("const a = 1;\n// one\n\n// two\n\n// three\n"), 0, "a blank line splits a run, the accepted gap");
  assert.equal(longest("const a = 1;\n// one\nconst b = 2;\n// two\n"), 0, "code DOES split a run");
  assert.equal(longest("const a = 1;\n// uses `foo here\n// second\n// third\n"), 3, "an odd backtick in a comment must not flip template state");
  assert.equal(longest('const s = "a ` in a string";\n// one\n// two\n'), 2, "nor one inside a quoted string");
  assert.equal(longest("const t = `\n/* css comment */\n/* still css */\n`;\n"), 0, "a template literal is not code comment");
  assert.equal(longest("const a = 1;\n/** one\n * two\n * three\n */\n"), 4, "a doc block is a run");
  assert.equal(longest("// head\n// still head\nconst a = 1;\n"), 0, "the file head is exempt");
  assert.equal(longest('const a = 1;\nconst s = "// not a comment";\n// real\n'), 0, "a comment marker inside a string is not a comment");
  // The two shapes that silently blinded the hand-rolled attempts, and the reason the real scanner replaced it.
  assert.equal(longest("const re = /[`~]/;\n// one\n// two\n// three\n"), 3, "a backtick in a REGEX literal must not blind the scan");
  assert.equal(longest('const s = "<style> in prose";\n// one\n// two\n// three\n'), 3, "a <style> mention in a string must not blind the scan");
  assert.equal(longest("code(); // trailing\nmore(); // trailing\n"), 0, "a trailing comment is not a comment LINE");
  assert.equal(longest("const t = `unterminated\n// one\n// two\n// three\n"), 0, "an unterminated template swallows the rest, and the scanner says so rather than guessing");
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
  assert.ok(![...files.keys()].some((f) => f.endsWith(".astro")), "astro is out of scope; the scanner cannot read it, so a green here would be a false clean bill");
  const self = "test/repo/comment-doctrine.test.ts";
  assert.ok(files.has(self), "the guard does not scan itself");
  assert.ok(!(self in LEGACY_BLOCKS), "the guard grandfathered itself, which is the one file that cannot");
});
