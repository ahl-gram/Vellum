import { decisionFor, HOOK_CHECKOUT, runHook, type Decision } from "./hook-io.ts";
import type { HookRequest } from "./request.ts";

export type CodexPayload = {
  tool_name?: string;
  session_id?: string;
  cwd?: string;
  agent_id?: string;
  agent_type?: string;
  tool_input?: { command?: string };
};

export const toCodexRequest = (
  payload: CodexPayload,
  sessionDirectory: string | null,
  policyRoot: string = HOOK_CHECKOUT,
): HookRequest | null =>
  payload.tool_name === "Bash"
    ? {
        harness: "codex",
        sessionKey: payload.session_id ?? null,
        caller: payload.agent_id === undefined ? "main" : "subagent",
        directoryPersists: false,
        sessionDirectory,
        operationDirectory: { path: payload.cwd ?? null, provenance: "payload" },
        policyRoot,
        operations: [{ kind: "shell", command: payload.tool_input?.command ?? "" }],
      }
    : null;

export const decideCodex = (payload: CodexPayload, sessionDirectory: string | null): Promise<Decision> =>
  decisionFor(toCodexRequest(payload, sessionDirectory));

export const runCodexHook = (): Promise<void> =>
  runHook((payload: CodexPayload) => decideCodex(payload, process.cwd()));
