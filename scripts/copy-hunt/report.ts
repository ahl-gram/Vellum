import { two } from "../comment-judge/report.ts";
import { MODEL } from "../jev/system-one.ts";
import type { Fn } from "./functions.ts";
import type { Asked, Found, Run } from "./hunt.ts";
import type { Verdict } from "./questions.ts";

export const BLIND_SPOTS =
  "Not seen, so a copy there goes unreported and none is made up: a function with fewer than 6 names, a pair under similarity 0.6, the body of a test(...) call or any unnamed callback, a getter, a setter, a constructor, an arrow assigned to an existing variable or property (x = () => ..., obj.p = () => ...), a function beside one nested in it, and any file but a .ts under the lint's roots; a function over 6,000 characters is held to exact copies.";

export const loc = (f: Fn): string => `${f.file}:${f.line} ${f.name}`;
const section = (title: string, lines: readonly string[]): string[] =>
  lines.length === 0 ? [] : ["", title, "", ...lines];
const byPlace = (a: Fn, b: Fn): number =>
  (a.file < b.file ? -1 : a.file > b.file ? 1 : 0) ||
  a.line - b.line ||
  (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
const byPair = (a: Found, b: Found): number => byPlace(a.x, b.x) || byPlace(a.y, b.y);

type Read = { readonly found: Found; readonly asked: Asked };
const readOf = (found: readonly Found[], verdict: Verdict): Read[] =>
  found.flatMap((f) =>
    f.outcome.kind === "asked" && f.outcome.asked.verdict === verdict ? [{ found: f, asked: f.outcome.asked }] : [],
  );

const table = (reads: readonly Read[]): string[] =>
  reads.length === 0
    ? []
    : [
        "| mean | a then b | b then a | similarity | function | copy |",
        "|---|---|---|---|---|---|",
        ...[...reads]
          .sort((a, b) => b.asked.mean - a.asked.mean || byPair(a.found, b.found))
          .map(
            ({ found: f, asked: a }) =>
              `| ${two(a.mean)} | ${two(a.ab)} | ${two(a.ba)} | ${two(f.similarity)} | ${loc(f.x)} | ${loc(f.y)} |`,
          ),
      ];

const header = (run: Run): string => {
  const kinds = (kind: Found["outcome"]["kind"]): number => run.found.filter((f) => f.outcome.kind === kind).length;
  const copies = readOf(run.found, "copy").length;
  const unsettled = readOf(run.found, "unsettled").length;
  const notCopies = readOf(run.found, "not a copy").length;
  const skipped = kinds("skipped");
  const tokens = run.found.reduce(
    (sum, f) => sum + f.replies.reduce((inner, r) => inner + (r.ok ? r.inputTokens : 0), 0),
    0,
  );
  const scope =
    run.base === null
      ? `all ${run.functions} functions`
      : `${run.hunted} of ${run.functions} functions added or changed since ${run.base}`;
  return `copy hunt at ${run.sha} (${MODEL}): ${scope}; exact copies ${kinds("exact")}; similar pairs ${copies + unsettled + notCopies + skipped} (copies ${copies}, unsettled ${unsettled}, not copies ${notCopies}, skipped ${skipped}); accepted ${kinds("accepted")}; input tokens ${tokens}`;
};

export const reportLines = (run: Run): string[] => [
  header(run),
  BLIND_SPOTS,
  ...section(
    "## Exact copies, found by code",
    run.found
      .filter((f) => f.outcome.kind === "exact")
      .sort(byPair)
      .map((f) => `- ${loc(f.x)} = ${loc(f.y)}`),
  ),
  ...section("## Read as copies: the mean of both orders is above 0.7", table(readOf(run.found, "copy"))),
  ...section("## Unsettled, 0.3 to 0.7: hypotheses to read, not findings", table(readOf(run.found, "unsettled"))),
  ...section(
    "## Skipped: not answered, so not judged",
    run.found
      .flatMap((f) => (f.outcome.kind === "skipped" ? [{ f, reason: f.outcome.reason }] : []))
      .sort((a, b) => byPair(a.f, b.f))
      .map(({ f, reason }) => `- ${loc(f.x)} | ${loc(f.y)}: ${reason}`),
  ),
  ...section(
    "## Not asked: over 6,000 characters, so held to exact copies",
    [...run.tooLong].sort(byPlace).map((f) => `- ${loc(f)}`),
  ),
  ...section(
    "## Not read: the file does not parse",
    run.unread.map((u) => `- ${u.file}: ${u.reason}`),
  ),
  ...section(
    "## Accepted copies no function now matches: renew the entry or remove it",
    run.stale.map((s) => `- ${s.a.file} ${s.a.name} | ${s.b.file} ${s.b.name}: ${s.reason} (${s.ruling})`),
  ),
];

export const requestLines = (found: readonly Found[]): string[] =>
  found.flatMap((f) =>
    f.requests.map((request, k) => JSON.stringify({ a: loc(f.x), b: loc(f.y), order: k === 0 ? "ab" : "ba", request })),
  );

export const replyLines = (found: readonly Found[]): string[] =>
  found.flatMap((f) =>
    f.replies.map((reply, k) => JSON.stringify({ a: loc(f.x), b: loc(f.y), order: k === 0 ? "ab" : "ba", reply })),
  );

const placed = (f: Fn): { file: string; line: number; name: string; hash: string } => ({
  file: f.file,
  line: f.line,
  name: f.name,
  hash: f.hash,
});

export const pairLines = (found: readonly Found[]): string[] =>
  found.map((f) => {
    const o = f.outcome;
    const detail =
      o.kind === "accepted"
        ? { ruling: o.copy.ruling }
        : o.kind === "asked"
          ? { ab: o.asked.ab, ba: o.asked.ba, mean: o.asked.mean, verdict: o.asked.verdict }
          : o.kind === "skipped"
            ? { reason: o.reason }
            : {};
    return JSON.stringify({ a: placed(f.x), b: placed(f.y), similarity: f.similarity, outcome: o.kind, ...detail });
  });
