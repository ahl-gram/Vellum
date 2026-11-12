import type { Rule } from "eslint";

export const ARGV_PATH_READS: Readonly<Record<string, number>> = { "test-support/source-read-guard.ts": 1 };

const noArgvEntryPath: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      typed:
        "process.argv[1] is the path the entry was started by, as typed, so started through a symlink it differs from the module's own path and an entry check built on it skips and exits 0 (Issue #1180): a module asks import.meta.main whether it is the entry, and a read that is no entry check is counted for its file in ARGV_PATH_READS in scripts/lint/entry-guard.ts",
      stale:
        "{{file}} is counted {{tolerated}} reads of process.argv[1] in ARGV_PATH_READS in scripts/lint/entry-guard.ts and makes {{seen}}, so the count leaves room for a read nobody ruled: lower it, or delete the entry",
    },
  },
  create() {
    return {};
  },
};

export default { rules: { "no-argv-entry-path": noArgvEntryPath } };
