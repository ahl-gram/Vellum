import type { ProspectGeometry } from "./geometry.ts";
import type { ProspectInput } from "./input.ts";
import type { PlateEra } from "./caption.ts";
import type { Surroundings } from "./surroundings.ts";

/** `letter` is the plate's mark for the entry (a numeral since Issue #754); x and y anchor a composed feature's tag, `town` names the road town a horizon tag stands over. */
export type PlateKeyEntry = {
  readonly letter: string;
  readonly label: string;
  readonly x: number | null;
  readonly y: number | null;
  readonly town: number | null;
};

const RANK = ["keep", "bridge", "quay", "mole", "jetty", "mill", "weir"] as const;
type Rank = (typeof RANK)[number];

const LABEL: Record<Rank, string> = {
  keep: "The Keep",
  bridge: "The Bridge Gate",
  quay: "The Quay",
  mole: "The Mole",
  jetty: "The Jetty",
  mill: "The Weir Mill",
  weir: "The Weir",
};

const MAX_FEATURES = 4;
const MAX_ENTRIES = 8;

type Draft = { readonly label: string; readonly x: number | null; readonly y: number | null; readonly town: number | null };

function composedFeatures(g: ProspectGeometry): Draft[] {
  const found: Array<{ readonly rank: Rank; readonly x: number; readonly y: number }> = [];
  const keep = g.masses.find((m) => m.form === "keep");
  if (keep) found.push({ rank: "keep", x: keep.x + keep.w / 2, y: keep.base - keep.h - 10 });
  for (const e of g.foreground) {
    if (e.kind === "bridge") {
      const t = e.gateTower;
      found.push({ rank: "bridge", x: t.x + t.w / 2, y: t.base - t.h - 10 });
    } else if (e.kind === "quay") {
      found.push({ rank: "quay", x: (e.x0 + e.x1) / 2, y: e.y - 12 });
    } else if (e.kind === "mole") {
      found.push({ rank: "mole", x: e.headX, y: e.headY - 12 });
    } else if (e.kind === "jetty") {
      found.push({ rank: "jetty", x: (e.x0 + e.x1) / 2, y: Math.min(e.y0, e.y1) - 12 });
    } else if (e.kind === "mill") {
      found.push({ rank: "mill", x: e.house.x + e.house.w / 2, y: e.house.base - e.house.h - 12 });
    } else if (e.kind === "weir") {
      found.push({ rank: "weir", x: (e.x0 + e.x1) / 2, y: e.y - 12 });
    }
  }
  return [...found]
    .sort((a, b) => RANK.indexOf(a.rank) - RANK.indexOf(b.rank) || a.x - b.x)
    .slice(0, MAX_FEATURES)
    .map((c) => ({ label: LABEL[c.rank], x: c.x, y: c.y, town: null }));
}

const lowerThe = (name: string): string => name.replace(/^The /, "the ");

export type KeyContext = { readonly input: ProspectInput; readonly surroundings: Surroundings; readonly era: PlateEra };

/** The world's entries in the round's order (design/prospects-after-braun-hogenberg/mock/furniture.ts, keyLines): the sea, the river, the range, the road towns, the beast, the realm. */
function worldEntries(g: ProspectGeometry, ctx: KeyContext): Draft[] {
  const { input, surroundings: s, era } = ctx;
  const plain = (label: string): Draft => ({ label, x: null, y: null, town: null });
  return [
    ...(input.harbor && s.seaName !== null ? [plain(s.seaName)] : []),
    ...(s.riverName === null ? [] : [plain(s.riverName)]),
    ...(s.rangeName !== null && g.ridge !== null ? [plain(s.rangeName)] : []),
    ...(era === "before-founding" ? [] : s.roadTowns.map((t, i) => ({ label: `The road to ${t.name}`, x: null, y: null, town: i }))),
    ...(s.beast === null ? [] : [plain(`${s.beast.name}, ${s.beast.epithet}`)]),
    ...(input.realmName !== null && input.kind !== "capital" && era !== "before-founding" && s.realmProclaimed ? [plain(`In ${lowerThe(input.realmName)}`)] : []),
  ];
}

export function plateKey(g: ProspectGeometry, ctx: KeyContext | null = null): ReadonlyArray<PlateKeyEntry> {
  const drafts = [...composedFeatures(g), ...(ctx === null ? [] : worldEntries(g, ctx))];
  return drafts.slice(0, MAX_ENTRIES).map((d, i) => ({ letter: String(i + 1), ...d }));
}
