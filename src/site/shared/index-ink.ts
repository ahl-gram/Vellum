// The document rooms' index (#462 ruling 1): the section being read is inked, the entry being read is marked, as the page scrolls. The choice is pure; the binder reads rects and writes classes.

export interface Placed {
  readonly id: string;
  /** The element's top in viewport pixels. */
  readonly top: number;
}

/** The last head at or above the reading line, else the first: a page scrolled past every head still reads its last section, and one above the first head is on the first. */
export function readingAt(heads: readonly Placed[], line: number): string | null {
  if (heads.length === 0) return null;
  let current = heads[0];
  for (const h of heads) if (h.top <= line) current = h;
  return current.id;
}

/** The entry nearest the line from above, within the section being read (at or below its head), or none: at a head no entry is read yet, never one from the section above, and of two entries level across the broadside's columns the earlier one. */
export function entryAt(entries: readonly Placed[], line: number, sectionTop: number): string | null {
  let current: Placed | null = null;
  for (const e of entries) {
    if (e.top > line || e.top < sectionTop) continue;
    if (current === null || e.top > current.top) current = e;
  }
  return current?.id ?? null;
}

interface InkParts {
  readonly heads: readonly Element[];
  readonly entries: readonly Element[];
  readonly rows: ReadonlyMap<string, HTMLElement>;
  readonly entryRows: ReadonlyMap<string, HTMLElement>;
  readonly line: () => number;
  /** The slip's scrolling body, so the inked row is kept in view (a wide sheet only; a phone's sheet scrolls itself). */
  readonly keepInView: () => HTMLElement | null;
}

export function bindIndexInk(p: InkParts): () => void {
  const placed = (els: readonly Element[]): Placed[] =>
    els.flatMap((el) => (el.id ? [{ id: el.id, top: el.getBoundingClientRect().top }] : []));
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
    if (box !== null && row !== undefined) {
      const r = row.getBoundingClientRect();
      const b = box.getBoundingClientRect();
      if (r.top < b.top || r.bottom > b.bottom) row.scrollIntoView({ block: "nearest" });
    }
  };
  return ink;
}
