import { NEIGHBORS_4, NEIGHBORS_8 } from "../core/grid.ts";
import { createMinHeap } from "../core/heap.ts";

/**
 * Snap internal realm borders onto the major rivers and watershed divides that
 * run alongside them (#80). A spike proved this cannot be cost-tuning: a
 * cost-bisector follows the midline between two seats, not a river, so raising the
 * river weight 16x moved borders under 1%. So we move the partition explicitly.
 *
 * The move is LOCAL and CONDITIONAL, matching the issue: "move the labels boundary
 * onto that feature for the stretch they run together" and "featureless stretches
 * remain straight bisectors". A feature only acts where it already lies within
 * `corridor` cells of an internal border; elsewhere nothing changes.
 *
 * Mechanism (corridor re-flood):
 *   1. Find the internal border and the feature cells that lie within `corridor`
 *      of it -- those become "walls".
 *   2. Freeze everything outside the corridor; re-flood the corridor from the
 *      frozen anchors, with walls as one-cell membranes a flood can touch but not
 *      cross. Each realm floods up to the wall from its side; the boundary lands
 *      on the feature.
 *   3. Revert any change that is not adjacent (within `corridor`) to a wall, so a
 *      featureless stretch is byte-stable and no wiggle is invented.
 *
 * Operates on the partition's own `labels` buffer in place (like floodRealms):
 * land is `labels[i] >= 0`, ocean/unassigned is -1, so seatless islands (still -1
 * at this stage) are correctly excluded -- they carry no internal border.
 */
export function snapBordersToFeatures(
  labels: Int16Array,
  w: number,
  h: number,
  landmassIds: Int32Array,
  featureMask: Uint8Array,
  corridor: number,
  seatCells: ReadonlyArray<number>,
): void {
  const n = w * h;

  // 1. internal border cells: land, a 4-neighbour on the same landmass in another realm.
  const border: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = x + y * w;
      const r = labels[i] as number;
      if (r < 0) continue;
      for (const [dx, dy] of NEIGHBORS_4) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const j = nx + ny * w;
        if ((labels[j] as number) >= 0 && (labels[j] as number) !== r &&
            (landmassIds[j] as number) === (landmassIds[i] as number)) {
          border.push(i);
          break;
        }
      }
    }
  }
  if (border.length === 0) return;

  const isLand = (i: number): boolean => (labels[i] as number) >= 0;

  // 2. Chebyshev distance to the border (8-conn BFS over land), capped at corridor+1.
  const db = bfsCap(border, corridor + 1, w, h, landmassIds, isLand);

  // 3. walls: feature cells lying within `corridor` of an internal border.
  const wall = new Uint8Array(n);
  let anyWall = false;
  for (let i = 0; i < n; i++) {
    if (featureMask[i] && isLand(i)) {
      const d = db[i] as number;
      if (d >= 0 && d <= corridor) { wall[i] = 1; anyWall = true; }
    }
  }
  if (!anyWall) return;

  // 4. distance to the nearest wall (capped at corridor), to gate spurious drift.
  const wallCells: number[] = [];
  for (let i = 0; i < n; i++) if (wall[i]) wallCells.push(i);
  const dw = bfsCap(wallCells, corridor, w, h, landmassIds, isLand);

  // 5. re-flood the corridor (db in [0..corridor]) from the frozen ring just outside
  //    it (db === corridor+1), walls acting as membranes. `origin` carries each
  //    source's realm label; ties break by lower label then are index-stable.
  const out = Int16Array.from(labels);
  const dist = new Float64Array(n).fill(Infinity);
  const origin = new Int16Array(n).fill(-1);
  const heap = createMinHeap();
  for (let i = 0; i < n; i++) {
    if (isLand(i) && (db[i] as number) === corridor + 1) {
      dist[i] = 0;
      origin[i] = labels[i] as number; // anchors keep their own label
      heap.push(i, 0);
    }
  }
  // Seats are frozen anchors: seed each at cost 0 with its own realm so it can never
  // be reached more cheaply by a neighbour's flood, even when a wall cuts it off from
  // the rest of its realm. Guards the "seats never move" invariant / realm survival.
  for (const s of seatCells) {
    if (!isLand(s) || (dist[s] as number) === 0) continue;
    dist[s] = 0;
    origin[s] = labels[s] as number;
    heap.push(s, 0);
  }
  while (heap.size() > 0) {
    const u = heap.pop();
    const du = dist[u] as number;
    // settle: a corridor cell adopts the winning origin's label
    if ((db[u] as number) <= corridor) out[u] = origin[u] as number;
    if (wall[u]) continue; // a membrane is claimable but never propagates
    const ux = u % w;
    const uy = (u / w) | 0;
    for (const [dx, dy, stepDist] of NEIGHBORS_8) {
      const nx = ux + dx;
      const ny = uy + dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const v = nx + ny * w;
      if (!isLand(v)) continue;
      if ((landmassIds[v] as number) !== (landmassIds[u] as number)) continue;
      // A diagonal step must not slip between two diagonally-adjacent wall cells: the
      // membrane would leak and the border would not trace a diagonal feature.
      if (dx !== 0 && dy !== 0 && wall[nx + uy * w] && wall[ux + ny * w]) continue;
      if ((db[v] as number) < 0 || (db[v] as number) > corridor) continue; // only flood INTO the corridor
      const nd = du + stepDist;
      const cur = dist[v] as number;
      const cand = origin[u] as number;
      if (nd < cur - 1e-9 || (Math.abs(nd - cur) <= 1e-9 && cand < (origin[v] as number))) {
        dist[v] = nd;
        origin[v] = cand;
        heap.push(v, nd);
      }
    }
  }

  // 6. keep a change only where it hugs a wall; revert featureless drift.
  for (let i = 0; i < n; i++) {
    if ((db[i] as number) < 0 || (db[i] as number) > corridor) continue;
    if ((out[i] as number) !== (labels[i] as number) && (dw[i] as number) < 0) {
      out[i] = labels[i] as number; // too far from any wall: not a real snap
    }
  }

  labels.set(out);
}

/**
 * Multi-source 8-connected BFS distance over passable cells, capped at `cap`, never
 * stepping to a different landmass (landmasses can touch at a diagonal corner, and an
 * unguarded [1,1] hop would leak the distance field across the water gap).
 */
function bfsCap(
  sources: ReadonlyArray<number>,
  cap: number,
  w: number,
  h: number,
  landmassIds: Int32Array,
  passable: (i: number) => boolean,
): Int32Array {
  const d = new Int32Array(w * h).fill(-1);
  let frontier: number[] = [];
  for (const s of sources) {
    if (d[s] === -1) { d[s] = 0; frontier.push(s); }
  }
  let depth = 0;
  while (frontier.length > 0 && depth < cap) {
    depth++;
    const next: number[] = [];
    for (const i of frontier) {
      const x = i % w;
      const y = (i / w) | 0;
      for (const [dx, dy] of NEIGHBORS_8) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const j = nx + ny * w;
        if (d[j] !== -1 || !passable(j)) continue;
        if ((landmassIds[j] as number) !== (landmassIds[i] as number)) continue;
        d[j] = depth;
        next.push(j);
      }
    }
    frontier = next;
  }
  return d;
}
