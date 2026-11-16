import { HOOK_CHECKOUT, runHook, type Decision } from "./hook-io.ts";
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
  _payload: CodexPayload,
  _sessionDirectory: string | null,
  _policyRoot: string = HOOK_CHECKOUT,
): HookRequest | null => null;

export const decideCodex = (_payload: CodexPayload, _sessionDirectory: string | null): Promise<Decision> =>
  Promise.resolve(null);

export const runCodexHook = (): Promise<void> =>
  runHook((payload: CodexPayload) => decideCodex(payload, process.cwd()));
