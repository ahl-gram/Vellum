// The Print Room's slip contents (#463 part 3/4): the atlas's index, string in and string out like plate-markup.ts. The host mints the blob URLs and hands the refs in; a null atlas is the unbound state.
import { escapeXml } from "../../render/svg.ts";
import { matterTitle, type MatterKey } from "./matter-markup.ts";
import type { PlateSection } from "../../atlas/document.ts";

export interface PlateRef {
  readonly key: string;
  readonly title: string;
  readonly href: string;
}

export interface ContentsCounts {
  readonly arms: number;
  readonly entries: number;
  readonly places: number;
}

export interface ContentsData {
  readonly hero: PlateRef;
  readonly draughtings: readonly PlateRef[];
  readonly themes: readonly PlateRef[];
  readonly regions: readonly PlateRef[];
  readonly prospects: readonly PlateRef[];
  readonly counts: ContentsCounts;
  readonly here: string | null;
}

const NUMERALS = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"] as const;
const SECTION_ROW: Record<PlateSection, number> = { hero: 0, draughting: 1, theme: 2, region: 3, prospect: 4 };

const turn = (p: PlateRef, here: string | null, text: string): string =>
  `<button class="turn${p.key === here ? " here" : ""}" type="button" data-plate="${escapeXml(p.key)}">${text}</button>`;
const named = (ps: readonly PlateRef[], here: string | null, name: (p: PlateRef) => string): string =>
  ps.map((p) => turn(p, here, `<em>${escapeXml(name(p))}</em>`)).join(", ");
const thumb = (p: PlateRef, here: string | null): string =>
  `<figure data-plate="${escapeXml(p.key)}"${p.key === here ? ' class="here"' : ""}>` +
  `<button class="thumb" type="button" data-plate="${escapeXml(p.key)}" aria-label="Turn to ${escapeXml(p.title)}"><img src="${escapeXml(p.href)}" alt=""></button>` +
  `<figcaption>${escapeXml(p.title)}</figcaption></figure>`;
const plates = (ps: readonly PlateRef[], here: string | null): string =>
  ps.length === 0 ? "" : `<div class="plates">${ps.map((p) => thumb(p, here)).join("")}</div>`;
const row = (i: number, on: boolean, text: string, platesHtml = ""): string =>
  `<li${on ? ' class="on"' : ""}><span class="cr-num">${NUMERALS[i]}</span><span class="cr-text">${text}</span>${platesHtml}</li>`;
const count = (n: number, noun: string): string => `<span class="n">&middot; ${n} ${noun}</span>`;
const lower = (p: PlateRef): string => p.title.toLowerCase();
const capitalOf = (p: PlateRef): string => p.title.replace(/^The Prospect of /, "");

export function contentsRows(atlas: ContentsData | null): string {
  if (atlas === null) {
    return [
      row(0, false, "The chart, drawn in the <em>antique</em> manner"),
      row(1, false, "Other draughtings: <em>topographic, pen &amp; ink, nautical</em>"),
      row(2, false, "Thematic surveys: <em>vegetation, temperature, rainfall, population</em>"),
      row(3, false, "Regional surveys, two close-ins"),
      row(4, false, "The prospect of the capital"),
      row(5, false, "The banners of every realm"),
      row(6, false, "The chronicle"),
      row(7, false, "The gazetteer"),
    ].join("\n");
  }
  const { here } = atlas;
  const on = (ps: readonly PlateRef[]): boolean => ps.some((p) => p.key === here);
  const matter = (i: number, key: MatterKey, n: number, noun: string, has: boolean): string => {
    const text = has
      ? `<button class="turn${key === here ? " here" : ""}" type="button" data-plate="${key}">${matterTitle(key)}</button> ${count(n, noun)}`
      : `${matterTitle(key)} ${count(n, noun)}`;
    return row(i, key === here, text);
  };
  return [
    row(0, on([atlas.hero]), turn(atlas.hero, here, "The chart, drawn in the <em>antique</em> manner"), plates([atlas.hero], here)),
    row(1, on(atlas.draughtings), `Other draughtings: ${named(atlas.draughtings, here, lower)}`, plates(atlas.draughtings, here)),
    row(2, on(atlas.themes), `Thematic surveys: ${named(atlas.themes, here, lower)}`, plates(atlas.themes, here)),
    row(3, on(atlas.regions), atlas.regions.length > 0 ? `Regional surveys: ${named(atlas.regions, here, (p) => p.title)}` : "Regional surveys: none for this world", plates(atlas.regions, here)),
    row(4, on(atlas.prospects), atlas.prospects.length > 0 ? atlas.prospects.map((p) => turn(p, here, `The prospect of <em>${escapeXml(capitalOf(p))}</em>`)).join(", ") : "The prospect of the capital: none for this world", plates(atlas.prospects, here)),
    matter(5, "banners", atlas.counts.arms, "arms", atlas.counts.arms > 0),
    matter(6, "chronicle", atlas.counts.entries, "entries", atlas.counts.entries > 0),
    matter(7, "gazetteer", atlas.counts.places, "places", true),
  ].join("\n");
}

export function plateCounts(html: { readonly bannersHtml: string; readonly chronicleHtml: string; readonly gazetteerHtml: string }): ContentsCounts {
  const n = (s: string, re: RegExp): number => (s.match(re) ?? []).length;
  return {
    arms: n(html.bannersHtml, /<figure class="banner"/g),
    entries: n(html.chronicleHtml, /<li>/g),
    places: Math.max(0, n(html.gazetteerHtml, /<tr>/g) - 1),
  };
}

const lowerNoun = (title: string): string => title.replace(/^The (\w+) of /, (_, noun: string) => `the ${noun.toLowerCase()} of `);

export function plateLine(section: PlateSection, title: string): string {
  const what: Record<PlateSection, string> = {
    hero: "the world chart, drawn in the antique manner",
    draughting: `drawn in the ${title.toLowerCase()} manner`,
    theme: `a thematic survey of ${title.toLowerCase()}`,
    region: `a regional survey, ${lowerNoun(title)}`,
    prospect: lowerNoun(title),
  };
  return `plate ${NUMERALS[SECTION_ROW[section]]} of the bound atlas · ${what[section]}`;
}
