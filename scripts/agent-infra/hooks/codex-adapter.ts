import { isAbsolute, resolve } from "node:path";
import { decodePatch } from "./codex-patch.ts";
import { headlessBuildOf } from "./headless-build.ts";
import { decisionFor, HOOK_CHECKOUT, runHook, type Decision } from "./hook-io.ts";
import type { FileChange, HookRequest, Operation } from "./request.ts";

export type CodexPayload = {
  tool_name?: string;
  session_id?: string;
  cwd?: string;
  agent_id?: string;
  agent_type?: string;
  tool_input?: { command?: string };
};

const UNREADABLE =
  "vellum-footguns: this patch could not be read, so none of its files was checked and it does not run: ";
const SUPPORTED =
  ". Send it again in the form the patch tool's own grammar gives: `*** Begin Patch`; then for each file `*** Add File: <path>` " +
  "with every line starting `+`, `*** Delete File: <path>`, or `*** Update File: <path>` with an optional `*** Move to: <path>` " +
  "and its hunks, each opened by `@@` with every line starting with a space, `+` or `-`; then `*** End Patch`.";
const UNPLACED =
  "vellum-footguns: this patch arrived with no absolute folder (`cwd`) to read its paths against, so the hook cannot tell " +
  "which files it would change, and it does not run.";

const placed = (change: FileChange, cwd: string): FileChange =>
  change.kind === "move"
    ? { ...change, from: resolve(cwd, change.from), path: resolve(cwd, change.path) }
    : { ...change, path: resolve(cwd, change.path) };

const patchOperations = (patch: string, cwd: string | undefined): readonly Operation[] => {
  const decoded = decodePatch(patch);
  if ("error" in decoded) return [{ kind: "unreadable", reason: UNREADABLE + decoded.error + SUPPORTED }];
  if (cwd === undefined || !isAbsolute(cwd)) return [{ kind: "unreadable", reason: UNPLACED }];
  return decoded.files.map((change) => placed(change, cwd));
};

const operationsOf = (payload: CodexPayload): readonly Operation[] | null => {
  const command = payload.tool_input?.command ?? "";
  if (payload.tool_name === "Bash") return [{ kind: "shell", command }];
  return payload.tool_name === "apply_patch" ? patchOperations(command, payload.cwd) : null;
};

export const toCodexRequest = (
  payload: CodexPayload,
  sessionDirectory: string | null,
  policyRoot: string = HOOK_CHECKOUT,
  headlessBuild = false,
): HookRequest | null => {
  const operations = operationsOf(payload);
  return operations === null
    ? null
    : {
        harness: "codex",
        headlessBuild,
        sessionKey: payload.session_id ?? null,
        caller: payload.agent_id === undefined ? "main" : "subagent",
        directoryPersists: false,
        sessionDirectory,
        operationDirectory: { path: payload.cwd ?? null, provenance: "payload" },
        policyRoot,
        operations,
      };
};

export const decideCodex = (
  payload: CodexPayload,
  sessionDirectory: string | null,
  headlessBuild = false,
): Promise<Decision> => decisionFor(toCodexRequest(payload, sessionDirectory, HOOK_CHECKOUT, headlessBuild));

export const runCodexHook = (): Promise<void> =>
  runHook((payload: CodexPayload) => decideCodex(payload, process.cwd(), headlessBuildOf(process.env)));
