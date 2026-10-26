import type { Rule } from "eslint";

const e2eSleepInsidePoll: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      found:
        'an e2e sleep outside a poll measures the runner, not the page: wait for the state with makeSettle or makeStable (handbook/specs/settle-doctrine.md, clause 3), or, where the pause is a gesture\'s own timing or the window a check reads over, name it at the call as sleep(ms, "pace: why") or sleep(ms, "window: why") (Issue #785)',
    },
  },
  create: () => ({}),
};

export default { rules: { "e2e-sleep-inside-poll": e2eSleepInsidePoll } };
