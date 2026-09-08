// The Portfolio's period voice (#521 Sub 3 of #401), pure and DOM-free so the wording is unit-testable
// the way the Chart Table's countLine is. Ruled 2026-09-08: direction C's picture with direction A's
// words, so nothing here says "sheaf".
import type { TableGroup, TableItem } from "../shared/table-address.ts";

const NUMERALS = ["i", "ii", "iii", "iv", "v", "vi"] as const;

/** The sheet's place in the pile, in the mockup's lower-case numerals; beyond the cap it falls back to the figure. */
export function roman(n: number): string {
  return NUMERALS[n - 1] ?? String(n);
}

const WORDS = ["no", "one", "two", "three", "four", "five", "six"] as const;
/** The tally as a word, the way the mockup writes it; past the cap it falls back to the figure. */
const word = (n: number): string => WORDS[n] ?? String(n);
const sheets = (n: number): string => `${word(n)} ${n === 1 ? "sheet" : "sheets"}`;
const capital = (line: string): string => line.charAt(0).toUpperCase() + line.slice(1);

/** "Five sheets from The Isle of Rahai and one from The Quiet Isles of Tri, each drafted here again from its chart's number." */
export function boundLine(groups: ReadonlyArray<{ readonly name: string; readonly count: number }>): string {
  if (groups.length === 0) return "";
  const total = groups.reduce((n, g) => n + g.count, 0);
  // The first run names the sheets, the rest carry the figure alone, which is how the mockup reads it aloud.
  const parts = groups.map((g, i) => `${i === 0 ? sheets(g.count) : word(g.count)} from ${g.name}`);
  const list = parts.length === 1 ? parts[0]! : `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)!}`;
  return `${capital(list)}, ${total === 1 ? "" : "each "}drafted here again from its chart's number.`;
}

/** The stamp under the bound line while the pile is still arriving: "four of six drafted · the rest a moment more". */
export function draftedLine(drawn: number, total: number): string {
  if (total === 0) return "";
  if (drawn >= total) return `${capital(sheets(total))} drafted`;
  return `${word(drawn)} of ${word(total)} drafted · the rest a moment more`;
}

/** The room's own line when the address carries nothing: a period sentence, not an error. */
export const BARE_LINE = "No sheets were gathered for this portfolio. The table is laid at the Explorer.";

/** The chart folio's title line under the pile: "The Environs of Nurunui · Sheet ii of vi". */
export function sheetLine(title: string, at: number, of: number): string {
  return `${title} · Sheet ${roman(at)} of ${roman(of)}`;
}

/** A prospect laid before its own page exists keeps its seat and its label, with the plate's place reserved (#520's ruling, carried here by #521 ruling 3). */
export function isAwaited(item: TableItem): boolean {
  return item.kind === "prospect";
}
