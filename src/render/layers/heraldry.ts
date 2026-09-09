import { el, renderSvg, type SvgNode } from "../svg.ts";
import type { RenderCtx } from "../context.ts";
import type { Box } from "../geometry.ts";
import type { RealmAnchor } from "./feature-labels.ts";
import type { Arms, Tincture } from "../../society/heraldry.ts";
import { type ArmsPalette, paletteForStyle } from "./heraldry/palette.ts";
import { n, geom, shieldPath, fieldNodes } from "./heraldry/geom.ts";
import { chargeNodes } from "./heraldry/charges.ts";

export { type ArmsPalette, paletteForStyle };

export function armsNode(
  arms: Arms,
  cx: number,
  cy: number,
  size: number,
  pal: ArmsPalette,
  idSuffix: string,
): SvgNode {
  const g = geom(cx, cy, size);
  const d = shieldPath(g);
  const clipId = `vellum-arms-${idSuffix}`;
  const fieldTinctures = arms.division === "plain"
    ? [arms.field[0]!]
    : [arms.field[0]!, arms.field[1]!];
  const fieldFill = pal.hatch
    ? (t: Tincture) => pal.hatch!.fill(t, idSuffix)
    : (t: Tincture) => pal.tincture(t);
  const defs = pal.hatch ? pal.hatch.defs(fieldTinctures, g.w, idSuffix) : [];
  const body: SvgNode[] = [];
  if (defs.length > 0) body.push(el("defs", {}, defs));
  body.push(
    el("clipPath", { id: clipId }, [el("path", { d })]),
    el("g", { "clip-path": `url(#${clipId})` }, [
      ...fieldNodes(arms, g, fieldFill),
      ...chargeNodes(arms, g, pal),
    ]),
    el("path", {
      d, fill: "none", stroke: pal.outline,
      "stroke-width": n(g.w * 0.045), "stroke-linejoin": "round",
    }),
  );
  return el("g", { class: "vellum-arms" }, body);
}

export function armsSvgDocument(
  arms: Arms,
  size: number,
  pal: ArmsPalette,
  idSuffix: string,
): string {
  const pad = size * 0.08;
  const w = size + 2 * pad;
  const h = size * 1.18 + 2 * pad;
  const svg = el(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: n(w),
      height: n(h),
      viewBox: `0 0 ${n(w)} ${n(h)}`,
      role: "img",
      "aria-label": "A procedural coat of arms",
    },
    [armsNode(arms, w / 2, h / 2, size, pal, idSuffix)],
  );
  return renderSvg(svg);
}

export function armsPlacements(
  world: RenderCtx["world"],
  anchors: ReadonlyArray<RealmAnchor>,
  proj: RenderCtx["proj"],
  k: number,
): RealmAnchor[] {
  const byRealm = new Map(anchors.map((a) => [a.realm, a] as const));
  const out: RealmAnchor[] = [];
  for (let realm = 0; realm < world.arms.length; realm++) {
    const anchored = byRealm.get(realm);
    if (anchored !== undefined) {
      out.push(anchored);
      continue;
    }
    const seatIdx = world.realms.seats[realm];
    const seat = seatIdx !== undefined ? world.settlements[seatIdx] : undefined;
    if (seat === undefined) continue;
    out.push({ realm, cx: proj.px(seat.x), cy: proj.py(seat.y), halfW: 22 * k, halfH: 16 * k });
  }
  return out;
}

export function heraldryLayer(
  ctx: RenderCtx,
  anchors: ReadonlyArray<RealmAnchor>,
): SvgNode | null {
  const { world, style, proj, labels } = ctx;
  if (world.arms.length === 0) return null;
  const k = proj.widthPx / 1500;
  const pal = paletteForStyle(style);
  const size = 30 * k;
  const sh = size * 1.18;
  const gap = 6 * k;
  const m = proj.margin;

  const placements = armsPlacements(world, anchors, proj, k);
  if (placements.length === 0) return null;

  const nodes: SvgNode[] = [];
  for (const a of placements) {
    const arms = world.arms[a.realm];
    if (arms === undefined) continue;
    const dx = a.halfW + gap + size / 2;
    const dy = a.halfH + gap + sh / 2;
    const dirs: ReadonlyArray<readonly [number, number]> = [
      [0, -1], [-1, 0], [1, 0], [0, 1], // N, W, E, S
      [-1, -1], [1, -1], [-1, 1], [1, 1], // NW, NE, SW, SE
    ];
    const candidates: Array<readonly [number, number]> = [];
    for (const reach of [1, 1.9, 2.8]) {
      for (const [ux, uy] of dirs) {
        candidates.push([a.cx + ux * dx * reach, a.cy + uy * dy * reach]);
      }
    }
    for (const [cx, cy] of candidates) {
      const box: Box = { x: cx - size / 2, y: cy - sh / 2, w: size, h: sh };
      if (box.x < m || box.y < m || box.x + box.w > proj.widthPx - m || box.y + box.h > proj.heightPx - m) {
        continue;
      }
      if (!labels.tryClaim(box, 2)) continue;
      nodes.push(armsNode(arms, cx, cy, size, pal, `m${a.realm}`));
      break;
    }
  }
  return nodes.length > 0 ? el("g", { id: "layer-heraldry" }, nodes) : null;
}
