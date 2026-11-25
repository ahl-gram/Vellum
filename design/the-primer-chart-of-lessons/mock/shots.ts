// Issue #1256 round: the shot lists for the stills. `node out/1256/mock/shots.ts full` writes the first pass (every still at its viewport, the first-visit ones before the seals are written, then one shot that writes the returner's seals, then the rest); `node out/1256/mock/shots.ts crops` reads that pass's results and writes the second (each crop cut from where the first pass measured the chart, the slip, the panel or the Explorer). Both are taken with `scripts/design/shoot.ts`.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { OUT } from "./paths.ts";
import { drawChart, lessonCard } from "./chart.ts";
import { layScript, PRIME, PROBE, type Laid } from "./inject.ts";
import { BASE, STILLS, type Still } from "./spec.ts";
import { FIRST_VISIT, RETURNER, storeScript } from "./states.ts";
import { PLACES } from "../../../src/layouts/atelier-chart.ts";

const MEASURE = resolve(OUT, "measure");
const heightOf = (w: number): number => (w === 1280 ? 800 : 768);
const cropOnly = (s: Still): boolean => s.crop !== undefined && (s.file.endsWith("-2x.png") || s.crop === "fold" || s.crop === "head");

export const fullOut = (s: Still): string =>
  cropOnly(s) ? resolve(MEASURE, "full", s.file.replace(/(-2x)?\.png$/, "-full.png")) : resolve(OUT, s.folder, "stills", s.file);

export const cropOut = (s: Still): string | null =>
  s.crop === undefined ? null : cropOnly(s) ? resolve(OUT, s.folder, "stills", s.file) : resolve(OUT, s.folder, "stills", s.file.replace(/\.png$/, "-2x.png"));

export function laid(s: Still): { readonly script: string; readonly frame: { x: number; y: number; w: number; h: number } } {
  const o = { ...BASE(s.state), ...s.opts };
  const drawn = drawChart(o);
  const l: Laid = {
    seat: s.seat,
    svg: drawn.svg,
    card: lessonCard(o.open, o),
    cardAt: s.seat === "head-card" ? { left: "auto;right:0.8rem", top: "0.8rem" } : { left: "0", top: "0" },
    foldWidth: s.width === 1280 ? "52rem" : "50rem",
    caption: s.seat === "head" || s.seat === "head-card" ? keyLine(o) : "",
  };
  const script = layScript(l) + (s.after === undefined ? "" : `;\n${s.after}`);
  return { script, frame: drawn.frame };
}

export function keyLine(o: { grain: string; marks: string; ink: string }): string {
  const seal = o.grain === "steps" ? "a red mark is a step you have done" : "a red seal is a lesson done, a red rim one begun";
  const road = o.ink === "roads" ? ", the red road is the way you have come" : o.ink === "route" ? ", the dotted road runs through the rooms in the page's order" : "";
  const here = o.marks === "hand" ? "the lit room is the one you are reading, and the hand points at your next step" : "the ring marks the room you are reading";
  return `Every room that teaches, and how far you have come: ${seal}${road}; ${here}.`;
}

const prime = (state: typeof RETURNER, name: string) => ({
  url: "/primer/",
  width: 1280,
  height: 800,
  mobile: false,
  out: resolve(MEASURE, "full", `${name}.png`),
  script: PRIME(storeScript(state)),
  waitMs: 300,
});

function fullPass(): unknown[] {
  const order = [...STILLS.filter((s) => s.state === FIRST_VISIT), ...STILLS.filter((s) => s.state === RETURNER)];
  const firstReturner = order.findIndex((s) => s.state === RETURNER);
  const shots = order.map((s) => ({
    url: "/primer/",
    width: s.width,
    height: heightOf(s.width),
    mobile: false,
    out: fullOut(s),
    script: laid(s).script,
    probe: PROBE,
  }));
  return [prime(FIRST_VISIT, "prime-first"), ...shots.slice(0, firstReturner), prime(RETURNER, "prime-returner"), ...shots.slice(firstReturner)];
}

interface Result {
  readonly out: string;
  readonly probe: string | null;
}

function cropPass(): unknown[] {
  const results = JSON.parse(readFileSync(resolve(MEASURE, "stills-results.json"), "utf8")) as Result[];
  const byOut = new Map(results.map((r) => [r.out, r.probe === null ? null : JSON.parse(r.probe)]));
  const withCrop = STILLS.filter((s) => s.crop !== undefined);
  const shots = withCrop.map((s) => {
    const p = byOut.get(fullOut(s));
    if (p === undefined || p === null || p.chart === null) throw new Error(`no measured chart for ${s.file}`);
    const { frame } = laid(s);
    const pad = 8;
    let clip: { x: number; y: number; width: number; height: number; scale: number };
    if (s.crop === "explorer") {
      const k = p.chart.w / frame.w;
      const ex = PLACES["/explorer/"]!;
      const cx = p.chart.x + (ex.x - frame.x) * k;
      const cy = p.chart.y + (ex.y - frame.y) * k;
      clip = { x: Math.round(cx - 150), y: Math.round(cy - 110), width: 300, height: 220, scale: 2 };
    } else if (s.crop === "fold") {
      clip = { x: Math.floor(p.fold.x) - pad, y: Math.floor(p.fold.y) - pad, width: Math.ceil(p.fold.w) + 2 * pad, height: Math.ceil(p.fold.h) + 2 * pad, scale: 1 };
    } else if (s.crop === "head") {
      clip = { x: Math.floor(p.head.x) - pad, y: Math.floor(p.head.y) - pad, width: Math.ceil(p.head.w) + 2 * pad, height: Math.ceil(p.head.h) + 2 * pad, scale: 1 };
    } else if (s.crop === "slip") {
      clip = { x: Math.floor(p.slip.x) - pad, y: Math.floor(p.slip.y) - pad, width: Math.ceil(p.slip.w) + 2 * pad, height: Math.min(Math.ceil(p.slip.h) + 2 * pad, 560), scale: 2 };
    } else {
      clip = { x: Math.floor(p.chart.x) - pad, y: Math.floor(p.chart.y) - pad, width: Math.ceil(p.chart.w) + 2 * pad, height: Math.ceil(p.chart.h) + 2 * pad, scale: 2 };
    }
    return { url: "/primer/", width: s.width, height: heightOf(s.width), mobile: false, out: cropOut(s)!, script: laid(s).script, clip, probe: PROBE, state: s.state.key };
  });
  const first = shots.filter((x) => x.state === FIRST_VISIT.key).map(({ state: _, ...x }) => x);
  const rest = shots.filter((x) => x.state === RETURNER.key).map(({ state: _, ...x }) => x);
  return [prime(FIRST_VISIT, "prime-first-crops"), ...first, prime(RETURNER, "prime-returner-crops"), ...rest];
}

const mode = import.meta.main ? process.argv[2] : "imported";
if (mode !== "imported") {
  mkdirSync(resolve(MEASURE, "full"), { recursive: true });
  for (const s of STILLS) mkdirSync(dirname(resolve(OUT, s.folder, "stills", s.file)), { recursive: true });
}
if (mode === "imported") {
  // read by sheets.ts and tables.ts for the paths alone
} else if (mode === "full") {
  writeFileSync(resolve(MEASURE, "stills-shots.json"), JSON.stringify(fullPass(), null, 1));
  writeFileSync(
    resolve(MEASURE, "stills-meta.json"),
    JSON.stringify(
      STILLS.map((s) => ({ folder: s.folder, file: s.file, width: s.width, state: s.state.key, seat: s.seat, opts: s.opts, caption: s.caption, hypothetical: s.hypothetical ?? false, frame: laid(s).frame, full: fullOut(s), crop: cropOut(s) })),
      null,
      1,
    ),
  );
  console.log(resolve(MEASURE, "stills-shots.json"));
} else if (mode === "crops") {
  writeFileSync(resolve(MEASURE, "crops-shots.json"), JSON.stringify(cropPass(), null, 1));
  console.log(resolve(MEASURE, "crops-shots.json"));
} else {
  console.error("usage: node out/1256/mock/shots.ts full|crops");
  process.exitCode = 2;
}
