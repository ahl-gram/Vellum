import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { dryRunSender, liveSender, type Env, type Fetch, type ReadText, type Send } from "./system-one.ts";

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

export type SendFor = (dryRun: boolean) => Send;
export type Main = (argv: readonly string[], sendFor: SendFor) => Promise<number>;
export type Signal = "SIGINT" | "SIGTERM";
export const SIGNAL_EXITS: Readonly<Record<Signal, number>> = { SIGINT: 130, SIGTERM: 143 };
export type RunDeps = {
  readonly env: Env;
  readonly home: string;
  readonly readText: ReadText;
  readonly fetcher: Fetch;
  readonly now: () => Date;
  readonly warn: (message: string) => void;
  readonly onSignal: (signal: Signal, handler: () => void) => void;
  readonly exit: (code: number) => void;
};

export const processDeps = (): RunDeps => ({
  env: process.env,
  home: homedir(),
  readText: (path) => readFileSync(path, "utf8"),
  fetcher: fetch,
  now: () => new Date(),
  warn: (message) => console.error(message),
  onSignal: (signal, handler) => {
    process.on(signal, handler);
  },
  exit: (code) => process.exit(code),
});

export const commandOf = (script: string, _argv: readonly string[]): string => script;

export const runCommand = async (
  _script: string,
  main: Main,
  argv: readonly string[],
  _deps: RunDeps,
): Promise<number> => {
  try {
    return await main(argv, () => dryRunSender);
  } catch {
    return 1;
  }
};

export const sendFor = (dryRun: boolean): Send =>
  dryRun
    ? dryRunSender
    : liveSender(process.env, homedir(), (path) => readFileSync(path, "utf8"), fetch, {
        sent: () => {},
        replied: () => {},
      });

export const writeAll = (dir: string, files: Readonly<Record<string, string[]>>): void => {
  mkdirSync(dir, { recursive: true });
  for (const [name, lines] of Object.entries(files)) writeFileSync(join(dir, name), lines.join("\n") + "\n");
};
