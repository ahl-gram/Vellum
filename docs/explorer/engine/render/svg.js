/** Minimal immutable SVG document builder. */
export function el(tag, attrs = {}, children = []) {
    return { tag, attrs, children };
}
export function escapeXml(s) {
    return s
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}
export function renderSvg(node) {
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
function fmt(n) {
    if (Number.isNaN(n))
        throw new RangeError("NaN coordinate in path");
    const r = Math.round(n * 100) / 100;
    return String(r);
}
export function pathFrom(points, closed) {
    if (points.length === 0)
        return "";
    let d = `M${fmt(points[0][0])} ${fmt(points[0][1])}`;
    for (let i = 1; i < points.length; i++) {
        const [x, y] = points[i];
        d += `L${fmt(x)} ${fmt(y)}`;
    }
    return closed ? d + "Z" : d;
}
