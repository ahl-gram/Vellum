// The Portfolio's period voice (#521 Sub 3 of #401), pure and DOM-free so the wording is unit-testable
// the way the Chart Table's countLine is. Ruled 2026-09-08: direction C's picture with direction A's
// words, so nothing here says "sheaf".
import type { TableGroup, TableItem } from "../shared/table-address.ts";

const NUMERALS = ["i", "ii", "iii", "iv", "v", "vi"] as const;

export function roman(n: number): string {
  return NUMERALS[n - 1] ?? String(n);
}

const WORDS = ["no", "one", "two", "three", "four", "five", "six"] as const;
const word = (n: number): string => WORDS[n] ?? String(n);
const sheets = (n: number): string => `${word(n)} ${n === 1 ? "sheet" : "sheets"}`;
const capital = (line: string): string => line.charAt(0).toUpperCase() + line.slice(1);

export function boundLine(groups: ReadonlyArray<{ readonly name: string; readonly count: number }>): string {
  if (groups.length === 0) return "";
  const total = groups.reduce((n, g) => n + g.count, 0);
  const parts = groups.map((g, i) => `${i === 0 ? sheets(g.count) : word(g.count)} from ${g.name}`);
  const list = parts.length === 1 ? parts[0]! : `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)!}`;
  return `${capital(list)}, ${total === 1 ? "" : "each "}drafted here again from its chart's number.`;
}

export function draftedLine(drawn: number, total: number): string {
  if (total === 0) return "";
  if (drawn >= total) return `${capital(sheets(total))} drafted`;
  // "no of six drafted" is what word(0) gives, and it is the FIRST thing the page renders: retitle() runs before draft().
  if (drawn === 0) return `none of ${word(total)} drafted · a moment more`;
  return `${word(drawn)} of ${word(total)} drafted · the rest a moment more`;
}

export const BARE_LINE = "No sheets were gathered for this portfolio. The table is laid at the Explorer.";

export function sheetLine(title: string, at: number, of: number): string {
  return `${title} · Sheet ${roman(at)} of ${roman(of)}`;
}

export function beneathLine(beneath: number): string {
  return beneath > 0 ? `${word(beneath)} beneath it` : "the last of them";
}

/** The slip's where-line, which the mockup writes with the tally: "six sheets gathered at the Explorer". */
export function gatheredLine(count: number): string {
  return `${sheets(count)} gathered at the Explorer`;
}

export function isAwaited(item: TableItem): boolean {
  return item.kind === "prospect";
}
