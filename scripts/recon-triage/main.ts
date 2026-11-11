import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { ensureCommit, gitTree, type Tree } from "../comment-judge/tree.ts";
import { parseArgs, sendFor, writeAll, type Args } from "../jev/cli.ts";
import { parseClaims } from "./claims.ts";
import { excerptOf } from "./excerpt.ts";
import { requestFor } from "./questions.ts";
import { replyLines, reportLines, requestLines } from "./report.ts";
import { parseTrialSet, scoreLines } from "./trial.ts";
import { askAll, RUN_INPUT_TOKEN_CAP, triage } from "./triage.ts";

const USAGE =
  "usage: npm run recon-triage -- rank <claims.jsonl> [--dry-run] [--out <dir>] | trial --out <dir> [--dry-run]";

const NOTES = [
  "# Issue #1310: the recon triage regression",
  "",
  "Look first at score.md: it sets this run's ranking of the 265 trial claims beside the trial's own at jev-1.14.0. requests.jsonl holds every request in the trial's own shape, so it compares line for line with the trial's, and replies.jsonl every reply.",
  "",
].join("\n");

const headOf = (repo: string): string => {
  const r = spawnSync("git", ["rev-parse", "HEAD"], { cwd: repo, encoding: "utf8", timeout: 30_000 });
  if (r.status !== 0) throw new Error(`git rev-parse HEAD failed: ${r.stderr.trim()}`);
  return r.stdout.trim();
};

const rank = async (repo: string, file: string, args: Args): Promise<number> => {
  const rows = parseClaims(readFileSync(file, "utf8"));
  const sha = headOf(repo);
  const triaged = await triage(rows, gitTree(repo, sha), sendFor(args.dryRun), RUN_INPUT_TOKEN_CAP);
  console.log(reportLines(sha, triaged).join("\n"));
  if (args.out !== null)
    writeAll(resolve(args.out), { "requests.jsonl": requestLines(triaged), "replies.jsonl": replyLines(triaged) });
  const failed = triaged.some((t) => t.route === "asked" && t.reply !== null && !t.reply.ok);
  return failed && !args.dryRun ? 1 : 0;
};

const trial = async (repo: string, out: string, args: Args): Promise<number> => {
  const rows = parseTrialSet(readFileSync(new URL("./trial-set.jsonl", import.meta.url), "utf8"));
  const trees = new Map<string, Tree>();
  for (const row of rows) {
    if (trees.has(row.sha)) continue;
    ensureCommit(repo, row.sha, row.sha);
    trees.set(row.sha, gitTree(repo, row.sha));
  }
  const requests = rows.map((r) => requestFor(r.claim, excerptOf(trees.get(r.sha)!, r.paths, r.symbols).code));
  writeAll(out, {
    "requests.jsonl": rows.map((r, i) => JSON.stringify({ issue: r.issue, claim: r.claim, request: requests[i] })),
  });
  if (args.dryRun) {
    const characters = requests.reduce((sum, request) => sum + JSON.stringify(request).length, 0);
    console.log(`dry run: ${requests.length} requests, ${characters} characters; nothing was sent`);
    return 0;
  }
  const replies = await askAll(requests, sendFor(false), RUN_INPUT_TOKEN_CAP);
  const score = scoreLines(rows, replies);
  writeAll(out, {
    "replies.jsonl": rows.map((r, i) => JSON.stringify({ issue: r.issue, verdict: r.verdict, reply: replies[i] })),
    "score.md": score,
  });
  writeFileSync(join(out, "notes.md"), NOTES);
  console.log(score.join("\n"));
  console.log(`score: ${join(out, "score.md")}`);
  return replies.some((reply) => !reply.ok) ? 1 : 0;
};

export const main = async (argv: readonly string[]): Promise<number> => {
  const args = parseArgs(argv);
  const [command, ...rest] = args?.positional ?? [];
  const repo = process.cwd();
  if (args !== null && command === "rank" && rest.length === 1) return rank(repo, resolve(repo, rest[0]!), args);
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
