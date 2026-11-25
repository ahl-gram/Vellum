// Issue #1248 round, items 2 and 3 together: the trimmed twin (item 2's A2) measured again under item 3's B, the nav tightened in every room, since tightening the nav moves every nav label over the trail line and so every press's nearest centre. All nine rooms, both widths, every candidate word. Writes measure/2-trail-navtight.md.
// node out/1248/mock/seats-trail-navtight.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { script } from "./drive.ts";
import { navJs } from "./inject.ts";
import { relayJs, styleJs } from "./seats-home-js.ts";
import { measureFile, SHA, shotDir } from "./seats-paths.ts";
import { PRESS_CSS, pressJs, ROOMS, SPACING } from "./seats-shared.ts";
import { probeOf, shoot, type Shot } from "./seats-shoot.ts";

const NAV_TIGHT = "nav.rooms{letter-spacing:.1em}nav.rooms .sep{margin:0 .22em}";
const WORDS = ["learn this room", "this room's steps", "a primer for this room", "how this room works"];
const roomKey = (room: string): string => (room.includes("portfolio") ? "portfolio" : room.split("/")[1]!);
const arms = WORDS.flatMap((words) => ROOMS.flatMap((room) => ([[1024, 768], [1280, 800]] as const).map(([w, h]) => ({ words, room, w, h }))));
const shots: Shot[] = arms.map((a) => ({ url: a.room, width: a.w, height: a.h, mobile: false, out: join(shotDir("2-trail"), "..", "..", "measure", "2-trail", `navtight-a2-${roomKey(a.room)}-${a.w}-${a.words.replace(/[^a-z]+/g, "-")}.png`), waitMs: 400, script: script([{ kind: "eval", js: styleJs("learn1248css", PRESS_CSS + NAV_TIGHT) + navJs("ninth", "Primer", false) + pressJs("a2-twin-trimmed", a.words) + relayJs }]), scriptWaitMs: 300, probe: SPACING }));
type S = { edge: number; edgeTo: string; centre: number; centreTo: string; fullMargin: number; fullTo: string; h: number };
const ps = shoot("2-trail-navtight", shots).map((r) => probeOf<{ press: S }>(r).press);
const lines = arms.map((a, i) => { const p = ps[i]!; return `| ${a.words} | ${a.room.split("#")[0]} | ${a.w} | ${p.edge} to "${p.edgeTo}" | ${p.centre} to "${p.centreTo}" | ${p.fullMargin >= 0 ? "pass" : "FAIL"} (${p.fullMargin} to "${p.fullTo}") |`; });
const fails = arms.filter((_, i) => ps[i]!.fullMargin < 0 || ps[i]!.centre < 24);
writeFileSync(measureFile("2-trail-navtight.md"), `# Items 2 and 3 together: the trimmed twin under the tightened nav\n\nItem 2's A2 with item 3's B (the nav's tracking 0.1em, its dots' margins 0.22em) in every room, the ninth item on, on the built rooms at ${SHA.slice(0, 8)}, reduced motion (\`node out/1248/mock/seats-trail-navtight.ts\`). Columns as \`measure/2-trail-trim.md\`. ${fails.length === 0 ? `No row fails either reading; the smallest margin in the full reading is ${Math.min(...ps.map((p) => p!.fullMargin))} px.` : `${fails.length} rows fail: ${fails.map((a) => `${a.words} ${a.room.split("#")[0]} ${a.w}`).join("; ")}.`} Every result came back with no 4xx and no console error.\n\n| words | room | width | nearest edge | nearest centre | full reading |\n|---|---|---|---|---|---|\n${lines.join("\n")}\n`);
console.log(fails.length, Math.min(...ps.map((p) => p!.fullMargin)));
