import type { E2eCheck, FileCheck, List } from "./list.ts";

export type Edit =
  | { file: string; find: string; replace: string }
  | { file: string; line: number; from: string; to: string }
  | { file: string; append: string };
export type Mutation = { id: string; patch?: string; edits?: Edit[]; unit?: FileCheck; lint?: FileCheck; e2e?: E2eCheck };
export type SuiteRules = {
  order: readonly string[];
  predecessor: Readonly<Partial<Record<string, string>>>;
  opensOnHome: readonly string[];
};

export const applyEdits = (read: (file: string) => string, edits: readonly Edit[]): Map<string, string> =>
  new Map(edits.map((e) => [e.file, read(e.file)]));

export const diffFor = (_before: ReadonlyMap<string, string>, _after: ReadonlyMap<string, string>): string => "";

export const appliesAt = (_repo: string, _sha: string, _patch: string): string | null => null;

export const orderProblems = (_suites: string, _rules: SuiteRules): string[] => [];

export const branchBodies = {
  blob: (content: string) => ({ content, encoding: "utf-8" }),
  tree: (baseTree: string, blob: string) => ({ base_tree: baseTree, tree: [{ path: "x", mode: "100644", type: "blob", sha: blob }] }),
  commit: (tree: string, parent: string, label: string) => ({ message: label, tree, parents: [parent] }),
  ref: (label: string, commit: string) => ({ ref: label, sha: commit }),
};

export type Built = { list: List | null; errors: string[]; warnings: string[] };
export type BuildDeps = { repo: string; read: (file: string) => string; rules: SuiteRules };

export const buildList = (_mutations: readonly Mutation[], sha: string, _deps: BuildDeps): Built => ({
  list: { version: 1, sha, entries: [] },
  errors: [],
  warnings: [],
});
