/** A plate's aspect off its svg text: the viewBox, else width and height, else null (the prospect plate is 520x384 where the chart is 1500x1157.931, so the fit cannot assume). */
export function plateAspect(svg: string): number | null {
  const vb = /viewBox="\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*"/.exec(svg);
  const w = vb ? Number(vb[1]) : Number(/\swidth="([\d.]+)"/.exec(svg)?.[1]);
  const h = vb ? Number(vb[2]) : Number(/\sheight="([\d.]+)"/.exec(svg)?.[1]);
  return Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0 ? w / h : null;
}
