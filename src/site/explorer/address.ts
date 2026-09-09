// The #192 address grammar, pure and DOM-free. Ratified vocabulary (the 2026-07-26 comment on #192): a bare `survey` flag or `year=N`, never both and no sentinel year; `survey=<t>` is reserved for mid-sweep addresses and deliberately not built.
import { TABLE_KEY, emitTable, type TableItem } from "../shared/table-address.ts";

export type Live = { kind: "survey" } | { kind: "year"; year: number };

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

export function emitTableKey(params: URLSearchParams, items: ReadonlyArray<TableItem> | null | undefined): void {
  if (!items || items.length === 0) return;
  params.set(TABLE_KEY, emitTable(items));
}

export function finalizeHash(params: URLSearchParams): string {
  return params.toString().replace(/(^|&)survey=(?=&|$)/, "$1survey");
}

export function forwardTarget(hash: string): string | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const live = parseLive(new URLSearchParams(raw));
  return live?.kind === "year" ? "/reading-room/#" + raw : null;
}

export function prospectTarget(hash: string, idx: number): string {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  return "/prospect/#" + (raw ? raw + "&" : "") + "i=" + idx;
}

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

export function seedFromHash(raw: string | null): number | null {
  return raw !== null && /^\d+$/.test(raw) ? Number(raw) : null;
}
