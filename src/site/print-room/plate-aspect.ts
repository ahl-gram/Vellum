// The prospect plate's root carries a width/height (1500x1108) that disagrees with its viewBox (520x384): the viewBox is the drawing.
export function plateAspect(svg: string): number | null {
  const vb = /viewBox="\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*"/.exec(svg);
  const w = vb ? Number(vb[1]) : Number(/\swidth="([\d.]+)"/.exec(svg)?.[1]);
  const h = vb ? Number(vb[2]) : Number(/\sheight="([\d.]+)"/.exec(svg)?.[1]);
  return Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0 ? w / h : null;
}
