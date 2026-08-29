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

const attr = (attrs: string, name: string): string | undefined =>
  new RegExp(`(?:^|\\s)${name}="([^"]*)"`).exec(attrs)?.[1];

// Attributes in any order (the #462 body's own gotcha: a tag matched exactly goes blind when attributes arrive).
export function roomSections(source: string, entryClass: EntryClass): readonly IndexSection[] {
  const sections: IndexSection[] = [];
  const heads = [...source.matchAll(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/g)];
  for (const [i, head] of heads.entries()) {
    const id = attr(head[1] ?? "", "id");
    if (id === undefined) throw new Error(`the section "${decode(head[2])}" has no id for the index`);
    const start = head.index + head[0].length;
    const end = i + 1 < heads.length ? heads[i + 1].index : source.length;
    const body = source.slice(start, end);
    const entries = [...body.matchAll(/<p(\s[^>]*)>([\s\S]*?)<\/p>/g)]
      .filter(([, attrs]) => attr(attrs, "class")?.split(/\s+/).includes(entryClass))
      .map(([, attrs, text]) => {
        const entryId = attr(attrs, "id");
        if (entryId === undefined) throw new Error(`the ${entryClass} "${decode(text)}" under "${decode(head[2])}" has no id for the index`);
        return { id: entryId, text: decode(text) };
      });
    sections.push({ id, title: decode(head[2]), entries });
  }
  return sections;
}

export const indexCount = (sections: readonly IndexSection[]): number =>
  sections.reduce((n, s) => n + s.entries.length, 0);
