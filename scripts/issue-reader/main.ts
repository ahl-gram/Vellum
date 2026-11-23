import { execFileSync } from "node:child_process";
import { renderJson, renderText } from "./render.ts";
import { isPullRequest, parseLines, threadOf } from "./thread.ts";

export const REPO = "ahl-gram/Vellum";
export const USAGE = "usage: npm run --silent issue -- <number> [--json]";

export type ReaderReads = {
  readonly issue: (n: number) => string;
  readonly listing: (path: string) => string;
};

export type ReaderRun = { readonly stdout: string; readonly stderr: string; readonly code: number };

const TIMEOUT_MS = 120_000;
const gh = (args: readonly string[]): string =>
  execFileSync("gh", [...args], { encoding: "utf8", timeout: TIMEOUT_MS, stdio: ["ignore", "pipe", "pipe"] });

export const LIVE_READS: ReaderReads = {
  issue: (n) => gh(["api", `repos/${REPO}/issues/${n}`]),
  listing: (path) => gh(["api", "--paginate", `repos/${REPO}/${path}`, "--jq", ".[] | tojson"]),
};

const reasonOf = (error: unknown): string => {
  const stderr = (error as { stderr?: unknown }).stderr;
  const first = String(stderr ?? "")
    .split("\n")
    .find((line) => line.trim() !== "");
  return first ?? (error instanceof Error ? error.message : String(error));
};

const refused = (what: string, error: unknown): ReaderRun => ({
  stdout: "",
  stderr: `issue reader: reading ${what} failed: ${reasonOf(error)}\n`,
  code: 1,
});

export const readIssue = (argv: readonly string[], reads: ReaderReads): ReaderRun => {
  const words = argv.filter((word) => word !== "--json");
  const [word] = words;
  if (argv.length - words.length > 1 || words.length !== 1 || word === undefined || !/^[1-9]\d*$/.test(word)) {
    return { stdout: "", stderr: `${USAGE}\n`, code: 2 };
  }
  const n = Number(word);
  let issue: unknown;
  try {
    issue = JSON.parse(reads.issue(n));
  } catch (error) {
    return refused(`issue ${n}`, error);
  }
  const paths = [`issues/${n}/comments`, ...(isPullRequest(issue) ? [`pulls/${n}/reviews`, `pulls/${n}/comments`] : [])];
  const lists: unknown[][] = [];
  for (const path of paths) {
    try {
      lists.push(parseLines(reads.listing(path)));
    } catch (error) {
      return refused(path, error);
    }
  }
  const thread = threadOf({
    issue,
    comments: lists[0] ?? [],
    reviews: lists[1] ?? [],
    reviewComments: lists[2] ?? [],
  });
  return { stdout: argv.includes("--json") ? renderJson(thread) : renderText(thread), stderr: "", code: 0 };
};

if (import.meta.main) {
  const run = readIssue(process.argv.slice(2), LIVE_READS);
  process.stdout.write(run.stdout);
  process.stderr.write(run.stderr);
  process.exitCode = run.code;
}
