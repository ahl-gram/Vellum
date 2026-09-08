// The Portfolio's period voice (#521 Sub 3 of #401), pure and DOM-free so the wording is unit-testable
// the way the Chart Table's countLine is. Ruled 2026-09-08: direction C's picture with direction A's
// words, so nothing here says "sheaf".
import type { TableGroup, TableItem } from "../shared/table-address.ts";

const NUMERALS = ["i", "ii", "iii", "iv", "v", "vi"] as const;

/** The sheet's place in the pile, in the mockup's lower-case numerals; beyond the cap it falls back to the figure. */
export function roman(n: number): string {
  return NUMERALS[n - 1] ?? String(n);
}

const WORDS = ["no sheets", "one sheet", "two sheets", "three sheets", "four sheets", "five sheets", "six sheets"] as const;
const word = (n: number): string => WORDS[n] ?? `${n} sheets`;

/** "Five sheets from The Isle of Rahai and one from The Quiet Isles of Tri, each drafted here again from its chart's number." */
export function boundLine(groups: ReadonlyArray<{ readonly name: string; readonly count: number }>): string {
  if (groups.length === 0) return "";
  const parts = groups.map((g, i) => `${i === 0 ? word(g.count) : word(g.count).replace(/^(one|two|three|four|five|six|no) sheets?$/, "$1")} from ${g.name}`);
  const list = parts.length === 1 ? parts[0]! : `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)!}`;
  return `${list}, each drafted here again from its chart's number.`;
}

/** The stamp under the bound line while the pile is still arriving. */
export function draftedLine(drawn: number, total: number): string {
  if (total === 0) return "";
  if (drawn >= total) return `${word(total)} drafted`;
  return `${word(drawn)} of ${word(total).replace(/ sheets?$/, "")} drafted · the rest a moment more`;
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

/** The groups in the order the address carries them, with the count each contributes. */
export function pileOrder(groups: ReadonlyArray<TableGroup>): ReadonlyArray<{ readonly seed: number; readonly count: number }> {
  return groups.map((g) => ({ seed: g.seed, count: g.entries.length }));
}
