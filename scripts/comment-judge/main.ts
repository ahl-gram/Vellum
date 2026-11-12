import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs, processDeps, runCommand, writeAll, type Args, type SendFor } from "../jev/cli.ts";
import { isTsUnderLintRoots } from "../../test-support/lint-roots.ts";
import { addedRuns } from "./collect.ts";
import { judgeAll, RUN_INPUT_TOKEN_CAP, type Judged } from "./judge.ts";
import { replyLines, reportLines, requestLines } from "./report.ts";
import { TRIAL_REFS, TRIAL_ROWS } from "./trial-set.ts";
import { locateRun, scoreLines } from "./trial.ts";
import { changedFiles, ensureCommit, gitTree, mergeBase, type Tree } from "./tree.ts";
import type { CommentRun } from "./types.ts";

const USAGE =
  "usage: npm run comment-judge -- diff <base> <head> [--dry-run] [--out <dir>] | trial --out <dir> [--dry-run]";

const NOTES = [
  "# Issue #1304: the comment trial",
  "",
  "Look first at trial.md: its first table sets the check's findings against what the two comment sweeps did, and its second asks whether each test PR #548's sweep named was found and answered yes. requests.jsonl holds every request as built and replies.jsonl every reply, so any row can be sent again.",
  "",
].join("\n");

const exitFor = (judged: readonly Judged[], dryRun: boolean): number =>
  !dryRun && judged.some((j) => j.outcome.kind === "skipped") ? 1 : 0;

const diff = async (repo: string, base: string, head: string, args: Args, sendFor: SendFor): Promise<number> => {
  const from = mergeBase(repo, base, head);
  const before = gitTree(repo, from);
  const after = gitTree(repo, head);
  const items = changedFiles(repo, from, head)
    .filter((c) => isTsUnderLintRoots(c.path))
    .flatMap((c) =>
      addedRuns(c.path, c.before === null ? null : before.read(c.before), after.read(c.path)).map((run) => ({
        tree: after,
        run,
      })),
    );
  const judged = await judgeAll(items, sendFor(args.dryRun), RUN_INPUT_TOKEN_CAP);
  console.log(reportLines(judged, args.dryRun).join("\n"));
  if (args.out !== null)
    writeAll(args.out, { "requests.jsonl": requestLines(judged), "replies.jsonl": replyLines(judged) });
  return exitFor(judged, args.dryRun);
};

const trial = async (repo: string, out: string, args: Args, sendFor: SendFor): Promise<number> => {
  const trees = new Map<string, Tree>();
  for (const row of TRIAL_ROWS) {
    if (trees.has(row.sha)) continue;
    ensureCommit(repo, row.sha, TRIAL_REFS[row.sha]!);
    trees.set(row.sha, gitTree(repo, row.sha));
  }
  const items = TRIAL_ROWS.map((row, i) => {
    const tree = trees.get(row.sha)!;
    const run: CommentRun | null = locateRun(tree, row.file, row.line);
    if (run === null) throw new Error(`trial row ${i + 1}: no comment covers ${row.file}:${row.line} at ${row.sha}`);
    return { tree, run };
  });
  const judged = await judgeAll(items, sendFor(args.dryRun), RUN_INPUT_TOKEN_CAP);
  const scored = TRIAL_ROWS.map((row, i) => ({ row, judged: judged[i]! }));
  writeAll(out, {
    "trial.md": scoreLines(scored),
    "requests.jsonl": requestLines(judged),
    "replies.jsonl": replyLines(judged),
  });
  writeFileSync(join(out, "notes.md"), NOTES);
  console.log(reportLines(judged, args.dryRun).join("\n"));
  console.log(`score: ${join(out, "trial.md")}`);
  return exitFor(judged, args.dryRun);
};

export const main = async (argv: readonly string[], sendFor: SendFor): Promise<number> => {
  const args = parseArgs(argv);
  const [command, ...rest] = args?.positional ?? [];
  const repo = process.cwd();
  if (args !== null && command === "diff" && rest.length === 2) return diff(repo, rest[0]!, rest[1]!, args, sendFor);
  if (args !== null && command === "trial" && rest.length === 0 && args.out !== null)
    return trial(repo, resolve(args.out), args, sendFor);
  console.error(USAGE);
  return 2;
};

if (import.meta.main) process.exitCode = await runCommand("comment-judge", main, process.argv.slice(2), processDeps());
