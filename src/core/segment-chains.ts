export type Seg = readonly [number, number, number, number];
export type ChainPoint = [number, number];

export function chainBorderSegments(segs: ReadonlyArray<Seg>): ChainPoint[][] {
  const key = (x: number, y: number): string =>
    `${Math.round(x * 4)},${Math.round(y * 4)}`;
  const touching = new Map<string, number[]>();
  segs.forEach((s, i) => {
    for (const k of [key(s[0], s[1]), key(s[2], s[3])]) {
      const list = touching.get(k);
      if (list) list.push(i);
      else touching.set(k, [i]);
    }
  });

  const used = new Uint8Array(segs.length);
  const chains: ChainPoint[][] = [];

  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue;
    used[i] = 1;
    const s = segs[i] as Seg;
    const chain: ChainPoint[] = [[s[0], s[1]], [s[2], s[3]]];

    for (const end of [1, 0] as const) {
      for (;;) {
        const tip = end === 1 ? chain[chain.length - 1]! : chain[0]!;
        const candidates = touching.get(key(tip[0], tip[1])) ?? [];
        let nextIdx = -1;
        for (const c of candidates) {
          if (!used[c]) {
            nextIdx = c;
            break;
          }
        }
        if (nextIdx === -1) break;
        used[nextIdx] = 1;
        const t = segs[nextIdx] as Seg;
        const startsAtTip = key(t[0], t[1]) === key(tip[0], tip[1]);
        const far: ChainPoint = startsAtTip ? [t[2], t[3]] : [t[0], t[1]];
        if (end === 1) chain.push(far);
        else chain.unshift(far);
      }
    }
    chains.push(chain);
  }
  return chains;
}

/** The label-boundary segment scan both the world border layer and the region carry draw from: one segment per adjacent differing-label land pair. */
export function labelBorderSegments(labels: Int16Array, w: number, h: number): Seg[] {
  const segs: Seg[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = labels[x + y * w] as number;
      if (a < 0) continue;
      if (x + 1 < w) {
        const b = labels[x + 1 + y * w] as number;
        if (b >= 0 && b !== a) {
          segs.push([x + 0.5, y - 0.5, x + 0.5, y + 0.5]);
        }
      }
      if (y + 1 < h) {
        const b = labels[x + (y + 1) * w] as number;
        if (b >= 0 && b !== a) {
          segs.push([x - 0.5, y + 0.5, x + 0.5, y + 0.5]);
        }
      }
    }
  }
  return segs;
}
