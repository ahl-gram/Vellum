import type { P } from "./geom.ts";

export type Lattice = {
  readonly x0: number;
  readonly y0: number;
  readonly h: number;
  readonly n: number;
  readonly pt: (i: number, j: number) => P;
  readonly at: (p: P) => number;
};

export const STEP = 0.125;

export function lattice(cx: number, cy: number, halfSpan: number): Lattice {
  const h = STEP;
  const n = Math.ceil((2 * halfSpan) / h) + 1;
  const x0 = cx - ((n - 1) * h) / 2,
    y0 = cy - ((n - 1) * h) / 2;
  return {
    x0,
    y0,
    h,
    n,
    pt: (i, j) => ({ x: x0 + i * h, y: y0 + j * h }),
    at: (p) => {
      const i = Math.max(0, Math.min(n - 1, Math.round((p.x - x0) / h)));
      const j = Math.max(0, Math.min(n - 1, Math.round((p.y - y0) / h)));
      return j * n + i;
    },
  };
}

export type Mask = number[];

export const blank = (L: Lattice): Mask => new Array<number>(L.n * L.n).fill(0);

export function maskOf(L: Lattice, test: (p: P, k: number) => boolean): Mask {
  const m = blank(L);
  for (let j = 0; j < L.n; j++) for (let i = 0; i < L.n; i++) if (test(L.pt(i, j), j * L.n + i)) m[j * L.n + i] = 1;
  return m;
}

export function neighbours4(L: Lattice, k: number): number[] {
  const i = k % L.n,
    j = (k - i) / L.n;
  const out: number[] = [];
  if (i > 0) out.push(k - 1);
  if (i < L.n - 1) out.push(k + 1);
  if (j > 0) out.push(k - L.n);
  if (j < L.n - 1) out.push(k + L.n);
  return out;
}

// Breadth-first lattice distance (in cells, 4-connected steps times h) from every node of `from` through nodes of `through`.
export function hopDistance(L: Lattice, from: Mask, through: Mask | null): number[] {
  const d = new Array<number>(L.n * L.n).fill(Infinity);
  const queue: number[] = [];
  for (let k = 0; k < from.length; k++)
    if (from[k] === 1) {
      d[k] = 0;
      queue.push(k);
    }
  for (let head = 0; head < queue.length; head++) {
    const k = queue[head]!;
    for (const m of neighbours4(L, k)) {
      if (d[m] !== Infinity || (through !== null && through[m] !== 1)) continue;
      d[m] = d[k]! + L.h;
      queue.push(m);
    }
  }
  return d;
}

export function components(L: Lattice, m: Mask): number[][] {
  const seen = blank(L);
  const out: number[][] = [];
  for (let k = 0; k < m.length; k++) {
    if (m[k] !== 1 || seen[k] === 1) continue;
    const comp = [k];
    seen[k] = 1;
    for (let head = 0; head < comp.length; head++)
      for (const q of neighbours4(L, comp[head]!))
        if (m[q] === 1 && seen[q] !== 1) {
          seen[q] = 1;
          comp.push(q);
        }
    out.push(comp);
  }
  return out;
}

export function boundaryRings(L: Lattice, nodes: ReadonlyArray<number>): P[][] {
  const inSet = new Set(nodes);
  const n = L.n;
  const key = (a: number, b: number): number => b * (2 * n + 3) + a;
  const edges = new Map<
    number,
    Array<{ readonly a2: number; readonly b2: number; readonly to: number; dead: boolean }>
  >();
  const add = (ax: number, ay: number, bx: number, by: number): void => {
    const from = key(ax, ay);
    const list = edges.get(from) ?? [];
    list.push({ a2: bx - ax, b2: by - ay, to: key(bx, by), dead: false });
    edges.set(from, list);
  };
  const has = (i: number, j: number): boolean => i >= 0 && j >= 0 && i < n && j < n && inSet.has(j * n + i);
  for (const k of nodes) {
    const i = k % n,
      j = (k - i) / n;
    const X = 2 * i + 1,
      Y = 2 * j + 1;
    if (!has(i, j + 1)) add(X - 1, Y + 1, X + 1, Y + 1);
    if (!has(i + 1, j)) add(X + 1, Y + 1, X + 1, Y - 1);
    if (!has(i, j - 1)) add(X + 1, Y - 1, X - 1, Y - 1);
    if (!has(i - 1, j)) add(X - 1, Y - 1, X - 1, Y + 1);
  }
  const rings: P[][] = [];
  const toP = (k: number): P => {
    const a = k % (2 * n + 3),
      b = (k - a) / (2 * n + 3);
    return { x: L.x0 + ((a - 1) * L.h) / 2, y: L.y0 + ((b - 1) * L.h) / 2 };
  };
  for (const [start, list] of edges) {
    for (const first of list) {
      if (first.dead) continue;
      const ring: P[] = [toP(start)];
      let cur = first;
      cur.dead = true;
      let guard = 0;
      while (cur.to !== start && guard++ < 1e6) {
        ring.push(toP(cur.to));
        const next = (edges.get(cur.to) ?? []).filter((e) => !e.dead);
        if (next.length === 0) break;
        // With the set on the left and y pointing south, a left turn is (dx, dy) -> (dy, -dx).
        const left = next.find((e) => e.a2 === cur.b2 && e.b2 === -cur.a2);
        const straight = next.find((e) => e.a2 === cur.a2 && e.b2 === cur.b2);
        cur = left ?? straight ?? next[0]!;
        cur.dead = true;
      }
      if (ring.length >= 4) rings.push(dropCollinear(ring));
    }
  }
  return rings;
}

function dropCollinear(ring: P[]): P[] {
  const out: P[] = [];
  const n = ring.length;
  for (let k = 0; k < n; k++) {
    const a = ring[(k + n - 1) % n]!,
      b = ring[k]!,
      c = ring[(k + 1) % n]!;
    if ((b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x) !== 0) out.push(b);
  }
  return out;
}

// Least cost over the lattice, 8-connected, from every source node; `step(k, m, len)` is the cost of a move or Infinity where barred.
export function leastCost(
  L: Lattice,
  sources: ReadonlyArray<number>,
  step: (k: number, m: number, len: number) => number,
): { readonly cost: number[]; readonly prev: number[] } {
  const cost = new Array<number>(L.n * L.n).fill(Infinity);
  const prev = new Array<number>(L.n * L.n).fill(-1);
  const heap: number[] = [];
  const push = (k: number): void => {
    heap.push(k);
    let c = heap.length - 1;
    while (c > 0) {
      const p = (c - 1) >> 1;
      if (cost[heap[p]!]! <= cost[heap[c]!]!) break;
      const t = heap[p]!;
      heap[p] = heap[c]!;
      heap[c] = t;
      c = p;
    }
  };
  const pop = (): number => {
    const top = heap[0]!;
    const last = heap.pop()!;
    if (heap.length > 0) {
      heap[0] = last;
      let c = 0;
      for (;;) {
        const l = 2 * c + 1,
          r = l + 1;
        let s = c;
        if (l < heap.length && cost[heap[l]!]! < cost[heap[s]!]!) s = l;
        if (r < heap.length && cost[heap[r]!]! < cost[heap[s]!]!) s = r;
        if (s === c) break;
        const t = heap[s]!;
        heap[s] = heap[c]!;
        heap[c] = t;
        c = s;
      }
    }
    return top;
  };
  for (const s of sources) {
    cost[s] = 0;
    push(s);
  }
  const done = new Array<boolean>(L.n * L.n).fill(false);
  const D = L.h * Math.SQRT2;
  while (heap.length > 0) {
    const k = pop();
    if (done[k]) continue;
    done[k] = true;
    const i = k % L.n,
      j = (k - i) / L.n;
    for (let dj = -1; dj <= 1; dj++)
      for (let di = -1; di <= 1; di++) {
        if (di === 0 && dj === 0) continue;
        const ni = i + di,
          nj = j + dj;
        if (ni < 0 || nj < 0 || ni >= L.n || nj >= L.n) continue;
        const m = nj * L.n + ni;
        if (done[m]) continue;
        const c = step(k, m, di !== 0 && dj !== 0 ? D : L.h);
        if (c === Infinity) continue;
        if (cost[k]! + c < cost[m]!) {
          cost[m] = cost[k]! + c;
          prev[m] = k;
          push(m);
        }
      }
  }
  return { cost, prev };
}

export function walkBack(prev: ReadonlyArray<number>, from: number, stopAt: (k: number) => boolean): number[] {
  const out = [from];
  let k = from;
  let guard = 0;
  while (prev[k]! >= 0 && guard++ < 1e6) {
    k = prev[k]!;
    out.push(k);
    if (stopAt(k)) break;
  }
  return out;
}
