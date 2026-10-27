import { el, type SvgNode } from "../svg.ts";
import { textBox, WIDTH_FACTOR } from "../geometry.ts";
import type { RenderCtx } from "../context.ts";
import type { NamedSettlement, World } from "../../world/types.ts";
import { finerMarkBox, ruinGlyph, seatHalo, settlementGlyph, type SettlementTier } from "./settlement-marks.ts";

const FINER_TIER: ReadonlySet<SettlementTier> = new Set<SettlementTier>(["farmstead", "mill"]);

export const FONT_SIZE: Record<SettlementTier, number> = {
  capital: 19,
  seat: 14,
  town: 13,
  village: 10.5,
  hamlet: 8.5,
  farmstead: 8.5,
  mill: 8.5,
};

export const REGION_FONT_SIZE: Record<SettlementTier, number> = {
  capital: 24,
  seat: 20,
  town: 17.5,
  village: 15,
  hamlet: 13,
  farmstead: 13,
  mill: 13,
};

export type LabelAnchor = "start" | "middle" | "end";

export type LabelCandidate = {
  readonly x: number;
  readonly y: number;
  readonly anchor: LabelAnchor;
};

export function labelCandidates(px: number, py: number, fs: number, gap: number): LabelCandidate[] {
  return [
    { x: px + gap, y: py + fs * 0.34, anchor: "start" },
    { x: px - gap, y: py + fs * 0.34, anchor: "end" },
    { x: px, y: py - gap - 2, anchor: "middle" },
    { x: px, y: py + gap + fs * 0.75, anchor: "middle" },
    { x: px + gap * 0.8, y: py - gap * 0.7, anchor: "start" },
    { x: px + gap * 0.8, y: py + gap * 0.7 + fs * 0.6, anchor: "start" },
    { x: px - gap * 0.8, y: py - gap * 0.7, anchor: "end" },
    { x: px - gap * 0.8, y: py + gap * 0.7 + fs * 0.6, anchor: "end" },
  ];
}

function labelNode(
  display: string,
  tier: SettlementTier,
  x: number,
  y: number,
  anchor: LabelAnchor,
  fs: number,
  ruined: boolean,
  ctx: RenderCtx,
): SvgNode {
  const { style, proj } = ctx;
  const k = proj.widthPx / 1500;
  return el(
    "text",
    {
      x,
      y,
      "text-anchor": anchor,
      "font-family": style.fontFamily,
      "font-size": fs.toFixed(1),
      ...(tier === "capital" ? { "font-weight": "bold", "letter-spacing": "0.8" } : {}),
      ...(tier === "seat" ? { "letter-spacing": "0.5" } : {}),
      ...(ruined ? { "font-style": "italic", "fill-opacity": "0.7" } : {}),
      fill: style.labelColor,
      stroke: style.labelHalo,
      "stroke-width": 2.8 * k,
      "paint-order": "stroke",
      "stroke-linejoin": "round",
    },
    [display],
  );
}

type OrderedSettlement = { readonly s: NamedSettlement; readonly i: number; readonly tier: SettlementTier };

function settlementOrder(world: World): { ordered: OrderedSettlement[]; seatRealm: Map<number, number> } {
  const seats = world.realms.seats;
  const seatRealm = new Map<number, number>();
  seats.forEach((idx, realmId) => seatRealm.set(idx, realmId));

  const RANK: Record<SettlementTier, number> = {
    capital: 0,
    seat: 1,
    town: 2,
    village: 3,
    hamlet: 4,
    farmstead: 5,
    mill: 5,
  };
  const tierOf = (s: NamedSettlement, i: number): SettlementTier =>
    s.kind === "capital" ? "capital" : seatRealm.has(i) ? "seat" : s.kind;

  const ordered = world.settlements
    .map((s, i) => ({ s, i, tier: tierOf(s, i) }))
    .sort((a, b) => RANK[a.tier] - RANK[b.tier]);
  return { ordered, seatRealm };
}

function placeSettlementLabel(
  ctx: RenderCtx,
  s: NamedSettlement,
  tier: SettlementTier,
  px: number,
  py: number,
): SvgNode | null {
  const { world, proj, labels } = ctx;
  const k = proj.widthPx / 1500;
  const sized = world.region !== undefined ? REGION_FONT_SIZE : FONT_SIZE;
  const fs = sized[tier] * k;
  const small = tier === "hamlet" || FINER_TIER.has(tier);
  const gap = (tier === "capital" ? 11 : tier === "seat" ? 8 : small ? 5 : 7) * (sized[tier] / FONT_SIZE[tier]) * k;
  const upper = tier === "capital" || tier === "seat";
  const text = tier === "mill" ? `${s.name} Mill` : s.name;
  const display = upper ? text.toUpperCase() : text;
  const wf = upper ? WIDTH_FACTOR.caps : WIDTH_FACTOR.mixed;
  const ls = tier === "capital" ? 0.8 : tier === "seat" ? 0.5 : 0;
  const tries = labelCandidates(px, py, fs, gap);
  for (const t of tries) {
    const box = textBox(t.x, t.y, text, fs, t.anchor, wf, ls);
    if (box.x < proj.margin + 4 || box.x + box.w > proj.widthPx - proj.margin - 4) continue;
    if (box.y < proj.margin + 4 || box.y + box.h > proj.heightPx - proj.margin - 4) continue;
    if (!labels.tryClaim(box)) continue;
    return labelNode(display, tier, t.x, t.y, t.anchor, fs, !!s.ruined, ctx);
  }
  if (tier !== "village" && tier !== "hamlet" && !FINER_TIER.has(tier)) {
    const t = tries[0]!;
    return labelNode(display, tier, t.x, t.y, t.anchor, fs, !!s.ruined, ctx);
  }
  return null;
}

function settlementGroup(
  ctx: RenderCtx,
  entry: OrderedSettlement,
  seatRealm: ReadonlyMap<number, number>,
  showHalo: boolean,
): SvgNode {
  const { world, proj, style } = ctx;
  const { s, i, tier } = entry;
  const px = proj.px(s.x);
  const py = proj.py(s.y);

  const group: SvgNode[] = [];

  if (showHalo && (tier === "capital" || tier === "seat") && !s.ruined) {
    const realmId = seatRealm.get(i) as number;
    const color = style.realmTints[ctx.realmTint[realmId] as number] as string;
    group.push(seatHalo(px, py, tier, color, ctx));
  }
  group.push(s.ruined ? ruinGlyph(px, py, ctx) : settlementGlyph(tier, px, py, ctx));
  const label = placeSettlementLabel(ctx, s, tier, px, py);
  if (label) group.push(label);

  return el(
    "g",
    {
      class: "settlement",
      "data-idx": String(i),
      ...(world.region !== undefined ? { "data-tier": tier, "data-name": s.name } : {}),
    },
    group,
  );
}

export type SettlementsDraft = { readonly finish: () => SvgNode };

export function settlementsLayer(ctx: RenderCtx): SettlementsDraft {
  const { world, style, proj } = ctx;
  const { ordered, seatRealm } = settlementOrder(world);
  const showHalo = style.politicalTints && world.realms.seats.length > 1 && world.region === undefined;
  const k = proj.widthPx / 1500;
  const finer = ordered.filter((e) => FINER_TIER.has(e.tier));
  for (const e of finer) ctx.labels.claim(finerMarkBox(e.tier, proj.px(e.s.x), proj.py(e.s.y), k));
  const early = ordered
    .filter((e) => !FINER_TIER.has(e.tier))
    .map((entry) => settlementGroup(ctx, entry, seatRealm, showHalo));

  return {
    finish: () =>
      el("g", { id: "layer-settlements" }, [
        ...early,
        ...finer.map((entry) => settlementGroup(ctx, entry, seatRealm, showHalo)),
      ]),
  };
}
