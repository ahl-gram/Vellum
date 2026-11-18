export function frontMatterOf(text: string): string | null {
  return /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text)?.[1] ?? null;
}

// Reads a key written on one line at the top level of front matter that test/repo/front-matter.test.ts already holds to valid YAML: a block scalar (`|` or `>`) reads as its indicator and a value carried onto a second line as its first line, so both err toward a pass, and a double-quoted escape JSON lacks throws, which errs toward a red.
export function topLevelScalar(frontMatter: string, key: string): string | null {
  const raw = new RegExp(`^${key}:[ \\t]*(.*?)[ \\t]*\\r?$`, "m").exec(frontMatter)?.[1];
  if (raw === undefined) return null;
  if (raw.startsWith('"')) {
    const value: unknown = JSON.parse(raw);
    return typeof value === "string" ? value : null;
  }
  return raw.startsWith("'") ? raw.slice(1, -1).replaceAll("''", "'") : raw;
}
