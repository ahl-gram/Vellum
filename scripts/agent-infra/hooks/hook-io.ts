import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { deliver, evaluate } from "./engine.ts";
import type { HookRequest } from "./request.ts";

export const HOOK_CHECKOUT = resolve(import.meta.dirname, "..", "..", "..");

type Output = {
  hookEventName: "PreToolUse";
  permissionDecision?: "deny";
  permissionDecisionReason?: string;
  additionalContext?: string;
};
export type Decision = { hookSpecificOutput: Output } | null;

export const decisionFor = async (request: HookRequest | null): Promise<Decision> => {
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

export const runHook = async <P>(decide: (payload: P) => Promise<Decision>): Promise<void> => {
  try {
    const result = await decide(JSON.parse(readFileSync(0, "utf8")) as P);
    if (result) process.stdout.write(JSON.stringify(result));
  } catch {
    /* a malformed payload or a missing SKILL.md fails open */
  }
  process.exit(0);
};
