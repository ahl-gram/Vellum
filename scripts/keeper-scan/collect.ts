import { isTsUnderLintRoots } from "../../test-support/lint-roots.ts";
import { addedRuns } from "../comment-judge/collect.ts";
import type { Changed } from "../comment-judge/tree.ts";
import type { CommentRun } from "../comment-judge/types.ts";

export type NotRead = { readonly path: string; readonly reason: string };

export const BY_HAND = "a sheet or a page, which this scan does not read, so its deleted comments are scanned by hand";
export const OUTSIDE_ROOTS =
  "a TypeScript file outside the lint's roots, which this scan does not read, so its deleted comments are scanned by hand";
export const DELETED_FILE = "the branch deletes the file, so no file is left to read its comments against";

export const isHandScanned = (path: string): boolean => path.endsWith(".css") || path.endsWith(".astro");

export const deletedRuns = (path: string, before: string, after: string): CommentRun[] =>
  addedRuns(path, after, before);

export const filesToRead = (
  changed: readonly Changed[],
  deleted: readonly string[],
): { readonly read: readonly Changed[]; readonly notRead: readonly NotRead[] } => {
  const edited = changed.filter((c) => c.before !== null);
  return {
    read: edited.filter((c) => isTsUnderLintRoots(c.path)),
    notRead: [
      ...edited.filter((c) => isHandScanned(c.path)).map((c) => ({ path: c.path, reason: BY_HAND })),
      ...deleted
        .filter((path) => isTsUnderLintRoots(path) || isHandScanned(path))
        .map((path) => ({ path, reason: DELETED_FILE })),
    ],
  };
};
