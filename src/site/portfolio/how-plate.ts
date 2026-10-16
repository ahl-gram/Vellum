// The plate a Portfolio with nothing gathered shows on its stage (Issue #670).
import { PLATE_TITLE } from "./folio-lines.ts";

export const PLATE_CHART = "../../charts/chart-42-antique.svg";

export interface PlateStep {
  readonly numeral: string;
  readonly head: string;
  readonly lines: readonly [string, string, string];
}

export const PLATE_STEPS: readonly [PlateStep, PlateStep, PlateStep] = [
  {
    numeral: "i",
    head: "At the Explorer",
    lines: ["Draw nearer with the Glass until a", "region is surveyed anew, then turn", "down the survey's corner."],
  },
  {
    numeral: "ii",
    head: "On the Table",
    lines: [
      "Each sheet turned down is laid on the",
      "Chart Table, in the drawer at the",
      "chart's right edge, up to six.",
    ],
  },
  {
    numeral: "iii",
    head: "In the Portfolio",
    lines: ["Take the table here: each sheet is", "drafted again from its number, and", "downloads as the engraving."],
  },
];
export const PLATE_TAB = "The Drawer";
export const PLATE_VERB = "Take the table to";
export const PLATE_ROOM = "The Portfolio";

type Box = readonly [number, number, number, number];

const crop = (n: number, href: string, [x, y, w, h]: Box, [vx, vy, vw, vh]: Box): string => {
  const s = Math.max(w / vw, h / vh);
  const tx = x + (w - vw * s) / 2 - vx * s;
  const ty = y + (h - vh * s) / 2 - vy * s;
  const id = `how-plate-clip-${n}`;
  return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" class="p-clip"/></clipPath><g clip-path="url(#${id})"><image href="${href}" width="1500" height="1158" transform="translate(${tx} ${ty}) scale(${s})"/></g>`;
};

const frame = (x: number, y: number, w: number, h: number): string =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="p-frame"/>`;

const rowOne = (href: string, y: number): string =>
  `${crop(1, href, [72, y, 400, 226], [460, 280, 640, 362])}${frame(72, y, 400, 226)}
<rect x="212" y="${y + 58}" width="130" height="100" class="p-window"/>
<path d="M314 ${y + 58} L342 ${y + 58} L342 ${y + 86} Z" class="p-gold"/>
<path d="M314 ${y + 58} L342 ${y + 86} L314 ${y + 86} Z" class="p-paper"/>`;

const cutting = (n: number, href: string, x: number, y: number, rot: number, window: Box): string =>
  `<g transform="rotate(${rot} ${x + 70} ${y + 46})"><rect x="${x - 6}" y="${y - 6}" width="152" height="104" class="p-leaf"/>${crop(n, href, [x, y, 140, 92], window)}</g>`;

const rowTwo = (href: string, y: number): string =>
  `<rect x="72" y="${y}" width="400" height="226" class="p-walnut"/>
<rect x="256" y="${y}" width="216" height="46" class="p-tabpaper"/>
<text x="364" y="${y + 33}" text-anchor="middle" class="p-tab">${PLATE_TAB}</text>
${cutting(2, href, 92, y + 62, -4, [600, 350, 520, 342])}
${cutting(3, href, 250, y + 58, 3, [300, 600, 520, 342])}
${cutting(4, href, 170, y + 116, -1.5, [900, 200, 520, 342])}`;

const rowThree = (href: string, y: number): string =>
  `<rect x="154" y="${y + 12}" width="236" height="120" class="p-leaf" transform="rotate(-1.5 272 ${y + 72})"/>
<rect x="149" y="${y + 8}" width="236" height="120" class="p-leaf" transform="rotate(-0.8 267 ${y + 68})"/>
${crop(5, href, [144, y + 4, 236, 120], [430, 250, 700, 356])}${frame(144, y + 4, 236, 120)}
<rect x="112" y="${y + 144}" width="320" height="76" rx="3" class="p-gold"/>
<text x="272" y="${y + 174}" text-anchor="middle" class="p-verb">${PLATE_VERB}</text>
<text x="272" y="${y + 208}" text-anchor="middle" class="p-room">${PLATE_ROOM}</text>`;

const row = (y0: number, step: PlateStep, picture: string): string =>
  `<g>${picture}
<text x="512" y="${y0 + 52}" class="p-head">${step.numeral} · ${step.head}</text>
${step.lines.map((line, i) => `<text x="512" y="${y0 + 108 + i * 42}" class="p-cap">${line}</text>`).join("\n")}
</g>`;

const rule = (y: number): string => `<line x1="72" y1="${y}" x2="1128" y2="${y}" class="p-hair"/>`;

export function howPlate(chartHref: string): string {
  const [one, two, three] = PLATE_STEPS;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1000" class="how-plate">
<rect width="1200" height="1000" class="p-ground"/>
<rect x="20" y="20" width="1160" height="960" class="p-rule outer"/>
<rect x="32" y="32" width="1136" height="936" class="p-rule inner"/>
<text x="600" y="112" text-anchor="middle" class="p-title">${PLATE_TITLE}</text>
<line x1="330" y1="142" x2="870" y2="142" class="p-hair"/>
${row(168, one, rowOne(chartHref, 180))}
${rule(432)}
${row(438, two, rowTwo(chartHref, 450))}
${rule(702)}
${row(708, three, rowThree(chartHref, 720))}
</svg>`;
}
