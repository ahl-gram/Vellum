/** Minimal immutable SVG document builder. */

export type SvgNode = {
  readonly tag: string;
  readonly attrs: Readonly<Record<string, string | number>>;
  readonly children: ReadonlyArray<SvgNode | string>;
};

export function el(
  tag: string,
  attrs: Record<string, string | number> = {},
  children: ReadonlyArray<SvgNode | string> = [],
): SvgNode {
  return { tag, attrs, children };
}

export function escapeXml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function renderSvg(node: SvgNode): string {
  const attrs = Object.entries(node.attrs)
    .map(([k, v]) => ` ${k}="${typeof v === "string" ? escapeXml(v) : v}"`)
    .join("");
  if (node.children.length === 0) {
    return `<${node.tag}${attrs}/>`;
  }
  const inner = node.children
    .map((c) => (typeof c === "string" ? escapeXml(c) : renderSvg(c)))
    .join("");
  return `<${node.tag}${attrs}>${inner}</${node.tag}>`;
}

function fmt(n: number): string {
  if (Number.isNaN(n)) throw new RangeError("NaN coordinate in path");
  const r = Math.round(n * 100) / 100;
  return String(r);
}

export function pathFrom(
  points: ReadonlyArray<readonly [number, number]>,
  closed: boolean,
): string {
  if (points.length === 0) return "";
  let d = `M${fmt((points[0] as readonly [number, number])[0])} ${fmt((points[0] as readonly [number, number])[1])}`;
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i] as readonly [number, number];
    d += `L${fmt(x)} ${fmt(y)}`;
  }
  return closed ? d + "Z" : d;
}
