import type { World } from "./types.ts";
import type { Quarry } from "./daily-hunt.ts";

export type ClueKind =
  | "framing"
  | "ew"
  | "ns"
  | "river"
  | "lake"
  | "coast"
  | "onriver"
  | "realm";

/**
 * One antique survey line. `subject` carries the geometric fact a feature clue
 * asserts (a feature name, or a band token for the positional clues) so callers
 * and tests can verify truthfulness without parsing prose.
 */
export type Clue = {
  readonly kind: ClueKind;
  readonly text: string;
  readonly subject?: string;
};

/** Grid-cell radius within which a named river or lake is "near" the quarry. */
const NEAR = 4;

/**
 * Emit only geometrically truthful antique clues, always at least three: a
 * constant framing line plus an always-true east/west band and an always-true
 * north/south band (each with a central-tie wording so neither is ever empty).
 * Feature clues are appended only when each holds, so the floor of three is
 * guaranteed for any world, including featureless off-grid seeds.
 */
export function buildClues(world: World, quarry: Quarry): Clue[] {
  const s = quarry.settlement;
  const { x, y } = s;
  const clues: Clue[] = [];

  clues.push({
    kind: "framing",
    text:
      "Today's survey hides one small place, set down on the chart but left " +
      "unnamed in these notes. Read the lines, then find it.",
  });

  const cx = (world.elev.w - 1) / 2;
  const ew = x < cx ? "west" : x > cx ? "east" : "central";
  clues.push({
    kind: "ew",
    subject: ew,
    text:
      ew === "east"
        ? "It lies toward the eastern reach of the chart."
        : ew === "west"
          ? "It lies toward the western reach of the chart."
          : "It sits near the chart's central meridian, neither east nor west.",
  });

  const cy = (world.elev.h - 1) / 2;
  const ns = y < cy ? "north" : y > cy ? "south" : "central";
  clues.push({
    kind: "ns",
    subject: ns,
    text:
      ns === "north"
        ? "It lies in the northern part of the chart."
        : ns === "south"
          ? "It lies in the southern part of the chart."
          : "It sits near the chart's middle latitude, neither north nor south.",
  });

  const river = nearestNamedRiver(world, x, y);
  if (river && river.dist <= NEAR) {
    clues.push({
      kind: "river",
      subject: river.name,
      text: `It stands within sight of the river ${river.name}.`,
    });
  }

  const lake = nearestNamedLake(world, x, y);
  if (lake && lake.dist <= NEAR) {
    clues.push({
      kind: "lake",
      subject: lake.name,
      text: `Its prospect takes in the waters of ${lake.name}.`,
    });
  }

  if (s.harbor) {
    clues.push({ kind: "coast", text: "It is a harbor settlement, open to the sea." });
  }

  if (s.onRiver) {
    clues.push({ kind: "onriver", text: "A river runs through its bounds." });
  }

  const realm = realmNameAt(world, x, y);
  if (realm) {
    clues.push({ kind: "realm", subject: realm, text: `It answers to ${realm}.` });
  }

  return clues;
}

/**
 * Drop feature clues that name a map feature the chart never labeled, so the
 * hunt never sends a player looking for a name that is not printed anywhere.
 *
 * `buildClues` is a pure function of the World and (correctly) cites the nearest
 * NAMED river/lake, but the renderer only draws a subset of those labels (short
 * courses and collision losers are skipped, see `feature-labels.ts`). This prune
 * runs AFTER `buildClues`, keying off each clue's `subject`, and keeps a
 * `river`/`lake` clue only when `isLabeled(subject)` reports the label was drawn.
 * The caller (the page, which owns the rendered SVG) supplies `isLabeled`; all
 * other clue kinds pass through untouched. Returns a new array (never mutates).
 */
export function pruneUnlabeledFeatureClues(
  clues: readonly Clue[],
  isLabeled: (name: string) => boolean,
): Clue[] {
  return clues.filter((c) => {
    if (c.kind !== "river" && c.kind !== "lake") return true;
    return c.subject !== undefined && isLabeled(c.subject);
  });
}

// --- internal geometry -------------------------------------------------------

function nearestNamedRiver(
  world: World,
  x: number,
  y: number,
): { name: string; dist: number } | null {
  let best: { name: string; dist: number } | null = null;
  for (const [i, name] of world.names.rivers) {
    const river = world.rivers[i];
    if (!river) continue;
    let d = Infinity;
    for (const p of river.points) d = Math.min(d, Math.hypot(p.x - x, p.y - y));
    if (best === null || d < best.dist) best = { name, dist: d };
  }
  return best;
}

function nearestNamedLake(
  world: World,
  x: number,
  y: number,
): { name: string; dist: number } | null {
  let best: { name: string; dist: number } | null = null;
  for (const lk of world.names.lakes) {
    const d = Math.hypot(lk.x - x, lk.y - y);
    if (best === null || d < best.dist) best = { name: lk.name, dist: d };
  }
  return best;
}

function realmNameAt(world: World, x: number, y: number): string | null {
  if (world.names.realms.length < 2) return null;
  const id = world.realms.labels[x + y * world.elev.w];
  return id >= 0 ? (world.names.realms[id] ?? null) : null;
}
