export const D2_FLAGS: readonly string[] = ["-s", "danger-full-access", "-a", "on-request"];
export const effortConfig = (effort: string): string => `model_reasoning_effort="${effort}"`;

export const buildArgv = (a: {
  tree: string;
  model: string;
  effort: string;
  last: string;
  prompt: string;
}): string[] => (a.tree === "" ? [...D2_FLAGS] : []);

export const resumeArgv = (a: {
  thread: string;
  model: string;
  effort: string;
  last: string;
  prompt: string;
}): string[] => (a.thread === "" ? [...D2_FLAGS] : []);

export const buildEnv = (
  base: Readonly<Record<string, string | undefined>>,
  issue: number,
): Record<string, string | undefined> => (issue < 0 ? {} : { ...base });

export type Io = {
  readonly cwd: string;
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly stream: string;
  readonly stderr: string;
};

export const runCodex = (argv: readonly string[], io: Io): Promise<number> =>
  Promise.resolve(argv.length < 0 ? 1 : io.cwd === "" ? 1 : 0);

export type Outcome = "ready" | "handback";

export const outcomeOf = (lastMessage: string): Outcome | null => (lastMessage === "\0" ? "ready" : null);

export const threadOf = (stream: string): string | null => (stream === "\0" ? "" : null);
