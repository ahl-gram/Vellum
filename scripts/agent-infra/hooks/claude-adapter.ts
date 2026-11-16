import { existsSync } from "node:fs";
import { decisionFor, HOOK_CHECKOUT, runHook, type Decision } from "./hook-io.ts";
import type { HookRequest, Operation } from "./request.ts";

export type { Decision } from "./hook-io.ts";
export type ToolInput = {
  file_path?: string;
  content?: string;
  new_string?: string;
  command?: string;
  edits?: ({ new_string?: string } | null)[];
};
export type Payload = {
  tool_name?: string;
  session_id?: string;
  cwd?: string;
  agent_id?: string;
  cwd_persists?: boolean;
  tool_input?: ToolInput;
};

const editFragment = (input: ToolInput): string =>
  [input.content ?? "", input.new_string ?? "", ...(input.edits ?? []).map((e) => e?.new_string ?? "")]
    .filter(Boolean)
    .join("\n");

const operationOf = (payload: Payload): Operation | null => {
  const input = payload.tool_input ?? {};
  if (payload.tool_name === "Bash") return { kind: "shell", command: input.command ?? "" };
  if (!["Edit", "Write", "MultiEdit"].includes(payload.tool_name ?? "")) return null;
  const path = input.file_path ?? "";
  return {
    kind: payload.tool_name === "Write" && !existsSync(path) ? "add" : "update",
    path,
    text: editFragment(input),
  };
};

export const toRequest = (
  payload: Payload,
  projectDir: string | undefined,
  policyRoot: string = HOOK_CHECKOUT,
): HookRequest | null => {
  const operation = operationOf(payload);
  if (operation === null) return null;
  return {
    harness: "claude-code",
    sessionKey: payload.session_id ?? null,
    caller: payload.agent_id === undefined ? "main" : "subagent",
    directoryPersists: payload.cwd_persists ?? "unknown",
    sessionDirectory: projectDir ?? null,
    operationDirectory: { path: payload.cwd ?? null, provenance: "payload" },
    policyRoot,
    operations: [operation],
  };
};

export const decide = (payload: Payload): Promise<Decision> =>
  decisionFor(toRequest(payload, process.env.CLAUDE_PROJECT_DIR));

export const runClaudeHook = (): Promise<void> => runHook(decide);
