import { escapeXml } from "./svg.ts";

/** A plain template string, not el()/renderSvg(): the nested chart is already-rendered markup that must NOT be re-escaped. */

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export const OG_WORDMARK = "Vellum";
export const OG_TAGLINE = "an atelier of imaginary cartography";
export const OG_HOOK_LINES: readonly string[] = ["Give Vellum a number.", "It gives you back a world."];
export const OG_HOOK = OG_HOOK_LINES.join(" ");

export type OgFontFace = {
  readonly family: string;
  readonly style: "normal" | "italic";
  readonly file: string;
};

const FELL_SC: OgFontFace = {
  family: "IM Fell English SC",
  style: "normal",
  file: "im-fell-english-sc-latin-400-normal.woff2",
};
const FELL_ITALIC: OgFontFace = {
  family: "IM Fell English",
  style: "italic",
  file: "im-fell-english-latin-400-italic.woff2",
};
export const OG_FONT_FACES: readonly OgFontFace[] = [FELL_SC, FELL_ITALIC];

const INK_DARK = "#4a3826";
const CHART_INK = "#3d2f1f";
const PARCHMENT = "#efe6cf";
const PARCHMENT_BRIGHT = "#fff7e4";
const LINE_TAN = "#b9a77f";
const WALNUT_LIT = "#5b4937";

const SERIF_FALLBACK = "'Iowan Old Style', 'Palatino', Georgia, serif";
const FONT_DISPLAY = `'${FELL_SC.family}', ${SERIF_FALLBACK}`;
const FONT_FLOURISH = `'${FELL_ITALIC.family}', ${SERIF_FALLBACK}`;

const CX = OG_WIDTH / 2;
const WORDMARK = { y: 170, size: 100, track: 0.14 };
const TAGLINE = { y: 236, size: 50 };
const ROSE = { y: 280, size: 132 };
const HOOK = { y: 468, size: 48, track: 0.3, leading: 1.4 };
const GHOST_OPACITY = 0.1;
const DEEP = { cx: 0.5, cy: 0.4, rx: 0.9, ry: 0.8, mid: 0.55 };

export type OgCardOptions = {
  readonly wordmark?: string;
  readonly tagline?: string;
  readonly footnote?: readonly string[];
  readonly fontCss?: string;
};

export function fontFaceCss(face: OgFontFace, woff2Base64: string): string {
  return (
    `@font-face { font-family: '${face.family}'; font-style: ${face.style}; font-weight: 400; ` +
    `src: url(data:font/woff2;base64,${woff2Base64}) format("woff2"); }`
  );
}

function deepGradient(): string {
  const cx = DEEP.cx * OG_WIDTH;
  const cy = DEEP.cy * OG_HEIGHT;
  const rx = DEEP.rx * OG_WIDTH;
  const squash = ((DEEP.ry * OG_HEIGHT) / rx).toFixed(4);
  return (
    `<radialGradient id="veil-deep" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${rx}" ` +
    `gradientTransform="translate(${cx} ${cy}) scale(1 ${squash}) translate(${-cx} ${-cy})">` +
    `<stop offset="0" stop-color="${WALNUT_LIT}"/>` +
    `<stop offset="${DEEP.mid}" stop-color="${INK_DARK}"/>` +
    `<stop offset="1" stop-color="${CHART_INK}"/>` +
    `</radialGradient>`
  );
}

function chartSize(openTag: string): { w: number; h: number } {
  const w = /\swidth="(\d+)"/.exec(openTag)?.[1];
  const h = /\sheight="(\d+)"/.exec(openTag)?.[1];
  if (!w || !h) throw new Error("chart SVG root carries no integer width/height");
  return { w: Number(w), h: Number(h) };
}

function ghostChart(chartSvg: string): string {
  const start = chartSvg.indexOf("<svg");
  if (start < 0) throw new Error("chart SVG has no <svg> root");
  const body = chartSvg.slice(start);
  const openEnd = body.indexOf(">");
  if (openEnd < 0) throw new Error("chart SVG root tag is unterminated");
  const openTag = body.slice(0, openEnd + 1);
  const { w, h } = chartSize(openTag);
  const ghostTag = openTag
    .replace(/\s(?:width|height)="[^"]*"/g, "")
    .replace(
      /^<svg/,
      `<svg x="${(OG_WIDTH - w) / 2}" y="${(OG_HEIGHT - h) / 2}" width="${w}" height="${h}" ` +
        `preserveAspectRatio="xMidYMid slice" opacity="${GHOST_OPACITY}"`,
    );
  return ghostTag + body.slice(openEnd + 1);
}

function settledRose(): string {
  return (
    `<svg x="${CX - ROSE.size / 2}" y="${ROSE.y}" width="${ROSE.size}" height="${ROSE.size}" ` +
    `viewBox="0 0 120 120" aria-hidden="true">` +
    `<circle cx="60" cy="60" r="44" fill="none" stroke="${LINE_TAN}" stroke-width="1"/>` +
    `<circle cx="60" cy="60" r="34" fill="none" stroke="${LINE_TAN}" stroke-width="0.6"/>` +
    `<g stroke="${LINE_TAN}" stroke-width="0.6" opacity="0.75">` +
    `<path d="M60 8 L60 112"/><path d="M8 60 L112 60"/>` +
    `<path d="M24 24 L96 96"/><path d="M96 24 L24 96"/>` +
    `</g>` +
    `<path d="M60 18 L66 60 L60 102 L54 60 Z" fill="${PARCHMENT}" transform="rotate(16 60 60)"/>` +
    `<circle cx="60" cy="60" r="3.4" fill="${LINE_TAN}"/>` +
    `</svg>`
  );
}

function line(content: string, y: number, size: number, family: string, fill: string, extra: string): string {
  return (
    `<text x="${CX}" y="${y}" text-anchor="middle" font-family="${family}" font-size="${size}"${extra} ` +
    `fill="${fill}">${escapeXml(content)}</text>`
  );
}

function hookLine(text: string, index: number): string {
  const y = Math.round(HOOK.y + index * HOOK.size * HOOK.leading);
  return line(text, y, HOOK.size, FONT_DISPLAY, PARCHMENT, ` letter-spacing="${HOOK.size * HOOK.track}"`);
}

export function buildOgCard(chartSvg: string, opts: OgCardOptions = {}): string {
  const wordmark = opts.wordmark ?? OG_WORDMARK;
  const tagline = opts.tagline ?? OG_TAGLINE;
  const hook = opts.footnote ?? OG_HOOK_LINES;
  const faces = opts.fontCss ? `<style>${opts.fontCss}</style>` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" ` +
    `viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" role="img" ` +
    `aria-label="Vellum: procedurally generated fantasy cartography">` +
    `<defs>${faces}${deepGradient()}</defs>` +
    `<rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#veil-deep)"/>` +
    ghostChart(chartSvg) +
    line(wordmark, WORDMARK.y, WORDMARK.size, FONT_DISPLAY, PARCHMENT_BRIGHT, ` letter-spacing="${WORDMARK.size * WORDMARK.track}"`) +
    line(tagline, TAGLINE.y, TAGLINE.size, FONT_FLOURISH, PARCHMENT, ` font-style="italic"`) +
    settledRose() +
    hook.map((text, i) => hookLine(text, i)).join("") +
    `</svg>`
  );
}
