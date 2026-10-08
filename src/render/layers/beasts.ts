import { el, type SvgNode } from "../svg.ts";
import { spacedTextBox, type Box } from "../geometry.ts";
import type { RenderCtx } from "../context.ts";
import type { SeaBeast } from "../../society/bestiary.ts";
import type { CartouchePlan } from "./cartouche.ts";
import type { CompassPlan } from "./compass.ts";
import { beastExtents, beastGlyph } from "./beast-glyphs.ts";

type Spot = { readonly x: number; readonly y: number; readonly d: number };
type Extents = ReturnType<typeof beastExtents>;
type ClearOf = (px: number, py: number, extra: number) => boolean;
type BeastPlace = { readonly spot: Spot; readonly text: string | null };

function openBeastWater(ctx: RenderCtx): Spot[] {
  const { world, proj } = ctx;
  const { w, h } = world.elev;
  const open: Spot[] = [];
  for (let gy = 4; gy < h - 4; gy += 2) {
    for (let gx = 4; gx < w - 4; gx += 2) {
      const d = world.oceanDist[gx + gy * w] as number;
      if (d < 8) continue;
      open.push({ x: proj.px(gx), y: proj.py(gy), d });
    }
  }
  return open;
}

function beastCandidates(
  ctx: RenderCtx,
  beast: SeaBeast,
  ext: Extents,
  open: ReadonlyArray<Spot>,
  clearOf: ClearOf,
): { near: Spot[]; viable: Spot[] } {
  const { world, proj } = ctx;
  const k = proj.widthPx / 1500;
  const { w } = world.elev;
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
  const fromHome = (o: Spot): number => Math.hypot(o.x - home.x, o.y - home.y);
  const viable = open
    .filter((o) => frameViable(o) && clearOf(o.x, o.y, ext.halfW * 0.7))
    .sort((a, b) => fromHome(a) - fromHome(b));
  const near = [home, ...viable.filter((o) => fromHome(o) < 460 * k)].slice(0, 140);
  return { near, viable };
}

function overWater(ctx: RenderCtx, box: Box, minD: number): boolean {
  const { world, proj } = ctx;
  const { w, h } = world.elev;
  const cellPx = proj.px(1) - proj.px(0);
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
}

function beastFits(
  ctx: RenderCtx,
  ext: Extents,
  clearOf: ClearOf,
  spot: Spot,
  text: string | null,
): { glyph: Box; label: Box | null } | null {
  const { proj, labels } = ctx;
  const k = proj.widthPx / 1500;
  const fs = 12.5 * k;
  const ls = fs * 0.19;
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
  if (!overWater(ctx, glyph, 3)) return null;
  if (label !== null && !overWater(ctx, label, 2)) return null;
  if (!clearOf(spot.x, spot.y, ext.halfW * 0.7)) return null;
  if (!labels.tryClaimAll(boxes, 6)) return null;
  return { glyph, label };
}

function firstBeastFit(
  candidateLists: ReadonlyArray<ReadonlyArray<Spot>>,
  texts: ReadonlyArray<string | null>,
  fits: (spot: Spot, text: string | null) => boolean,
): BeastPlace | null {
  for (const candidates of candidateLists) {
    for (const text of texts) {
      for (const spot of candidates) {
        if (fits(spot, text)) return { spot, text };
      }
    }
  }
  return null;
}

function beastNode(ctx: RenderCtx, beast: SeaBeast, ext: Extents, placed: BeastPlace, i: number): SvgNode {
  const { style, proj } = ctx;
  const k = proj.widthPx / 1500;
  const fs = 12.5 * k;
  const ls = fs * 0.19;
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
  return el("g", { id: `beast-${i}`, opacity: 0.88 }, children);
}

function placeBeast(
  ctx: RenderCtx,
  beast: SeaBeast,
  i: number,
  open: ReadonlyArray<Spot>,
  clearOf: ClearOf,
): SvgNode | null {
  const k = ctx.proj.widthPx / 1500;
  const ext = beastExtents(beast.kind, k);
  const { near, viable } = beastCandidates(ctx, beast, ext, open, clearOf);
  const full = `${beast.name}, ${beast.epithet}`;
  const placed = firstBeastFit(
    [near, viable],
    [full, beast.name, null],
    (spot, text) => beastFits(ctx, ext, clearOf, spot, text) !== null,
  );
  return placed ? beastNode(ctx, beast, ext, placed, i) : null;
}

export function beastsLayer(ctx: RenderCtx, cartouche: CartouchePlan, compass: CompassPlan | null): SvgNode | null {
  const { style, world } = ctx;
  if (!style.seaDecorations || world.beasts.length === 0) return null;

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

  const open = openBeastWater(ctx);
  const nodes = world.beasts
    .map((beast, i) => placeBeast(ctx, beast, i, open, clearOf))
    .filter((n): n is SvgNode => n !== null);

  if (nodes.length === 0) return null;
  return el("g", { id: "layer-bestiary" }, nodes);
}
