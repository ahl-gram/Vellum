import type { Box, Pt } from "../geometry.ts";
import { spacedTextBox } from "../geometry.ts";
import type { Projection } from "../transform.ts";

/**
 * #145: a realm must ALWAYS carry its name.
 *
 * The old search tried five candidates, all on the blob centroid's x, moving only
 * in y. One crowded column of settlement labels (settlements claim the arena
 * first) dropped the name silently, even with thousands of the realm's own cells
 * free elsewhere. This keeps those five candidates, in their original order, and
 * only then widens the search, so any label that places today places identically
 * and the committed charts stay byte-identical.
 *
 * The escalation, in order:
 *   1. the caller's vertical ladder at the centroid's x (the historical behaviour)
 *   2. interior cells of the realm's own blob, nearest the centroid first
 *   3. a forced placement at the centroid, claimed so later labels route around it
 *
 * Pure: the arena is injected, nothing here touches the DOM or an rng.
 */

/** How many interior cells of the blob stage 2 is willing to probe. */
const MAX_INTERIOR_PROBES = 240;

/** Padding the realm name reserves around itself, matching the historical call. */
const CLAIM_PAD = 4;

export type RealmLabelArena = {
  tryClaim(box: Box, pad?: number): boolean;
  claim(box: Box): void;
};

export type RealmLabelPlacement = {
  readonly x: number;
  readonly y: number;
  /** False when stage 3 forced the label in; it may overlap a neighbour. */
  readonly claimed: boolean;
};

type Args = {
  /** Cell indices of the realm's largest contiguous blob. */
  readonly blob: ReadonlyArray<number>;
  readonly gridW: number;
  readonly proj: Projection;
  /** Projected centroid of the blob; stage 1 and 3 both anchor here. */
  readonly centroid: Pt;
  /** The historical vertical ladder, tried first and in order. */
  readonly yCandidates: ReadonlyArray<number>;
  readonly name: string;
  readonly fs: number;
  readonly ls: number;
  readonly arena: RealmLabelArena;
};

/** The label's box must sit inside the drawn map, not out on the frame. */
function withinChart(box: Box, proj: Projection): boolean {
  return box.x >= proj.margin && box.x + box.w <= proj.widthPx - proj.margin;
}

/**
 * Blob cells ordered nearest-centroid first, thinned to at most
 * MAX_INTERIOR_PROBES so a 20k-cell realm does not cost 20k box tests. Ties break
 * on cell index, so the order never depends on how the blob was walked.
 */
function interiorProbes(
  blob: ReadonlyArray<number>,
  gridW: number,
  proj: Projection,
  centroid: Pt,
): Pt[] {
  const scored = blob.map((i) => {
    const x = proj.px(i % gridW);
    const y = proj.py((i / gridW) | 0);
    const dx = x - centroid.x;
    const dy = y - centroid.y;
    return { i, x, y, d2: dx * dx + dy * dy };
  });
  scored.sort((a, b) => (a.d2 !== b.d2 ? a.d2 - b.d2 : a.i - b.i));
  const stride = Math.max(1, Math.ceil(scored.length / MAX_INTERIOR_PROBES));
  const out: Pt[] = [];
  for (let n = 0; n < scored.length; n += stride) {
    out.push({ x: scored[n]!.x, y: scored[n]!.y });
  }
  return out;
}

/**
 * Place a realm name. Never fails: a realm always gets its label, even if the last
 * resort has to sit over a neighbour.
 */
export function placeRealmLabel({
  blob,
  gridW,
  proj,
  centroid,
  yCandidates,
  name,
  fs,
  ls,
  arena,
}: Args): RealmLabelPlacement {
  const boxAt = (x: number, y: number) => spacedTextBox(x, y, name, fs, ls);

  // Stage 1: the historical ladder, first and byte-for-byte unchanged, so every
  // label that places today places identically. Deliberately NOT filtered by
  // withinChart: adding that test here would move existing labels and force a regen.
  for (const y of yCandidates) {
    const box = boxAt(centroid.x, y);
    if (arena.tryClaim(box, CLAIM_PAD)) {
      return { x: centroid.x, y, claimed: true };
    }
  }

  // Stage 2: anywhere over the realm's own heartland, nearest the centroid first.
  for (const p of interiorProbes(blob, gridW, proj, centroid)) {
    const box = boxAt(p.x, p.y);
    if (withinChart(box, proj) && arena.tryClaim(box, CLAIM_PAD)) {
      return { x: p.x, y: p.y, claimed: true };
    }
  }

  // Stage 3: the guarantee. Force it in at the centroid, nudged inside the chart,
  // and claim the space so later labels route around the name rather than into it.
  const half = boxAt(centroid.x, centroid.y).w / 2;
  const minX = proj.margin + half;
  const maxX = proj.widthPx - proj.margin - half;
  const x = maxX >= minX ? Math.min(maxX, Math.max(minX, centroid.x)) : centroid.x;
  arena.claim(boxAt(x, centroid.y));
  return { x, y: centroid.y, claimed: false };
}
