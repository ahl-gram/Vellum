// Issue #1248 round, item 2, a second pass: the chart of the atelier press's twin with its manicule's line box held to the line's own (so the press stands as tall as the press beside it, 11 px under the nav rather than 9), in all nine rooms with every candidate word; and the Gallery's first row of plates against the head cluster under each seat, since a press on a line of its own makes the cluster taller there. Writes measure/2-trail-trim.md.
// node out/1248/mock/seats-trail-trim.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { script } from "./drive.ts";
import { navJs } from "./inject.ts";
import { relayJs, styleJs } from "./seats-home-js.ts";
import { measureFile, SHA, shotDir } from "./seats-paths.ts";
import { PRESS_CSS, pressJs, ROOMS, SPACING, type Seat } from "./seats-shared.ts";
import { probeOf, shoot, type Shot } from "./seats-shoot.ts";

const WORDS = ["learn this room", "this room's steps", "a primer for this room", "how this room works"];
const WINDOWS = [[1024, 768], [1280, 800]] as const;
const js = (seat: Seat, words: string): string => styleJs("learn1248css", PRESS_CSS) + navJs("ninth", "Primer", false) + pressJs(seat, words) + relayJs;
const roomKey = (room: string): string => (room.includes("portfolio") ? "portfolio" : room.split("/")[1]!);
type Arm = { seat: Seat; words: string; room: string; w: number; h: number; still: boolean };
const arms: Arm[] = [];
for (const words of WORDS) for (const room of ROOMS) for (const [w, h] of WINDOWS) arms.push({ seat: "a2-twin-trimmed", words, room, w, h, still: words === WORDS[0] && (room.startsWith("/prospect/") || room.startsWith("/explorer/#")) });
const GAP = `JSON.stringify((()=>{const c=document.querySelector("header.chrome").getBoundingClientRect();const f=document.querySelector("main figure, .gl-grid figure, .plates figure, main a img");const r=f?f.getBoundingClientRect():null;return{cluster:Math.round(c.bottom),firstRow:r?Math.round(r.top):null,gap:r?Math.round(r.top-c.bottom):null};})())`;
const gapSeats: Seat[] = ["control", "a-twin", "a2-twin-trimmed", "b-own-line", "c-room-folio", "d-glyph-after-trail"];
const shots: Shot[] = arms.map((a) => ({ url: a.room, width: a.w, height: a.h, mobile: false, out: join(a.still ? shotDir("2-trail") : join(shotDir("2-trail"), "..", "..", "measure", "2-trail"), `${a.seat}-${roomKey(a.room)}-${a.w}${a.words === WORDS[0] ? "" : `-${a.words.replace(/[^a-z]+/g, "-")}`}.png`), waitMs: 400, script: script([{ kind: "eval", js: js(a.seat, a.words) }]), scriptWaitMs: 300, probe: SPACING }));
const crops: Shot[] = arms.filter((a) => a.still).map((a) => ({ url: a.room, width: a.w, height: a.h, mobile: false, out: join(shotDir("2-trail"), `${a.seat}-${roomKey(a.room)}-${a.w}-2x.png`), waitMs: 400, script: script([{ kind: "eval", js: js(a.seat, a.words) }]), scriptWaitMs: 300, clip: { x: 0, y: 0, width: 720, height: 220, scale: 2 } }));
const gaps: Shot[] = gapSeats.flatMap((seat) => WINDOWS.map(([w, h]) => ({ url: "/gallery/", width: w, height: h, mobile: false as const, out: join(shotDir("2-trail"), "..", "..", "measure", "2-trail", `gallery-gap-${seat}-${w}.png`), waitMs: 400, script: script([{ kind: "eval", js: js(seat, WORDS[0]!) }]), scriptWaitMs: 300, probe: GAP })));
const res = shoot("2-trail-trim", [...shots, ...gaps, ...crops]);
type S = { edge: number | null; edgeTo: string; centre: number; centreTo: string; fullMargin: number; fullTo: string; h: number } | null;
const spacing = res.slice(0, shots.length).map((r) => probeOf<{ press: S; toCorner: number | null }>(r));
const gapRes = res.slice(shots.length, shots.length + gaps.length).map((r) => probeOf<{ cluster: number; firstRow: number | null; gap: number | null }>(r));
const lines = arms.map((a, i) => {
  const p = spacing[i]!.press!;
  return `| ${a.words} | ${a.room.split("#")[0]} | ${a.w} | ${p.h} | ${p.edge} to "${p.edgeTo}" | ${p.centre} to "${p.centreTo}" | ${p.fullMargin >= 0 ? "pass" : "FAIL"} (${p.fullMargin} to "${p.fullTo}") | ${spacing[i]!.toCorner ?? ""} |`;
});
const gapLines = gapSeats.flatMap((seat, s) => WINDOWS.map(([w], k) => { const g = gapRes[s * 2 + k]!; return `| ${seat} | ${w} | ${g.cluster} | ${g.firstRow} | ${g.gap} |`; }));
const fails = arms.filter((_, i) => spacing[i]!.press!.fullMargin < 0 || spacing[i]!.press!.centre < 24);
const worst = Math.min(...spacing.map((s) => s.press!.fullMargin));
writeFileSync(measureFile("2-trail-trim.md"), `# Item 2, a second pass: the twin trimmed, and the Gallery's first row\n\nThe real built rooms at ${SHA.slice(0, 8)}, reduced motion, the ninth nav item on (\`node out/1248/mock/seats-trail-trim.ts\` from the design tree). Every result came back with no 4xx and no console error.\n\n## The twin with its manicule's line box held to the line's\n\nThe chart of the atelier press's twin, as \`measure/2-trail.md\`'s a-twin, with its manicule set at no line height of its own, so the press stands as tall as the line. Columns as there: the press's height, its nearest edge, its nearest centre (24 or more passes the circle-against-circle reading), and the full reading with its margin. ${fails.length === 0 ? `No row fails either reading; the smallest margin in the full reading is ${worst} px.` : `${fails.length} rows fail: ${fails.map((a) => `${a.words} ${a.room.split("#")[0]} ${a.w}`).join("; ")}.`}\n\n| words | room | width | height | nearest edge | nearest centre | full reading | to the corner |\n|---|---|---|---|---|---|---|---|\n${lines.join("\n")}\n\n## The Gallery's first row of plates under each seat\n\nThe head cluster's foot and the first plate's top, in px from the window's top, on the built Gallery.\n\n| seat | width | cluster's foot | first plate's top | gap |\n|---|---|---|---|---|\n${gapLines.join("\n")}\n`);
console.log(lines.join("\n"));
console.log(gapLines.join("\n"));
