// The Print Room's slip contents (#463 part 3/4): the atlas's index, string in and string out like plate-markup.ts. The host mints the blob URLs and hands the refs in; a null atlas is the unbound state.
import { escapeXml } from "../../render/svg.ts";
import { contentsRowHtml } from "../shared/contents-row.ts";
import { matterTitle, type MatterKey } from "./matter-markup.ts";
import { MATTER_ROW, SECTION_ROW, numeralOf, plateRow } from "./plate-numbers.ts";
import { THEMATIC } from "../../atlas/thematic.ts";
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
  `<li${on ? ' class="on"' : ""}>${contentsRowHtml(numeralOf(i), text)}${platesHtml}</li>`;
const count = (n: number, noun: string): string => `<span class="n">&middot; ${n} ${noun}</span>`;
const lower = (p: PlateRef): string => p.title.toLowerCase();
const capitalOf = (p: PlateRef): string => p.title.replace(/^The Prospect of /, "");
const survey = (name: string): string => `A thematic survey of <em>${escapeXml(name)}</em>`;

export function contentsRows(atlas: ContentsData | null): string {
  if (atlas === null) {
    return [
      row(SECTION_ROW.hero, false, "The chart, drawn in the <em>antique</em> manner"),
      row(SECTION_ROW.draughting, false, "Other draughtings: <em>topographic, pen &amp; ink, nautical</em>"),
      ...THEMATIC.map((t, i) => row(plateRow("theme", i), false, survey(t.title.toLowerCase()))),
      row(SECTION_ROW.region, false, "Regional surveys, two close-ins"),
      row(SECTION_ROW.prospect, false, "The prospect of the capital"),
      row(MATTER_ROW.banners, false, "The banners of every realm"),
      row(MATTER_ROW.chronicle, false, "The chronicle"),
      row(MATTER_ROW.gazetteer, false, "The gazetteer"),
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
    row(SECTION_ROW.hero, on([atlas.hero]), turn(atlas.hero, here, "The chart, drawn in the <em>antique</em> manner"), plates([atlas.hero], here)),
    row(SECTION_ROW.draughting, on(atlas.draughtings), `Other draughtings: ${named(atlas.draughtings, here, lower)}`, plates(atlas.draughtings, here)),
    ...atlas.themes.map((p, i) => row(plateRow("theme", i), on([p]), turn(p, here, survey(lower(p))), plates([p], here))),
    row(SECTION_ROW.region, on(atlas.regions), atlas.regions.length > 0 ? `Regional surveys: ${named(atlas.regions, here, (p) => p.title)}` : "Regional surveys: none for this world", plates(atlas.regions, here)),
    row(SECTION_ROW.prospect, on(atlas.prospects), atlas.prospects.length > 0 ? atlas.prospects.map((p) => turn(p, here, `The prospect of <em>${escapeXml(capitalOf(p))}</em>`)).join(", ") : "The prospect of the capital: none for this world", plates(atlas.prospects, here)),
    matter(MATTER_ROW.banners, "banners", atlas.counts.arms, "arms", atlas.counts.arms > 0),
    matter(MATTER_ROW.chronicle, "chronicle", atlas.counts.entries, "entries", atlas.counts.entries > 0),
    matter(MATTER_ROW.gazetteer, "gazetteer", atlas.counts.places, "places", true),
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

export function plateLine(section: PlateSection, title: string, ordinal = 0): string {
  const what: Record<PlateSection, string> = {
    hero: "the world chart, drawn in the antique manner",
    draughting: `drawn in the ${title.toLowerCase()} manner`,
    theme: `a thematic survey of ${title.toLowerCase()}`,
    region: `a regional survey, ${lowerNoun(title)}`,
    prospect: lowerNoun(title),
  };
  return `plate ${numeralOf(plateRow(section, ordinal))} of the bound atlas · ${what[section]}`;
}
