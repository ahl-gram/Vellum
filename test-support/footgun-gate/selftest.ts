// The footgun hook's fixture table: `node test-support/footgun-gate/selftest.ts` prints one line per fixture and exits with the number of misses, and test/repo/footgun-gate.test.ts runs it under npm test.
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { decide, type Decision, type Payload } from "../../scripts/agent-infra/hooks/claude-adapter.ts";
import { gateText, statePath } from "../../scripts/agent-infra/hooks/gate-state.ts";
import { requiredHeadings } from "../../scripts/agent-infra/hooks/pr-body.ts";
import { CD_ROWS } from "./bare-cd.fixtures.ts";
import { codexChecks } from "./codex-rows.ts";
import { ESCAPE_ROWS } from "./escape.fixtures.ts";
import { GH_API_ROWS } from "./gh-api.fixtures.ts";
import { ROUTE_ROWS, SEQUENCE_ROWS } from "./gate-routes.fixtures.ts";
import {
  bash,
  bodyWith,
  edit,
  judged,
  LINK,
  NEEDLES,
  placed,
  ROOT,
  SCRATCH,
  SECTIONS,
  STASH_POP,
  WHOLE_BODY,
  type Fixture,
} from "./kit.ts";
import { CODE_ROWS } from "./markdown-code.fixtures.ts";
import { PR_BODY_ROWS } from "./pr-body.fixtures.ts";
import { SHELL_ROWS } from "./shell.fixtures.ts";
import { orderChecks, patchSizeCheck, sizeChecks } from "./size-probes.ts";

const TEMPLATE_PATH = join(ROOT, ".github", "PULL_REQUEST_TEMPLATE.md");
// A checkout of the hook with no .github/ beside it. The Claude adapter reads the template from the checkout it sits in, so this is the only way to drive decide() down the no-template path: an env override would be a seam that exists for the test, and calling headingCheck directly skips ghRefusal, which is where the warning could be returned in the wrong tuple slot.
const ROOTLESS = join(SCRATCH, "rootless");
const ROOTLESS_HOOK = join(ROOTLESS, ".claude", "skills", "vellum-footguns", "hooks", "footgun-gate.ts");
const OPERATION = join(SCRATCH, "operation-checkout");
const OPERATION_SKILL = "# a skill\n\n## Gate 1: the operation checkout's gate\n\nthe operation checkout's gate text\n";
const SETTINGS = JSON.parse(execFileSync("cat", [join(ROOT, ".claude", "settings.json")], { encoding: "utf8" })) as {
  hooks: { PreToolUse: { hooks: { command: string }[] }[] };
};
const WIRED = SETTINGS.hooks.PreToolUse[0]?.hooks[0]?.command ?? "";

export const readDeployed = (run: () => string): Decision => {
  let out: string;
  try {
    out = run();
  } catch (err) {
    const e = err as NodeJS.ErrnoException & { status?: number | null; stdout?: string };
    if (e.code === "EPIPE" && e.status === 0 && !e.stdout) return null; // the missing-project-dir wrapper runs `exit 0` without reading stdin, so our write races its exit: a clean exit with no output IS "no hook, no decision"
    throw err;
  }
  return out.trim() ? (JSON.parse(out) as Decision) : null;
};

const deployed = (payload: Payload, projectDir: string) => (): Decision =>
  readDeployed(() =>
    execFileSync("sh", ["-c", WIRED], {
      input: JSON.stringify(payload),
      encoding: "utf8",
      env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir },
    }),
  );

const DASH = String.fromCharCode(0x2014);
const filled = (text: string): string => text.replaceAll("<D>", DASH).replaceAll("<WHOLE>", WHOLE_BODY);
const codeFile = (row: number, k: number): string => `code-${row}-${k}.md`;
const CODE_FIXTURES: Fixture[] = CODE_ROWS.map(([name, command, bodies, want, needle], row): Fixture => [
  name,
  bash(
    filled(bodies.reduce((text, _, k) => text.replaceAll(`{${k}}`, codeFile(row, k)), command)),
    bodies.length ? SCRATCH : undefined,
  ),
  want,
  needle ? filled(needle) : want === "deny" ? "em-dash outside code" : want ? "## Gate 5" : "",
]);
const setProject = (dir: string | undefined): void => {
  if (dir === undefined) delete process.env.CLAUDE_PROJECT_DIR;
  else process.env.CLAUDE_PROJECT_DIR = dir;
};
const inProject = (payload: Payload, project: string | undefined) => async (): Promise<Decision> => {
  const before = process.env.CLAUDE_PROJECT_DIR;
  const session = `cd-${process.pid}`;
  setProject(project);
  try {
    return await decide({ ...payload, session_id: session });
  } finally {
    setProject(before);
    rmSync(statePath(session), { force: true });
  }
};
const PROJECTS: Record<string, string | undefined> = {
  "no project": undefined,
  "project via link": LINK,
  "project at home": homedir(),
};
const CD_FIXTURES: Fixture[] = CD_ROWS.map(([name, command, cwd, want, who]): Fixture => {
  const agent =
    who === "subagent"
      ? { agent_id: "a781" }
      : who === "with --agent"
        ? { agent_type: "vellum-implementer" }
        : who === "directory does not persist"
          ? { cwd_persists: false }
          : who === "directory persists"
            ? { cwd_persists: true }
            : {};
  const project = who !== undefined && who in PROJECTS ? PROJECTS[who] : cwd?.startsWith("<S>") ? SCRATCH : ROOT;
  return [
    name,
    inProject({ ...bash(placed(command), cwd === null ? undefined : placed(cwd)), ...agent }, project),
    want && "deny",
    NEEDLES[who ?? ""] ?? (want ? (NEEDLES[want] ?? "") : ""),
  ];
});
// The unlink is what lets the two rows share a session id: the gate is once per session, so without it the second row would see no Gate 5 and read as the warning having swallowed it. The FIXTURES loop's own unlink does not reach a function subject.
const inRootlessCheckout = (payload: Payload) => (): Decision => {
  const session = `rootless-${process.pid}`;
  try {
    return readDeployed(() =>
      execFileSync(process.execPath, [ROOTLESS_HOOK], {
        input: JSON.stringify({ ...payload, session_id: session }),
        encoding: "utf8",
      }),
    );
  } finally {
    try {
      unlinkSync(statePath(session));
    } catch {
      /* nothing was written when no gate fired */
    }
  }
};
const inLaunchCheckout = (payload: Payload) => (): Decision => {
  const session = `launch-${process.pid}`;
  try {
    return deployed({ ...payload, session_id: session }, ROOTLESS)();
  } finally {
    rmSync(statePath(session), { force: true });
  }
};
const ROUTE_FIXTURES: Fixture[] = ROUTE_ROWS.map(([name, tool, path, text, want, needle, absent]): Fixture => [
  name,
  edit(tool, placed(path), text),
  want,
  needle,
  absent,
]);
const lastOf = (payloads: Payload[], session: string) => async (): Promise<Decision> => {
  try {
    let last: Decision = null;
    for (const payload of payloads) last = await decide({ ...payload, session_id: session });
    return last;
  } finally {
    rmSync(statePath(session), { force: true });
  }
};
const SEQUENCE_FIXTURES: Fixture[] = SEQUENCE_ROWS.map(([name, paths, want, needle, absent]): Fixture => [
  name,
  lastOf(
    paths.map((p) => edit("Edit", placed(p), "x")),
    `route-${process.pid}-${name}`,
  ),
  want,
  needle,
  absent,
]);

const DEPLOYED_ROWS: Fixture[] = [
  // decide() down the real no-template path, not headingCheck in isolation: these two are the only rows that can see a warning returned through ghRefusal's DECISION slot, which short-circuits checkBash before the Gate 5 note is pushed.
  [
    "a checkout with no template warns through the deployed path",
    inRootlessCheckout(bash(`gh pr create --body '${WHOLE_BODY}'`)),
    "context",
    "there is no PR template",
  ],
  [
    "a checkout with no template still shows gate 5",
    inRootlessCheckout(bash(`gh pr create --body '${WHOLE_BODY}'`)),
    "context",
    "## Gate 5",
  ],
  [
    "the launch checkout's gate text wins over the edited checkout's",
    inLaunchCheckout({ ...edit("Edit", join(OPERATION, "test", "x.test.ts"), "x"), cwd: OPERATION }),
    "context",
    "## Gate 1: before writing a test or a guard",
    "the operation checkout's gate",
  ],
  ["deployed: real project dir denies stash pop", deployed(STASH_POP, ROOT), "deny", "shared"],
  ["deployed: symlinked project dir denies stash pop", deployed(STASH_POP, LINK), "deny", "shared"],
  ["deployed: missing project dir exits 0 with no output", deployed(STASH_POP, "/nonexistent"), null, ""],
];

const FIXTURES: Fixture[] = [
  ...SHELL_ROWS,
  ...CODE_FIXTURES,
  ...CD_FIXTURES,
  ...GH_API_ROWS,
  ...PR_BODY_ROWS,
  ...ESCAPE_ROWS,
  ...ROUTE_FIXTURES,
  ...SEQUENCE_FIXTURES,
  ...DEPLOYED_ROWS,
];

const run = async (): Promise<number> => {
  let fails = 0;
  const report = (ok: boolean, line: string): void => {
    fails += ok ? 0 : 1;
    console.log(`${ok ? "ok  " : "FAIL"} ${line}`);
  };
  mkdirSync(SCRATCH, { recursive: true });
  writeFileSync(join(SCRATCH, "body.md"), "a — b\n");
  writeFileSync(join(SCRATCH, "headingless.md"), "# a template with no sections\n\nprose only.\n");
  writeFileSync(join(SCRATCH, "no-ran.md"), bodyWith(SECTIONS.filter((x) => x !== "## Ran")));
  writeFileSync(join(SCRATCH, "whole.md"), WHOLE_BODY);
  CODE_ROWS.forEach(([, , bodies], row) =>
    bodies.forEach((body, k) => writeFileSync(join(SCRATCH, codeFile(row, k)), filled(body))),
  );
  mkdirSync(dirname(ROOTLESS_HOOK), { recursive: true });
  cpSync(join(ROOT, ".claude", "skills", "vellum-footguns", "hooks", "footgun-gate.ts"), ROOTLESS_HOOK);
  cpSync(join(ROOT, "scripts", "agent-infra", "hooks"), join(ROOTLESS, "scripts", "agent-infra", "hooks"), {
    recursive: true,
  });
  cpSync(
    join(ROOT, ".claude", "skills", "vellum-footguns", "SKILL.md"),
    join(ROOTLESS, ".claude", "skills", "vellum-footguns", "SKILL.md"),
  );
  symlinkSync(ROOT, LINK);
  mkdirSync(join(OPERATION, ".claude", "skills", "vellum-footguns"), { recursive: true });
  writeFileSync(join(OPERATION, ".claude", "skills", "vellum-footguns", "SKILL.md"), OPERATION_SKILL);
  for (const dir of ["a dir", ".claude/worktrees/orch-779", "out/762/baseline-phone"])
    mkdirSync(join(SCRATCH, dir), { recursive: true });
  symlinkSync(join(SCRATCH, "a dir"), join(SCRATCH, "to-a-dir"));
  for (const label of ["Gate 1", "Gate 2", "Gate 3", "Gate 4", "Gate 5", "Gate 6", "Gate 7"])
    report(gateText(ROOT, label).length > 200, `${label} text found in SKILL.md`);
  await sizeChecks(report);
  await orderChecks(report);
  report(requiredHeadings(TEMPLATE_PATH) !== null, "section names found in .github/PULL_REQUEST_TEMPLATE.md");
  report(
    !readFileSync(TEMPLATE_PATH, "utf8").includes("—"),
    "the PR template carries no em-dash to prefill a body with",
  );
  for (const [name, subject, want, needle, absent] of FIXTURES) {
    const sessionId = `selftest-${process.pid}-${name}`;
    const got = typeof subject === "function" ? await subject() : await decide({ ...subject, session_id: sessionId });
    const [ok, line] = judged(got, want, needle, absent);
    report(ok, `${name}: ${line}`);
    try {
      unlinkSync(statePath(sessionId));
    } catch {
      /* nothing was written for a null decision */
    }
  }
  await codexChecks(report, FIXTURES);
  await patchSizeCheck(report);
  rmSync(SCRATCH, { recursive: true, force: true });
  return fails;
};

if (import.meta.main) process.exit(await run());
