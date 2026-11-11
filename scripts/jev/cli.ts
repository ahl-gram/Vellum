import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { errorText } from "../../src/site/shared/error-text.ts";
import { dryRunSender, liveSender, type Env, type Fetch, type Meter, type ReadText, type Send } from "./system-one.ts";
import { appendUsage, NO_TALLY, notLogged, usageLine, withReply, withSent } from "./usage.ts";

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

export const commandOf = (script: string, argv: readonly string[]): string => {
  const first = argv[0];
  return first === undefined || first.startsWith("-") ? script : `${script} ${first}`;
};

export const runCommand = async (
  script: string,
  main: Main,
  argv: readonly string[],
  deps: RunDeps,
): Promise<number> => {
  let tally = NO_TALLY;
  let logged = false;
  const meter: Meter = {
    sent: (request) => {
      tally = withSent(tally, request);
    },
    replied: (reply) => {
      tally = withReply(tally, reply);
    },
  };
  const log = (): void => {
    if (logged) return;
    logged = true;
    const line = usageLine(tally, commandOf(script, argv), deps.now());
    if (line === null) return;
    try {
      appendUsage(deps.home, line);
    } catch (error) {
      deps.warn(notLogged(line, error));
    }
  };
  for (const signal of ["SIGINT", "SIGTERM"] as const)
    deps.onSignal(signal, () => {
      log();
      deps.exit(SIGNAL_EXITS[signal]);
    });
  const sendFor: SendFor = (dryRun) =>
    dryRun ? dryRunSender : liveSender(deps.env, deps.home, deps.readText, deps.fetcher, meter);
  try {
    return await main(argv, sendFor);
  } catch (error) {
    deps.warn(errorText(error));
    return 1;
  } finally {
    log();
  }
};

export const writeAll = (dir: string, files: Readonly<Record<string, string[]>>): void => {
  mkdirSync(dir, { recursive: true });
  for (const [name, lines] of Object.entries(files)) writeFileSync(join(dir, name), lines.join("\n") + "\n");
};
