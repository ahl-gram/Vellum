import { two } from "../comment-judge/report.ts";
import { pngDims } from "../delivery/dims.ts";
import { MODEL, type SystemOneRequest } from "../jev/system-one.ts";
import { COMPARISON_RULE, differenceOf, readingOf, type Asked } from "./compare.ts";
import { ASKED, sha256Of, type Kind } from "./questions.ts";
import type { TrialStill } from "./trial-set.ts";

export const loggedRequest = (request: SystemOneRequest, png: Uint8Array, path: string): unknown => {
  const { width, height } = pngDims(png)!;
  const assets = Object.keys(request.assets ?? {}).map((ref): [string, object] => [
    ref,
    { path, sha256: sha256Of(png), bytes: png.length, width, height },
  ]);
  return { ...request, assets: Object.fromEntries(assets) };
};

export const trialLine = (n: number, still: TrialStill, rest: Readonly<Record<string, unknown>>): string =>
  JSON.stringify({ n, seed: still.seed, kind: still.kind, arm: still.arm, ...rest });

const notAnswered = (a: Asked): string | null =>
  a.problem !== null
    ? `refused unsent: ${a.problem}`
    : a.reply !== null && !a.reply.ok
      ? `skipped: ${a.reply.reason}`
      : null;

export const compareLines = (kind: Kind, asked: readonly Asked[]): string[] => {
  const [today, ...others] = asked;
  const replies = asked.flatMap((a) => (a.reply?.ok ? [a.reply] : []));
  const tokens = replies.reduce((sum, r) => sum + r.inputTokens, 0);
  const refused = asked.filter((a) => a.problem !== null).length;
  const skipped = asked.filter((a) => a.reply !== null && !a.reply.ok).length;
  const lines = [
    `still-judge compare ${kind} at ${MODEL}: ${asked.length} pictures, ${replies.length} answered, ${refused} refused unsent, ${skipped} skipped, ${tokens} input tokens reported`,
    `today: ${today!.path}`,
  ];
  const todayOut = notAnswered(today!);
  for (const other of others) {
    const otherOut = notAnswered(other);
    if (todayOut !== null) lines.push(`${other.path}: not compared: today's picture was ${todayOut}`);
    else if (otherOut !== null) lines.push(`${other.path}: not compared: ${otherOut}`);
    else {
      const before = today!.reply!.ok ? today!.reply!.nouls : {};
      const after = other.reply!.ok ? other.reply!.nouls : {};
      for (const q of ASKED[kind]) {
        const d = differenceOf(before[q]!, after[q]!);
        lines.push(
          `${other.path}: ${q} today ${two(before[q]!)}, this ${two(after[q]!)}, difference ${d >= 0 ? "+" : ""}${two(d)}, ${readingOf(d)}`,
        );
      }
    }
  }
  return [...lines, COMPARISON_RULE];
};
