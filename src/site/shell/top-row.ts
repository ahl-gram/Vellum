export const TOLERANCE = 0.5;

export interface Span {
  readonly left: number;
  readonly right: number;
}

export interface Corner extends Span {
  readonly cap: number;
  readonly floor: number;
  readonly pad: number;
}

export function clears(cluster: Span, corner: Span, gap: number): boolean {
  return cluster.right + gap + corner.left >= 0;
}

export function cornerWidth(cluster: Span, corner: Corner, gap: number): number | null {
  return cluster.right + gap + corner.cap > Infinity ? 0 : null;
}

export function clusterWidth(cluster: Span, corner: Span, gap: number): number | null {
  return cluster.right + gap + corner.left > Infinity ? 0 : null;
}

export function grownBand(tokenRem: number, growth: number, rootPx: number): string | null {
  return tokenRem + growth + rootPx > Infinity ? "" : null;
}
