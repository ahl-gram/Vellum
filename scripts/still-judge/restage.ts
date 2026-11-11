import { svgDimensions } from "../../src/cli/raster.ts";
import type { Kind } from "./questions.ts";

export type RestageId = "rain-faint" | "realm-faint" | "range-thin" | "title-small";
export type Restage = {
  readonly id: RestageId;
  readonly issue: number;
  readonly kind: Kind;
  readonly question: string;
  readonly css: string;
  readonly witness: string;
  readonly property: string;
  readonly value: string;
};

export const RESTAGES: readonly Restage[] = [
  {
    id: "rain-faint",
    issue: 108,
    kind: "rainfall",
    question: "rain_lines_lead",
    css: "#layer-iso path[stroke] { stroke: #857257; stroke-width: 0.7px; stroke-opacity: 0.45 }",
    witness: "#layer-iso path[stroke]",
    property: "stroke-opacity",
    value: "0.45",
  },
  {
    id: "realm-faint",
    issue: 158,
    kind: "sheet",
    question: "realm_names_read",
    css: '#layer-feature-labels text[font-weight="700"] { font-weight: 400; fill-opacity: 0.55; stroke-width: 2.6px }',
    witness: '#layer-feature-labels text[font-weight="700"]',
    property: "fill-opacity",
    value: "0.55",
  },
  {
    id: "range-thin",
    issue: 9,
    kind: "crop",
    question: "names_read",
    css: "#layer-feature-labels rect.range-casing { display: none } #layer-feature-labels rect.range-casing + text { stroke-width: 2.4px; fill-opacity: 0.78 }",
    witness: "#layer-feature-labels rect.range-casing + text",
    property: "fill-opacity",
    value: "0.78",
  },
  {
    id: "title-small",
    issue: 1309,
    kind: "sheet",
    question: "title_reads_first",
    css: "#layer-cartouche text:first-of-type { font-size: 10.5px; font-style: italic; letter-spacing: 0px; fill: #857257 }",
    witness: "#layer-cartouche text:first-of-type",
    property: "font-size",
    value: "10.5px",
  },
];

export const withStyle = (svg: string, css: string): string => {
  const open = /<svg\b[^>]*>/.exec(svg);
  if (open === null) throw new Error("not an SVG: no <svg> tag");
  const at = open.index + open[0].length;
  return svg.slice(0, at) + `<style>${css}</style>` + svg.slice(at);
};

const count = (text: string, pattern: RegExp): number => (text.match(pattern) ?? []).length;

const layer = (svg: string, from: string, to: string): string => {
  const a = svg.indexOf(`<g id="${from}"`);
  const b = svg.indexOf(`<g id="${to}"`);
  return a === -1 || b < a ? "" : svg.slice(a, b);
};

export const carriesEverySubject = (sheet: string, rain: string): boolean =>
  count(sheet, /font-weight="700"/g) > 0 &&
  count(sheet, /class="range-casing"/g) === 1 &&
  count(layer(sheet, "layer-cartouche", "layer-legend"), /<text /g) > 0 &&
  count(layer(rain, "layer-iso", "layer-rivers"), /<path [^>]*stroke=/g) > 0 &&
  count(layer(rain, "layer-wind-streams", "layer-iso"), /<path [^>]*stroke=/g) > 0;

export const CROP = { width: 600, height: 400 } as const;

export const cropClip = (svg: string): { x: number; y: number; width: number; height: number } => {
  const m = /class="range-casing"[^>]*transform="rotate\([-0-9.]+ ([-0-9.]+) ([-0-9.]+)\)"/.exec(svg);
  if (m === null) throw new Error("the sheet has no mountain range name to crop around");
  const { width, height } = svgDimensions(svg);
  const x = Math.round(Math.min(Math.max(Number(m[1]) - CROP.width / 2, 0), width - CROP.width));
  const y = Math.round(Math.min(Math.max(Number(m[2]) - CROP.height / 2, 0), height - CROP.height));
  return { x, y, ...CROP };
};

export const witnessProbe = (r: Restage): string =>
  `(() => { const els = [...document.querySelectorAll(${JSON.stringify(r.witness)})]; return JSON.stringify({ matched: els.length, value: els.length ? getComputedStyle(els[0]).getPropertyValue(${JSON.stringify(r.property)}) : null }); })()`;

export const witnessFails = (r: Restage, probe: string | null): boolean => {
  if (probe === null) return true;
  const read = JSON.parse(probe) as { matched?: unknown; value?: unknown };
  return read.matched === 0 || read.value !== r.value;
};
