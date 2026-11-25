// Issue #1256 round: the measured tables, read back from the shooter's results: `measure/stills.md` (each still's probe), `measure/growth.md` (the HYPOTHETICAL grown ladders) and `measure/links.md` (what a press on the chart does to the page's own click handler). A result whose page answered 4xx or logged an error is named, never dropped.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { OUT } from "./paths.ts";
import { STILLS } from "./spec.ts";
import { cropOut, fullOut } from "./shots.ts";

const MEASURE = resolve(OUT, "measure");
interface Result {
  readonly out: string;
  readonly probe: string | null;
  readonly http4xx: readonly string[];
  readonly consoleErrors: readonly string[];
  readonly viewport: { readonly innerWidth: number };
}
const read = (name: string): Result[] => JSON.parse(readFileSync(resolve(MEASURE, name), "utf8")) as Result[];
const stills = read("stills-results.json");
const crops = read("crops-results.json");
const byOut = new Map([...stills, ...crops].map((r) => [r.out, r]));
const n1 = (v: unknown): string => (typeof v === "number" ? (Math.round(v * 10) / 10).toString() : "none");

const rows = STILLS.map((s) => {
  const r = byOut.get(fullOut(s));
  if (r === undefined) throw new Error(`no result for ${s.file}`);
  const p = r.probe === null ? null : JSON.parse(r.probe);
  const c = cropOut(s);
  const cr = c === null ? undefined : byOut.get(c);
  const bad = [...r.http4xx, ...r.consoleErrors, ...(cr?.http4xx ?? []), ...(cr?.consoleErrors ?? [])];
  const chart = p?.chart === null || p === null ? "none" : `${Math.round(p.chart.w)} by ${Math.round(p.chart.h)}`;
  const step = s.hypothetical ? `${p?.shownStepTop ?? "?"} (its one step, ending at ${p?.shownStepBottom ?? "?"})` : `${p?.firstStepTop ?? "?"}`;
  return `| ${s.file} | ${s.width} | ${p?.scrollWidth ?? "?"} | ${p?.sealed ?? "?"} | ${p?.openRoom ?? "?"} | ${step} | ${chart} | ${n1(p?.labelPx)} | ${n1(p?.numeralPx)} | ${n1(p?.wayGapPx)} | ${n1(p?.placeClearPx)} | ${(p?.overlaps ?? []).length} | ${p?.cardCovers === undefined ? "no card" : p.cardCovers.length} | ${bad.length === 0 ? "none" : bad.join("; ")} |`;
});
writeFileSync(
  resolve(MEASURE, "stills.md"),
  `# Every still, as the probe measured it\n\nRead from \`measure/stills-results.json\` and \`measure/crops-results.json\`, taken by \`scripts/design/shoot.ts\` at a true layout viewport (1280 by 800, or 1024 by 768) over the tree's built site at 94ad4392. A crop's row is its full shot's; the crop itself was shot again at twice the size from the same page.\n\n- **page width**: \`document.documentElement.scrollWidth\`; equal to the window means nothing runs off sideways.\n- **seals**: the page's own \`li.step.sealed\` count, which says the shot read the seals it was given; **opens on**: the room the page opened (\`roomOnArrival\`).\n- **first step's top**: where the open room's first step starts on the page, in px from the page's top; today it is 485 at 1280 and 539 at 1024, and a window is 800 or 768 tall.\n- **name px / numeral px**: the smallest place name and a lesson's numeral, in screen px; **waypoint gap**: the least paper between two waypoints; **places' clearance**: the least paper between two different places' marks (pips, waypoints, rings).\n- **collisions**: names against names, waypoints, pips and rings, and waypoints against waypoints, by their boxes (a waypoint as a circle); **card covers**: how many names, waypoints and pips a card lies over.\n\n| still | width | page width | seals | opens on | first step's top | chart (px) | name px | numeral px | waypoint gap | places' clearance | collisions | card covers | 4xx or errors |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n${rows.join("\n")}\n\nWritten by \`node out/1256/mock/tables.ts\`.\n`,
);

const growth = read("growth-results.json").filter((r) => r.probe !== null);
const labels = JSON.parse(readFileSync(resolve(MEASURE, "growth-labels.json"), "utf8")) as { name: string; moved: string[]; forced: string[] }[];
const grows = growth.map((r) => {
  const p = JSON.parse(r.probe!);
  const file = r.out.split("/").pop()!;
  const name = file.replace("HYPOTHETICAL-", "").replace(/-(1024|1280)\.png$/, "");
  const l = labels.find((x) => x.name === name)!;
  return `| ${name} | ${r.viewport.innerWidth} | ${p.overlaps.length} | ${n1(p.placeClearPx)} (${p.placeClearPair}) | ${l.moved.join("; ") || "none"} | ${l.forced.join("; ") || "none"} | ${[...r.http4xx, ...r.consoleErrors].length} |`;
});
writeFileSync(
  resolve(MEASURE, "growth.md"),
  `# How each layout grows (HYPOTHETICAL ladders)\n\nNo room has these lessons. Each case copies a real lesson (or a real step) of the room until it has the count named, draws the chart at the head of the sheet at the returner's seals, and measures it in the browser as the stills are measured. The captures are \`measure/growth/HYPOTHETICAL-*.png\` and are not stills.\n\n- **collisions**: as in \`measure/stills.md\`.\n- **places' clearance**: the least paper, in screen px, between two different places' marks, and which two.\n- **names moved**: a name that no longer stands above its place, and the side it took (\`placeLabels\` in \`mock/labels.ts\`); **names forced**: a name that found no free side and was set above anyway.\n\n| case | window | collisions | places' clearance (px) | names moved | names forced | 4xx or errors |\n|---|---|---|---|---|---|---|\n${grows.join("\n")}\n\nWritten by \`node out/1256/mock/tables.ts\`, from \`node out/1256/mock/measure.ts\` and \`measure/growth-shots.json\`.\n`,
);

const runs = ["links-results.json", "links-results-run1.json", "links-results-run2.json", "links-results-run3.json"];
const links = runs.flatMap((f) => read(f).filter((r) => r.probe !== null).map((r) => ({ ...r, run: f })));
writeFileSync(
  resolve(MEASURE, "links.md"),
  `# A press on the chart, and the page's own click handler\n\nEach row lays the chart at the head of the sheet (answer A of question 1) at the returner's seals, clicks one link with a real bubbling click event, waits 900 ms, and reads where the page went. The last row is today's index slip link, the control.The same four shots were taken four times (\`measure/links-shots.json\`, results in \`measure/links-results*.json\`).\n\n| run | click | went to | room open after | scrolled to | errors the page logged |\n|---|---|---|---|---|---|\n${links
    .map((r) => {
      const p = JSON.parse(r.probe!);
      return `| ${r.run.replace("links-results", "").replace(".json", "") || "first"} | ${r.out.split("/").pop()!.replace(".png", "")} | ${p.hash} | ${p.open} | ${p.scrollY} | ${r.consoleErrors.length === 0 ? "none" : r.consoleErrors.map((e) => e.split("\n")[0]).join("; ")} |`;
    })
    .join("\n")}\n\nWhat it shows: the page's click handler (\`bindPrimer\` in \`src/site/primer/bind.ts\`) reads \`link.hash\`, which an SVG link does not have, so every press on the chart throws before the handler opens the room. The room still opens, on the hash change. A room's own head is never folded away, so a press on a room lands on it every time; a press on a lesson in a folded room depends on whether the browser looks for the lesson before or after the room is unfolded, and in these runs it sometimes stayed at the top of the page. Sub 11 owes the handler a read of the link's \`href\` attribute, which serves both kinds of link, or HTML links laid over the drawing.\n\nWritten by \`node out/1256/mock/tables.ts\`.\n`,
);
console.log("stills.md, growth.md and links.md written");
