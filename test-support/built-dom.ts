import { parseHTML } from "linkedom";

export function documentOf(html: string): Document {
  return parseHTML(html).document;
}

export const text = (e: Element | null): string | null => (e ? e.textContent.replace(/\s+/g, " ").trim() : null);

export const kids = (e: Element | null, skip: readonly string[] = []): string[] | null =>
  e
    ? [...e.children].map((c) => {
        const classes = [...c.classList].filter((n) => !skip.includes(n));
        return c.tagName + (c.id ? "#" + c.id : "") + (classes.length ? "." + classes.join(".") : "");
      })
    : null;

// Document order read off the tree's own element order: linkedom 0.18.15's compareDocumentPosition answers the reverse when the first element sits deeper than the second in another subtree (measured 2026-11-09, <div><div id=a></div></div><div id=b></div>).
export const before = (a: Element | null, b: Element | null): boolean => {
  if (!a || !b) return false;
  const order = [...a.ownerDocument.querySelectorAll("*")];
  return order.indexOf(a) < order.indexOf(b);
};

export const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

export const faults = (parts: (true | string)[]): string[] => parts.filter((f): f is string => f !== true);

const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function pageText(html: string): string {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi, (whole, dec?: string, hex?: string, name?: string) => {
      if (dec) return String.fromCodePoint(Number(dec));
      if (hex) return String.fromCodePoint(parseInt(hex, 16));
      return entities[name!.toLowerCase()] ?? whole;
    });
}
