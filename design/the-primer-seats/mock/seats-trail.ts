// Issue #1248 round, item 2: the press that opens a room's own steps in the Primer (ruling 2, "A press on each room's trail line"), seated five ways in all nine rooms with a ladder, at 1024 by 768 and 1280 by 800, the ninth nav item on in every arm since both are ruled. Each press is measured against every other link and control in the head cluster in both readings of the thumb's 24 px (`handbook/specs/ui-design.md`: each trail link clears a thumb's 24 px from the cluster's other links and controls; no check reads it since Issue #1273): circle against circle, centres 24 px apart, as the deleted DR11 read it, and the full reading, each undersized target's 24 px circle clear of the other's box. Writes shots/2-trail/ and measure/2-trail.md.
// node out/1248/mock/seats-trail.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { script } from "./drive.ts";
import { navJs } from "./inject.ts";
import { relayJs, styleJs } from "./seats-home-js.ts";
import { measureFile, SHA, shotDir } from "./seats-paths.ts";
import { PRESS_CSS, pressJs, ROOMS, SPACING, type Seat } from "./seats-shared.ts";
import { probeOf, shoot, type Shot } from "./seats-shoot.ts";

const roomKey = (room: string): string => (room.includes("portfolio") ? "portfolio" : room.split("/")[1]!);
const SEATS: readonly Seat[] = ["control", "a-twin", "b-own-line", "c-room-folio", "d-glyph-after-trail", "e-in-the-chart-panel"];
const STILL_ROOMS = new Set(["/prospect/#seed=42&i=0", "/explorer/#seed=42"]);
const WORDS = ["learn this room", "this room's steps", "a primer for this room", "how this room works"];
const WINDOWS = [[1024, 768], [1280, 800]] as const;

type Arm = { seat: Seat; words: string; room: string; w: number; h: number; still: boolean };
const arms: Arm[] = [];
for (const seat of SEATS) for (const room of ROOMS) for (const [w, h] of WINDOWS) arms.push({ seat, words: WORDS[0]!, room, w, h, still: STILL_ROOMS.has(room) });
for (const words of WORDS.slice(1)) for (const room of ROOMS) for (const [w, h] of WINDOWS) arms.push({ seat: "a-twin", words, room, w, h, still: false });

const jsOf = (a: Arm): string => styleJs("learn1248css", PRESS_CSS) + navJs("ninth", "Primer", false) + pressJs(a.seat, a.words) + relayJs;
const fileOf = (a: Arm): string => `${a.seat}-${roomKey(a.room)}-${a.w}${a.words === WORDS[0] ? "" : `-${a.words.replace(/[^a-z]+/g, "-")}`}`;
const shots: Shot[] = [];
const probed: Arm[] = [];
for (const a of arms) {
  const dir = a.still ? shotDir("2-trail") : join(shotDir("2-trail"), "..", "..", "measure", "2-trail");
  shots.push({ url: a.room, width: a.w, height: a.h, mobile: false, out: join(dir, `${fileOf(a)}.png`), waitMs: 400, script: script([{ kind: "eval", js: jsOf(a) }]), scriptWaitMs: 300, probe: SPACING });
  probed.push(a);
  if (a.still) shots.push({ url: a.room, width: a.w, height: a.h, mobile: false, out: join(dir, `${fileOf(a)}-2x.png`), waitMs: 400, script: script([{ kind: "eval", js: jsOf(a) }]), scriptWaitMs: 300, clip: { x: 0, y: 0, width: Math.min(a.w, 720), height: a.seat === "e-in-the-chart-panel" ? 560 : 220, scale: 2 } });
}
const results = shoot("2-trail", shots).filter((r) => r.probe !== null);
type S = { edge: number | null; edgeTo: string; centre: number; centreTo: string; fullMargin: number; fullTo: string; h: number; w: number } | null;
type P = { press: S; atelier: S; toCorner: number | null; overCorner: boolean; chromeBottom: number; cornerBottom: number; navLines: number };
const ps = results.map((r) => probeOf<P>(r));
const ctrl = new Map<string, P>();
probed.forEach((a, i) => {
  if (a.seat === "control") ctrl.set(`${a.room}|${a.w}`, ps[i]!);
});
const cell = (s: S): string => (s && s.edge !== null ? `${s.edge} to "${s.edgeTo}" / ${s.centre} / ${s.fullMargin >= 0 ? "pass" : "FAIL"} (${s.fullMargin} to "${s.fullTo}")` : "");
const lines = probed.map((a, i) => {
  const p = ps[i]!;
  const c = ctrl.get(`${a.room}|${a.w}`)!;
  return `| ${a.seat} | ${a.words} | ${a.room.split("#")[0]} | ${a.w} | ${cell(p.press)} | ${cell(p.atelier)} | ${p.toCorner ?? (p.overCorner ? "OVER the corner" : "not on the corner's row")} | ${p.chromeBottom - c.chromeBottom} | ${p.cornerBottom - c.cornerBottom} | ${p.navLines} | ${a.still ? `\`shots/2-trail/${fileOf(a)}.png\`` : ""} |`;
});
const fails = probed.filter((a, i) => a.seat !== "control" && ps[i]!.press !== null && (ps[i]!.press!.fullMargin < 0 || (ps[i]!.press!.centre ?? 99) < 24));
writeFileSync(
  measureFile("2-trail.md"),
  `# Item 2: the press on every room's trail line, measured\n\nThe nine rooms with a ladder, each with the ninth nav item ("Primer", before Q & A) and the press seated as each arm says, on the real built rooms at ${SHA.slice(0, 8)}, reduced motion (\`node out/1248/mock/seats-trail.ts\` from the design tree). Each spacing cell reads: the nearest edge distance and to what / the nearest centre distance (the deleted DR11's circle-against-circle reading passes at 24 or more) / the full reading of the thumb's 24 px, pass or FAIL, with its margin and to what (each undersized target's 24 px circle clear of the other's box, and of the other's circle). The press column is the new press; the chart of the atelier press's column says what the new press does to it. "Cluster grows" and "corner grows" are px against the same room and width with no press. Every result came back with no 4xx and no console error.\n\n${fails.length === 0 ? "No arm's press fails either reading." : `${fails.length} arm rows fail a reading: ${fails.map((a) => `${a.seat} ${a.words} ${a.room.split("#")[0]} ${a.w}`).join("; ")}.`}\n\n| seat | words | room | width | the press | the chart of the atelier press | to the corner | cluster grows | corner grows | nav lines | still |\n|---|---|---|---|---|---|---|---|---|---|---|\n${lines.join("\n")}\n`,
);
console.log(lines.join("\n"));
