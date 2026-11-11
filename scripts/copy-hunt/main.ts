import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { ensureCommit, gitTree, type Tree } from "../comment-judge/tree.ts";
import { parseArgs, sendFor, writeAll, type Args } from "../jev/cli.ts";
import { ACCEPTED_COPIES } from "./accepted-copies.ts";
import { functionsIn, type Fn } from "./functions.ts";
import { askPair, RUN_INPUT_TOKEN_CAP, type Found, type HuntOptions, type Run } from "./hunt.ts";
import { jaccard } from "./pairs.ts";
import { pairLines, replyLines, reportLines, requestLines } from "./report.ts";
import { diffRun, fullRun } from "./runs.ts";
import { CONTROL, SCAN, TRIAL_ROWS } from "./trial-set.ts";
import { locate, scoreLines, type Scored } from "./trial.ts";

const USAGE =
  "usage: npm run copy-hunt -- diff <base> <head> [--dry-run] [--out <dir>] | full [<sha>] [--dry-run] [--out <dir>] | trial --out <dir> [--dry-run]";

const NOTES =
  "# Issue #1319: the copy hunt's regression\n\nLook first at trial.md: it sets this run's answers to the trial's 24 pairs beside the scan's at jev-1.14.0. requests.jsonl holds every request as built and replies.jsonl every reply.\n";

const optionsFor = (args: Args): HuntOptions => ({
  send: sendFor(args.dryRun),
  cap: RUN_INPUT_TOKEN_CAP,
  accepted: ACCEPTED_COPIES,
});

const finish = (run: Run, args: Args): number => {
  console.log(reportLines(run).join("\n"));
  if (args.out !== null)
    writeAll(resolve(args.out), {
      "requests.jsonl": requestLines(run.found),
      "replies.jsonl": replyLines(run.found),
      "pairs.jsonl": pairLines(run.found),
    });
  return !args.dryRun && run.found.some((f) => f.outcome.kind === "skipped") ? 1 : 0;
};

const trial = async (repo: string, out: string, args: Args): Promise<number> => {
  ensureCommit(repo, SCAN, SCAN);
  ensureCommit(repo, CONTROL, CONTROL);
  const trees = new Map<string, Tree>();
  const reads = new Map<string, readonly Fn[]>();
  const fnsAt = (sha: string, file: string): readonly Fn[] => {
    const key = `${sha} ${file}`;
    const known = reads.get(key);
    if (known !== undefined) return known;
    const tree = trees.get(sha) ?? gitTree(repo, sha);
    trees.set(sha, tree);
    const fns = functionsIn(file, tree.read(file));
    reads.set(key, fns);
    return fns;
  };
  const send = sendFor(args.dryRun);
  const scored: Scored[] = [];
  let spent = 0;
  for (const row of TRIAL_ROWS) {
    const x = locate(fnsAt(row.sha, row.a.file), row.sha, row.a);
    const y = locate(fnsAt(row.sha, row.b.file), row.sha, row.b);
    const asked = await askPair(x, y, send, spent, RUN_INPUT_TOKEN_CAP);
    spent += asked.tokens;
    const found: Found = {
      x,
      y,
      similarity: jaccard(x.tokens, y.tokens),
      requests: asked.requests,
      replies: asked.replies,
      outcome: asked.outcome,
    };
    scored.push({ row, found });
  }
  const founds = scored.map((s) => s.found);
  const lines = scoreLines(scored);
  writeAll(out, { "trial.md": lines, "requests.jsonl": requestLines(founds), "replies.jsonl": replyLines(founds) });
  writeFileSync(join(out, "notes.md"), NOTES);
  console.log(lines.join("\n"));
  console.log(`score: ${join(out, "trial.md")}`);
  return !args.dryRun && founds.some((f) => f.outcome.kind === "skipped") ? 1 : 0;
};

export const main = async (argv: readonly string[]): Promise<number> => {
  const args = parseArgs(argv);
  const [command, ...rest] = args?.positional ?? [];
  const repo = process.cwd();
  if (args !== null && command === "diff" && rest.length === 2)
    return finish(await diffRun(repo, rest[0]!, rest[1]!, optionsFor(args)), args);
  if (args !== null && command === "full" && rest.length <= 1)
    return finish(await fullRun(repo, rest[0] ?? "HEAD", optionsFor(args)), args);
  if (args !== null && command === "trial" && rest.length === 0 && args.out !== null)
    return trial(repo, resolve(args.out), args);
  console.error(USAGE);
  return 2;
};

if (import.meta.main) {
  process.exitCode = await main(process.argv.slice(2)).catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : String(err));
    return 1;
  });
}
