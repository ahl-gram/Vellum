// A cancelled view transition is logged as one of three fixed openings plus one of eighteen reasons (measured 2026-09-14 in Brave 153.1.95.101's own string table), so a filter fitted to one whole sentence goes stale the moment the reason changes, which is #613: on that build the second opening was the only one to fire in 1148 checks across two full runs and the first fired not once, while what CI's google-chrome prints is UNVERIFIABLE because a filtered error never reaches a log, so every opening ships permanently rather than one replacing another.
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

export const dropExpectedCancellations = (errs: readonly string[]): string[] =>
  errs.filter((e) => !(CANCELLATION_PREFIXES.some((p) => e.includes(p)) && !OUR_OWN_REASONS.some((r) => e.includes(r))));
