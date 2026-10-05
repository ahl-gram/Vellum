import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// A tracked agent or skill file never sends its reader to the private auto-memory for content (Issue #729, handbook/specs/conventions.md). Misses, by Alex's ruling A or by construction: a pointer that names the store by none of its names and no address ("see memory", "Alex's notes"); a memory file's hyphenated name outside wikilink brackets; a file under neither root (CLAUDE.md by the ruling, the specs, .claude/settings.json); an untracked file; a copy of a kept phrase elsewhere in its own file. Errs toward a false positive: a MENTION one is reworded or kept when it lands, an ADDRESS one (a future project_id) only reworded.

const REPO = resolve(import.meta.dirname, "..", "..");
const ROOTS = [".claude/agents", ".claude/skills"];
// 2026-10-04: this git ls-files answers in under 10 ms on a Mac; thirty seconds is a cap on a hang, not a budget.
const GIT_TIMEOUT_MS = 30_000;
const ADDRESS = /\b(?:feedback|project|reference|user)_(?:[a-z][a-z0-9_]*|\*)|\[\[(?:feedback|project|reference|user)-[a-z0-9-]+\]\]|MEMORY\.md|\.claude\/projects/g;
const MENTION = /auto(?:- ?| )?memory|private(?:- ?| )memory|alex['’]s memory|memory file|memory folder|memory director/gi;

type Kept = { readonly file: string; readonly phrase: string; readonly why: "forbids reading it" | "history" | "rule of thumb" };

const KEPT: ReadonlyArray<Kept> = [
  { file: ".claude/agents/vellum-plan-skeptic.md", phrase: "an auto-memory pointer once sent six subagents", why: "history" },
  { file: ".claude/agents/vellum-plan-skeptic.md", phrase: "or the auto-memory files. They carry the planning session's framing", why: "forbids reading it" },
  { file: ".claude/agents/vellum-pr-skeptic.md", phrase: "or the auto-memory files. They carry the implementing session's framing", why: "forbids reading it" },
  { file: ".claude/agents/vellum-plate-reader.md", phrase: "This trap was already in auto-memory when", why: "history" },
  { file: ".claude/agents/vellum-spec-recon.md", phrase: "Auto-memory is a pointer, not a citation.", why: "rule of thumb" },
  { file: ".claude/skills/vellum-footguns/references/scars.md", phrase: "moved out of private memory", why: "history" },
];

const fold = (text: string): string => text.replace(/\s+/g, " ");
const near = (text: string, at: number): string => text.slice(Math.max(0, at - 40), at + 40);

function spansOf(text: string, phrase: string): ReadonlyArray<readonly [number, number]> {
  const spans: Array<readonly [number, number]> = [];
  for (let at = text.indexOf(phrase); at !== -1; at = text.indexOf(phrase, at + 1)) spans.push([at, at + phrase.length]);
  return spans;
}

function findingsIn(file: string, raw: string, kept: ReadonlyArray<Kept> = KEPT): ReadonlyArray<string> {
  const text = fold(raw);
  const spans = kept.filter((k) => k.file === file).flatMap((k) => spansOf(text, k.phrase));
  const inside = (from: number, to: number): boolean => spans.some(([start, end]) => start <= from && to <= end);
  const addresses = [...text.matchAll(ADDRESS)].map((m) => `${file} names ${m[0]}, an address in the private memory: "${near(text, m.index)}"`);
  const loose = [...text.matchAll(MENTION)]
    .filter((m) => !inside(m.index, m.index + m[0].length))
    .map((m) => `${file} names the memory store outside every kept line: "${near(text, m.index)}"`);
  return [...addresses, ...loose];
}

function trackedUnderRoots(): ReadonlyArray<string> {
  const listing = spawnSync("git", ["ls-files", "-z", "--", ...ROOTS], { cwd: REPO, encoding: "utf8", timeout: GIT_TIMEOUT_MS });
  assert.equal(listing.status, 0, `git ls-files failed: ${listing.error?.message ?? listing.stderr}`);
  return listing.stdout.split("\0").filter(Boolean);
}

test("no agent or skill file names an address in the private memory, or names the store outside its kept lines", () => {
  const files = trackedUnderRoots();
  for (const root of ROOTS) assert.ok(files.some((f) => f.startsWith(`${root}/`)), `${root} yielded no tracked file: the listing is broken`);
  const findings = files.flatMap((f) => findingsIn(f, readFileSync(resolve(REPO, f), "utf8")));
  assert.deepEqual(
    findings,
    [],
    `${findings.length} memory reference(s) under ${ROOTS.join(" and ")}. Write the content into its tracked home and point there ` +
      `(handbook/specs/conventions.md, "Where a rule lives"); a line that only forbids reading the store, records history or states ` +
      `a rule of thumb about it names the store, never a file in it, and joins KEPT.\n  ` + findings.join("\n  "),
  );
});

test("every kept phrase is still in its file and names the store", () => {
  const files = new Set(trackedUnderRoots());
  for (const { file, phrase, why } of KEPT) {
    assert.ok(files.has(file), `${file} is not a tracked file under ${ROOTS.join(" or ")}`);
    assert.notEqual(fold(readFileSync(resolve(REPO, file), "utf8")).indexOf(phrase), -1, `${file}: the kept line "${phrase}" (${why}) is gone, so its KEPT row goes too`);
    assert.match(phrase, new RegExp(MENTION.source, "i"), `"${phrase}" names no store, so it keeps nothing`);
  }
});

const REAIMED = [
  {
    file: ".claude/skills/vellum-footguns/SKILL.md",
    text: "The doctrine behind every line here already exists, in `CLAUDE.md`, in `handbook/specs/rulebook.md`, in the\nagents, and in the auto-memory doctrine files.",
    arms: { address: false, mention: true },
  },
  {
    file: ".claude/skills/vellum-footguns/references/scars.md",
    text: "carried it. The long form of each lesson, with the earlier scars, is in the auto-memory doctrine\nfiles named at the end.",
    arms: { address: false, mention: true },
  },
  {
    file: ".claude/skills/vellum-footguns/references/scars.md",
    text:
      "Auto-memory, in the private per-project memory directory, which is Alex's machine only:\n`feedback_guard_doctrine.md` (whether a guard bites), `feedback_measurement_doctrine.md` (whether\n" +
      "a measurement is true), `feedback_drive_real_input_not_synthetic.md`, `feedback_look_at_visual_work.md`,\n`feedback_pr_discipline_doctrine.md`, `feedback_verification_budget_doctrine.md`,\n" +
      "`feedback_comment_doctrine.md`, `feedback_check_dont_reason.md`, and the `reference_*` files for\nthe tooling traps (CDP escapes, perl wide chars, the rebase subject strip, closing keywords).",
    arms: { address: true, mention: true },
  },
  {
    file: ".claude/agents/vellum-guard-prover.md",
    text: "Rules already exist for this (the guard doctrine in Alex's auto-memory, and CLAUDE.md's requirement that a RED fail on the assertion you care about).",
    arms: { address: false, mention: true },
  },
  {
    file: ".claude/agents/vellum-plate-reader.md",
    text: "**Measurements and named files, never \"it looks right.\"** Alex sees only what you relay and what lands on disk (`feedback_show_visual_artifacts`).",
    arms: { address: true, mention: false },
  },
] as const;

test("each pointer PR #730 re-aimed, as it stood at a4edabd^, is refused in the file it stood in, and each arm is the only one to catch a witness", () => {
  for (const { file, text, arms } of REAIMED) {
    assert.notDeepEqual(findingsIn(file, text), [], `${file}: "${text.slice(0, 60)}..." passes`);
    assert.equal(text.match(ADDRESS) !== null, arms.address, `${file}: the address arm`);
    assert.equal(fold(text).match(MENTION) !== null, arms.mention, `${file}: the store-name arm`);
  }
});

const OUTSIDE = ".claude/agents/no-such-agent.md";
const PLATE = ".claude/agents/vellum-plate-reader.md";

const REFUSED: ReadonlyArray<readonly [string, string]> = [
  [OUTSIDE, "the long form is in automemory"],
  [OUTSIDE, "see the Auto Memory"],
  [OUTSIDE, "kept in private-memory"],
  [OUTSIDE, "see the auto-\nmemory"],
  [OUTSIDE, "kept in private-\nmemory"],
  [OUTSIDE, "in Alex's memory"],
  [OUTSIDE, "in Alex’s memory"],
  [OUTSIDE, "read the memory files"],
  [OUTSIDE, "see the memory file"],
  [OUTSIDE, "the per-project memory directory"],
  [OUTSIDE, "the memory directories"],
  [OUTSIDE, "the memory folder"],
  [OUTSIDE, "the memory folders"],
  [OUTSIDE, "see [[feedback-x]]"],
  [OUTSIDE, "see [[project-b]]"],
  [OUTSIDE, "see [[reference-c]]"],
  [OUTSIDE, "see [[user-d]]"],
  [OUTSIDE, "the index, MEMORY.md"],
  [OUTSIDE, "`feedback_a`"],
  [OUTSIDE, "`project_b.md`"],
  [OUTSIDE, "`reference_c.md`"],
  [OUTSIDE, "`user_d.md`"],
  [OUTSIDE, "the `reference_*` files"],
  [OUTSIDE, "under ~/.claude/projects/x/"],
  [".claude/agents/vellum-spec-recon.md", "This trap was already in auto-memory when"],
  [PLATE, "This trap was already in auto-memory when it nearly hid. The long form is in the auto-memory."],
  [PLATE, "This trap was already in auto-memory when `feedback_x.md` said so"],
  [OUTSIDE, "the long form is in the private\nmemory"],
];

const PASSED: ReadonlyArray<readonly [string, string]> = [
  [".claude/skills/vellum-footguns/references/scars.md", "that Issue #708 moved out of private\nmemory, one row"],
  [".claude/agents/vellum-plan-skeptic.md", "or the auto-memory files. They carry\nthe planning session's framing"],
  [".claude/agents/vellum-spec-recon.md", "Auto-memory is a pointer, not a citation."],
  [OUTSIDE, "a plan is usually written from memory"],
  [OUTSIDE, "`a7e3018`, `chore/708-memory-to-specs-round-two`"],
  [OUTSIDE, "## Promoted from the memory triage (Issue #708)"],
  [OUTSIDE, "a memorial"],
  [OUTSIDE, "my_project_x"],
  [OUTSIDE, "${CLAUDE_PROJECT_DIR}"],
  [OUTSIDE, "`~/.claude/settings.json`"],
];

test("each arm refuses its own form, a kept phrase keeps only its own words in its own file, and the near misses pass", () => {
  for (const [file, text] of REFUSED) assert.notDeepEqual(findingsIn(file, text), [], `${file}: "${text}" passes`);
  const naming = "it was once in `feedback_x.md`, in the private memory";
  assert.notDeepEqual(findingsIn(OUTSIDE, naming, [{ file: OUTSIDE, phrase: naming, why: "history" }]), [], "a kept phrase excused the memory file it names");
  for (const [file, text] of PASSED) assert.deepEqual(findingsIn(file, text), [], `${file}: "${text}"`);
});
