export const decode = (s: string): string =>
  s
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
export const text = (s: string): string =>
  decode(s.replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
export const sheetOf = (html: string): string =>
  html.slice(html.indexOf('<div class="sheet">'), html.indexOf("</main>"));
export const slipOf = (html: string): string => {
  const at = html.indexOf('<aside class="slip" id="index"');
  return html.slice(at, html.indexOf("</aside>", at));
};
export const all = (s: string, re: RegExp): string[] => [...s.matchAll(re)].map((m) => m[1]!);

export type Section = { heading: string; terms: string[]; defs: number };
export const sectionsOf = (sheet: string): Section[] => {
  const out: Section[] = [];
  for (const m of sheet.matchAll(/<(h2|h3)\b[^>]*>([\s\S]*?)<\/\1>|<p class="(term|def)"[^>]*>([\s\S]*?)<\/p>/g)) {
    if (m[1]) out.push({ heading: text(m[2]!), terms: [], defs: 0 });
    else if (out.length && m[3] === "term") out.at(-1)!.terms.push(text(m[4]!));
    else if (out.length) out.at(-1)!.defs++;
  }
  return out;
};
export const CAP = 8;
export const FLOOR = 5;
export const OVER_CAP = ["Zoryan", "Ordai"];
export const OVER_CAP_CEILING = 10;
export const ADDED = [
  "Coming in from the sea",
  "The waterfront",
  "The river & the fen",
  "The road & the market",
  "The court & the realm",
  "What a place smells of",
  "What a place ships",
  "On the Ribbon",
];
export const CHART_SPLIT = ["The sheet and its frame", "On the chart itself", "Soundings & sea marks"];
export const OWED =
  "Quay Weir Breakwater Chandler Osier Drover Reeve Reach Holding_ground Warp Beck Fen Waterman Wharf Moorings League Plate Colophon Docket Neat_line Contour_line Attar Kvass Copal Copra Cochineal Iron_bloom Kurgan An. Height_of_the_way Itinerary Turn_about Wayfarers'_chain"
    .split(" ")
    .map((t) => t.replaceAll("_", " "));
export const headword = (t: string): string =>
  t
    .toLowerCase()
    .replace(/\s*[(,].*$/, "")
    .trim();
export const sortKey = (t: string): string => t.toLowerCase().replace(/^-/, "");

export function shapeFaults(sections: readonly Section[]): string[] {
  const withTerms = sections.filter((s) => s.terms.length > 0);
  const faults: string[] = withTerms.length < FLOOR ? [`only ${withTerms.length} sections with terms`] : [];
  for (const s of withTerms) {
    const ceiling = OVER_CAP.some((n) => s.heading.startsWith(n)) ? OVER_CAP_CEILING : CAP;
    if (s.terms.length > ceiling) faults.push(`"${s.heading}" ${s.terms.length} terms > ${ceiling}`);
    const sorted = [...s.terms].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
    if (JSON.stringify(sorted) !== JSON.stringify(s.terms)) faults.push(`"${s.heading}" out of order`);
  }
  for (const s of sections.filter((x) => x.terms.length > 0 || x.defs > 0))
    if (s.defs !== s.terms.length) faults.push(`"${s.heading}" ${s.terms.length} terms, ${s.defs} definitions`);
  for (const h of ADDED) {
    const n = withTerms.find((s) => s.heading === h)?.terms.length ?? 0;
    if (n < FLOOR || n > CAP) faults.push(`"${h}" ${n} terms, not ${FLOOR} to ${CAP}`);
  }
  for (const h of CHART_SPLIT) if (!withTerms.some((s) => s.heading === h)) faults.push(`no "${h}"`);
  const terms = withTerms.flatMap((s) => s.terms);
  for (const t of OWED) if (!terms.some((x) => x.toLowerCase() === t.toLowerCase())) faults.push(`"${t}" undocumented`);
  const seen = new Set<string>();
  for (const t of terms) {
    if (seen.has(headword(t))) faults.push(`"${t}" repeats a headword`);
    seen.add(headword(t));
  }
  return faults;
}
