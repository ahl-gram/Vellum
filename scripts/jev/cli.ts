import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { dryRunSender, liveSender, type Send } from "./system-one.ts";

export type Args = { readonly positional: string[]; readonly dryRun: boolean; readonly out: string | null };

export const parseArgs = (argv: readonly string[]): Args | null => {
  const positional: string[] = [];
  let dryRun = false;
  let out: string | null = null;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!;
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--out") {
      const value = argv[(i += 1)];
      if (value === undefined) return null;
      out = value;
    } else if (arg.startsWith("--")) return null;
    else positional.push(arg);
  }
  return { positional, dryRun, out };
};

export const sendFor = (dryRun: boolean): Send =>
  dryRun ? dryRunSender : liveSender(process.env, homedir(), (path) => readFileSync(path, "utf8"), fetch);

export const writeAll = (dir: string, files: Readonly<Record<string, string[]>>): void => {
  mkdirSync(dir, { recursive: true });
  for (const [name, lines] of Object.entries(files)) writeFileSync(join(dir, name), lines.join("\n") + "\n");
};
