import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";

// A backticked file path in prose claims the file is in the repo or deliberately kept out of it (Issue #624). Like its sibling comment-citations.test.ts this guard checks the path and never the claim around it, and it errs toward a miss or a reword, never a silent wrong directory. Misses: the forms the extraction test pins as never extracted; a placeholder that happens to exist, a memory-prefixed name that is not a memory file, a gitignored path nobody has on disk, and a relative or unique-basename hit that is the wrong file of that name; a span wrapped across a line, which is not joined; code files under the prose roots, read by neither guard; and a wrong-case or untracked-draft citation, which existsSync accepts on a Mac and CI's Linux checkout does not (green here, red there, never silent). False positives, reworded when they land: a backticked path inside a fenced block, extracted like any other; a unique basename the day a namesake lands; a dotted word whose extension some tracked file happens to carry (`index.html`, an extension tracked only under design/), read as a citation.

const REPO = resolve(import.meta.dirname, "..", "..");
const PROSE_ROOTS = ["specs", ".claude/skills", ".claude/agents", "CLAUDE.md", "README.md", ".github"];
const SERVED_ROOT = "public";
const MEMORY_PREFIX = /^(project_|feedback_|reference_)/;
// A cap on a hang, never a budget (2026-09-16: the whole sweep with both git calls ran in 13 to 15 ms on a Mac and in CI's Linux checkout, so 30 s is three orders above the worst case): spawnSync's timeout is the mechanism test/repo/footgun-deployed-run.test.ts pins with a child that outlives it, and a check-ignore batch on stdin is the draining-child shape Issue #564 measured.
const GIT_TIMEOUT_MS = 30_000;
// Issue #624's seven, restated on purpose under the derived set: a deliberate Gate 1 item 16 departure.
const EXTENSION_FLOOR = ["md", "ts", "mjs", "astro", "css", "yml", "json"];

type Citation = { readonly file: string; readonly line: number; readonly path: string };
type Verdict = { readonly citation: Citation; readonly finding: string | null };

const git = (args: string[], input?: string) =>
  spawnSync("git", args, { cwd: REPO, encoding: "utf8", input, timeout: GIT_TIMEOUT_MS });

const listing = git(["ls-files", "-z"]);
if (listing.status !== 0) throw new Error(`git ls-files failed (${listing.status}, ${listing.error ?? listing.stderr}): the tracked set would be empty or partial`);
const tracked: ReadonlyArray<string> = listing.stdout.split("\0").filter(Boolean);
const extensions: ReadonlySet<string> = new Set(tracked.map((f) => extname(f).slice(1)).filter(Boolean));
const byBasename: ReadonlyMap<string, ReadonlyArray<string>> = new Map(
  [...new Set(tracked.map((f) => basename(f)))].map((name) => [name, tracked.filter((f) => basename(f) === name)]),
);
const PATH = new RegExp("`([A-Za-z0-9_./-]+\\.(?:" + [...extensions].join("|") + "))`", "g");

const rel = (abs: string): string => relative(REPO, abs);
const insideRepo = (abs: string): boolean => !rel(abs).startsWith("..") && !rel(abs).startsWith("/");
const isPlaceholder = (path: string): boolean => /(^|\/)N-/.test(path) || basename(path).startsWith(".");

function walkMarkdown(root: string): ReadonlyArray<string> {
  const abs = resolve(REPO, root);
  if (!statSync(abs).isDirectory()) return [abs];
  return readdirSync(abs, { recursive: true, encoding: "utf8" })
    .map((entry) => join(abs, entry))
    .filter((p) => p.endsWith(".md") && statSync(p).isFile());
}

function extractPaths(text: string): ReadonlyArray<string> {
  return [...text.matchAll(PATH)].map(([, path]) => path);
}

function citationsIn(file: string): ReadonlyArray<Citation> {
  return readFileSync(file, "utf8")
    .split("\n")
    .flatMap((text, i) => extractPaths(text).map((path) => ({ file: rel(file), line: i + 1, path })));
}

function localVerdict(dir: string, path: string): string | true | null {
  if (isPlaceholder(path) || MEMORY_PREFIX.test(basename(path))) return true;
  if (!insideRepo(resolve(REPO, path)) || !insideRepo(resolve(REPO, dir, path))) return `\`${path}\`, which leaves the repo`;
  if (existsSync(resolve(REPO, path)) || existsSync(resolve(REPO, dir, path))) return true;
  return null;
}

function gitIgnored(paths: ReadonlyArray<string>): ReadonlySet<string> {
  // git check-ignore exits 1 when nothing on stdin is ignored, and is fatal (128) on a path outside the repo and on a BLANK line, which the join below would send for an empty batch (measured on git 2.55: empty stdin exits 1, "\n" exits 128), so the empty batch never runs and only 0 and 1 are clean exits.
  if (paths.length === 0) return new Set();
  const out = git(["check-ignore", "--stdin", "--no-index"], paths.join("\n") + "\n");
  if (out.status !== 0 && out.status !== 1) throw new Error(`git check-ignore failed (${out.status}): ${out.stderr}`);
  return new Set(out.stdout.split("\n").filter(Boolean));
}

function remoteVerdict(dir: string, path: string, served: boolean, ignored: ReadonlySet<string>): string | null {
  if (ignored.has(path)) return null;
  if (served) return `\`/${path.slice(SERVED_ROOT.length + 1)}\`, which is not served: ${path} neither exists nor is gitignored`;
  const namesakes = byBasename.get(path) ?? [];
  if (!path.includes("/") && namesakes.length === 1) return null;
  const by = path.includes("/") ? "" : `, nor as a unique basename (matches ${namesakes.length} tracked files)`;
  return `\`${path}\`, which resolves neither from the repo root, nor from ${dir}/, nor as gitignored${by}`;
}

function resolveCitations(citations: ReadonlyArray<Citation>): ReadonlyArray<Verdict> {
  const staged = citations.map((citation) => {
    const served = citation.path.startsWith("/");
    const path = served ? SERVED_ROOT + citation.path : citation.path;
    return { citation, served, path, local: localVerdict(dirname(citation.file), path) };
  });
  const ignored = gitIgnored([...new Set(staged.filter((s) => s.local === null).map((s) => s.path))]);
  return staged.map(({ citation, served, path, local }) => ({
    citation,
    finding:
      local === true ? null : local ?? remoteVerdict(dirname(citation.file), path, served, ignored),
  }));
}

const findingsOf = (verdicts: ReadonlyArray<Verdict>): ReadonlyArray<string> =>
  verdicts.flatMap(({ citation, finding }) => (finding ? [`${citation.file}:${citation.line} cites ${finding}`] : []));

test("every backticked file path in the prose roots resolves", () => {
  const perRoot = PROSE_ROOTS.map((root) => {
    const files = walkMarkdown(root);
    return { root, files: files.length, citations: files.flatMap(citationsIn) };
  });
  for (const { root, files } of perRoot) assert.ok(files > 0, `${root} yielded no markdown: the walk is broken, or the root has none and leaves PROSE_ROOTS`);
  const citations = perRoot.flatMap((r) => r.citations);
  assert.ok(citations.length > 0, "no backticked path in any root: the extraction or the reader is broken");
  for (const ext of EXTENSION_FLOOR) assert.ok(extensions.has(ext), `no tracked .${ext} file: the derived extension set shrank`);
  const findings = findingsOf(resolveCitations(citations));
  assert.deepEqual(
    findings,
    [],
    `${findings.length} backticked path(s) in prose do not resolve. A backticked path claims the file is in the repo or ` +
      `deliberately kept out of it: fix the path, cite a generated file with its directory, write a retired file or ` +
      `an example name without backticks, and a file outside this repo at its real home under ~.\n  ` + findings.join("\n  "),
  );
});

test("each resolution rule has a live witness, and each finding class has one", () => {
  const skill = ".claude/skills/vellum-footguns";
  const verdict = (dir: string, path: string): string | null =>
    resolveCitations([{ file: `${dir}/witness.md`, line: 1, path }])[0]!.finding;
  const absent = (path: string): void => {
    assert.ok(!existsSync(resolve(REPO, path)), `${path} exists, so the witness below would pass for the wrong reason`);
  };

  absent("references/flake-record.md");
  absent("specs/references/flake-record.md");
  assert.match(verdict("specs", "references/flake-record.md") ?? "", /resolves neither/, "PR #618's round 2, the incident");
  absent("hooks");
  assert.match(verdict(".", "hooks/README.md") ?? "", /resolves neither/, "CLAUDE.md's dangler, skill-relative from the root");
  assert.ok((byBasename.get("index.css")?.length ?? 0) > 1, "the ambiguous-basename witness needs namesakes");
  assert.match(verdict("specs", "index.css") ?? "", /matches \d+ tracked files/, "a bare name several files carry");
  assert.equal(byBasename.get("no-such-file.ts"), undefined);
  assert.match(verdict("specs", "no-such-file.ts") ?? "", /matches 0 tracked files/, "a bare name nothing carries");
  assert.ok(existsSync(resolve(REPO, "CLAUDE.md")), "the .. witness leaves the repo despite resolving to a real file");
  assert.match(verdict("specs", "../CLAUDE.md") ?? "", /leaves the repo/);
  absent("public/no-such.css");
  assert.match(verdict("specs", "/no-such.css") ?? "", /is not served/, "a served address nothing serves");

  absent("references/scars.md");
  assert.equal(verdict(skill, "references/scars.md"), null, "relative to the citing directory");
  absent("specs/test/repo/comment-citations.test.ts");
  assert.equal(verdict("specs", "test/repo/comment-citations.test.ts"), null, "from the repo root, a slashed path no basename rule can save");
  assert.equal(byBasename.get("comment-citations.test.ts")?.length, 1);
  absent("specs/comment-citations.test.ts");
  assert.equal(verdict("specs", "comment-citations.test.ts"), null, "a unique basename");
  absent("out/no-such-probe.mjs");
  assert.equal(verdict(".", "out/no-such-probe.mjs"), null, "gitignored by design, on no one's disk");
  absent("public/explorer/chunks/no-such.js");
  assert.equal(verdict("specs", "/explorer/chunks/no-such.js"), null, "a served address the repo keeps out of git");
  assert.ok(existsSync(resolve(REPO, "public/living-chart.css")));
  assert.equal(verdict("specs", "/living-chart.css"), null, "a served address that exists");
  for (const name of ["project_vellum.md", "reference_x.md", "N-plan.md", ".test.ts"]) {
    assert.equal(byBasename.get(name), undefined, `${name} must exist nowhere for its rule to be the reason it passes`);
    assert.equal(verdict("specs", name), null, `${name}: a memory name or a placeholder`);
  }
});

test("extraction reads a backticked path with a tracked extension and nothing else", () => {
  const prose =
    "see `src/a.ts` and `hash-sync.ts`, not `Math.sin`, `public/<page>/index.css`, `public/**/index.css`, " +
    "`~/CodeProjects/CLAUDE.md`, `${dir}/x.ts`, `@scope/pkg.js`, `{a,b}.ts`, `docs/`, `.js` or src/plain.ts";
  assert.deepEqual(extractPaths(prose), ["src/a.ts", "hash-sync.ts"]);
});
