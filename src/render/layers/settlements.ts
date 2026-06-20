import { el, type SvgNode } from "../svg.ts";
import { textBox } from "../geometry.ts";
import type { RenderCtx } from "../context.ts";
import type { NamedSettlement } from "../../world/types.ts";

const FONT_SIZE: Record<NamedSettlement["kind"], number> = {
  capital: 17,
  town: 13,
  village: 10.5,
};

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

/** The map mark for a settlement tier; reused by the legend so the two match. */
export function settlementGlyph(
  kind: NamedSettlement["kind"],
  px: number,
  py: number,
  ctx: RenderCtx,
): SvgNode {
  const { style } = ctx;
  const k = ctx.proj.widthPx / 1500;
  if (kind === "capital") {
    if (style.name === "antique" || style.name === "ink") {
      return castleGlyph(px, py, k, style.ink, style.labelHalo);
    }
    const r = 6.5 * k;
    const star = starPath(px, py, r * 0.62, 5);
    return el("g", {}, [
      el("circle", {
        cx: px, cy: py, r,
        fill: style.labelHalo, stroke: style.ink, "stroke-width": 1.6 * k,
      }),
      el("path", { d: star, fill: style.ink }),
    ]);
  }
  if (kind === "town") {
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

export function settlementsLayer(ctx: RenderCtx): SvgNode {
  const { world, proj, style, labels } = ctx;
  const k = proj.widthPx / 1500;
  const nodes: SvgNode[] = [];

  // capitals first so they always win label space
  const ordered = [...world.settlements].sort((a, b) => {
    const rank = { capital: 0, town: 1, village: 2 };
    return rank[a.kind] - rank[b.kind];
  });

  for (const s of ordered) {
    const px = proj.px(s.x);
    const py = proj.py(s.y);
    nodes.push(s.ruined ? ruinGlyph(px, py, ctx) : settlementGlyph(s.kind, px, py, ctx));

    const fs = FONT_SIZE[s.kind] * k;
    const gap = (s.kind === "capital" ? 10 : 7) * k;
    const text = s.name;
    const tries = labelCandidates(px, py, fs, gap);
    let placed = false;
    for (const t of tries) {
      const box = textBox(t.x, t.y, text, fs, t.anchor);
      if (box.x < proj.margin + 4 || box.x + box.w > proj.widthPx - proj.margin - 4) continue;
      if (box.y < proj.margin + 4 || box.y + box.h > proj.heightPx - proj.margin - 4) continue;
      if (!labels.tryClaim(box)) continue;
      nodes.push(
        el(
          "text",
          {
            x: t.x,
            y: t.y,
            "text-anchor": t.anchor,
            "font-family": style.fontFamily,
            "font-size": fs.toFixed(1),
            ...(s.kind === "capital"
              ? { "font-weight": "bold", "letter-spacing": "0.6" }
              : {}),
            ...(s.ruined ? { "font-style": "italic", "fill-opacity": "0.7" } : {}),
            fill: style.labelColor,
            stroke: style.labelHalo,
            "stroke-width": 2.8 * k,
            "paint-order": "stroke",
            "stroke-linejoin": "round",
          },
          [s.kind === "capital" ? text.toUpperCase() : text],
        ),
      );
      placed = true;
      break;
    }
    if (!placed && s.kind !== "village") {
      // important places keep their label even in a crowd
      const t = tries[0]!;
      nodes.push(
        el(
          "text",
          {
            x: t.x, y: t.y, "text-anchor": t.anchor,
            "font-family": style.fontFamily, "font-size": fs.toFixed(1),
            fill: style.labelColor, stroke: style.labelHalo,
            "stroke-width": 2.8 * k, "paint-order": "stroke",
          },
          [s.kind === "capital" ? text.toUpperCase() : text],
        ),
      );
    }
  }

  return el("g", { id: "layer-settlements" }, nodes);
}
