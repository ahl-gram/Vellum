// Issue #1248 round, item 1: the Primer's station on home, its pip at Poalo and its fifth legend press, drawn over the real built home page at 1024 by 768 and 1280 by 800, today's look beside it, each direction measured for what the row covers. Writes shots/1-home/ and measure/1-home.md.
// node out/1248/mock/seats-home.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { script } from "./drive.ts";
import { cardJs, fifthPressJs, moveGalleryJs, openJs, pipJs, PROBE, relayJs, rowClearOfGalleryJs, STAND_IN, styleJs, type Words } from "./seats-home-js.ts";
import { measureFile, SHA, shotDir } from "./seats-paths.ts";
import { NARROW_CSS } from "./seats-shared.ts";
import { probeOf, shoot, type Shot } from "./seats-shoot.ts";

const GALLERY_ABOVE_CSS = '.lf-station[data-station="gallery"] .lf-station-slip{top:auto;bottom:calc(50% + 13px)}';
const READING_ABOVE_CSS = '.lf-station[data-station="reading-room"] .lf-station-slip{top:auto;bottom:calc(50% + 13px)}';
export const GALLERY_MOVED = { nx: Number(process.env["GALLERY_NX"] ?? "0.76"), ny: Number(process.env["GALLERY_NY"] ?? "0.53") };

type Arm = { readonly key: string; readonly caption: string; readonly js: string; readonly still: boolean };
const station = (w: Words = STAND_IN): string => pipJs(w) + fifthPressJs(w) + cardJs(w);
const arms: Arm[] = [
  { key: "control", caption: "Today: four stations, four presses", js: "", still: true },
  { key: "a-as-first-drawn", caption: "A, as the Issue #1155 round drew it: the pip at Poalo and a fifth press, every press as today", js: station(), still: true },
  { key: "b-narrow-presses", caption: "B, narrower presses: every press's side padding, the row's gap and its own sides tightened", js: station() + styleJs("seats1248", NARROW_CSS), still: true },
  { key: "c-gallery-slip-above", caption: "C, the Gallery's slip set above its mark", js: station() + styleJs("seats1248", GALLERY_ABOVE_CSS), still: true },
  { key: "d-gallery-moored-anew", caption: `D, the Gallery moored anew in open water (${GALLERY_MOVED.nx}, ${GALLERY_MOVED.ny})`, js: station() + moveGalleryJs(GALLERY_MOVED.nx, GALLERY_MOVED.ny), still: true },
  { key: "b-and-d-together", caption: `B and D together: the narrower presses, and the Gallery moored anew (${GALLERY_MOVED.nx}, ${GALLERY_MOVED.ny})`, js: station() + styleJs("seats1248", NARROW_CSS) + moveGalleryJs(GALLERY_MOVED.nx, GALLERY_MOVED.ny), still: true },
  { key: "e-row-left-of-centre", caption: "E, the row seated left of centre, its right end a gap clear of the Gallery's slip", js: station() + relayJs + rowClearOfGalleryJs(12), still: true },
  { key: "f-b-and-reading-room-above", caption: "Beside B, not folded in: the Reading Room's slip set above its mark", js: station() + styleJs("seats1248", NARROW_CSS + READING_ABOVE_CSS), still: true },
  { key: "g-b-primer-card", caption: "B with the Primer's card open, flown to Poalo by the page's own press", js: station() + styleJs("seats1248", NARROW_CSS) + relayJs + openJs("primer"), still: true },
  { key: "h-b-how-card", caption: "B with How It Works's card open, unchanged, the Primer's pip on the chart", js: station() + styleJs("seats1248", NARROW_CSS) + relayJs + openJs("how"), still: true },
  { key: "control-how-card", caption: "Today: How It Works's card open", js: relayJs + openJs("how"), still: true },
];
const VERBS = ["Learn one", "Learn how", "Start here", "Learn the rooms", "Learn to make one"];
for (const verb of VERBS) {
  const w = { ...STAND_IN, verb };
  arms.push({ key: `verb-a-${verb.replace(/ /g, "-").toLowerCase()}`, caption: `A with the verb "${verb}"`, js: station(w), still: false });
  arms.push({ key: `verb-b-${verb.replace(/ /g, "-").toLowerCase()}`, caption: `B with the verb "${verb}"`, js: station(w) + styleJs("seats1248", NARROW_CSS), still: false });
}
const WINDOWS = [[1024, 768], [1280, 800]] as const;

const shots: Shot[] = [];
const rows: Array<{ arm: Arm; w: number }> = [];
for (const arm of arms)
  for (const [w, h] of WINDOWS) {
    const out = join(arm.still ? shotDir("1-home") : join(shotDir("1-home"), "..", "..", "measure", "1-home-verbs"), `${arm.key}-${w}.png`);
    shots.push({ url: "/", width: w, height: h, mobile: false, out, waitMs: 1200, script: script([{ kind: "eval", js: arm.js + relayJs }]), scriptWaitMs: 300, probe: PROBE });
    rows.push({ arm, w });
    if (arm.still) {
      const crop = arm.key.includes("card") ? { x: w - 420, y: 120, width: 420, height: 560 } : { x: w / 2 - 20, y: h - 200, width: w / 2 + 20, height: 200 };
      shots.push({ url: "/", width: w, height: h, mobile: false, out: join(shotDir("1-home"), `${arm.key}-${w}-2x.png`), waitMs: 1200, script: script([{ kind: "eval", js: arm.js + relayJs }]), scriptWaitMs: 300, clip: { ...crop, scale: 2 } });
    }
  }

const results = shoot("1-home", shots);
type P = { rowW: number; rowLines: number; rowToGlass: number; rowOver: Record<string, number>; pressOver: Record<string, Record<string, number>>; rowOverCoords: number; gallerySlipOverGlass: number; galleryOffWindow: number; galleryOverRow: number; galleryNearest: number; pip: { inWindow: boolean; nearest: number; slipOverOthers: number; overGlass: number; overSeed: number; overRow: number } | null; card: { id: string; inWindow: boolean; overGlass: number; overSeed: number } | null };
const probed = results.filter((r) => r.probe !== null).map((r) => probeOf<P>(r));
if (probed.length !== rows.length) throw new Error(`${rows.length} rows against ${probed.length} probes`);
const others = (o: Record<string, number>, skip: string[]): string => Object.entries(o).filter(([k, v]) => v > 0 && !skip.includes(k)).map(([k, v]) => `${k} ${v}`).join(", ") || "none";
const line = ({ arm, w }: { arm: Arm; w: number }, p: P): string =>
  `| ${arm.key} | ${w} | ${p.rowLines} | ${p.rowW} | ${p.rowToGlass} | ${others(p.rowOver, [])} | ${p.pressOver["primer"] ? others(p.pressOver["primer"], []) : "no fifth press"} | ${p.rowOverCoords} | ${p.galleryOverRow} | ${p.gallerySlipOverGlass} | ${p.galleryOffWindow} | ${p.pip ? `${p.pip.inWindow ? "yes" : "NO"}, ${p.pip.nearest} px, ${p.pip.slipOverOthers + p.pip.overGlass + p.pip.overSeed + p.pip.overRow}` : ""} | ${p.card ? `${p.card.id}, ${p.card.inWindow ? "in the window" : "OFF the window"}, ${p.card.overGlass} over the Glass, ${p.card.overSeed} over the seed card` : ""} | ${arm.still ? `\`shots/1-home/${arm.key}-${w}.png\`` : ""} |`;
const body = rows.map((row, i) => line(row, probed[i]!));
writeFileSync(
  measureFile("1-home.md"),
  `# Item 1: the Primer's station on home, measured\n\nThe real built home page at ${SHA.slice(0, 8)}, reduced motion, through the shared camera (\`node out/1248/mock/seats-home.ts\` from the design tree). Areas are square CSS px. "Row over" is the legend row's whole box, its footing included, against each station's slip and mark; "fifth press over" is the Primer's press box alone. The Gallery columns read its slip and mark against the row, the Glass's visible presses, and the window's edge. The pip columns: whole in the window, edge distance from its mark to the nearest other station's mark, and any area it shares with another station, the Glass, the seed card or the row. Every result came back with no 4xx and no console error.\n\n| arm | width | row lines | row width | row to the Glass | row over (station: area) | fifth press over | row over the coordinates line | Gallery under the row | Gallery under the Glass | Gallery past the window's edge | pip: in window, nearest, shared area | card | still |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n${body.join("\n")}\n`,
);
console.log(body.join("\n"));
