// The top of every page (Issue #762 pull requests B and D): the head cluster and the right-hand corner share one row, measured off their own boxes, and a corner wider than the kit's gives way toward the kit's width, never below it, wherever it would run under the cluster.
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
  return corner.left >= cluster.right + gap - TOLERANCE;
}

export function cornerWidth(cluster: Span, corner: Corner, gap: number): number | null {
  if (clears(cluster, corner, gap)) return null;
  const width = Math.max(corner.floor, corner.right - (cluster.right + gap) - corner.pad);
  return width < corner.cap ? width : null;
}

type Styled = HTMLElement;

const remOf = (style: CSSStyleDeclaration, prop: string): number => parseFloat(style.getPropertyValue(prop));

function cornerOf(el: Styled, floorPx: number): Corner {
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
  const cap = parseFloat(cs.maxWidth) || r.width - pad;
  return { left: r.left, right: r.right, cap, floor: Math.min(cap, floorPx), pad };
}

function layRow(cluster: Styled, corner: Styled): void {
  corner.style.setProperty("transition", "none");
  corner.style.removeProperty("max-width");
  const rootStyle = getComputedStyle(document.documentElement);
  const rootPx = parseFloat(rootStyle.fontSize);
  const gap = remOf(rootStyle, "--chrome-x") * rootPx;
  const width = cornerWidth(cluster.getBoundingClientRect(), cornerOf(corner, remOf(rootStyle, "--folio-w") * rootPx), gap);
  if (width !== null) corner.style.setProperty("max-width", `${width}px`);
  corner.style.removeProperty("transition");
}

export function bindTopRow(): void {
  const cluster = document.querySelector<HTMLElement>("header.chrome");
  const corner = document.querySelector<HTMLElement>(".corner.tr.folio-room");
  if (cluster === null || corner === null) return;
  const lay = (): void => { layRow(cluster, corner); };
  lay();
  window.addEventListener("resize", lay);
  void document.fonts.ready.then(lay);
  new MutationObserver(lay).observe(corner, { childList: true, characterData: true, subtree: true });
}
