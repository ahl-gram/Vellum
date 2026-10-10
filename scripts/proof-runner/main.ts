import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { BRANCH_PREFIX, parseList, planJobs, type List } from "./list.ts";
import { branchBodies, buildList, type Mutation, type SuiteRules } from "./send.ts";

export const REPO = "ahl-gram/Vellum";
export const WORKFLOW_FILE = "proof-runner.yml";
export const WORKFLOW_NAME = "Proof runner";
const CMD_MS = 120_000;
const FIND_RUN_TRIES = 20;

export type RunView = { status: string; conclusion: string; headBranch: string; workflowName: string; url: string };
export type ReadPlan =
  | { action: "refuse"; reason: string }
  | { action: "wait"; status: string }
  | { action: "fetch"; deleteBranch: string | null; ok: boolean };

export const readPlan = (run: RunView, keep: boolean): ReadPlan => {
  if (run.workflowName !== WORKFLOW_NAME)
    return { action: "refuse", reason: `${run.url} is a ${run.workflowName} run, not a ${WORKFLOW_NAME} run` };
  if (!run.headBranch.startsWith(BRANCH_PREFIX))
    return { action: "refuse", reason: `${run.url} ran on ${run.headBranch}, not a ${BRANCH_PREFIX} branch` };
  if (run.status !== "completed") return { action: "wait", status: run.status };
  return { action: "fetch", deleteBranch: keep ? null : run.headBranch, ok: run.conclusion === "success" };
};

const sh = (cmd: string, args: string[], input?: string): string => {
  const r = spawnSync(cmd, args, { encoding: "utf8", input, timeout: CMD_MS });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed: ${r.stderr.trim() || r.stdout.trim()}`);
  return r.stdout.trim();
};
const api = (endpoint: string, body: object): string =>
  sh(
    "gh",
    ["api", "-X", "POST", `repos/${REPO}/${endpoint}`, "--input", "-", "--jq", ".sha // .object.sha"],
    JSON.stringify(body),
  );

const rulesAt = async (sha: string): Promise<SuiteRules> => {
  const dir = mkdtempSync(join(tmpdir(), "proof-runner-rules-"));
  try {
    const file = join(dir, "suites.mts");
    writeFileSync(file, sh("git", ["show", `${sha}:e2e/support/suites.ts`]));
    const m = (await import(pathToFileURL(file).href)) as {
      E2E_SUITE_ORDER: string[];
      NEEDS_PREDECESSOR: Record<string, string>;
      OPENS_ON_HOME: string[];
    };
    return { order: m.E2E_SUITE_ORDER, predecessor: m.NEEDS_PREDECESSOR, opensOnHome: m.OPENS_ON_HOME };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

const loadMutations = async (path: string): Promise<Mutation[]> =>
  path.endsWith(".json")
    ? (JSON.parse(readFileSync(path, "utf8")) as Mutation[])
    : ((await import(pathToFileURL(resolve(path)).href)) as { MUTATIONS: Mutation[] }).MUTATIONS;

const option = (args: string[], name: string): string | undefined => {
  const at = args.indexOf(name);
  return at === -1 ? undefined : args[at + 1];
};

const listFor = async (args: string[]): Promise<List> => {
  const raw = option(args, "--raw");
  if (raw !== undefined) return parseList(JSON.parse(readFileSync(raw, "utf8")));
  const sha = sh("git", ["rev-parse", option(args, "--sha") ?? "HEAD"]);
  const built = buildList(await loadMutations(args[0] ?? ""), sha, {
    repo: process.cwd(),
    read: (f) => sh("git", ["show", `${sha}:${f}`]),
    rules: await rulesAt(sha),
  });
  for (const w of built.warnings) console.warn(`warning: ${w}`);
  if (built.list === null) throw new Error(`nothing was sent:\n- ${built.errors.join("\n- ")}`);
  return built.list;
};

const findRun = (branch: string, printed: string): string => {
  const fromPrint = printed.match(/actions\/runs\/(\d+)/);
  if (fromPrint) return fromPrint[1]!;
  for (let i = 0; i < FIND_RUN_TRIES; i++) {
    const id = sh("gh", [
      "run",
      "list",
      "-R",
      REPO,
      "--workflow",
      WORKFLOW_FILE,
      "--branch",
      branch,
      "--json",
      "databaseId",
      "--jq",
      ".[0].databaseId // empty",
    ]);
    if (id !== "") return id;
    spawnSync("sleep", ["3"]);
  }
  throw new Error(`the run on ${branch} did not appear; look with gh run list --branch ${branch}`);
};

const send = async (args: string[]): Promise<number> => {
  const list = await listFor(args);
  const plan = planJobs(list);
  sh("gh", ["api", `repos/${REPO}/commits/${list.sha}`, "--jq", ".sha"]);
  const runner = sh("gh", ["api", `repos/${REPO}/commits/${option(args, "--runner") ?? "main"}`, "--jq", ".sha"]);
  const label = option(args, "--label") ?? `${list.sha.slice(0, 7)}-${Date.now()}`;
  const runnerTree = sh("gh", ["api", `repos/${REPO}/git/commits/${runner}`, "--jq", ".tree.sha"]);
  const blob = api("git/blobs", branchBodies.blob(`${JSON.stringify(list, null, 2)}\n`));
  const tree = api("git/trees", branchBodies.tree(runnerTree, blob));
  const commit = api("git/commits", branchBodies.commit(tree, runner, label));
  api("git/refs", branchBodies.ref(label, commit));
  const branch = `${BRANCH_PREFIX}${label}`;
  const id = findRun(branch, sh("gh", ["workflow", "run", WORKFLOW_FILE, "-R", REPO, "--ref", branch]));
  console.log(
    `sent ${list.entries.length} entries (${plan.jobs.length} jobs) at ${list.sha} on ${branch}, runner ${runner}\nrun ${id}: https://github.com/${REPO}/actions/runs/${id}\nread it with: npm run proof -- read ${id}`,
  );
  return 0;
};

const read = (args: string[]): number => {
  const id = args[0] ?? "";
  const run = JSON.parse(
    sh("gh", ["run", "view", id, "-R", REPO, "--json", "status,conclusion,headBranch,workflowName,url"]),
  ) as RunView;
  const plan = readPlan(run, args.includes("--keep"));
  if (plan.action === "refuse") throw new Error(plan.reason);
  if (plan.action === "wait") {
    console.log(`run ${id} is ${plan.status}; read it again when it has finished`);
    return 3;
  }
  const out = option(args, "--out") ?? mkdtempSync(join(tmpdir(), `proof-runner-${id}-`));
  sh("gh", ["run", "download", id, "-R", REPO, "-n", "ledger", "-D", out]);
  console.log(readFileSync(join(out, "ledger.md"), "utf8"));
  console.log(`ledger saved in ${out}`);
  if (plan.deleteBranch !== null) {
    sh("gh", ["api", "-X", "DELETE", `repos/${REPO}/git/refs/heads/${plan.deleteBranch}`]);
    console.log(`deleted ${plan.deleteBranch}`);
  }
  return plan.ok ? 0 : 1;
};

const USAGE =
  "usage: npm run proof -- send <mutations.ts|.json> [--sha <sha>] [--runner <ref>] [--label <label>]\n       npm run proof -- send --raw <proof.json> [--runner <ref>] [--label <label>]\n       npm run proof -- read <run-id> [--out <dir>] [--keep]";

const main = async (argv: string[]): Promise<number> => {
  const [command, ...args] = argv;
  if (command === "send") return send(args);
  if (command === "read") return read(args);
  console.error(USAGE);
  return 2;
};

if (import.meta.main) {
  process.exitCode = await main(process.argv.slice(2)).catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    return 1;
  });
}
