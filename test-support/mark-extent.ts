export type Extent = { readonly x0: number; readonly y0: number; readonly x1: number; readonly y1: number };

const NUM = String.raw`-?\d+(?:\.\d+)?(?:e-?\d+)?`;

function attr(tag: string, name: string): number {
  const m = tag.match(new RegExp(`(?:^|\\s)${name}="(${NUM})"`));
  if (m === null) throw new Error(`a circle without ${name}: ${tag}`);
  return Number(m[1]);
}

export function markExtent(svg: string): Extent {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [, d] of svg.matchAll(/\sd="([^"]*)"/g)) {
    for (const [, nums] of (d as string).matchAll(/[MLQ]([^MLQZ]*)/g)) {
      const pair = [...(nums as string).matchAll(new RegExp(NUM, "g"))].map((n) => Number(n[0]));
      for (let i = 0; i + 1 < pair.length; i += 2) {
        xs.push(pair[i] as number);
        ys.push(pair[i + 1] as number);
      }
    }
  }
  for (const [tag] of svg.matchAll(/<circle\b[^>]*>/g)) {
    const [cx, cy, r] = [attr(tag, "cx"), attr(tag, "cy"), attr(tag, "r")];
    xs.push(cx - r, cx + r);
    ys.push(cy - r, cy + r);
  }
  if (xs.length === 0) throw new Error("markExtent: the fragment holds no point");
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

export const largerSide = (e: Extent): number => Math.max(e.x1 - e.x0, e.y1 - e.y0);
