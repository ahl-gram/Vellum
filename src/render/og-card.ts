import { escapeXml } from "./svg.ts";

/**
 * Builds a social-preview card: a fixed 1200x630 (the canonical Open Graph /
 * Twitter summary_large_image aspect) parchment panel with a hero chart
 * letterboxed on the right and the Vellum wordmark on the left.
 *
 * Hero charts are ~1.3:1, so rasterizing one directly would crop badly when a
 * scraper fits it to 1.91:1. The chart is nested as a child <svg>: its root tag
 * is rewritten in place (positioned, resized, preserveAspectRatio added) rather
 * than stripped, so its embedded recipe metadata (data-vellum-seed, viewBox)
 * survives for anyone who saves the card and inspects it.
 *
 * Output is a plain template string, not the el()/renderSvg() builder, because
 * the nested chart is already-rendered markup that must NOT be re-escaped.
 */

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const PARCHMENT = "#efe6cf";
const INK = "#3d2f1f";
const FADED = "#6b5a40";
const RULE = "#b9a77f";
const SERIF = "'Iowan Old Style', 'Palatino', Georgia, serif";

// Left text column; the chart fills the rest, inset by a uniform margin.
const TEXT_X = 64;
const TEXT_W = 392;
const MAP_X = TEXT_X + TEXT_W;
const MARGIN = 30;

export type OgCardOptions = {
  /** Large wordmark. Defaults to VELLUM. */
  readonly wordmark?: string;
  /** Italic tagline under the wordmark. */
  readonly tagline?: string;
  /** Small footnote near the bottom of the text column. */
  readonly footnote?: string;
};

/**
 * Rewrites a rendered chart's root <svg> tag so the chart becomes a positioned,
 * letterboxed child viewport. Keeps every other attribute (viewBox, role,
 * aria-label, data-vellum-*); only width/height are replaced and x/y/
 * preserveAspectRatio are added.
 */
function embedChart(
  chartSvg: string,
  x: number,
  y: number,
  w: number,
  h: number,
): string {
  const start = chartSvg.indexOf("<svg");
  if (start < 0) throw new Error("chart SVG has no <svg> root");
  const body = chartSvg.slice(start);

  const openEnd = body.indexOf(">");
  if (openEnd < 0) throw new Error("chart SVG root tag is unterminated");
  const openTag = body.slice(0, openEnd + 1);
  const rest = body.slice(openEnd + 1);

  const rewritten = openTag
    .replace(/\s(?:width|height)="[^"]*"/g, "")
    .replace(
      /^<svg/,
      `<svg x="${x}" y="${y}" width="${w}" height="${h}" ` +
        `preserveAspectRatio="xMidYMid meet"`,
    );

  return rewritten + rest;
}

export function buildOgCard(chartSvg: string, opts: OgCardOptions = {}): string {
  const wordmark = opts.wordmark ?? "VELLUM";
  const mapW = OG_WIDTH - MAP_X - MARGIN;
  const mapH = OG_HEIGHT - MARGIN * 2;
  const chart = embedChart(chartSvg, MAP_X, MARGIN, mapW, mapH);

  const cx = TEXT_X;
  const lines: string[] = [
    `<text x="${cx}" y="288" font-family="${SERIF}" font-size="72" ` +
      `letter-spacing="6" fill="${INK}">${escapeXml(wordmark)}</text>`,
  ];
  if (opts.tagline) {
    lines.push(
      `<text x="${cx}" y="338" font-family="${SERIF}" font-size="26" ` +
        `font-style="italic" fill="${FADED}">${escapeXml(opts.tagline)}</text>`,
    );
  }
  if (opts.footnote) {
    lines.push(
      `<text x="${cx}" y="566" font-family="${SERIF}" font-size="15" ` +
        `letter-spacing="2" fill="${FADED}">${escapeXml(opts.footnote.toUpperCase())}</text>`,
    );
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" ` +
    `viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" role="img" ` +
    `aria-label="Vellum: procedurally generated fantasy cartography">` +
    `<rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${PARCHMENT}"/>` +
    `<line x1="${cx}" y1="312" x2="${cx + 300}" y2="312" stroke="${RULE}" stroke-width="1"/>` +
    chart +
    lines.join("") +
    `</svg>`
  );
}
