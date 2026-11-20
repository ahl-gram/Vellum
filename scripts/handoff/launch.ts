import { spawn } from "node:child_process";
import { closeSync, openSync, writeSync } from "node:fs";
import { HEADLESS_BUILD_VAR } from "../agent-infra/hooks/headless-build.ts";

export const D2_FLAGS: readonly string[] = ["-s", "danger-full-access", "-a", "on-request"];
export const effortConfig = (effort: string): string => `model_reasoning_effort="${effort}"`;

export const buildArgv = (a: {
  tree: string;
  model: string;
  effort: string;
  last: string;
  prompt: string;
}): string[] => [
  ...D2_FLAGS,
  "exec",
  "--json",
  "-C",
  a.tree,
  "-m",
  a.model,
  "-c",
  effortConfig(a.effort),
  "-o",
  a.last,
  a.prompt,
];

export const resumeArgv = (a: {
  thread: string;
  model: string;
  effort: string;
  last: string;
  prompt: string;
}): string[] => [
  ...D2_FLAGS,
  "exec",
  "resume",
  "--json",
  "-m",
  a.model,
  "-c",
  effortConfig(a.effort),
  "-o",
  a.last,
  a.thread,
  a.prompt,
];

export const CREDENTIAL_VARS: readonly string[] = [
  "GH_TOKEN",
  "GITHUB_TOKEN",
  "GH_ENTERPRISE_TOKEN",
  "GITHUB_ENTERPRISE_TOKEN",
  "GIT_ASKPASS",
  "SSH_ASKPASS",
  "SSH_AUTH_SOCK",
  "GIT_CONFIG_PARAMETERS",
];
const GIT_CONFIG_INDEXED = /^GIT_CONFIG_(?:COUNT|KEY_\d+|VALUE_\d+)$/;

export const buildEnv = (
  base: Readonly<Record<string, string | undefined>>,
  issue: number,
  ghConfigDir: string,
): Record<string, string | undefined> => ({
  ...Object.fromEntries(
    Object.entries(base).filter(([name]) => !CREDENTIAL_VARS.includes(name) && !GIT_CONFIG_INDEXED.test(name)),
  ),
  [HEADLESS_BUILD_VAR]: String(issue),
  GIT_CONFIG_COUNT: "1",
  GIT_CONFIG_KEY_0: "credential.helper",
  GIT_CONFIG_VALUE_0: "",
  GIT_TERMINAL_PROMPT: "0",
  GIT_SSH_COMMAND: "/usr/bin/false",
  GH_CONFIG_DIR: ghConfigDir,
});

export type Io = {
  readonly cwd: string;
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly stream: string;
  readonly stderr: string;
};

export const runCodex = (argv: readonly string[], io: Io): Promise<number> =>
  new Promise((resolve) => {
    const out = openSync(io.stream, "w");
    const err = openSync(io.stderr, "w");
    let settled = false;
    const done = (code: number): void => {
      if (settled) return;
      settled = true;
      closeSync(out);
      closeSync(err);
      resolve(code);
    };
    const child = spawn("codex", [...argv], { cwd: io.cwd, env: { ...io.env }, stdio: ["ignore", out, err] });
    child.on("error", (error) => {
      if (!settled) writeSync(err, `${error.message}\n`);
      done(127);
    });
    child.on("close", (code) => done(code ?? 1));
  });

export type Outcome = "ready" | "handback";

export const outcomeOf = (lastMessage: string): Outcome | null => {
  const last = lastMessage
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .at(-1);
  if (last === "OUTCOME: ready") return "ready";
  return last === "OUTCOME: handback" ? "handback" : null;
};

export const threadOf = (stream: string): string | null => {
  for (const line of stream.split("\n")) {
    try {
      const event = JSON.parse(line) as { type?: unknown; thread_id?: unknown };
      if (event.type === "thread.started" && typeof event.thread_id === "string") return event.thread_id;
    } catch {
      /* a line that is not JSON is skipped */
    }
  }
  return null;
};
