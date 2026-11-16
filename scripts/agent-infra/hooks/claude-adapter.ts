import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { deliver, evaluate } from "./engine.ts";
import type { HookRequest, Operation } from "./request.ts";

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
type Output = {
  hookEventName: "PreToolUse";
  permissionDecision?: "deny";
  permissionDecisionReason?: string;
  additionalContext?: string;
};
export type Decision = { hookSpecificOutput: Output } | null;

const POLICY_ROOT = resolve(import.meta.dirname, "..", "..", "..");

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
  policyRoot: string = POLICY_ROOT,
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

export const decide = async (payload: Payload): Promise<Decision> => {
  const request = toRequest(payload, process.env.CLAUDE_PROJECT_DIR);
  if (request === null) return null;
  const delivery = deliver(request, await evaluate(request));
  if (delivery === null) return null;
  return delivery.kind === "deny"
    ? {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: delivery.reason,
        },
      }
    : { hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext: delivery.text } };
};

export const runClaudeHook = async (): Promise<void> => {
  try {
    const result = await decide(JSON.parse(readFileSync(0, "utf8")) as Payload);
    if (result) process.stdout.write(JSON.stringify(result));
  } catch {
    /* a malformed payload or a missing SKILL.md fails open */
  }
  process.exit(0);
};
