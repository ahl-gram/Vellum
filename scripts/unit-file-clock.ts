import { relative, resolve } from "node:path";

export type FileTiming = { readonly file: string; readonly ms: number };

type FileEvent = {
  type: string;
  data: { name?: string; file?: string; nesting?: number; details?: { duration_ms?: number } };
};

const seconds = (ms: number): string => `${(ms / 1000).toFixed(1)}s`;

export const fileClockLines = (timings: readonly FileTiming[]): readonly string[] => {
  if (timings.length === 0) return [];
  const total = timings.reduce((sum, t) => sum + t.ms, 0);
  const width = Math.max(...timings.map((t) => t.file.length));
  const rows = timings
    .slice()
    .sort((a, b) => b.ms - a.ms || (a.file < b.file ? -1 : a.file > b.file ? 1 : 0))
    .map((t) => {
      const share = total === 0 ? 0 : (t.ms / total) * 100;
      return `  ${t.file.padEnd(width)}  ${seconds(t.ms).padStart(6)}  ${share.toFixed(1).padStart(5)}%`;
    });
  return [`per-file wall clock (${timings.length} files, ${seconds(total)} total):`, ...rows];
};

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
