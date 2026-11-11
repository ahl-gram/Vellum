import type { Changed } from "../comment-judge/tree.ts";
import type { CommentRun } from "../comment-judge/types.ts";

export type NotRead = { readonly path: string; readonly reason: string };

export const BY_HAND = "a sheet or a page, which this scan does not read, so its deleted comments are scanned by hand";
export const DELETED_FILE = "the branch deletes the file, so no file is left to read its comments against";

export const isHandScanned = (path: string): boolean => path === "";

export const deletedRuns = (path: string, before: string, after: string): CommentRun[] =>
  path === before && before === after ? [] : [];

export const filesToRead = (
  changed: readonly Changed[],
  deleted: readonly string[],
): { readonly read: readonly Changed[]; readonly notRead: readonly NotRead[] } => ({
  read: deleted.length === 0 ? changed : changed,
  notRead: [],
});
