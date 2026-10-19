import { resolve } from "node:path";

export const SELFTEST = resolve(
  import.meta.dirname,
  "..",
  ".claude",
  "skills",
  "vellum-footguns",
  "hooks",
  "footgun-gate.selftest.ts",
);
// The cap reaches the selftest's own three deployed rows, which pipe input to a child that drains it and so share the shape Issue #564 wedged on; a cap here bounds that whole subtree in one place. Measured 2026-09-11: the selftest runs in 0.34s, so this is about 90x.
export const BOUND_MS = 30_000;
