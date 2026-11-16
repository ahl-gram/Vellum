import type * as TS from "typescript";

const SILENT_ESCAPE = /(?<!\\)\\[sSdDwWbB.]/;
const NOISY_ESCAPE = /(?<!\\)\\[()[\]{}+*?|^/]/;

const templateRawTexts = async (text: string): Promise<string[] | null> => {
  let ts: typeof TS;
  try {
    const mod: unknown = await import("typescript");
    ts = ((mod as { default?: typeof TS }).default ?? mod) as typeof TS;
  } catch {
    return null;
  }
  const tagOf = (n: TS.Node): string => {
    const p = n.parent;
    if (ts.isTaggedTemplateExpression(p)) return p.tag.getText();
    return ts.isTemplateExpression(p) && ts.isTaggedTemplateExpression(p.parent) ? p.parent.tag.getText() : "";
  };
  const raws: string[] = [];
  const walk = (n: TS.Node): void => {
    const literal =
      ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n);
    if (literal && tagOf(n) !== "String.raw") raws.push(n.rawText ?? "");
    ts.forEachChild(n, walk);
  };
  walk(ts.createSourceFile("fragment.ts", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS));
  return raws;
};

const SCAN_SKIPPED =
  "vellum-footguns: the typescript package could not be loaded, so the backtick escape scan was skipped; check any regex inside a template literal by hand.";
const NOISY_WARNING =
  "a punctuation escape inside a backtick string loses its backslash before the browser sees it; if that span is a regex, double the backslash or use String.raw.";

export const escapeScan = async (
  text: string,
  where: string,
): Promise<{ readonly denial: string | null; readonly note: string | null }> => {
  const raws = await templateRawTexts(text);
  if (raws === null) return { denial: null, note: SCAN_SKIPPED };
  for (const raw of raws) {
    const hit = SILENT_ESCAPE.exec(raw);
    if (!hit) continue;
    const near = raw.slice(Math.max(0, hit.index - 30), hit.index + hit[0].length + 30).replace(/\n/g, " ");
    return {
      denial:
        `vellum-footguns: \`${hit[0]}\` inside a backtick string in ${where} reaches the browser with its backslash gone ` +
        `(\`\\s\` splits on the letter s, \`\\.\` matches any char) and never throws. Write \`\\\\${hit[0].slice(1)}\` or build ` +
        `the payload with String.raw. Near: ...${near}...`,
      note: null,
    };
  }
  return { denial: null, note: raws.some((r) => NOISY_ESCAPE.test(r)) ? NOISY_WARNING : null };
};
