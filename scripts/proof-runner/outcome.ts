export type Stop = { id: string; kind: "step" | "suite"; detail: string; stanza: string };
export type Red = { name: string; file: string };
export type E2eOutcome = { reds: string[]; stops: Stop[]; broken: string | null };
export type FileOutcome = { reds: Red[]; loadFailures: string[]; broken: string | null };

export const e2eOutcome = (_stdout: string, _stderr: string, _exit: number | null): E2eOutcome => ({
  reds: [],
  stops: [],
  broken: null,
});

export const unitOutcome = (_jsonl: string, _files: readonly string[], _tree: string, _exit: number | null): FileOutcome => ({
  reds: [],
  loadFailures: [],
  broken: null,
});

export const lintOutcome = (_json: string, _tree: string, _exit: number | null): FileOutcome => ({
  reds: [],
  loadFailures: [],
  broken: null,
});
