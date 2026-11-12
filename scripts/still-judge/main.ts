import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { shootAll } from "../design/shoot.ts";
import { parseArgs, processDeps, runCommand, writeAll, type Args, type SendFor } from "../jev/cli.ts";
import { askAll } from "../recon-triage/triage.ts";
import { askStills } from "./compare.ts";
import { isKind, requestFor, type Kind } from "./questions.ts";
import { compareLines, loggedRequest, trialLine } from "./report.ts";
import { carriesEverySubject, RESTAGES, witnessFails } from "./restage.ts";
import { scoreLines } from "./score.ts";
import {
  REASKED_SEEDS,
  reaskedOf,
  seedRange,
  sheetsOf,
  shotsOf,
  stillsOf,
  takeSeeds,
  TRIAL_SEEDS,
  type TrialStill,
} from "./trial-set.ts";

const USAGE =
  "usage: npm run still-judge -- compare <sheet|rainfall|crop> <today.png> <other.png>... [--dry-run] [--out <dir>] | trial --out <dir> [--seeds <from>-<to>] [--dry-run]";

// 2026-11-11, Issue #1309: the live trial's 270 requests took 1,104,883 input tokens (a whole sheet about 5,100, a 600 by 400 piece about 1,050, a question about 100), which puts the kept trial's 240 near 934,000; 4,000,000, the cap Alex ruled, is four times that.
export const RUN_INPUT_TOKEN_CAP = 4_000_000;

const NOTES =
  "# Issue #1309: the still judge's trial\n\nLook first at score.md: it sets today's chart beside each of four restaged defects over 30 charts. requests.jsonl names every request's image by its path and sha256, replies.jsonl holds every reply, and stills/ every image sent.\n";

const compare = async (
  repo: string,
  kind: Kind,
  paths: readonly string[],
  args: Args,
  sendFor: SendFor,
): Promise<number> => {
  const stills = paths.map((path) => ({ path, bytes: readFileSync(resolve(repo, path)) }));
  const asked = await askStills(kind, stills, sendFor(args.dryRun), RUN_INPUT_TOKEN_CAP);
  console.log(compareLines(kind, asked).join("\n"));
  if (args.out !== null)
    writeAll(resolve(args.out), {
      "requests.jsonl": asked.flatMap((a, n) =>
        a.request === null
          ? []
          : [JSON.stringify({ n, path: a.path, request: loggedRequest(a.request, stills[n]!.bytes, a.path) })],
      ),
      "replies.jsonl": asked.flatMap((a, n) =>
        a.reply === null ? [] : [JSON.stringify({ n, path: a.path, reply: a.reply })],
      ),
    });
  const unanswered = asked.some((a) => a.reply === null || !a.reply.ok);
  return unanswered && !args.dryRun ? 1 : 0;
};

const trial = async (out: string, args: Args, chosen: readonly number[] | null, sendFor: SendFor): Promise<number> => {
  const files = new Map<string, string>();
  const stills: TrialStill[] = [];
  const seeds: number[] = [];
  const lacking: number[] = [];
  for (const seed of chosen ?? TRIAL_SEEDS) {
    const { sheet, rain } = sheetsOf(seed);
    if (!carriesEverySubject(sheet, rain)) {
      if (chosen === null) throw new Error(`seed ${seed} no longer carries every subject the trial restages`);
      lacking.push(seed);
      continue;
    }
    const made = stillsOf(seed, sheet, rain);
    for (const file of made.files) files.set(file.name, file.text);
    stills.push(...made.stills);
    seeds.push(seed);
  }
  if (seeds.length === 0) throw new Error("no seed of those asked carries every subject the trial restages");
  if (lacking.length > 0)
    console.log(`seeds left out, their sheets lacking a subject a restage needs: ${lacking.join(", ")}`);
  mkdirSync(join(out, "sheets"), { recursive: true });
  mkdirSync(join(out, "stills"), { recursive: true });
  for (const [name, text] of files) writeFileSync(join(out, "sheets", name), text);
  const shot = await shootAll(shotsOf(out, stills, files), { site: join(out, "sheets") });
  const failed = stills.filter((s, i) => {
    const r = RESTAGES.find((x) => x.id === s.arm);
    return r !== undefined && witnessFails(r, shot[i]!.probe);
  });
  if (failed.length > 0)
    throw new Error(
      `a restage did not take, so nothing was sent: ${failed.map((s) => `${s.seed} ${s.arm}`).join(", ")}`,
    );
  const asked = [...stills, ...reaskedOf(stills, seeds, REASKED_SEEDS)];
  const pngs = asked.map((s) => readFileSync(join(out, s.png)));
  const requests = asked.map((s, i) => requestFor(s.kind, pngs[i]!));
  writeAll(out, {
    "requests.jsonl": asked.map((s, i) => trialLine(i, s, { request: loggedRequest(requests[i]!, pngs[i]!, s.png) })),
  });
  const replies = await askAll(requests, sendFor(args.dryRun), RUN_INPUT_TOKEN_CAP);
  const score = scoreLines(seeds, asked, replies, stills.length);
  writeAll(out, {
    "replies.jsonl": asked.map((s, i) => trialLine(i, s, { reply: replies[i] })),
    "score.md": score,
  });
  writeFileSync(join(out, "notes.md"), NOTES);
  console.log(score.join("\n"));
  console.log(`score: ${join(out, "score.md")}`);
  return !args.dryRun && replies.some((reply) => !reply.ok) ? 1 : 0;
};

export const main = async (argv: readonly string[], sendFor: SendFor): Promise<number> => {
  const taken = takeSeeds(argv);
  const args = taken === null ? null : parseArgs(taken.rest);
  const range = taken?.range ?? null;
  const chosen = range === null ? null : seedRange(range);
  const badSeeds = range !== null && chosen === null;
  const [command, word, ...paths] = args?.positional ?? [];
  const repo = process.cwd();
  if (
    args !== null &&
    command === "compare" &&
    word !== undefined &&
    isKind(word) &&
    paths.length >= 2 &&
    range === null
  )
    return compare(repo, word, paths, args, sendFor);
  if (args !== null && command === "trial" && word === undefined && args.out !== null && !badSeeds)
    return trial(resolve(args.out), args, chosen, sendFor);
  console.error(USAGE);
  return 2;
};

if (import.meta.main) process.exitCode = await runCommand("still-judge", main, process.argv.slice(2), processDeps());
