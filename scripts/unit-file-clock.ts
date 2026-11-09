import { relative, resolve } from "node:path";
import { formatSuiteTimings } from "../e2e/support/suites.ts";

export type FileTiming = { readonly file: string; readonly ms: number };

type FileEvent = {
  type: string;
  data: { name?: string; file?: string; nesting?: number; details?: { duration_ms?: number } };
};

export const fileClockLines = (timings: readonly FileTiming[]): readonly string[] =>
  formatSuiteTimings(
    timings.map((t) => ({ name: t.file, ms: t.ms })),
    "file",
  );

export default async function* unitFileClock(source: AsyncIterable<FileEvent>): AsyncGenerator<string> {
  const longest = new Map<string, number>();
  for await (const { type, data } of source) {
    if (type !== "test:complete" || data.nesting !== 0 || data.file === undefined || data.name === undefined) continue;
    if (resolve(data.name) !== data.file) continue;
    const file = relative(process.cwd(), data.file);
    longest.set(file, Math.max(longest.get(file) ?? 0, data.details?.duration_ms ?? 0));
  }
  for (const line of fileClockLines([...longest].map(([file, ms]) => ({ file, ms })))) yield `${line}\n`;
}
