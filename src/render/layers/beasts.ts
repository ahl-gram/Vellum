import { el, type SvgNode } from "../svg.ts";
import { spacedTextBox, type Box } from "../geometry.ts";
import type { RenderCtx } from "../context.ts";
import type { CartouchePlan } from "./cartouche.ts";
import type { CompassPlan } from "./compass.ts";
import type { SeaBeast } from "../../society/bestiary.ts";
import { beastExtents, beastGlyph } from "./beast-glyphs.ts";

type Spot = { readonly x: number; readonly y: number; readonly d: number };

export function beastsLayer(
  ctx: RenderCtx,
  cartouche: CartouchePlan,
  compass: CompassPlan | null,
): SvgNode | null {
  const { style, world, proj, labels } = ctx;
  if (!style.seaDecorations || world.beasts.length === 0) return null;
  const k = proj.widthPx / 1500;
  const { w, h } = world.elev;

  const avoid: Array<{ x: number; y: number; r: number }> = [
    {
      x: cartouche.rect.x + cartouche.rect.w / 2,
      y: cartouche.rect.y + cartouche.rect.h / 2,
      r: cartouche.rect.w * 0.7,
    },
  ];
  if (compass) avoid.push({ x: compass.cx, y: compass.cy, r: compass.r * 2.2 });
  const clearOf = (px: number, py: number, extra: number): boolean =>
    avoid.every((a) => Math.hypot(px - a.x, py - a.y) > a.r + extra);

  const cellPx = proj.px(1) - proj.px(0);
  const open: Spot[] = [];
  for (let gy = 4; gy < h - 4; gy += 2) {
    for (let gx = 4; gx < w - 4; gx += 2) {
      const d = world.oceanDist[gx + gy * w] as number;
      if (d < 8) continue;
      if (world.region?.seaGate && world.region.seaGate[gx + gy * w] === 0) continue;
      open.push({ x: proj.px(gx), y: proj.py(gy), d });
    }
  }

  const nodes: SvgNode[] = [];

  world.beasts.forEach((beast, i) => {
    const ext = beastExtents(beast.kind, k);
    const home: Spot = {
      x: proj.px(beast.x),
      y: proj.py(beast.y),
      d: world.oceanDist[beast.x + beast.y * w] as number,
    };
    const frameViable = (o: Spot): boolean =>
      o.x - ext.halfW >= proj.margin + 8 &&
      o.x + ext.halfW <= proj.widthPx - proj.margin - 8 &&
      o.y - ext.up >= proj.margin + 8 &&
      o.y + ext.down + 20 * k <= proj.heightPx - proj.margin - 8;
    const near = [home, ...open
      .filter((o) =>
        frameViable(o) &&
        clearOf(o.x, o.y, ext.halfW * 0.7) &&
        Math.hypot(o.x - home.x, o.y - home.y) < 460 * k)
      .sort((a, b) =>
        Math.hypot(a.x - home.x, a.y - home.y) - Math.hypot(b.x - home.x, b.y - home.y),
      )].slice(0, 140);

    const overWater = (box: Box, minD: number): boolean => {
      const gx0 = Math.floor((box.x - proj.px(0)) / cellPx);
      const gx1 = Math.ceil((box.x + box.w - proj.px(0)) / cellPx);
      const gy0 = Math.floor((box.y - proj.py(0)) / cellPx);
      const gy1 = Math.ceil((box.y + box.h - proj.py(0)) / cellPx);
      if (gx0 < 0 || gy0 < 0 || gx1 >= w || gy1 >= h) return false;
      for (let gy = gy0; gy <= gy1; gy += 2) {
        for (let gx = gx0; gx <= gx1; gx += 2) {
          if ((world.oceanDist[gx + gy * w] as number) < minD) return false;
        }
      }
      return true;
    };

    const fs = 12.5 * k;
    const ls = fs * 0.19;
    const fits = (spot: Spot, text: string | null): { glyph: Box; label: Box | null } | null => {
      const glyph: Box = {
        x: spot.x - ext.halfW,
        y: spot.y - ext.up,
        w: ext.halfW * 2,
        h: ext.up + ext.down,
      };
      const labelY = spot.y + ext.down + 15 * k;
      const label = text === null ? null : spacedTextBox(spot.x, labelY, text, fs, ls);
      const boxes = label === null ? [glyph] : [glyph, label];
      for (const b of boxes) {
        if (b.x < proj.margin + 8 || b.x + b.w > proj.widthPx - proj.margin - 8) return null;
        if (b.y < proj.margin + 8 || b.y + b.h > proj.heightPx - proj.margin - 8) return null;
      }
      if (!overWater(glyph, 3)) return null;
      if (label !== null && !overWater(label, 2)) return null;
      if (!clearOf(spot.x, spot.y, ext.halfW * 0.7)) return null;
      if (!labels.tryClaimAll(boxes, 6)) return null;
      return { glyph, label };
    };

    const full = `${beast.name}, ${beast.epithet}`;
    let placed: { spot: Spot; text: string | null } | null = null;
    for (const text of [full, beast.name, null]) {
      for (const spot of near) {
        if (fits(spot, text)) {
          placed = { spot, text };
          break;
        }
      }
      if (placed) break;
    }
    if (!placed) return;

    const { spot, text } = placed;
    const children: SvgNode[] = [
      el("title", {}, [`${beast.name}, ${beast.epithet}. ${beast.tale}`]),
      ...beastGlyph(beast.kind, spot.x, spot.y, k, style),
    ];
    if (text !== null) {
      children.push(
        el(
          "text",
          {
            x: spot.x,
            y: spot.y + ext.down + 15 * k,
            "text-anchor": "middle",
            "font-family": style.fontFamilyTitle,
            "font-size": fs.toFixed(1),
            "font-style": "italic",
            "letter-spacing": ls.toFixed(1),
            fill: style.inkSoft,
            "fill-opacity": 0.85,
          },
          [text],
        ),
      );
    }
    nodes.push(el("g", { id: `beast-${i}`, opacity: 0.88 }, children));
  });

  if (nodes.length === 0) return null;
  return el("g", { id: "layer-bestiary" }, nodes);
}
