import type { PlaceId } from "../../world/outline-ids.ts";

export type NameRow = readonly [id: PlaceId, name: string, kind: string, country: string];
export interface PlaceHit {
  readonly id: PlaceId;
  readonly name: string;
  readonly sub: string;
  readonly mark: readonly [number, number] | null;
}
export interface PlaceList {
  readonly hits: ReadonlyArray<PlaceHit>;
  readonly more: number;
}

export const fold = (s: string): string => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export const subLine = (row: NameRow): string =>
  row[2] === "country" ? "a country" : row[2] === "lake" ? "a lake" : `in ${row[3]}`;

export const NO_SUCH_PLACE = "no such place in the gazetteer";
export const moreWords = (n: number): string => `and ${n} more; type more of the name`;

export function largestNameGroup(rows: ReadonlyArray<NameRow>): number {
  const counts = new Map<string, number>();
  let most = 0;
  for (const row of rows) {
    const n = (counts.get(row[1]) ?? 0) + 1;
    counts.set(row[1], n);
    if (n > most) most = n;
  }
  return most;
}

const KIND_ORDER: Readonly<Record<string, number>> = { country: 0, unit: 1, state: 2, lake: 3 };
const kindRank = (kind: string): number => KIND_ORDER[kind] ?? 4;

const rankOf = (folded: string, q: string): number => {
  if (folded === q) return 0;
  if (folded.startsWith(q)) return 1;
  if (folded.split(/[\s'’-]+/).some((word) => word.startsWith(q))) return 2;
  return folded.includes(q) ? 3 : -1;
};

export function createMatcher(rows: ReadonlyArray<NameRow>): (query: string) => PlaceList {
  const folded = rows.map((row) => fold(row[1]));
  const cap = largestNameGroup(rows);
  return (query) => {
    const q = fold(query).trim();
    if (q === "") return { hits: [], more: 0 };
    const found: Array<{ index: number; rank: number }> = [];
    folded.forEach((name, index) => {
      const rank = rankOf(name, q);
      if (rank >= 0) found.push({ index, rank });
    });
    found.sort(
      (a, b) =>
        a.rank - b.rank ||
        kindRank(rows[a.index]![2]) - kindRank(rows[b.index]![2]) ||
        rows[a.index]![1].localeCompare(rows[b.index]![1], "en") ||
        a.index - b.index,
    );
    const hits = found.slice(0, cap).map(({ index }): PlaceHit => {
      const row = rows[index]!;
      const at = folded[index]!.indexOf(q);
      const marked = folded[index]!.length === row[1].length && at >= 0;
      return { id: row[0], name: row[1], sub: subLine(row), mark: marked ? [at, at + q.length] : null };
    });
    return { hits, more: found.length - hits.length };
  };
}

export const nameOf = (rows: ReadonlyArray<NameRow>, id: PlaceId): string | null =>
  rows.find((row) => row[0] === id)?.[1] ?? null;
