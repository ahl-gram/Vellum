import type { ProspectGeometry } from "./geometry.ts";

export type PlateKeyEntry = {
  readonly letter: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
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

const MAX_ENTRIES = 4;

export function plateKey(g: ProspectGeometry): ReadonlyArray<PlateKeyEntry> {
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
  const ranked = [...found].sort(
    (a, b) => RANK.indexOf(a.rank) - RANK.indexOf(b.rank) || a.x - b.x,
  );
  return ranked.slice(0, MAX_ENTRIES).map((c, i) => ({
    letter: String.fromCharCode(65 + i),
    label: LABEL[c.rank],
    x: c.x,
    y: c.y,
  }));
}
