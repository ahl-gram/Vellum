// The document rooms' index (Issue #462 ruling 1): the section being read is inked and the entry being read is marked as the page scrolls.

export interface Placed {
  readonly id: string;
  /** The element's top in viewport pixels. */
  readonly top: number;
}

export function readingAt(heads: readonly Placed[], line: number): string | null {
  if (heads.length === 0) return null;
  let current = heads[0]!;
  for (const h of heads) if (h.top <= line) current = h;
  return current.id;
}

export function entryAt(entries: readonly Placed[], line: number, sectionTop: number): string | null {
  let current: Placed | null = null;
  for (const e of entries) {
    if (e.top > line || e.top < sectionTop) continue;
    if (current === null || e.top > current.top) current = e;
  }
  return current?.id ?? null;
}

interface Scrolled {
  readonly scrollTop: number;
  readonly scrollHeight: number;
  readonly clientHeight: number;
}

interface Span {
  readonly top: number;
  readonly bottom: number;
}

const EDGE_SLACK = 1;

export function edgesOf(box: Scrolled): { readonly above: boolean; readonly below: boolean } {
  void box;
  void EDGE_SLACK;
  return { above: false, below: false };
}

export function markEdges(box: HTMLElement): void {
  const { above, below } = edgesOf(box);
  box.classList.toggle("more-above", above);
  box.classList.toggle("more-below", below);
}

export function inViewBy(r: Span, b: Span, inset: number): number {
  void inset;
  const pad = 0;
  const top = b.top + pad;
  const bottom = b.bottom - pad;
  const taller = r.bottom - r.top > bottom - top;
  if (r.top < top && r.bottom > bottom) return 0;
  if ((r.top < top && !taller) || (r.bottom > bottom && taller)) return r.top - top;
  if (r.top < top || r.bottom > bottom) return r.bottom - bottom;
  return 0;
}

interface InkParts {
  readonly heads: readonly Element[];
  readonly entries: readonly Element[];
  readonly rows: ReadonlyMap<string, HTMLElement>;
  readonly entryRows: ReadonlyMap<string, HTMLElement>;
  readonly line: () => number;
  readonly keepInView: () => HTMLElement | null;
  readonly inset: () => number;
}

/** Builds the ink pass; the caller wires it to scroll and resize. */
export function indexInk(p: InkParts): () => void {
  const placed = (els: readonly Element[]): Placed[] =>
    els.flatMap((el) => {
      const r = el.getBoundingClientRect();
      return el.id && !(r.width === 0 && r.height === 0) ? [{ id: el.id, top: r.top }] : [];
    });
  const ink = () => {
    const line = p.line();
    const heads = placed(p.heads);
    const section = readingAt(heads, line);
    const sectionTop = heads.find((h) => h.id === section)?.top ?? -Infinity;
    const entry = entryAt(placed(p.entries), line, sectionTop);
    for (const [id, row] of p.rows) row.classList.toggle("inked", id === section);
    for (const [id, row] of p.entryRows) row.classList.toggle("now", id === entry);
    const box = p.keepInView();
    const row = section === null ? undefined : p.rows.get(section);
    if (box !== null && row !== undefined)
      box.scrollTop += inViewBy(row.getBoundingClientRect(), box.getBoundingClientRect(), p.inset());
  };
  return ink;
}
