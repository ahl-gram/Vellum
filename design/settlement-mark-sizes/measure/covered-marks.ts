// Issue #1104 round: which settlement points on the four deepest-band places stand inside the cartouche's or the key's box, as today's sheet draws them (the known, ruled case in handbook/errata/engine.md, the PR #1024 row).
// usage: node out/1104/measure/covered-marks.ts
import { PLACES, explorerRegion, explorerSvg, anchorIn } from "../mock/places.ts";

const boxOf = (svg: string, layer: string) => {
  const m = new RegExp(`<g id="${layer}"[^>]*>(?:(?!<rect).)*<rect x="([\\d.]+)" y="([\\d.]+)" width="([\\d.]+)" height="([\\d.]+)"`).exec(svg);
  if (!m) return null;
  const [x, y, w, h] = [1, 2, 3, 4].map((i) => Number(m[i]));
  return { x: x!, y: y!, w: w!, h: h! };
};
for (const p of PLACES) {
  const sh = explorerRegion(p, 5);
  const svg = explorerSvg(sh);
  for (const layer of ["layer-cartouche", "layer-legend"]) {
    const b = boxOf(svg, layer);
    if (!b) continue;
    const inside = sh.world.settlements
      .map((s) => ({ s, a: anchorIn(sh.world, s.name) }))
      .filter(({ a }) => a.x >= b.x && a.x <= b.x + b.w && a.y >= b.y && a.y <= b.y + b.h)
      .map(({ s, a }) => `${s.name} (${s.kind}) at ${a.x.toFixed(0)},${a.y.toFixed(0)}`);
    console.log(`chart ${p.seed} ${p.key} ${layer} box ${b.x.toFixed(0)},${b.y.toFixed(0)} ${b.w.toFixed(0)}x${b.h.toFixed(0)}: ${inside.join("; ") || "none"}`);
  }
}
