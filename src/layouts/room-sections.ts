// Sub 7 (#462, document-room ruling 1): the index slip lists every section with its questions or its terms, read at BUILD time from the page's own source, so the index can never drift from the prose it points at. The h2 sections and their entries are the same shapes test/site/glossary-sections.test.ts parses.

export interface IndexEntry {
  readonly id: string;
  readonly text: string;
}

export interface IndexSection {
  readonly id: string;
  readonly title: string;
  readonly entries: readonly IndexEntry[];
}

export type EntryClass = "q" | "term";

const decode = (s: string): string =>
  s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

/** Every `<h2 id>` with the entries under it; an entry without an id throws, because the index needs an anchor for each one. */
export function roomSections(source: string, entryClass: EntryClass): readonly IndexSection[] {
  const sections: IndexSection[] = [];
  const heads = [...source.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)];
  const entryRe = new RegExp(`<p class="${entryClass}"([^>]*)>([\\s\\S]*?)</p>`, "g");
  for (const [i, head] of heads.entries()) {
    const start = head.index + head[0].length;
    const end = i + 1 < heads.length ? heads[i + 1].index : source.length;
    const body = source.slice(start, end);
    const entries = [...body.matchAll(entryRe)].map(([, attrs, text]) => {
      const id = /\sid="([^"]+)"/.exec(attrs)?.[1];
      if (id === undefined) throw new Error(`the ${entryClass} "${decode(text)}" under "${decode(head[2])}" has no id for the index`);
      return { id, text: decode(text) };
    });
    sections.push({ id: head[1], title: decode(head[2]), entries });
  }
  return sections;
}

export const indexCount = (sections: readonly IndexSection[]): number =>
  sections.reduce((n, s) => n + s.entries.length, 0);
