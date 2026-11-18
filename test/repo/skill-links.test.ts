import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { frontMatterOf, topLevelScalar } from "../../test-support/front-matter.ts";

const REPO = resolve(import.meta.dirname, "..", "..");
const AUTHORED = ".claude/skills";
const EXPOSED = ".agents/skills";
const LINK_MODE = "120000";
// 2026-11-18: this git ls-files answers in under 5 ms on a Mac; thirty seconds is a cap on a hang, not a budget.
const GIT_TIMEOUT_MS = 30_000;

type IndexEntry = { readonly mode: string; readonly path: string };

const linkText = (name: string): string => `../../${AUTHORED}/${name}`;

function indexEntries(root: string): readonly IndexEntry[] {
  const listing = spawnSync("git", ["ls-files", "-s", "-z", "--", AUTHORED, EXPOSED], {
    cwd: root,
    encoding: "utf8",
    timeout: GIT_TIMEOUT_MS,
  });
  assert.equal(listing.status, 0, `git ls-files failed: ${listing.error?.message ?? listing.stderr}`);
  return listing.stdout
    .split("\0")
    .filter(Boolean)
    .map((line) => ({ mode: line.slice(0, line.indexOf(" ")), path: line.slice(line.indexOf("\t") + 1) }));
}

function repoIndex(): { readonly skills: readonly string[]; readonly links: readonly IndexEntry[] } {
  const entries = indexEntries(REPO);
  const skills = entries
    .map((e) => e.path.split("/"))
    .filter((parts) => parts.length === 4 && `${parts[0]}/${parts[1]}` === AUTHORED && parts[3] === "SKILL.md")
    .map((parts) => parts[2] ?? "");
  assert.ok(skills.length > 0, `git listed no SKILL.md under ${AUTHORED}/, so this test would read nothing`);
  return { skills, links: entries.filter((e) => e.path.startsWith(`${EXPOSED}/`)) };
}

function rosterProblems(skills: readonly string[], links: readonly IndexEntry[]): readonly string[] {
  const wanted = skills.map((name) => `${EXPOSED}/${name}`);
  return [
    ...wanted.filter((path) => !links.some((l) => l.path === path)).map((path) => `${path} is not tracked`),
    ...links
      .filter((l) => !wanted.includes(l.path))
      .map((l) => `${l.path} is tracked but names no skill under ${AUTHORED}/`),
    ...links
      .filter((l) => wanted.includes(l.path) && l.mode !== LINK_MODE)
      .map((l) => `${l.path} is committed as mode ${l.mode}, not as a link (${LINK_MODE})`),
  ];
}

function exposureProblems(root: string, skills: readonly string[]): readonly string[] {
  return skills.flatMap((name) => {
    const link = join(root, EXPOSED, name);
    const stat = lstatSync(link, { throwIfNoEntry: false });
    if (stat === undefined) return [`${EXPOSED}/${name} is missing`];
    if (!stat.isSymbolicLink()) return [`${EXPOSED}/${name} is not a link`];
    const text = readlinkSync(link);
    if (text !== linkText(name)) return [`${EXPOSED}/${name} points at ${text}, not ${linkText(name)}`];
    if (!existsSync(link)) return [`${EXPOSED}/${name} does not resolve, since ${AUTHORED}/${name} is missing`];
    return [];
  });
}

function frontMatterProblems(root: string, skills: readonly string[]): readonly string[] {
  return skills.flatMap((name) => {
    const file = `${EXPOSED}/${name}/SKILL.md`;
    try {
      const frontMatter = frontMatterOf(readFileSync(join(root, file), "utf8"));
      if (frontMatter === null) return [`${file} has no front matter`];
      const problems: string[] = [];
      if (topLevelScalar(frontMatter, "name") !== name) problems.push(`${file} does not give its name as ${name}`);
      if ((topLevelScalar(frontMatter, "description") ?? "").trim() === "") problems.push(`${file} has no description`);
      return problems;
    } catch (error) {
      return [`${file} cannot be read through its link: ${error instanceof Error ? error.message : String(error)}`];
    }
  });
}

function inTree(skills: readonly string[], run: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "skill-links-"));
  try {
    mkdirSync(join(root, EXPOSED), { recursive: true });
    for (const name of skills) {
      mkdirSync(join(root, AUTHORED, name), { recursive: true });
      writeFileSync(
        join(root, AUTHORED, name, "SKILL.md"),
        `---\nname: ${name}\ndescription: The ${name} skill.\n---\n`,
      );
    }
    run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const link = (root: string, name: string, text: string = linkText(name)): void =>
  symlinkSync(text, join(root, EXPOSED, name));

test("every skill under .claude/skills/ has one tracked link at .agents/skills/<name>, committed as a link, and nothing else is tracked there", () => {
  const { skills, links } = repoIndex();
  assert.deepEqual(
    rosterProblems(skills, links),
    [],
    `each skill folder under ${AUTHORED}/ owes Codex a link: ln -s ../../${AUTHORED}/<name> ${EXPOSED}/<name>, then git add it (handbook/specs/conventions.md, Where a rule lives)`,
  );
});

test("the roster check refuses a skill with no link, a tracked path that names no skill, and a link committed as a file or a folder", () => {
  const entry = (name: string, mode: string = LINK_MODE): IndexEntry => ({ mode, path: `${EXPOSED}/${name}` });
  assert.deepEqual(rosterProblems(["a", "b"], [entry("a"), entry("b")]), []);
  assert.deepEqual(rosterProblems(["a", "b"], [entry("a")]), [".agents/skills/b is not tracked"]);
  assert.deepEqual(rosterProblems(["a"], [entry("a"), entry("z")]), [
    ".agents/skills/z is tracked but names no skill under .claude/skills/",
  ]);
  assert.deepEqual(rosterProblems(["a"], [entry("a", "100644")]), [
    ".agents/skills/a is committed as mode 100644, not as a link (120000)",
  ]);
  assert.deepEqual(rosterProblems(["a"], [entry("a/SKILL.md", "100644")]), [
    ".agents/skills/a is not tracked",
    ".agents/skills/a/SKILL.md is tracked but names no skill under .claude/skills/",
  ]);
});

test("each link is the relative path ../../.claude/skills/<name> and resolves to that skill's folder", () => {
  const { skills } = repoIndex();
  assert.deepEqual(exposureProblems(REPO, skills), []);
});

test("the link check refuses a missing link, a copied folder, an absolute link, another skill's path and a link whose skill folder is gone", () => {
  inTree(["a"], (root) => {
    link(root, "a");
    assert.deepEqual(exposureProblems(root, ["a"]), []);
  });
  inTree(["a"], (root) => {
    assert.deepEqual(exposureProblems(root, ["a"]), [".agents/skills/a is missing"]);
  });
  inTree(["a"], (root) => {
    mkdirSync(join(root, EXPOSED, "a"));
    assert.deepEqual(exposureProblems(root, ["a"]), [".agents/skills/a is not a link"]);
  });
  inTree(["a"], (root) => {
    const absolute = join(root, AUTHORED, "a");
    link(root, "a", absolute);
    assert.deepEqual(exposureProblems(root, ["a"]), [
      `.agents/skills/a points at ${absolute}, not ../../.claude/skills/a`,
    ]);
  });
  inTree(["a", "b"], (root) => {
    link(root, "a", linkText("b"));
    assert.deepEqual(exposureProblems(root, ["a"]), [
      ".agents/skills/a points at ../../.claude/skills/b, not ../../.claude/skills/a",
    ]);
  });
  inTree([], (root) => {
    link(root, "a");
    assert.deepEqual(exposureProblems(root, ["a"]), [
      ".agents/skills/a does not resolve, since .claude/skills/a is missing",
    ]);
  });
});

test("each skill read through its link opens with front matter giving the link's name and a description that is not empty", () => {
  const { skills } = repoIndex();
  assert.deepEqual(frontMatterProblems(REPO, skills), []);
});

test("the front matter check refuses a missing description, an empty one, another name, no front matter and a link it cannot read through", () => {
  const withSkill = (text: string): readonly string[] => {
    let problems: readonly string[] = [];
    inTree(["a"], (root) => {
      writeFileSync(join(root, AUTHORED, "a", "SKILL.md"), text);
      link(root, "a");
      problems = frontMatterProblems(root, ["a"]);
    });
    return problems;
  };
  assert.deepEqual(withSkill("---\nname: a\ndescription: The a skill.\n---\n"), []);
  assert.deepEqual(withSkill("---\nname: a\n---\n"), [".agents/skills/a/SKILL.md has no description"]);
  assert.deepEqual(withSkill('---\nname: a\ndescription: ""\n---\n'), [".agents/skills/a/SKILL.md has no description"]);
  assert.deepEqual(withSkill("---\nname: b\ndescription: The a skill.\n---\n"), [
    ".agents/skills/a/SKILL.md does not give its name as a",
  ]);
  assert.deepEqual(withSkill("# a\n"), [".agents/skills/a/SKILL.md has no front matter"]);
  inTree([], (root) => {
    link(root, "a");
    const problems = frontMatterProblems(root, ["a"]);
    assert.equal(problems.length, 1);
    assert.match(problems[0] ?? "", /^\.agents\/skills\/a\/SKILL\.md cannot be read through its link: ENOENT/);
  });
});

test("the front matter reader takes a top-level key's plain, double-quoted or single-quoted value, and never an indented, longer or absent key", () => {
  assert.equal(topLevelScalar("name: a\ndescription: plain words\n", "description"), "plain words");
  assert.equal(topLevelScalar('description: "a colon: and \\"marks\\""\n', "description"), 'a colon: and "marks"');
  assert.equal(topLevelScalar("description: 'it''s single'\n", "description"), "it's single");
  assert.equal(topLevelScalar('description: ""\n', "description"), "");
  assert.equal(topLevelScalar("description:   padded   \n", "description"), "padded");
  assert.equal(topLevelScalar("meta:\n  description: nested\n", "description"), null);
  assert.equal(topLevelScalar("descriptions: longer key\n", "description"), null);
  assert.equal(topLevelScalar("name: a\n", "description"), null);
});
