import { el, type SvgNode } from "../svg.ts";
import { textBox, WIDTH_FACTOR } from "../geometry.ts";
import type { RenderCtx } from "../context.ts";
import type { NamedSettlement } from "../../world/types.ts";

/** Render tier for a settlement mark. "seat" is a non-capital realm seat: a town
 *  that heads its own realm, drawn a notch grander than a plain town. */
export type SettlementTier = NamedSettlement["kind"] | "seat";

export const FONT_SIZE: Record<SettlementTier, number> = {
  capital: 19,
  seat: 14,
  town: 13,
  village: 10.5,
};

/** Grand capital and provincial-seat marks scale the same base glyph. */
const CAPITAL_GLYPH_SCALE = 1.25;
const SEAT_GLYPH_SCALE = 0.85;
const HALO_OPACITY = 0.33;

export type LabelAnchor = "start" | "middle" | "end";

export type LabelCandidate = {
  readonly x: number;
  readonly y: number;
  readonly anchor: LabelAnchor;
};

/** Anchor positions in preference order: E, W, N, S, then diagonals. */
export function labelCandidates(
  px: number,
  py: number,
  fs: number,
  gap: number,
): LabelCandidate[] {
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

/** The map mark for a settlement tier; reused by the legend so the two match.
 *  Grand capitals and realm seats share one base glyph (a castle in the inked
 *  styles, a star-in-circle otherwise), scaled so the capital reads grander. */
export function settlementGlyph(
  tier: SettlementTier,
  px: number,
  py: number,
  ctx: RenderCtx,
): SvgNode {
  const { style } = ctx;
  const k = ctx.proj.widthPx / 1500;
  if (tier === "capital" || tier === "seat") {
    const ks = k * (tier === "capital" ? CAPITAL_GLYPH_SCALE : SEAT_GLYPH_SCALE);
    const mark =
      style.name === "antique" || style.name === "ink"
        ? castleGlyph(px, py, ks, style.ink, style.labelHalo)
        : starInCircle(px, py, ks, ctx);
    return el("g", { class: `settlement-${tier}` }, [mark]);
  }
  if (tier === "town") {
    return el("circle", {
      cx: px, cy: py, r: 3.4 * k,
      fill: style.ink, stroke: style.labelHalo, "stroke-width": 1.2 * k,
    });
  }
  return el("circle", {
    cx: px, cy: py, r: 2.3 * k,
    fill: style.labelHalo, stroke: style.ink, "stroke-width": 1.3 * k,
  });
}

/** A star set in a haloed disc; the capital mark for the un-inked styles. */
function starInCircle(px: number, py: number, ks: number, ctx: RenderCtx): SvgNode {
  const { style } = ctx;
  const r = 6.5 * ks;
  const star = starPath(px, py, r * 0.62, 5);
  return el("g", {}, [
    el("circle", {
      cx: px, cy: py, r,
      fill: style.labelHalo, stroke: style.ink, "stroke-width": 1.6 * ks,
    }),
    el("path", { d: star, fill: style.ink }),
  ]);
}

/** A soft realm-tint aura behind a seat mark; ties the seat to its territory.
 *  Drawn before the glyph so the paper-filled mark sits on top, leaving a ring. */
function seatHalo(
  px: number,
  py: number,
  tier: SettlementTier,
  color: string,
  ctx: RenderCtx,
): SvgNode {
  const { style } = ctx;
  const k = ctx.proj.widthPx / 1500;
  const ks = k * (tier === "capital" ? CAPITAL_GLYPH_SCALE : SEAT_GLYPH_SCALE);
  const castle = style.name === "antique" || style.name === "ink";
  const r = (castle ? 9.5 : 9) * ks;
  const cy = castle ? py - 3.5 * ks : py;
  return el("circle", {
    class: "seat-halo",
    cx: px.toFixed(2), cy: cy.toFixed(2), r: r.toFixed(2),
    fill: color, "fill-opacity": String(HALO_OPACITY),
  });
}

/** A broken-tower mark for a ruined settlement; reused by the legend. */
export function ruinGlyph(px: number, py: number, ctx: RenderCtx): SvgNode {
  const { style } = ctx;
  const s = ctx.proj.widthPx / 1500;
  // a wall standing taller on the left, broken away in a jagged line to a
  // shorter stub on the right
  const d =
    `M${px - 3 * s} ${py}` +
    `L${px - 3 * s} ${py - 7 * s}` +
    `L${px - 1.7 * s} ${py - 5.3 * s}` +
    `L${px - 0.5 * s} ${py - 6.1 * s}` +
    `L${px + 0.7 * s} ${py - 3.4 * s}` +
    `L${px + 2.7 * s} ${py - 4.2 * s}` +
    `L${px + 2.7 * s} ${py}Z`;
  // a narrow dark window slit reads as a hollow, roofless tower
  const slit =
    `M${px - 2 * s} ${py}L${px - 2 * s} ${py - 3.4 * s}` +
    `L${px - 1 * s} ${py - 3.4 * s}L${px - 1 * s} ${py}Z`;
  return el("g", { class: "ruin" }, [
    el("path", {
      d, fill: style.labelHalo, stroke: style.ink,
      "stroke-width": 1.2 * s, "stroke-linejoin": "round",
    }),
    el("path", { d: slit, fill: style.ink }),
  ]);
}

function castleGlyph(
  px: number,
  py: number,
  k: number,
  ink: string,
  paper: string,
): SvgNode {
  const s = k;
  const d =
    `M${px - 5.5 * s} ${py}` +
    `L${px - 5.5 * s} ${py - 6 * s}L${px - 4 * s} ${py - 6 * s}L${px - 4 * s} ${py - 8 * s}` +
    `L${px - 2.5 * s} ${py - 8 * s}L${px - 2.5 * s} ${py - 6 * s}L${px - 0.75 * s} ${py - 6 * s}` +
    `L${px - 0.75 * s} ${py - 8 * s}L${px + 0.75 * s} ${py - 8 * s}L${px + 0.75 * s} ${py - 6 * s}` +
    `L${px + 2.5 * s} ${py - 6 * s}L${px + 2.5 * s} ${py - 8 * s}L${px + 4 * s} ${py - 8 * s}` +
    `L${px + 4 * s} ${py - 6 * s}L${px + 5.5 * s} ${py - 6 * s}L${px + 5.5 * s} ${py}Z`;
  const door =
    `M${px - 1.2 * s} ${py}L${px - 1.2 * s} ${py - 2.4 * s}` +
    `Q${px} ${py - 3.8 * s} ${px + 1.2 * s} ${py - 2.4 * s}L${px + 1.2 * s} ${py}Z`;
  return el("g", {}, [
    el("path", {
      d, fill: paper, stroke: ink,
      "stroke-width": 1.2 * k, "stroke-linejoin": "round",
    }),
    el("path", { d: door, fill: ink }),
  ]);
}

function starPath(cx: number, cy: number, r: number, points: number): string {
  const inner = r * 0.42;
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : inner;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const x = cx + rad * Math.cos(a);
    const y = cy + rad * Math.sin(a);
    d += (i === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2);
  }
  return d + "Z";
}

/** A settlement label, styled by tier: grand capitals shout in large spaced
 *  caps, seats use smaller spaced caps, towns and villages stay as set. */
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
      x, y, "text-anchor": anchor,
      "font-family": style.fontFamily,
      "font-size": fs.toFixed(1),
      ...(tier === "capital" ? { "font-weight": "bold", "letter-spacing": "0.8" } : {}),
      ...(tier === "seat" ? { "letter-spacing": "0.5" } : {}),
      ...(ruined ? { "font-style": "italic", "fill-opacity": "0.7" } : {}),
      fill: style.labelColor, stroke: style.labelHalo,
      "stroke-width": 2.8 * k, "paint-order": "stroke", "stroke-linejoin": "round",
    },
    [display],
  );
}

export function settlementsLayer(ctx: RenderCtx): SvgNode {
  const { world, proj, style, labels } = ctx;
  const k = proj.widthPx / 1500;
  const nodes: SvgNode[] = [];

  const seats = world.realms.seats;
  const seatRealm = new Map<number, number>();
  seats.forEach((idx, realmId) => seatRealm.set(idx, realmId));
  const showHalo = style.politicalTints && seats.length > 1;

  const RANK: Record<SettlementTier, number> = { capital: 0, seat: 1, town: 2, village: 3 };
  const tierOf = (s: NamedSettlement, i: number): SettlementTier =>
    s.kind === "capital" ? "capital" : seatRealm.has(i) ? "seat" : s.kind;

  // capitals then seats first so the seats of power always win label space
  const ordered = world.settlements
    .map((s, i) => ({ s, i, tier: tierOf(s, i) }))
    .sort((a, b) => RANK[a.tier] - RANK[b.tier]);

  for (const { s, i, tier } of ordered) {
    const px = proj.px(s.x);
    const py = proj.py(s.y);

    // #93: each settlement's marks (halo, glyph, label) go into one addressable
    // <g class="settlement" data-idx="i"> so the Explorer's chronicle can reveal
    // the real glyph as its founding year passes. `i` is the WORLD index (matches
    // the manifest place idx); the wrapper is inert (no style rule targets it), so
    // idle output is byte-identical bar the tag itself, which regenerates the golden.
    const group: SvgNode[] = [];

    if (showHalo && (tier === "capital" || tier === "seat") && !s.ruined) {
      const realmId = seatRealm.get(i) as number;
      const color = style.realmTints[ctx.realmTint[realmId] as number] as string;
      group.push(seatHalo(px, py, tier, color, ctx));
    }
    group.push(s.ruined ? ruinGlyph(px, py, ctx) : settlementGlyph(tier, px, py, ctx));

    const fs = FONT_SIZE[tier] * k;
    const gap = (tier === "capital" ? 11 : tier === "seat" ? 8 : 7) * k;
    const upper = tier === "capital" || tier === "seat";
    const text = s.name;
    const display = upper ? text.toUpperCase() : text;
    // #195: capitals and seats render .toUpperCase() (and letter-spaced), so their
    // claim must use caps width + that spacing or the box is ~20% narrower than the
    // drawn name, letting a neighbour (e.g. a river reach, #178) bury the final
    // letters. Towns and villages draw as set, so they keep the mixed default.
    const wf = upper ? WIDTH_FACTOR.caps : WIDTH_FACTOR.mixed;
    const ls = tier === "capital" ? 0.8 : tier === "seat" ? 0.5 : 0;
    const tries = labelCandidates(px, py, fs, gap);
    let placed = false;
    for (const t of tries) {
      const box = textBox(t.x, t.y, text, fs, t.anchor, wf, ls);
      if (box.x < proj.margin + 4 || box.x + box.w > proj.widthPx - proj.margin - 4) continue;
      if (box.y < proj.margin + 4 || box.y + box.h > proj.heightPx - proj.margin - 4) continue;
      if (!labels.tryClaim(box)) continue;
      group.push(labelNode(display, tier, t.x, t.y, t.anchor, fs, !!s.ruined, ctx));
      placed = true;
      break;
    }
    if (!placed && tier !== "village") {
      // important places keep their label even in a crowd
      const t = tries[0]!;
      group.push(labelNode(display, tier, t.x, t.y, t.anchor, fs, !!s.ruined, ctx));
    }

    nodes.push(el("g", { class: "settlement", "data-idx": String(i) }, group));
  }

  return el("g", { id: "layer-settlements" }, nodes);
}
