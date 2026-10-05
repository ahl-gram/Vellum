// The top of every page (Issue #762 pull request B): the head cluster and the right-hand corner share one row, measured off their own boxes. A wide corner gives way toward the kit's width first; then the cluster takes what the corner leaves and the nav wraps between rooms; the band token grows by what the cluster grew.
export const TOLERANCE = 0.5;

export interface Span {
  readonly left: number;
  readonly right: number;
}

export interface Corner extends Span {
  /** The content max-width the sheets give the corner. */
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

export function clusterWidth(cluster: Span, corner: Span, gap: number): number | null {
  return clears(cluster, corner, gap) ? null : corner.left - gap - cluster.left;
}

export function grownBand(tokenRem: number, growth: number, rootPx: number): string | null {
  return growth > TOLERANCE ? `${Number((tokenRem + growth / rootPx).toFixed(4))}rem` : null;
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

function layRow(cluster: Styled, corner: Styled, nav: Element | null): void {
  const root = document.documentElement;
  for (const el of [cluster, corner]) el.style.setProperty("transition", "none");
  corner.style.removeProperty("max-width");
  cluster.style.removeProperty("max-width");
  nav?.classList.remove("wrapped");
  root.style.removeProperty("--band-h");
  const rootStyle = getComputedStyle(root);
  const rootPx = parseFloat(rootStyle.fontSize);
  const gap = remOf(rootStyle, "--chrome-x") * rootPx;
  const before = cluster.getBoundingClientRect();
  const width = cornerWidth(before, cornerOf(corner, remOf(rootStyle, "--folio-w") * rootPx), gap);
  if (width !== null) corner.style.setProperty("max-width", `${width}px`);
  const capped = clusterWidth(before, corner.getBoundingClientRect(), gap);
  if (capped !== null) {
    cluster.style.setProperty("max-width", `${capped}px`);
    nav?.classList.add("wrapped");
    const band = grownBand(remOf(rootStyle, "--band-h"), cluster.getBoundingClientRect().bottom - before.bottom, rootPx);
    if (band !== null) root.style.setProperty("--band-h", band);
  }
  for (const el of [cluster, corner]) el.style.removeProperty("transition");
}

export function bindTopRow(): void {
  const cluster = document.querySelector<HTMLElement>("header.chrome");
  const corner = document.querySelector<HTMLElement>(".corner.tr.folio-room") ?? document.querySelector<HTMLElement>(".lf-seed");
  if (cluster === null || corner === null) return;
  const nav = cluster.querySelector("nav.rooms");
  const lay = (): void => { layRow(cluster, corner, nav); };
  lay();
  window.addEventListener("resize", lay);
  void document.fonts?.ready.then(lay); // eslint-disable-line @typescript-eslint/no-unnecessary-condition
  new MutationObserver(lay).observe(corner, { childList: true, characterData: true, subtree: true });
}
