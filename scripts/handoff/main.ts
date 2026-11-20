import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { loadModelPolicy, resolveModel } from "../agent-infra/model-policy.ts";
import { ROLES } from "../agent-infra/roles.ts";
import { createPlan, resolveRoot, runPlan } from "../agent-sandbox.ts";
import { buildArgv, buildEnv, outcomeOf, resumeArgv, runCodex, threadOf } from "./launch.ts";
import { nextStep } from "./next.ts";
import { buildPrompt, resumePrompt } from "./prompt.ts";
import { isRunning, snapshotOf, LIVE_GH, type GhReads } from "./snapshot.ts";
import {
  FILES,
  folderOf,
  lastRun,
  readState,
  runFiles,
  treeOf,
  writeState,
  type HandoffState,
  type RunRecord,
} from "./state.ts";

export const USAGE =
  "usage: npm run handoff -- next <issue> | build <issue> --plan <path> --session <link> | resume <issue> --brief <path> [--plan <path>]";

const HERE_ROOT = resolve(import.meta.dirname, "..", "..");

type Env = Readonly<Record<string, string | undefined>>;
type Parsed = { readonly command: string; readonly issue: number; readonly flags: ReadonlyMap<string, string> };

const parse = (argv: readonly string[]): Parsed | null => {
  const [command, word, ...rest] = argv;
  if (command === undefined || word === undefined || !/^[1-9]\d*$/.test(word) || rest.length % 2 !== 0) return null;
  const flags = new Map<string, string>();
  for (let at = 0; at < rest.length; at += 2) {
    const name = rest[at] ?? "";
    if (!name.startsWith("--")) return null;
    flags.set(name.slice(2), rest[at + 1] ?? "");
  }
  return { command, issue: Number(word), flags };
};

const isFile = (path: string | undefined): path is string => {
  if (path === undefined || !isAbsolute(path)) return false;
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
};

const statSafe = (path: string): boolean => {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
};

const refuse = (reason: string): number => {
  console.error(reason);
  return 2;
};

const finish = (state: HandoffState, n: number, exit: number, stream: string): HandoffState => ({
  ...state,
  thread: state.thread ?? threadOf(readFileSync(stream, "utf8")),
  runs: state.runs.map((run): RunRecord => (run.n === n ? { ...run, ended: new Date().toISOString(), exit } : run)),
});

const closing = (issue: number, n: number, exit: number, last: string): string => {
  let text: string | null = null;
  try {
    text = readFileSync(last, "utf8");
  } catch {
    /* no last message was written */
  }
  const outcome = text === null ? null : outcomeOf(text);
  return `run ${n} ended, exit ${exit}, ${outcome === null ? "no outcome line" : `OUTCOME: ${outcome}`}; next: npm run handoff -- next ${issue}`;
};

const writeIssueFiles = (folder: string, issue: number, gh: GhReads): void => {
  const issueText = gh.issueJson(issue);
  const commentsText = gh.commentsJsonl(issue);
  mkdirSync(join(folder, FILES.ghEmpty), { recursive: true });
  writeFileSync(join(folder, FILES.issue), issueText);
  writeFileSync(join(folder, FILES.comments), commentsText);
};

const build = async (p: Parsed, root: string, env: Env, gh: GhReads): Promise<number> => {
  const { issue } = p;
  const plan = p.flags.get("plan");
  const session = p.flags.get("session") ?? "";
  const folder = folderOf(root, issue);
  const tree = treeOf(root, issue);
  if (!isFile(plan)) return refuse("--plan must be the absolute path of the finished plan file");
  if (session === "") return refuse("--session must be the dispatching session's link");
  if (readState(folder) !== null) {
    return refuse(`Issue #${issue} already has a build record in ${folder}; run npm run handoff -- next ${issue}`);
  }
  if (statSafe(tree)) return refuse(`${tree} already exists; retire it before building Issue #${issue} again`);
  const { model, effort } = resolveModel(loadModelPolicy(HERE_ROOT, ROLES), "codex-local", "vellum-implementer");
  const issueText = gh.issueJson(issue);
  const commentsText = gh.commentsJsonl(issue);
  runPlan(createPlan(tree, "origin/main", false), root, tree);
  mkdirSync(join(folder, FILES.ghEmpty), { recursive: true });
  writeFileSync(join(folder, FILES.issue), issueText);
  writeFileSync(join(folder, FILES.comments), commentsText);
  const first: RunRecord = {
    n: 1,
    kind: "build",
    started: new Date().toISOString(),
    pid: process.pid,
    ended: null,
    exit: null,
  };
  const state: HandoffState = { issue, plan, tree, session, model, effort, thread: null, runs: [first] };
  writeState(folder, state);
  const files = runFiles(folder, 1);
  console.log(`follow it: tail -f ${files.stream}`);
  const exit = await runCodex(
    buildArgv({ tree, model, effort, last: files.last, prompt: buildPrompt({ issue, plan, tree, folder, session }) }),
    { cwd: tree, env: buildEnv(env, issue, join(folder, FILES.ghEmpty)), stream: files.stream, stderr: files.stderr },
  );
  writeState(folder, finish(state, 1, exit, files.stream));
  console.log(closing(issue, 1, exit, files.last));
  return exit;
};

const resume = async (p: Parsed, root: string, env: Env, gh: GhReads): Promise<number> => {
  const { issue } = p;
  const folder = folderOf(root, issue);
  const state = readState(folder);
  if (state === null) return refuse(`Issue #${issue} has no build record in ${folder}; there is nothing to resume`);
  const brief = p.flags.get("brief");
  const plan = p.flags.get("plan");
  if (!isFile(brief)) return refuse("--brief must be the absolute path of the brief file");
  if (plan !== undefined && !isFile(plan)) return refuse("--plan must be the absolute path of the revised plan file");
  if (isRunning(lastRun(state))) return refuse(`Issue #${issue}'s last run is still running`);
  if (state.thread === null) return refuse(`Issue #${issue}'s build never started a thread, so it cannot be resumed`);
  if (!statSafe(state.tree)) return refuse(`${state.tree} is gone, so Issue #${issue}'s build cannot be resumed`);
  writeIssueFiles(folder, issue, gh);
  const n = state.runs.length + 1;
  const run: RunRecord = {
    n,
    kind: "resume",
    started: new Date().toISOString(),
    pid: process.pid,
    ended: null,
    exit: null,
  };
  const next: HandoffState = { ...state, plan: plan ?? state.plan, runs: [...state.runs, run] };
  writeState(folder, next);
  const files = runFiles(folder, n);
  console.log(`follow it: tail -f ${files.stream}`);
  const exit = await runCodex(
    resumeArgv({
      thread: state.thread,
      model: state.model,
      effort: state.effort,
      last: files.last,
      prompt: resumePrompt({ issue, brief, folder }),
    }),
    {
      cwd: state.tree,
      env: buildEnv(env, issue, join(folder, FILES.ghEmpty)),
      stream: files.stream,
      stderr: files.stderr,
    },
  );
  writeState(folder, finish(next, n, exit, files.stream));
  console.log(closing(issue, n, exit, files.last));
  return exit;
};

export const main = async (argv: readonly string[], cwd: string, env: Env, gh: GhReads): Promise<number> => {
  const parsed = parse(argv);
  if (parsed === null || !["next", "build", "resume"].includes(parsed.command)) {
    console.error(USAGE);
    return 1;
  }
  try {
    const root = resolveRoot(cwd);
    if (parsed.command === "next") {
      console.log(nextStep(snapshotOf(parsed.issue, root, gh)).text);
      return 0;
    }
    return await (parsed.command === "build" ? build(parsed, root, env, gh) : resume(parsed, root, env, gh));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
};

if (import.meta.main) process.exitCode = await main(process.argv.slice(2), process.cwd(), process.env, LIVE_GH);
