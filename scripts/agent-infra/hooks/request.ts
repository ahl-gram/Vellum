export type HarnessId = "claude-code" | "codex";
export type CallerKind = "main" | "subagent" | "unknown";
export type ShellOperation = { readonly kind: "shell"; readonly command: string };
export type FileChange = { readonly kind: "add" | "update"; readonly path: string; readonly text: string };
export type Operation = ShellOperation | FileChange;
export type OperationDirectory = { readonly path: string | null; readonly provenance: "payload" };
export type HookRequest = {
  readonly harness: HarnessId;
  readonly sessionKey: string | null;
  readonly caller: CallerKind;
  readonly directoryPersists: boolean | "unknown";
  readonly sessionDirectory: string | null;
  readonly operationDirectory: OperationDirectory;
  readonly policyRoot: string;
  readonly operations: readonly Operation[];
};
export type DueGate = { readonly key: string; readonly label: string; readonly lead: string };
export type Note =
  { readonly kind: "warning"; readonly text: string } | { readonly kind: "gate"; readonly gate: DueGate };
export type Verdict = { readonly denial: string | null; readonly notes: readonly Note[] };
export type Delivery =
  { readonly kind: "deny"; readonly reason: string } | { readonly kind: "context"; readonly text: string } | null;
