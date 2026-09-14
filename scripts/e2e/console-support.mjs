// A cancelled view transition is logged as one of three fixed openings plus one of eighteen reasons (measured 2026-09-14 in Brave 153.1.95.101's own string table), so a filter fitted to one whole sentence goes stale the moment the reason changes, which is #613: the opening this file adds is the only one that fired on that build in 1148 checks across two full runs, while the opening the suites already knew fired not once, and CI's google-chrome has only ever printed the other, so both ship permanently rather than one replacing the other.
export const CANCELLATION_PREFIXES = [
  "Transition was skipped",
  "Transition was aborted because of invalid state",
  "Transition was aborted because of timeout in DOM update",
];

export const OUR_OWN_REASONS = [
  "Unsupported layout or style",
  "Incompatible style on scope element",
  "Duplicate view-transition-name",
];

export const dropExpectedCancellations = (errs) =>
  errs.filter((e) => !(CANCELLATION_PREFIXES.some((p) => e.includes(p)) && !OUR_OWN_REASONS.some((r) => e.includes(r))));
