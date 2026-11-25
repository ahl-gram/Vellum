// Issue #1256 round: where each place's name stands. Above its place as the chart of the atelier sets every name, unless that box meets a place, a waypoint or a name already set, then to its right, its left, or under it, in that order; the first that meets nothing is taken, the capital first, then the taught towns and isles, then the untaught. Widths are estimated, not measured: 0.58 of the size a letter, from the house's Fell small capitals as the browser set them on 2026-11-24 (0.45 to 0.56, `measure/draft/draft-results.json`), so the probe on every still is the real check.
export interface Box {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface Item {
  readonly route: string;
  readonly x: number;
  readonly y: number;
  readonly ext: number;
  readonly text: string;
  readonly size: number;
}

export interface Placed {
  readonly route: string;
  readonly text: string;
  readonly size: number;
  readonly tx: number;
  readonly ty: number;
  readonly anchor: "start" | "middle" | "end";
  readonly box: Box;
  readonly side: "above" | "right" | "left" | "below";
  readonly forced: boolean;
}

const PER_LETTER = 0.58;
const PAD = 1.5;

const meets = (a: Box, b: Box): boolean =>
  a.x < b.x + b.w + PAD && b.x < a.x + a.w + PAD && a.y < b.y + b.h + PAD && b.y < a.y + a.h + PAD;

const r1 = (v: number): number => Math.round(v * 10) / 10;

function candidates(it: Item): readonly Omit<Placed, "route" | "text" | "size" | "forced">[] {
  const w = it.text.length * PER_LETTER * it.size;
  const up = 0.82 * it.size;
  const h = 1.07 * it.size;
  const gap = 3;
  const aboveY = it.y - it.ext - gap - 0.25 * it.size;
  const sideY = it.y + 0.33 * it.size;
  const belowY = it.y + it.ext + gap + up;
  return [
    { side: "above", anchor: "middle", tx: it.x, ty: r1(aboveY), box: { x: it.x - w / 2, y: aboveY - up, w, h } },
    { side: "right", anchor: "start", tx: r1(it.x + it.ext + gap), ty: r1(sideY), box: { x: it.x + it.ext + gap, y: sideY - up, w, h } },
    { side: "left", anchor: "end", tx: r1(it.x - it.ext - gap), ty: r1(sideY), box: { x: it.x - it.ext - gap - w, y: sideY - up, w, h } },
    { side: "below", anchor: "middle", tx: it.x, ty: r1(belowY), box: { x: it.x - w / 2, y: belowY - up, w, h } },
  ];
}

export function placeLabels(items: readonly Item[], obstacles: readonly Box[]): readonly Placed[] {
  const placed: Placed[] = [];
  for (const it of items) {
    const all = candidates(it);
    const free = all.find((c) => !obstacles.some((o) => meets(c.box, o)) && !placed.some((p) => meets(c.box, p.box)));
    const c = free ?? all[0]!;
    placed.push({ route: it.route, text: it.text, size: it.size, ...c, forced: free === undefined });
  }
  return placed;
}
