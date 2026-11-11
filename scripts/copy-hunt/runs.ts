import { changedFiles, ensureCommit, gitTree, mergeBase, revParse } from "../comment-judge/tree.ts";
import { acceptedFaults, staleCopies } from "./accepted.ts";
import { changedFunctions } from "./changed.ts";
import { functionsAt, functionsIn, MAX_CHARS, type Fn, type Unread } from "./functions.ts";
import { hunt, type HuntOptions, type Run } from "./hunt.ts";

const refuseFaults = (options: HuntOptions): void => {
  const faults = acceptedFaults(options.accepted);
  if (faults.length > 0) throw new Error(faults.join("\n"));
};

export const diffRun = async (repo: string, base: string, head: string, options: HuntOptions): Promise<Run> => {
  refuseFaults(options);
  ensureCommit(repo, base, base);
  ensureCommit(repo, head, head);
  const sha = revParse(repo, head);
  const from = mergeBase(repo, base, sha);
  const { fns, unread } = functionsAt(gitTree(repo, sha));
  const old = gitTree(repo, from);
  const baseUnread: Unread[] = [];
  const before = (path: string): readonly Fn[] => {
    try {
      return functionsIn(path, old.read(path));
    } catch (error) {
      baseUnread.push({ file: `${path} at ${from}`, reason: error instanceof Error ? error.message : String(error) });
      return [];
    }
  };
  const hunted = changedFunctions(fns, changedFiles(repo, from, sha), before);
  const found = await hunt(fns, hunted, options);
  return {
    sha,
    base: from,
    functions: fns.length,
    hunted: hunted.size,
    tooLong: fns.filter((f, i) => hunted.has(i) && f.body.length > MAX_CHARS),
    unread: [...unread, ...baseUnread],
    found,
    stale: staleCopies(options.accepted, fns),
  };
};

export const fullRun = async (repo: string, at: string, options: HuntOptions): Promise<Run> => {
  refuseFaults(options);
  ensureCommit(repo, at, at);
  const sha = revParse(repo, at);
  const { fns, unread } = functionsAt(gitTree(repo, sha));
  const found = await hunt(fns, null, options);
  return {
    sha,
    base: null,
    functions: fns.length,
    hunted: fns.length,
    tooLong: fns.filter((f) => f.body.length > MAX_CHARS),
    unread,
    found,
    stale: staleCopies(options.accepted, fns),
  };
};
