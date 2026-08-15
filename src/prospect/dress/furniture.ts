import { el, type SvgNode } from "../../render/svg.ts";
import type { Arms } from "../../society/heraldry.ts";
import { armsNode, paletteForStyle } from "../../render/layers/heraldry.ts";
import { geom } from "../../render/layers/heraldry/geom.ts";
import { PLATE_H, PLATE_MARGIN, PLATE_W, VIEW_X0, VIEW_X1 } from "../geometry.ts";
import { r1, type DressContext } from "./context.ts";
import type { PlateCaption, PlateEra } from "../caption.ts";
import type { PlateKeyEntry } from "../key.ts";

const CX = PLATE_W / 2;
const FRAME_INSET = Math.round(PLATE_MARGIN * 0.45);
const SHIELD_SIZE = 27;
const SHIELD_CX = VIEW_X1 - 36;
const SHIELD_CY = 62;

const ROWS = { divider: 290, title: 308, year: 324, epithet: 340, key: 353, footer: 366 };
const ROWS_UNFOUNDED = { divider: 294, title: 316, epithet: 334, footer: 353 };

function frameNodes(c: DressContext): SvgNode[] {
  const oi = FRAME_INSET;
  return [
    el("rect", { x: oi, y: oi, width: PLATE_W - 2 * oi, height: PLATE_H - 2 * oi, fill: "none", stroke: c.ink, "stroke-width": 2 }),
    el("rect", { x: oi + 4, y: oi + 4, width: PLATE_W - 2 * oi - 8, height: PLATE_H - 2 * oi - 8, fill: "none", stroke: c.ink, "stroke-width": 0.7 }),
  ];
}

function dividerNodes(c: DressContext, y: number): SvgNode[] {
  return [
    el("line", { x1: CX - 76, y1: y, x2: CX + 76, y2: y, stroke: c.ink, "stroke-width": 0.9 }),
    el("path", { d: `M${CX} ${r1(y - 3.2)}L${CX + 3.2} ${y}L${CX} ${r1(y + 3.2)}L${CX - 3.2} ${y}Z`, fill: c.ink }),
  ];
}

function titleNode(c: DressContext, text: string, y: number, ruined: boolean): SvgNode {
  const fs = Math.min(14.5, (PLATE_W - 120) / (text.length * 0.62));
  return el("text", {
    x: CX, y, "text-anchor": "middle",
    "font-family": c.style.fontFamilyTitle, "font-size": r1(fs),
    "letter-spacing": 1.3, fill: c.ink,
    ...(ruined ? { "font-style": "italic", "fill-opacity": 0.85 } : {}),
  }, [text]);
}

function yearLineNode(c: DressContext, text: string, y: number): SvgNode {
  return el("text", {
    x: CX, y, "text-anchor": "middle",
    "font-family": c.style.fontFamily, "font-size": 8.5, "letter-spacing": 1.6, fill: c.ink,
  }, [text]);
}

function epithetNode(c: DressContext, text: string, y: number): SvgNode {
  const fs = Math.min(9.5, (PLATE_W - 90) / (text.length * 0.52));
  return el("text", {
    x: CX, y, "text-anchor": "middle",
    "font-family": c.style.fontFamily, "font-size": r1(fs), "font-style": "italic", fill: c.soft,
  }, [text]);
}

function footerNode(c: DressContext, text: string, y: number): SvgNode {
  return el("text", {
    x: CX, y, "text-anchor": "middle",
    "font-family": c.style.fontFamily, "font-size": 8, "letter-spacing": 2.2, fill: c.soft,
  }, [text]);
}

function keyStripNode(c: DressContext, entries: ReadonlyArray<PlateKeyEntry>, y: number): SvgNode {
  const text = entries.map((e) => `${e.letter}. ${e.label}.`).join("  ");
  return el("text", {
    x: CX, y, "text-anchor": "middle",
    "font-family": c.style.fontFamily, "font-size": 8, "font-style": "italic",
    "letter-spacing": 1.1, fill: c.soft,
  }, [text]);
}

function keyTagNodes(c: DressContext, entries: ReadonlyArray<PlateKeyEntry>): SvgNode[] {
  return entries.flatMap((e) => {
    const x = r1(Math.max(VIEW_X0 + 8, Math.min(VIEW_X1 - 8, e.x)));
    const y = r1(Math.max(40, e.y));
    const tag = {
      x, y, "text-anchor": "middle",
      "font-family": c.style.fontFamilyTitle, "font-size": 9.5, "font-style": "italic",
    } as const;
    return [
      el("text", { ...tag, fill: c.paper, stroke: c.paper, "stroke-width": 2.6 }, [e.letter]),
      el("text", { ...tag, fill: c.ink }, [e.letter]),
      el("line", {
        x1: x, y1: r1(y + 2.5), x2: x, y2: r1(y + 8),
        stroke: c.ink, "stroke-width": 0.5, "stroke-dasharray": "1.2 1.6",
      }),
    ];
  });
}

function shieldNodes(c: DressContext, arms: Arms, idSuffix: string): SvgNode[] {
  const g = geom(SHIELD_CX, SHIELD_CY, SHIELD_SIZE);
  return [
    el("path", {
      d: `M${r1(g.cx - 6)} ${r1(g.top)}L${r1(g.cx - 3)} ${PLATE_MARGIN}M${r1(g.cx + 6)} ${r1(g.top)}L${r1(g.cx + 3)} ${PLATE_MARGIN}`,
      fill: "none", stroke: c.ink, "stroke-width": 0.6, "stroke-opacity": 0.7,
    }),
    armsNode(arms, SHIELD_CX, SHIELD_CY, SHIELD_SIZE, paletteForStyle(c.style), idSuffix),
  ];
}

export type PlateFurniture = {
  readonly engraved: ReadonlyArray<SvgNode>;
  readonly furniture: ReadonlyArray<SvgNode>;
};

export function plateFurniture(
  c: DressContext,
  caption: PlateCaption,
  era: PlateEra,
  key: ReadonlyArray<PlateKeyEntry>,
  arms: Arms | null,
  idSuffix: string,
): PlateFurniture {
  const engraved = arms === null ? [] : shieldNodes(c, arms, idSuffix);
  const caption_: SvgNode[] =
    caption.yearLine === null
      ? [
          ...dividerNodes(c, ROWS_UNFOUNDED.divider),
          titleNode(c, caption.title, ROWS_UNFOUNDED.title, false),
          epithetNode(c, caption.epithet, ROWS_UNFOUNDED.epithet),
          footerNode(c, caption.footer, ROWS_UNFOUNDED.footer),
        ]
      : [
          ...dividerNodes(c, ROWS.divider),
          titleNode(c, caption.title, ROWS.title, era === "ruined"),
          yearLineNode(c, caption.yearLine, ROWS.year),
          epithetNode(c, caption.epithet, ROWS.epithet),
          ...(key.length > 0 ? [keyStripNode(c, key, ROWS.key), ...keyTagNodes(c, key)] : []),
          footerNode(c, caption.footer, ROWS.footer),
        ];
  return { engraved, furniture: [...caption_, ...frameNodes(c)] };
}
