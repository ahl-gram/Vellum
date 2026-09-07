// The Chart Table's grammar (#519, Sub 1 of #401): one key, two hosts. It rides in the
// Explorer's hash while the table is being gathered and it IS the Portfolio page's address once
// the button is pressed, so the folio survives a reload and a round trip to the Prospect page.
// Pure and DOM-free like its siblings in src/site/{explorer,prospect,ribbon}/address.ts, because
// three bundles import it. The key is `table` (ruled at #518's sitting, 2026-09-07; `plates` is
// taken by the Explorer's order button and the poster/atlas plates).
import { LATTICE_DIVISIONS, LOD_BANDS, lodWindowFor, type LodBand } from "../../world/lod.ts";
import { parseYear } from "../prospect/address.ts";
import type { UvWindow, MapType } from "../../terrain/heightfield.ts";
import type { ClimateBand } from "../../climate/climate.ts";
import type { StyleName } from "../../render/style.ts";
import type { ThemeName } from "../../render/layers/field.ts";

export const TABLE_KEY = "table";
/** #401 ruling 5. The refusal wording is the hosts', not the grammar's. */
export const TABLE_CAP = 6;

// Separators chosen by measurement: the urlencoded serializer leaves only A-Za-z0-9 and * - . _
// alone, so the epic body's `~` would have ridden as %7E and broken the round trip on the first
// write. This is also why a centre encodes as an integer lattice index and never as a decimal.
const ITEMS = "_";
const FIELDS = ".";
const PAIR = "-";

// Boundary discipline: allowlists mirrored from the Explorer's <select> values, the Print Room's
// idiom. Pinned against the page's own options in test/site/table-address.test.ts.
const STYLES = ["antique", "topographic", "ink", "nautical"];
const TYPES = ["island", "archipelago", "continent", "citystate"];
const BANDS = ["temperate", "tropical", "polar"];
const THEMES = ["vegetation", "climate", "moisture", "population"];

/** The Explorer's own override set (`app.ts`), presence-gated: an absent land is the world's natural waterline, not a default. */
export interface TableOverrides {
  readonly mapType?: MapType;
  readonly band?: ClimateBand;
  readonly landFraction?: number;
  readonly coastWarp?: number;
}

export interface TableWorld {
  readonly seed: number;
  readonly overrides: TableOverrides;
}

/**
 * A committed redraft: the RegionJob tuple with `window` replaced by (rung, lattice centre) and
 * `render` decomposed into the dress; gridW/gridH/widthPx the page derives.
 * `rung` is the Glass's LOD band (1 to 3, `LodBand.index`), deliberately not called `band`, which
 * every host key name already spends on the climate band. The title is never encoded: the worker
 * derives it from (world, window), which is what lets a live redraft and a later redraw agree
 * byte for byte (#169).
 */
export interface SurveyItem extends TableWorld {
  readonly kind: "survey";
  readonly rung: number;
  readonly lx: number;
  readonly ly: number;
  readonly style: StyleName;
  readonly legend: boolean;
  readonly arms: boolean;
  readonly beasts: boolean;
  readonly theme: ThemeName | null;
}

/** The ProspectJob tuple, in `parseProspectAddress`'s own key names; the plate's dress derives from the style through `plateDressFor`. */
export interface ProspectItem extends TableWorld {
  readonly kind: "prospect";
  readonly style: StyleName;
  readonly index: number | null;
  readonly year: number | null;
}

export type TableItem = SurveyItem | ProspectItem;

export interface TableGroup {
  readonly world: string;
  readonly entries: ReadonlyArray<{ readonly at: number; readonly item: TableItem }>;
}

// `beasts` is in the dress although #519 and #401 both list only (style, legend, arms, theme).
// It cannot change a region sheet today: `generateRegionWorld` sets `beasts: []`, so `beastsLayer`
// returns null on every survey and seaDecor's serpent flag never flips (measured: a band-1 seed-42
// region renders byte-identical either way). It is encoded for the reason #519 gives for encoding
// the style while the redraft is antique-only, so a later expansion cannot change the grammar.

// A stated field reads three ways: absent (undefined), stated and readable, or stated and not
// (null). A stated-but-unreadable field drops the whole ITEM: a folio sheet either describes
// itself exactly or is not on the table, because silently drafting a different world would be a
// lie the reader cannot see. Continuous values clamp instead, the way every other host clamps them.
type Field<T> = T | null | undefined;

const allowed = <T extends string>(raw: string | undefined, list: readonly string[]): Field<T> =>
  raw === undefined ? undefined : list.includes(raw) ? (raw as T) : null;

const nat = (raw: string | undefined): Field<number> =>
  raw === undefined ? undefined : /^\d+$/.test(raw) ? Number(raw) : null;

const scaled = (raw: string | undefined, divisor: number, lo: number, hi: number): Field<number> =>
  raw === undefined ? undefined : /^\d+$/.test(raw) ? Math.min(hi, Math.max(lo, Number(raw) / divisor)) : null;

const seal = (raw: string | undefined): Field<boolean> =>
  raw === undefined ? undefined : raw === "1" ? true : raw === "0" ? false : null;

const regionBand = (rung: number): LodBand | null => {
  const band = LOD_BANDS[rung];
  return band && band.isRegion ? band : null;
};

const latticeStep = (band: LodBand): number => band.sizeUV / LATTICE_DIVISIONS;
const latticeMax = (band: LodBand): number => LATTICE_DIVISIONS / band.sizeUV;

function readFields(chunk: string): Map<string, string> | null {
  const fields = new Map<string, string>();
  for (const field of chunk.split(FIELDS)) {
    const at = field.indexOf(PAIR);
    if (at <= 0) return null;
    const key = field.slice(0, at);
    if (fields.has(key)) return null; // a field stated twice names two sheets, so it names none
    fields.set(key, field.slice(at + 1));
  }
  return fields;
}

function readWorld(fields: Map<string, string>): TableWorld | null {
  const seed = nat(fields.get("seed"));
  const mapType = allowed<MapType>(fields.get("type"), TYPES);
  const band = allowed<ClimateBand>(fields.get("band"), BANDS);
  const landFraction = scaled(fields.get("land"), 1000, 0.1, 0.7);
  const coastWarp = scaled(fields.get("coast"), 100, 0, 1);
  if (seed == null || mapType === null || band === null || landFraction === null || coastWarp === null) return null;
  return {
    seed,
    overrides: {
      ...(mapType !== undefined ? { mapType } : {}),
      ...(band !== undefined ? { band } : {}),
      ...(landFraction !== undefined ? { landFraction } : {}),
      ...(coastWarp !== undefined ? { coastWarp } : {}),
    },
  };
}

function readItem(chunk: string): TableItem | null {
  const fields = readFields(chunk);
  if (!fields) return null;
  const kind = fields.get("k");
  const world = readWorld(fields);
  const style = allowed<StyleName>(fields.get("style"), STYLES);
  if (!world || style == null) return null;
  if (kind === "s") {
    const legend = seal(fields.get("legend"));
    const arms = seal(fields.get("arms"));
    const beasts = seal(fields.get("beasts"));
    const theme = allowed<ThemeName>(fields.get("theme"), THEMES);
    const rung = nat(fields.get("rung"));
    if (legend == null || arms == null || beasts == null || theme === null || rung == null) return null;
    const band = regionBand(rung);
    if (!band) return null;
    const lx = nat(fields.get("lx"));
    const ly = nat(fields.get("ly"));
    const max = latticeMax(band);
    if (lx == null || ly == null || lx > max || ly > max) return null;
    return { kind: "survey", ...world, style, legend, arms, beasts, theme: theme ?? null, rung, lx, ly };
  }
  if (kind === "p") {
    const index = nat(fields.get("i"));
    const yearRaw = fields.get("year");
    // The one year grammar, imported rather than copied: digits making a positive whole number.
    const year = yearRaw === undefined ? undefined : parseYear(yearRaw);
    if (index === null || year === null) return null;
    return { kind: "prospect", ...world, style, index: index ?? null, year: year ?? null };
  }
  return null;
}

/** The items a hash carries, or null when it carries no table at all (which the hosts read differently from an empty one). */
export function parseTable(hash: string): ReadonlyArray<TableItem> | null {
  const raw = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash).get(TABLE_KEY);
  if (raw === null) return null;
  return raw
    .split(ITEMS)
    .map(readItem)
    .filter((item): item is TableItem => item !== null)
    .slice(0, TABLE_CAP);
}

const worldFields = (overrides: TableOverrides): string[] => [
  ...(overrides.mapType !== undefined ? [`type${PAIR}${overrides.mapType}`] : []),
  ...(overrides.band !== undefined ? [`band${PAIR}${overrides.band}`] : []),
  ...(overrides.landFraction !== undefined ? [`land${PAIR}${Math.round(overrides.landFraction * 1000)}`] : []),
  ...(overrides.coastWarp !== undefined ? [`coast${PAIR}${Math.round(overrides.coastWarp * 100)}`] : []),
];

const dressFields = (item: TableItem): string[] =>
  item.kind === "survey"
    ? [
        `legend${PAIR}${item.legend ? 1 : 0}`,
        `arms${PAIR}${item.arms ? 1 : 0}`,
        `beasts${PAIR}${item.beasts ? 1 : 0}`,
        ...(item.theme !== null ? [`theme${PAIR}${item.theme}`] : []),
        `rung${PAIR}${item.rung}`,
        `lx${PAIR}${item.lx}`,
        `ly${PAIR}${item.ly}`,
      ]
    : [
        ...(item.index !== null ? [`i${PAIR}${item.index}`] : []),
        ...(item.year !== null ? [`year${PAIR}${item.year}`] : []),
      ];

const emitItem = (item: TableItem): string =>
  [
    `k${PAIR}${item.kind === "survey" ? "s" : "p"}`,
    `seed${PAIR}${item.seed}`,
    ...worldFields(item.overrides),
    `style${PAIR}${item.style}`,
    ...dressFields(item),
  ].join(FIELDS);

/** The key's VALUE, in one canonical field order, capped. The caller writes it under TABLE_KEY. */
export function emitTable(items: ReadonlyArray<TableItem>): string {
  return items.slice(0, TABLE_CAP).map(emitItem).join(ITEMS);
}

/**
 * The encode half of the lattice: the Glass's settled centre as the integer index the address
 * carries. The same operands `quantizeCenter` uses, so the two agree bit for bit. There is
 * deliberately no window-to-lattice twin: `lodWindowFor` clamps at the sheet edge, so that
 * direction is lossy, and the caller has the camera anyway.
 */
export function latticeFromCentre(
  cx: number,
  cy: number,
  rung: number,
): { readonly lx: number; readonly ly: number } | null {
  const band = regionBand(rung);
  if (!band) return null;
  const step = latticeStep(band);
  const max = latticeMax(band);
  const lx = Math.round(cx / step);
  const ly = Math.round(cy / step);
  if (!Number.isFinite(lx) || !Number.isFinite(ly)) return null;
  return lx < 0 || ly < 0 || lx > max || ly > max ? null : { lx, ly };
}

/** The decode half: the window the redraft must be drawn from, exactly the one `decideSettle` committed. */
export function tableWindow(item: SurveyItem): UvWindow {
  const band = regionBand(item.rung) as LodBand;
  const step = latticeStep(band);
  return lodWindowFor(item.lx * step, item.ly * step, band.sizeUV);
}

/**
 * Sub 3's drafting order: one run per world, worlds in first-seen order. Grouped on the world the
 * ADDRESS states, never on a stringified overrides object, whose key order would split one world
 * into two runs and regenerate the parent twice through the single-entry `worldFor` cache.
 */
export function groupByWorld(items: ReadonlyArray<TableItem>): ReadonlyArray<TableGroup> {
  const order: string[] = [];
  const runs = new Map<string, Array<{ at: number; item: TableItem }>>();
  items.forEach((item, at) => {
    const world = [`seed${PAIR}${item.seed}`, ...worldFields(item.overrides)].join(FIELDS);
    const run = runs.get(world);
    if (run) run.push({ at, item });
    else {
      order.push(world);
      runs.set(world, [{ at, item }]);
    }
  });
  return order.map((world) => ({ world, entries: runs.get(world) as ReadonlyArray<{ at: number; item: TableItem }> }));
}
