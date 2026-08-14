import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

// #384: #378 ratified "comments are the exception" as prose in CLAUDE.md, and prose lost twice, so the SHAPE half is mechanical here. This guard enforces only what a machine can see: a mid-file comment is ONE line, because a comment that restates a tested behavior needs several lines to do it while an untestable gotcha usually fits in one. It cannot tell whether a one-liner restates a test; that half is vellum-pr-skeptic's, and #296's citation guards are the same division of labour. File-head blocks are exempt (a different job: orienting a reader who has just opened the file), and .yml is out of scope, since multi-line blocks are the norm there and YAML has no test layer to carry a rationale instead.

const REPO = resolve(import.meta.dirname, "..", "..");
const CODE_ROOTS = ["src", "test", "test-support", "scripts"];
const SKIP_DIRS = new Set(["node_modules", "dist", "out", ".git", ".claude"]);
const SOURCE = /\.(ts|mjs|astro)$/;

const MAX_MIDFILE_RUN = 1;

// Every file whose longest mid-file run already exceeds one line, measured on main at #384. A ceiling, not a target: sweeping a file below its entry is the point, and the roster test below then requires the entry to go. It can only shrink.
const LEGACY_RUNS: Readonly<Record<string, number>> = {
  "src/atlas/document.ts": 10,
  "src/site/explorer/survey-arm.ts": 7,
  "src/site/living-chart/voyage-log-panel.ts": 7,
  "test/atlas/document.test.ts": 5,
  "src/cli/e2e-suites.ts": 4,
  "src/site/explorer/draw-ceremony.ts": 4,
  "test/repo/constant-contracts.test.ts": 4,
  "src/layouts/BaseLayout.astro": 3,
  "src/site/explorer/verso.ts": 3,
  "src/site/living-chart/chronicle.ts": 3,
  "src/site/living-chart/place-overlay.ts": 3,
  "src/site/living-chart/voyage-session.ts": 3,
  "src/site/seed-of-the-day/app.ts": 3,
  "test/cli/e2e-ports.test.ts": 3,
  "test/site/reading-frame.test.ts": 3,
  "scripts/e2e/suite-motion.mjs": 2,
  "src/pages/gallery/index.astro": 2,
  "src/pages/index.astro": 2,
  "src/site/explorer/footnotes.ts": 2,
  "src/site/explorer/glass.ts": 2,
  "src/site/living-chart/voyage.ts": 2,
  "src/site/print-room/app.ts": 2,
  "src/site/print-room/bound-atlas.ts": 2,
  "src/site/reading-room/app.ts": 2,
  "test/cli/e2e-suites.test.ts": 2,
  "test/cli/poster-parity.test.ts": 2,
  "test/explorer/sheet-turn.test.ts": 2,
  "test/render/chronicle-scrubber.test.ts": 2,
  "test/render/label-overlap.test.ts": 2,
  "test/render/place-card.test.ts": 2,
  "test/render/realm-labels.test.ts": 2,
  "test/render/realm-legibility.test.ts": 2,
  "test/render/region-coast.test.ts": 2,
  "test/render/region-lake-label.test.ts": 2,
  "test/render/region-sea-furniture.test.ts": 2,
  "test/render/voyage-route.test.ts": 2,
  "test/render/voyage-tour.test.ts": 2,
  "test/render/voyage-water.test.ts": 2,
  "test/render/voyage.test.ts": 2,
  "test/repo/comment-citations.test.ts": 2,
  "test/repo/e2e-tiers.test.ts": 2,
  "test/site/discovery.test.ts": 2,
  "test/site/glossary-sections.test.ts": 2,
  "test/site/hero-charts.test.ts": 2,
  "test/site/hunt-zoom.test.ts": 2,
  "test/site/living-chart-boundary.test.ts": 2,
  "test/site/living-chart-css.test.ts": 2,
  "test/site/living-chart-no-bar.test.ts": 2,
  "test/site/pages-prose.test.ts": 2,
  "test/site/reading-room-colophon.test.ts": 2,
  "test/site/survey-arm.test.ts": 2,
  "test/site/tip-affordance.test.ts": 2,
  "test/site/voyage-session-mount.test.ts": 2,
  "test/site/zoom-controller.test.ts": 2,
  "test/world/covenant-seed42.test.ts": 2,
  "test/world/golden-seed42.test.ts": 2,
  "test/world/voyage-log.test.ts": 2,
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

// Tracks /* */ spans as well as // runs, so a doc block cannot walk around the rule.
// CSS hides in three authored places (#360: BaseLayout's style element, GALLERY_PAGE_CSS, document.ts's sheet constants) and ITS comments are not code comments, so template literals and <style> elements are skipped whole.
function commentLineFlags(source: string): boolean[] {
  const flags: boolean[] = [];
  let inBlock = false;
  let inTemplate = false;
  let inStyle = false;
  for (const line of source.split("\n")) {
    const text = line.trim();
    const wasQuoted = inTemplate || inStyle;
    if (/<style[\s>]/.test(line)) inStyle = true;
    if (inStyle && line.includes("</style>")) inStyle = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === "`" && line[i - 1] !== "\\") inTemplate = !inTemplate;
    }
    if (wasQuoted || inTemplate || inStyle) {
      flags.push(false);
      continue;
    }
    if (inBlock) {
      flags.push(true);
      if (text.includes("*/")) inBlock = false;
      continue;
    }
    if (text.startsWith("/*")) {
      flags.push(true);
      if (!text.includes("*/")) inBlock = true;
      continue;
    }
    flags.push(text.startsWith("//"));
  }
  return flags;
}

// A run starting at line 0 is the file head, whose job is orienting a reader rather than annotating a line.
function longestMidFileRun(source: string): { len: number; line: number } {
  const flags = commentLineFlags(source);
  let best = { len: 0, line: 0 };
  let start = -1;
  const close = (end: number) => {
    if (start > 0 && end - start > best.len) best = { len: end - start, line: start + 1 };
    start = -1;
  };
  flags.forEach((isComment, i) => {
    if (isComment) {
      if (start === -1) start = i;
    } else close(i);
  });
  close(flags.length);
  return best;
}

const measured = (): Map<string, { len: number; line: number }> => {
  const out = new Map<string, { len: number; line: number }>();
  for (const file of sourceFiles()) {
    out.set(relative(REPO, file), longestMidFileRun(readFileSync(file, "utf8")));
  }
  return out;
};

test("a mid-file comment is one line, outside the files grandfathered at #384", () => {
  const offenders: string[] = [];
  for (const [rel, worst] of measured()) {
    const allowed = LEGACY_RUNS[rel] ?? MAX_MIDFILE_RUN;
    if (worst.len > allowed) offenders.push(`  "${rel}": ${worst.len},   // was ${allowed}, at line ${worst.line}`);
  }
  assert.deepEqual(
    offenders,
    [],
    `Comment doctrine (#378, #384): these files carry a mid-file comment block longer than they are ` +
      `allowed. Compress it to one line, or move what it says into the test that pins the behavior. ` +
      `If the comment is a genuine untestable gotcha that truly needs the room, raise the file's ` +
      `LEGACY_RUNS entry deliberately and say why in the PR:\n${offenders.join("\n")}`,
  );
});

test("the grandfather roster only ever shrinks", () => {
  const worst = measured();
  const stale: string[] = [];
  for (const [rel, allowed] of Object.entries(LEGACY_RUNS)) {
    const found = worst.get(rel);
    if (!found) {
      stale.push(`  ${rel} is no longer a source file, so its entry is dead`);
      continue;
    }
    if (found.len < allowed) {
      stale.push(`  ${rel} now needs ${found.len === 1 ? "no entry at all" : found.len}, not ${allowed}`);
    }
  }
  assert.deepEqual(
    stale,
    [],
    `The roster is a ceiling that ratchets DOWN: a file swept below its entry must have the entry ` +
      `lowered or removed in the same change, or the allowance silently stays available to the next ` +
      `comment written there:\n${stale.join("\n")}`,
  );
});

test("the guard reads the whole tree it claims to, and this file obeys its own rule", () => {
  const files = measured();
  assert.ok(files.size > 150, `only ${files.size} source files scanned; the walk is missing a root`);
  for (const root of CODE_ROOTS) {
    assert.ok([...files.keys()].some((f) => f.startsWith(root + "/")), `${root} contributed no files`);
  }
  const self = "test/repo/comment-doctrine.test.ts";
  assert.ok(files.has(self), "the guard does not scan itself");
  assert.ok(!(self in LEGACY_RUNS), "the guard grandfathered itself, which is the one file that cannot");
});
