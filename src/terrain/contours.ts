import type { Field } from "../core/grid.ts";

export type Point = readonly [number, number];

export type Contour = {
  readonly points: ReadonlyArray<Point>;
  readonly closed: boolean;
};

type Seg = readonly [number, number, number, number];

// The clamp keeps crossings off exact lattice corners, where chain-walking would become ambiguous.
const T_MIN = 1e-6;
const T_MAX = 1 - 1e-6;

function crossT(a: number, b: number, iso: number): number {
  const t = (iso - a) / (b - a);
  return t < T_MIN ? T_MIN : t > T_MAX ? T_MAX : t;
}

function key(x: number, y: number): string {
  return `${Math.round(x * 1e6)},${Math.round(y * 1e6)}`;
}

function cellSegments(x: number, y: number, corners: readonly [number, number, number, number], iso: number): Seg[] {
  const [a, b, c, d] = corners;
  const segs: Seg[] = [];
  const idx =
    (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (c > iso ? 2 : 0) | (d > iso ? 1 : 0);
  if (idx === 0 || idx === 15) return segs;

  const top: Point = [x + crossT(a, b, iso), y];
  const right: Point = [x + 1, y + crossT(b, c, iso)];
  const bottom: Point = [x + crossT(d, c, iso), y + 1];
  const left: Point = [x, y + crossT(a, d, iso)];

  const add = (p: Point, q: Point): void => {
    segs.push([p[0], p[1], q[0], q[1]]);
  };

  switch (idx) {
    case 1: add(bottom, left); break;
    case 2: add(right, bottom); break;
    case 3: add(right, left); break;
    case 4: add(top, right); break;
    case 5: {
      const center = (a + b + c + d) / 4;
      if (center > iso) { add(top, left); add(bottom, right); } else { add(top, right); add(bottom, left); }
      break;
    }
    case 6: add(top, bottom); break;
    case 7: add(top, left); break;
    case 8: add(left, top); break;
    case 9: add(bottom, top); break;
    case 10: {
      const center = (a + b + c + d) / 4;
      if (center > iso) { add(right, top); add(left, bottom); } else { add(left, top); add(right, bottom); }
      break;
    }
    case 11: add(right, top); break;
    case 12: add(left, right); break;
    case 13: add(bottom, right); break;
    case 14: add(left, bottom); break;
  }
  return segs;
}

export function marchingSquares(field: Field, iso: number): Contour[] {
  const { w, h, data } = field;
  const segs: Seg[] = [];

  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w - 1; x++) {
      const a = data[x + y * w] as number;
      const b = data[x + 1 + y * w] as number;
      const c = data[x + 1 + (y + 1) * w] as number;
      const d = data[x + (y + 1) * w] as number;
      segs.push(...cellSegments(x, y, [a, b, c, d], iso));
    }
  }

  return chainSegments(segs);
}

function startIndex(segs: ReadonlyArray<Seg>): Map<string, number[]> {
  const byStart = new Map<string, number[]>();
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i] as Seg;
    const k = key(s[0], s[1]);
    const list = byStart.get(k);
    if (list) list.push(i);
    else byStart.set(k, [i]);
  }
  return byStart;
}

function headSegment(segs: ReadonlyArray<Seg>, used: Uint8Array, headKey: string): number {
  for (let j = 0; j < segs.length; j++) {
    if (used[j]) continue;
    const s = segs[j] as Seg;
    if (key(s[2], s[3]) === headKey) return j;
  }
  return -1;
}

function createChainWalker(segs: ReadonlyArray<Seg>): (i: number) => Contour | null {
  const byStart = startIndex(segs);
  const used = new Uint8Array(segs.length);
  const takeFrom = (k: string): number => {
    const list = byStart.get(k);
    if (!list) return -1;
    while (list.length > 0) {
      const i = list.pop() as number;
      if (!used[i]) return i;
    }
    return -1;
  };
  const walkForward = (first: Seg): { points: Point[]; closed: boolean } => {
    const points: Point[] = [[first[0], first[1]], [first[2], first[3]]];
    const startKey = key(first[0], first[1]);
    let endKey = key(first[2], first[3]);
    while (endKey !== startKey) {
      const next = takeFrom(endKey);
      if (next === -1) break;
      used[next] = 1;
      const s = segs[next] as Seg;
      points.push([s[2], s[3]]);
      endKey = key(s[2], s[3]);
    }
    return { points, closed: endKey === startKey };
  };

  const walkBackward = (startKey: string): Point[] => {
    const prefix: Point[] = [];
    let headKey = startKey;
    for (;;) {
      const found = headSegment(segs, used, headKey);
      if (found === -1) break;
      used[found] = 1;
      const s = segs[found] as Seg;
      prefix.push([s[0], s[1]]);
      headKey = key(s[0], s[1]);
    }
    return prefix.reverse();
  };

  return (i: number): Contour | null => {
    if (used[i]) return null;
    used[i] = 1;
    const first = segs[i] as Seg;
    const { points, closed } = walkForward(first);
    if (closed) return { points, closed };
    return { points: [...walkBackward(key(first[0], first[1])), ...points], closed: false };
  };
}

function chainSegments(segs: ReadonlyArray<Seg>): Contour[] {
  const chainFrom = createChainWalker(segs);
  const contours: Contour[] = [];
  for (let i = 0; i < segs.length; i++) {
    const contour = chainFrom(i);
    if (contour) contours.push(contour);
  }
  return contours;
}

type BoundaryFrame = {
  readonly tOf: (p: Point) => number;
  readonly mod: (a: number) => number;
  readonly cornersBetween: (from: number, to: number) => Point[];
};

function boundaryFrame(w: number, h: number, eps: number): BoundaryFrame {
  const W = w - 1;
  const H = h - 1;
  const P = 2 * W + 2 * H;

  // Boundary parameter t: left edge walking down, bottom edge right, right edge up, top edge left.
  const tOf = (p: Point): number => {
    const [x, y] = p;
    if (x <= eps) return y;
    if (y >= H - eps) return H + x;
    if (x >= W - eps) return H + W + (H - y);
    if (y <= eps) return 2 * H + W + (W - x);
    throw new RangeError(`open chain endpoint not on boundary: ${x},${y}`);
  };

  const CORNERS: ReadonlyArray<readonly [number, Point]> = [
    [0, [0, 0]],
    [H, [0, H]],
    [H + W, [W, H]],
    [2 * H + W, [W, 0]],
  ];

  const mod = (a: number): number => ((a % P) + P) % P;

  const cornersBetween = (from: number, to: number): Point[] => {
    const span = mod(to - from);
    return CORNERS
      .map(([tc, pt]) => ({ delta: mod(tc - from), pt }))
      .filter(({ delta }) => delta > eps && delta < span - eps)
      .sort((a, b) => a.delta - b.delta)
      .map(({ pt }) => pt);
  };

  return { tOf, mod, cornersBetween };
}

function nearestOpenStart(
  open: ReadonlyArray<Contour>,
  used: ReadonlyArray<boolean>,
  endT: number,
  frame: BoundaryFrame,
): { bestJ: number; bestDelta: number } {
  const { tOf, mod } = frame;
  let bestJ = -1;
  let bestDelta = Infinity;
  for (let j = 0; j < open.length; j++) {
    if (used[j]) continue;
    const c = open[j] as Contour;
    const delta = mod(tOf(c.points[0] as Point) - endT);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestJ = j;
    }
  }
  return { bestJ, bestDelta };
}

export function closeChainsOnBoundary(
  contours: ReadonlyArray<Contour>,
  w: number,
  h: number,
): Contour[] {
  const frame = boundaryFrame(w, h, 1e-4);
  const { tOf, mod, cornersBetween } = frame;

  const out: Contour[] = contours.filter((c) => c.closed).map((c) => ({
    points: [...c.points],
    closed: true,
  }));
  const open = contours.filter((c) => !c.closed);
  const used = new Array<boolean>(open.length).fill(false);

  for (let i = 0; i < open.length; i++) {
    if (used[i]) continue;
    used[i] = true;
    const first = open[i] as Contour;
    const ring: Point[] = [...first.points];
    const homeT = tOf(first.points[0] as Point);
    let endT = tOf(first.points[first.points.length - 1] as Point);

    for (let guard = 0; guard <= open.length + 4; guard++) {
      const { bestJ, bestDelta } = nearestOpenStart(open, used, endT, frame);
      const selfDelta = mod(homeT - endT);
      if (bestJ === -1 || selfDelta <= bestDelta) {
        ring.push(...cornersBetween(endT, homeT));
        break;
      }
      const next = open[bestJ] as Contour;
      used[bestJ] = true;
      ring.push(...cornersBetween(endT, tOf(next.points[0] as Point)));
      ring.push(...next.points);
      endT = tOf(next.points[next.points.length - 1] as Point);
    }

    out.push({ points: ring, closed: true });
  }

  return out;
}

export function closedIsoRings(field: Field, iso: number): Contour[] {
  return closeChainsOnBoundary(marchingSquares(field, iso), field.w, field.h);
}

export {
  chaikinSmooth,
  chaikinSmoothPinned,
  coastSmoothingIterations,
  ringArea,
} from "./polyline.ts";
