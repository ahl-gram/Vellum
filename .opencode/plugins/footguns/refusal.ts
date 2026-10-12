import type { ShellEvent, ToolEvent } from "@opencode/plugin";
import { decide, type Payload } from "../../../.claude/skills/vellum-footguns/hooks/footgun-gate.ts";

const refusalOf = async (payload: Payload): Promise<string | null> => {
  try {
    const output = (await decide(payload))?.hookSpecificOutput;
    return output?.permissionDecision === "deny" ? (output.permissionDecisionReason ?? "vellum-footguns refused this call.") : null;
  } catch {
    return null;
  }
};

const text = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);

export const shellRefusal = async (event: ShellEvent): Promise<string | null> =>
  refusalOf({ tool_name: "Bash", cwd: event.cwd, cwd_persists: false, tool_input: { command: event.command } });

export const toolRefusal = async (event: ToolEvent): Promise<string | null> => {
  const input = event.input ?? {};
  if (event.tool === "write") {
    return refusalOf({ tool_name: "Write", tool_input: { file_path: text(input.path), content: text(input.content) } });
  }
  if (event.tool === "edit") {
    return refusalOf({ tool_name: "Edit", tool_input: { file_path: text(input.path), new_string: text(input.newString) } });
  }
  return null;
};
