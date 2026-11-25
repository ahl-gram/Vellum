// Issue #1256 round: the measurements behind the menu that are not stills. Writes `measure/contrast.md` and `measure/route.md` itself, and the shot lists `measure/links-shots.json` (does a press on the chart open its room, and what does the page's own click handler make of an SVG link) and `measure/growth-shots.json` (HYPOTHETICAL ladders, grown by copying a real lesson, to find where each layout first collides), which `scripts/design/shoot.ts` takes and `tables.ts` reads back.
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { OUT } from "./paths.ts";
import { PLACES } from "../../../src/layouts/atelier-chart.ts";
import { LADDERS } from "../../../src/site/shared/primer/ladders.ts";
import { primerPage } from "../../../src/site/primer/page.ts";
import type { Ladder } from "../../../src/site/shared/primer/shape.ts";
import { drawChart } from "./chart.ts";
import { layScript, PRIME, PROBE } from "./inject.ts";
import { BASE } from "./spec.ts";
import { RETURNER, storeScript } from "./states.ts";

const MEASURE = resolve(OUT, "measure");
mkdirSync(resolve(MEASURE, "growth"), { recursive: true });
mkdirSync(resolve(MEASURE, "links"), { recursive: true });

const hex = (h: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
const lin = (c: number): number => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const lum = ([r, g, b]: readonly number[]): number => 0.2126 * lin(r!) + 0.7152 * lin(g!) + 0.0722 * lin(b!);
const ratio = (a: readonly number[], b: readonly number[]): number => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
};
const over = (top: readonly number[], alpha: number, under: readonly number[]): number[] => top.map((v, i) => Math.round(v * alpha + under[i]! * (1 - alpha)));

const T = {
  inkDark: hex("#4a3826"),
  inkBrown: hex("#6b5a40"),
  inkFaded: hex("#857257"),
  parchment: hex("#efe6cf"),
  parchmentPanel: hex("#f4ecd8"),
  parchmentBright: hex("#fff7e4"),
  parchmentDeep: hex("#e6d9b8"),
  ironRed: hex("#7a1f12"),
  chartPaper: hex("#f2e8cf"),
  chartInk: hex("#3d2f1f"),
  controlGold: hex("#f0e3bd"),
};
const land = over(T.parchmentDeep, 0.6, T.chartPaper);
const shine = over(T.parchmentBright, 0.3, T.ironRed);
const night = over(T.chartInk, 0.985, T.parchmentPanel);
const rows: [string, string, number, number][] = [
  ["a taught room's name, dark ink, on the land wash", "--ink-dark on --parchment-deep 0.6 over --chart-paper", ratio(T.inkDark, land), 4.5],
  ["a taught room's name, dark ink, on the sea", "--ink-dark on --chart-paper", ratio(T.inkDark, T.chartPaper), 4.5],
  ["an untaught place's name, brown, on the land wash", "--ink-brown on the land wash", ratio(T.inkBrown, land), 4.5],
  ["an untaught place's name, brown, on the sea", "--ink-brown on --chart-paper", ratio(T.inkBrown, T.chartPaper), 4.5],
  ["the open room's name on its gold light", "--ink-dark on --control-gold", ratio(T.inkDark, T.controlGold), 4.5],
  ["a lesson's numeral on a waypoint not done", "--ink-dark on --parchment-bright", ratio(T.inkDark, T.parchmentBright), 4.5],
  ["a done lesson's numeral on its red seal", "--parchment-bright on --iron-red", ratio(T.parchmentBright, T.ironRed), 4.5],
  ["the same, where the seal's cream shine is brightest", "--parchment-bright on --parchment-bright 0.3 over --iron-red", ratio(T.parchmentBright, shine), 4.5],
  ["the key line under the chart, on the sheet", "--ink-brown on --parchment-panel", ratio(T.inkBrown, T.parchmentPanel), 4.5],
  ["a ring's step not yet done (a mark, not text)", "--ink-faded on the land wash", ratio(T.inkFaded, land), 3],
  ["a ring's step done (a mark, not text)", "--iron-red on the land wash", ratio(T.ironRed, land), 3],
  ["a begun waypoint's red rim (a mark, not text)", "--iron-red on --parchment-bright", ratio(T.ironRed, T.parchmentBright), 3],
  ["the dark dress: a name, parchment, on the panel", "--parchment on --chart-ink 0.985", ratio(T.parchment, night), 4.5],
  ["the dark dress: a numeral, cream, on a waypoint", "--parchment-bright on --chart-ink", ratio(T.parchmentBright, T.chartInk), 4.5],
  ["the dark dress: a done seal's red fill against the panel (a mark)", "--iron-red against --chart-ink 0.985", ratio(T.ironRed, night), 3],
  ["the dark dress: the same seal's cream rim against the panel (a mark)", "--parchment-bright against --chart-ink 0.985", ratio(T.parchmentBright, night), 3],
  ["the card: a step count, brown, on the card", "--ink-brown on --parchment-panel", ratio(T.inkBrown, T.parchmentPanel), 4.5],
  ["the card: a done count, red, on the card", "--iron-red on --parchment-panel", ratio(T.ironRed, T.parchmentPanel), 4.5],
];
writeFileSync(
  resolve(MEASURE, "contrast.md"),
  `# The chart of lessons' inks against the 4.5:1 floor\n\nComputed from the token values in \`src/styles/shared/shell.css\` at 94ad4392 with the WCAG formula, each wash blended over its ground as the mock declares it (\`mock/dress.ts\`). Not sampled from pixels. A mark that is not text is held to 3:1, the floor for a graphic a reader must see; the house's own floor is for text.\n\n| what | inks | ratio | floor | passes |\n|---|---|---|---|---|\n${rows.map(([w, i, r, f]) => `| ${w} | ${i} | ${r.toFixed(2)}:1 | ${f}:1 | ${r >= f ? "yes" : "NO"} |`).join("\n")}\n\nWritten by \`node out/1256/mock/measure.ts\`.\n`,
);

const quad = (p: { x: number; y: number }, q: { x: number; y: number }, n: number): [number, number][] => {
  const cx = (p.x + q.x) / 2 - 14;
  const cy = (p.y + q.y) / 2 + 12;
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    return [(1 - t) ** 2 * p.x + 2 * (1 - t) * t * cx + t * t * q.x, (1 - t) ** 2 * p.y + 2 * (1 - t) * t * cy + t * t * q.y];
  });
};
const crosses = (a: [number, number], b: [number, number], c: [number, number], d: [number, number]): boolean => {
  const o = (p: [number, number], q: [number, number], r: [number, number]): number => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
  return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b);
};
const seq = ["/", ...primerPage().rooms.map((r) => r.route)];
const legs = seq.slice(1).map((r, i) => ({ from: seq[i]!, to: r, pts: quad(PLACES[seq[i]!]!, PLACES[r]!, 40) }));
const crossings: string[] = [];
for (let i = 0; i < legs.length; i++)
  for (let j = i + 2; j < legs.length; j++) {
    const A = legs[i]!.pts;
    const B = legs[j]!.pts;
    let hit = false;
    for (let a = 0; a < A.length - 1 && !hit; a++) for (let b = 0; b < B.length - 1 && !hit; b++) hit = crosses(A[a]!, A[a + 1]!, B[b]!, B[b + 1]!);
    if (hit) crossings.push(`${legs[i]!.from} to ${legs[i]!.to} crosses ${legs[j]!.from} to ${legs[j]!.to}`);
  }
const length = legs.reduce((n, l) => n + l.pts.slice(1).reduce((k, p, i) => k + Math.hypot(p[0] - l.pts[i]![0], p[1] - l.pts[i]![1]), 0), 0);
writeFileSync(
  resolve(MEASURE, "route.md"),
  `# The Primer's own route (question 3, answer C), measured\n\nThe route runs from home through the rooms in the page's order (\`primerPage\` in \`src/site/primer/page.ts\`): ${seq.join(", ")}. Each leg is drawn as a curve bowed the other way from the chart of the atelier's roads, sampled at 40 points.\n\n- Legs: ${legs.length}; its length in the chart's units: ${Math.round(length)} (the chart is 600 wide).\n- Legs that cross a leg other than their neighbour: ${crossings.length}.\n${crossings.map((c) => `  - ${c}`).join("\n")}\n\nWritten by \`node out/1256/mock/measure.ts\`.\n`,
);

const copyLesson = (ladder: Ladder, n: number): Ladder => {
  const extra = Array.from({ length: Math.max(0, n - ladder.lessons.length) }, (_, i) => {
    const src = ladder.lessons[i % ladder.lessons.length]!;
    return { ...src, id: `${src.id}-copy${i}`, title: `${src.title} (a copy)`, steps: src.steps.map((s) => ({ ...s, id: `${s.id}-copy${i}` })) };
  });
  return { ...ladder, lessons: [...ladder.lessons, ...extra] };
};
const addSteps = (ladder: Ladder, total: number): Ladder => {
  const have = ladder.lessons.reduce((k, l) => k + l.steps.length, 0);
  const last = ladder.lessons[ladder.lessons.length - 1]!;
  const more = Array.from({ length: Math.max(0, total - have) }, (_, i) => ({ ...last.steps[0]!, id: `${last.steps[0]!.id}-more${i}` }));
  return { ...ladder, lessons: [...ladder.lessons.slice(0, -1), { ...last, steps: [...last.steps, ...more] }] };
};
const grown = (route: string, f: (l: Ladder) => Ladder): readonly Ladder[] => LADDERS.map((l) => (l.route === route ? f(l) : l));

const cases: { name: string; grain: "lesson" | "steps"; ladders: readonly Ladder[] }[] = [
  ...[8, 9, 10, 11, 12, 13, 14, 16].map((n) => ({ name: `explorer-${n}-lessons`, grain: "lesson" as const, ladders: grown("/explorer/", (l) => copyLesson(l, n)) })),
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ name: `portfolio-${n}-lessons`, grain: "lesson" as const, ladders: grown("/explorer/portfolio/", (l) => copyLesson(l, n)) })),
  ...[3, 4, 5, 6, 8].map((n) => ({ name: `print-room-${n}-lessons`, grain: "lesson" as const, ladders: grown("/print-room/", (l) => copyLesson(l, n)) })),
  ...[37, 50, 65, 80, 100].map((n) => ({ name: `explorer-${n}-steps`, grain: "steps" as const, ladders: grown("/explorer/", (l) => addSteps(l, n)) })),
  ...[6, 12, 18, 24, 30].map((n) => ({ name: `portfolio-${n}-steps`, grain: "steps" as const, ladders: grown("/explorer/portfolio/", (l) => addSteps(l, n)) })),
];
const growthShots = [
  { url: "/primer/", width: 1024, height: 768, mobile: false, out: resolve(MEASURE, "growth", "prime.png"), script: PRIME(storeScript(RETURNER)), waitMs: 300 },
  ...cases.flatMap((c) =>
    [1024, 1280].map((w) => ({
      url: "/primer/",
      width: w,
      height: w === 1280 ? 800 : 768,
      mobile: false,
      out: resolve(MEASURE, "growth", `HYPOTHETICAL-${c.name}-${w}.png`),
      script: layScript({ seat: "head", svg: drawChart({ ...BASE(RETURNER), grain: c.grain, ladders: c.ladders }).svg }),
      probe: PROBE,
    })),
  ),
];
writeFileSync(resolve(MEASURE, "growth-shots.json"), JSON.stringify(growthShots, null, 1));
writeFileSync(
  resolve(MEASURE, "growth-labels.json"),
  JSON.stringify(
    cases.map((c) => {
      const d = drawChart({ ...BASE(RETURNER), grain: c.grain, ladders: c.ladders });
      return { name: c.name, frame: d.frame, moved: d.labels.filter((l) => l.side !== "above").map((l) => `${l.text}: ${l.side}`), forced: d.labels.filter((l) => l.forced).map((l) => l.text) };
    }),
    null,
    1,
  ),
);

const click = (css: string): string => `(() => { const el = document.querySelector(${JSON.stringify(css)}); if (!el) return "no element"; el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window })); return "clicked"; })()`;
const after = `(() => JSON.stringify({ hash: location.hash, open: (document.querySelector(".primer section.room:not(.folded) h2[id]") || {}).id || null, scrollY: Math.round(scrollY) }))()`;
const head = layScript({ seat: "head", svg: drawChart(BASE(RETURNER)).svg });
const linkShots = [
  { url: "/primer/", width: 1280, height: 800, mobile: false, out: resolve(MEASURE, "links", "prime.png"), script: PRIME(storeScript(RETURNER)), waitMs: 300 },
  { url: "/primer/", width: 1280, height: 800, mobile: false, out: resolve(MEASURE, "links", "svg-room-link-prospect.png"), script: `${head};\n${click('.col-chart .col-place a[href="#prospect"]')}`, scriptWaitMs: 900, probe: after },
  { url: "/primer/", width: 1280, height: 800, mobile: false, out: resolve(MEASURE, "links", "svg-lesson-link-print-room.png"), script: `${head};\n${click('.col-chart a.col-way[href="#print-room-atlas"]')}`, scriptWaitMs: 900, probe: after },
  { url: "/primer/", width: 1280, height: 800, mobile: false, out: resolve(MEASURE, "links", "html-index-link-prospect.png"), script: click('#index a.sec[href="#prospect"]'), scriptWaitMs: 900, probe: after },
];
writeFileSync(resolve(MEASURE, "links-shots.json"), JSON.stringify(linkShots, null, 1));
console.log(`${growthShots.length} growth shots, ${linkShots.length} link shots; contrast.md and route.md written`);
