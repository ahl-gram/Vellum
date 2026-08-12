// The #192 address grammar: the live-state keys of the Explorer hash, kept pure and
// DOM-free so they are unit-tested in isolation (the `camera.ts` pattern); the live
// plumbing lives in `readHash`/`writeHash` in `src/site/explorer/hash-sync.ts` and the
// conductor, proven by the e2e suite-survey (Explorer side, since #321) and the
// room-hosted RA suite. Ratified vocabulary (the 2026-07-26
// comment on #192): two MUTUALLY EXCLUSIVE keys, a bare `survey` flag (the voyage at
// rest on its completed track) and `year=N` (the chronicle wound to in-world year N).
// The writer emits exactly one of them, or neither; there is no sentinel year. Under
// the #220 Overture the survey is dated at the PRESENT, so its key is a word, never a
// year. `survey=<t>` is reserved for mid-sweep addresses and deliberately not built.
export type Live = { kind: "survey" } | { kind: "year"; year: number };

// Presence-gated like the seed key (Number(null) === 0 is the trap that gate exists
// for), and a year must be a positive integer: no world derives a year 0 and a
// hand-edited value must never throw. Out-of-range years are NOT clamped here;
// `scrubTo` in `src/site/living-chart/chronicle.ts` parks them at the range boundary.
// Both keys at once is a nonsensical set and is ignored WHOLE, the camera's
// discipline in `readHash` in `src/site/explorer/hash-sync.ts`. The survey gate is
// presence-only, so `survey=<anything>` reads as the bare flag today (the writer
// self-heals the spelling); a future mid-sweep reader would tighten this.
export function parseLive(params: URLSearchParams): Live | null {
  const hasSurvey = params.has("survey");
  const yearRaw = params.get("year");
  const year = Number(yearRaw);
  const hasYear = yearRaw !== null && yearRaw !== "" && Number.isInteger(year) && year > 0;
  if (hasSurvey && hasYear) return null;
  if (hasSurvey) return { kind: "survey" };
  return hasYear ? { kind: "year", year } : null;
}

// The writer's half. URLSearchParams cannot serialize a bare flag (`set("survey", "")`
// emits `survey=`), so finalizeHash respells exactly that one pair to the ratified
// bare form. Call finalizeHash INSTEAD of params.toString(), never after it.
export function emitLive(params: URLSearchParams, live: Live | null | undefined): void {
  if (!live) return;
  if (live.kind === "survey") params.set("survey", "");
  else params.set("year", String(live.year));
}

export function finalizeHash(params: URLSearchParams): string {
  return params.toString().replace(/(^|&)survey=(?=&|$)/, "$1survey");
}

// #321: the time forward. An Explorer link carrying a valid `year=N` belongs to the
// Reading Room now (the room keeps TIME, the epic's ratified division), so the boot
// forwards it there BEFORE any draw, hash verbatim (decision 2, 2026-08-11: the room
// reads the same recipe keys and its boundary validation ignores what it cannot use,
// so nothing is stripped). Validated exactly as parseLive does: a malformed year, the
// bare survey flag, or the nonsensical both-keys set all stay in the Explorer, which
// is today's behavior. Pure, so the redirect decision is unit-testable.
export function forwardTarget(hash: string): string | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const live = parseLive(new URLSearchParams(raw));
  // The original string rides through untouched (never re-serialized), so the room
  // receives byte-for-byte what the link carried.
  return live?.kind === "year" ? "/reading-room/#" + raw : null;
}

// What the writer should say right now. Reads the CHECKBOX first, not engine-session
// existence: the box is truthful at every syncHash call site, while the instrument's
// session lags the gesture that arms it (and draw()'s early sync runs before the
// re-arm). #220: one instrument, one box; the chamber picks the key. A survey-chamber
// rest anywhere on the half emits the bare flag (mid-sweep `survey=<t>` addresses stay
// reserved and unbuilt), an ages-chamber rest emits its year. While the session lags,
// the caller passes the boot's restored key through as the fallback so a deep link
// survives the first draw's sync; an unknowable state emits nothing rather than a guess.
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
