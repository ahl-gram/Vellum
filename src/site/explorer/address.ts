// The #192 address grammar, pure and DOM-free so it unit-tests in isolation; the live
// plumbing lives in `readHash` in `src/site/explorer/hash-sync.ts` and the conductors.
// Ratified vocabulary (the 2026-07-26 comment on #192): two MUTUALLY EXCLUSIVE keys, a
// bare `survey` flag and `year=N`; the writer emits exactly one of them or neither, and
// there is no sentinel year. `survey=<t>` is reserved for mid-sweep addresses and deliberately not built.
export type Live = { kind: "survey" } | { kind: "year"; year: number };

// Presence-gated like the seed key (Number(null) === 0 is the trap); a year must be a positive integer and is NOT clamped here (`scrubTo` in `src/site/living-chart/chronicle.ts` parks out-of-range at the boundary). Both keys at once is nonsensical and ignored WHOLE; the survey gate is presence-only, so survey=<anything> reads as the bare flag (the writer self-heals the spelling).
export function parseLive(params: URLSearchParams): Live | null {
  const hasSurvey = params.has("survey");
  const yearRaw = params.get("year");
  const year = Number(yearRaw);
  const hasYear = yearRaw !== null && yearRaw !== "" && Number.isInteger(year) && year > 0;
  if (hasSurvey && hasYear) return null;
  if (hasSurvey) return { kind: "survey" };
  return hasYear ? { kind: "year", year } : null;
}

// URLSearchParams cannot serialize a bare flag (`set("survey", "")` emits `survey=`), so finalizeHash respells exactly that one pair to the ratified bare form. Call finalizeHash INSTEAD of params.toString(), never after it.
export function emitLive(params: URLSearchParams, live: Live | null | undefined): void {
  if (!live) return;
  if (live.kind === "survey") params.set("survey", "");
  else params.set("year", String(live.year));
}

export function finalizeHash(params: URLSearchParams): string {
  return params.toString().replace(/(^|&)survey=(?=&|$)/, "$1survey");
}

// #321: an Explorer link carrying a valid `year=N` belongs to the Reading Room (the room keeps TIME), forwarded BEFORE any draw; a malformed year, the bare survey flag, and the both-keys set all stay in the Explorer. Pure, so the redirect decision is unit-testable.
export function forwardTarget(hash: string): string | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const live = parseLive(new URLSearchParams(raw));
  // The original string rides through untouched (never re-serialized), so the room receives byte-for-byte what the link carried.
  return live?.kind === "year" ? "/reading-room/#" + raw : null;
}

// #242: the card's way in to the prospect page; the chart's hash rides through VERBATIM (#321) with the settlement index appended.
export function prospectTarget(hash: string, idx: number): string {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  return "/prospect/#" + (raw ? raw + "&" : "") + "i=" + idx;
}

// What the writer should say right now. Reads the CHECKBOX first, not engine-session existence: the box is truthful at every syncHash call site, while the instrument's session lags the gesture that arms it. While it lags, the caller's `pending` fallback keeps a deep link alive through the first draw's sync; an unknowable state emits nothing rather than a guess.
export function liveNow(state: {
  ages: boolean;
  chamber: "survey" | "ages" | null;
  year: number | null | undefined;
  pending: Live | null;
}): Live | null {
  if (!state.ages) return null;
  if (state.chamber === "survey") return { kind: "survey" };
  if (state.chamber === "ages" && state.year != null) return { kind: "year", year: state.year };
  return state.pending;
}
