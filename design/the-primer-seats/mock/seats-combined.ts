// Issue #1248 round, after the sitting: the ruled directions drawn together on the pages they share (rulings 1 with 2 on home; 3 with 4 in the Print Room, the Ribbon and the Gallery; 3 with 5 in the Explorer; and 3 with the ninth nav item in all nine rooms), at 1024 by 768 and 1280 by 800, seed 42, today's look beside each. Writes combined/shots/ and combined/measure/.
// node out/1248/mock/seats-combined.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { script, type Act } from "./drive.ts";
import { ARM_SLIDE, DEPTH_PROBE, DONE_ISLANDS, DOTS_TIGHT, FLOOR_LOWER, NAV_TIGHT, GALLERY_RESERVE, HOME_PROBE, homeJs, NOTE, noteJs, ROOM_PROBE, roomsJs } from "./seats-combined-js.ts";
import { openJs, relayJs } from "./seats-home-js.ts";
import { OUT, SHA } from "./seats-paths.ts";
import { ROOMS, SPACING } from "./seats-shared.ts";

const BOTH = `JSON.stringify({room:JSON.parse(${ROOM_PROBE}),spacing:JSON.parse(${SPACING})})`;
import { probeOf, shoot, type Shot } from "./seats-shoot.ts";

const C = join(OUT, "combined");
const still = (f: string): string => join(C, "shots", f);
const meas = (f: string): string => join(C, "measure", f);
const WINDOWS = [[1024, 768], [1280, 800]] as const;
const shot = (url: string, w: number, h: number, out: string, acts: Act[], probe?: string, clip?: Shot["clip"]): Shot => ({ url, width: w, height: h, mobile: false, out, waitMs: 1000, script: script(acts), scriptWaitMs: 400, ...(probe ? { probe } : {}), ...(clip ? { clip } : {}) });
const ev = (js: string): Act => ({ kind: "eval", js });

// A: home, rulings 1 and 2 together, with the ruled words.
const homeArms = WINDOWS.flatMap(([w, h]) => [
  { key: `A-today-${w}`, w, h, acts: [ev(relayJs)] },
  { key: `A-ruled-${w}`, w, h, acts: [ev(homeJs())] },
  { key: `A-ruled-card-${w}`, w, h, acts: [ev(homeJs() + openJs("primer"))] },
]);
const homeShots = homeArms.flatMap((a) => [
  shot("/", a.w, a.h, still(`${a.key}.png`), a.acts, HOME_PROBE),
  shot("/", a.w, a.h, still(`${a.key}-2x.png`), a.acts, undefined, a.key.includes("card") ? { x: a.w - 420, y: 120, width: 420, height: 560, scale: 2 } : { x: a.w / 2 - 40, y: a.h - 260, width: a.w / 2 + 40, height: 260, scale: 2 }),
]);

// C: the Explorer, the trail press on its own line and the slim step note under it.
const AT = "/explorer/#seed=42&type=archipelago";
const explorerArms = WINDOWS.flatMap(([w, h]) => [
  { key: `C-today-${w}`, w, h, acts: [ev(DONE_ISLANDS + relayJs)] },
  { key: `C-note-alone-${w}`, w, h, acts: [ev(DONE_ISLANDS + noteJs(NOTE.islands))] },
  { key: `C-press-alone-${w}`, w, h, acts: [ev(DONE_ISLANDS + roomsJs(false))] },
  { key: `C-press-and-note-${w}`, w, h, acts: [ev(DONE_ISLANDS + roomsJs(false) + noteJs(NOTE.islands))] },
]);
const explorerShots = explorerArms.flatMap((a) => [
  shot(AT, a.w, a.h, still(`${a.key}.png`), a.acts, ROOM_PROBE),
  ...(a.key.startsWith("C-press-and-note") ? [shot(AT, a.w, a.h, still(`${a.key}-2x.png`), a.acts, undefined, { x: 0, y: 0, width: 720, height: 300, scale: 2 })] : []),
]);
const DEPTHS = [0, 2, 4, 6];
const depthArms = WINDOWS.flatMap(([w, h]) => DEPTHS.map((n) => ({ key: `C-depth-${n}-presses-${w}`, w, h, acts: [ev(roomsJs(false) + noteJs(NOTE.anew) + ARM_SLIDE), ...(n ? [{ kind: "nearer", until: "presses", presses: n } as Act] : []), { kind: "ticks", n: 8 } as Act] })));
const depthShots = depthArms.map((a) => shot("/explorer/#seed=42", a.w, a.h, still(`${a.key}.png`), a.acts, DEPTH_PROBE));

// B and D: every room with a ladder, the ninth item and the trail press on its own line, the Print Room's corner wrapping where it must.
const key = (room: string): string => (room.includes("portfolio") ? "portfolio" : room.split("/")[1]!);
const STILLS_B = new Set(["print-room", "ribbon", "gallery", "writing-room", "seed-of-the-day"]);
type RoomArm = { room: string; w: number; h: number; arm: string; key: string; acts: Act[]; still: boolean };
const roomArms: RoomArm[] = [];
for (const room of ROOMS)
  for (const [w, h] of WINDOWS) {
    const pr0 = room.startsWith("/print-room/");
    const k = key(room);
    roomArms.push({ room, w, h, arm: "today", key: `${k}-today-${w}`, acts: [ev(relayJs)], still: STILLS_B.has(k) });
    roomArms.push({ room, w, h, arm: "ruled", key: `${k}-ruled-${w}`, acts: [ev(roomsJs(pr0))], still: STILLS_B.has(k) });
    roomArms.push({ room, w, h, arm: "ruled, dots tightened", key: `${k}-ruled-dots-${w}`, acts: [ev(roomsJs(pr0, DOTS_TIGHT))], still: ["print-room", "ribbon", "portfolio"].includes(k) && w === 1024 });
    roomArms.push({ room, w, h, arm: "ruled, nav tightened as item 3's B", key: `${k}-ruled-navtight-${w}`, acts: [ev(roomsJs(pr0, NAV_TIGHT))], still: ["print-room", "writing-room", "seed-of-the-day"].includes(k) && w === 1024 });
    if (["print-room", "ribbon", "portfolio"].includes(k)) roomArms.push({ room, w, h, arm: "ruled, floor lowered", key: `${k}-ruled-floor-${w}`, acts: [ev(roomsJs(pr0, FLOOR_LOWER))], still: w === 1024 });
    if (k === "gallery") roomArms.push({ room, w, h, arm: "ruled, its first row reserves the press's line", key: `${k}-ruled-reserve-${w}`, acts: [ev(roomsJs(false, GALLERY_RESERVE))], still: true });
  }
const outOf = (a: RoomArm): string => (a.still ? still(`B-${a.key}.png`) : meas(join("D", `D-${a.key}.png`)));
const roomShots = roomArms.flatMap((a) => [shot(a.room, a.w, a.h, outOf(a), a.acts, BOTH), ...(a.still ? [shot(a.room, a.w, a.h, still(`B-${a.key}-2x.png`), a.acts, undefined, { x: 0, y: 0, width: a.w, height: 300, scale: 2 })] : [])]);

const all = [...homeShots, ...explorerShots, ...depthShots, ...roomShots];
const res = shoot("../combined/measure/combined", all);
const byOut = new Map(res.map((r) => [r.out, r]));
const pr = <T>(out: string): T => { const r = byOut.get(out); if (!r) throw new Error(`no result for ${out}`); return probeOf<T>(r); };

// A's table.
type St = { id: string; underRow: number; underGlass: number; pastEdge: number; overStations: number; overDots: string[]; overMore: number; overSeed: number; overNotice: number; overChrome: number; overCoords: number };
type HP = { rowW: number; rowLines: number; rowToGlass: number; rowOverCoords: number; stations: St[]; rrNearestStation: { id: string; d: number } | null; rrNearestDot: { n: string; d: number } | null; rrToRow: number | null; card: { id: string; inWindow: boolean; overGlass: number; overSeed: number } | null };
const aLines: string[] = [];
const aSummary: string[] = [];
for (const a of homeArms) {
  const p = pr<HP>(still(`${a.key}.png`));
  for (const s of p.stations) aLines.push(`| ${a.key} | ${s.id} | ${s.underRow} | ${s.underGlass} | ${s.pastEdge} | ${s.overStations} | ${s.overDots.join(", ") || "none"} | ${s.overMore} | ${s.overSeed + s.overNotice + s.overChrome + s.overCoords} |`);
  aSummary.push(`| ${a.key} | ${p.rowW} | ${p.rowLines} | ${p.rowToGlass} | ${p.rowOverCoords} | ${p.rrToRow ?? ""} | ${p.rrNearestStation ? `${p.rrNearestStation.d} px, ${p.rrNearestStation.id}` : ""} | ${p.rrNearestDot ? `${p.rrNearestDot.d} px, ${p.rrNearestDot.n}` : ""} | ${p.card ? `${p.card.inWindow ? "in the window" : "OFF"}, ${p.card.overGlass} over the Glass, ${p.card.overSeed} over the seed card` : ""} |`);
}
writeFileSync(meas("A-home.md"), `# A: home with rulings 1 and 2 together\n\nThe slimmer presses, the Gallery moored at 0.76, 0.53 and the Reading Room's label lifted above its mark, all at once, with the ruled words ("Start here / The Primer" on the fifth press, the card's prose as ruled), on the built home page at ${SHA.slice(0, 8)}, reduced motion (\`node out/1248/mock/seats-combined.ts\` from the design tree). Square CSS px. Every result came back with no 4xx and no console error.\n\n## The row and the Reading Room's label\n\n"Reading Room's label to the row" is the row's top less the label's foot. Its nearest neighbours are edge distances.\n\n| arm | row width | row lines | row to the Glass | row over the coordinates line | Reading Room's label to the row | its nearest station | its nearest town mark | card |\n|---|---|---|---|---|---|---|---|---|\n${aSummary.join("\n")}\n\n## Every station\n\nEach station's label and mark under the row, under the Glass's presses, past the window's edge, over another station, over a town's mark or name, over the "scroll on" hint, and over the seed card, the Notice, the head cluster or the coordinates line together.\n\n| arm | station | under the row | under the Glass | past the edge | over another station | over a town | over the hint | over the other furniture |\n|---|---|---|---|---|---|---|---|---|\n${aLines.join("\n")}\n`);

// C's tables.
type RP = { chrome: { b: number; r: number } | null; gapToCorner: number | null; corner: { w: number; h: number; b: number } | null; controlRows: number; cut: string[]; chart: { w: number; h: number; t: number } | null; floored: boolean; overChrome: Record<string, number>; nearestBelow: { name: string; gap: number } | null; navLines: number; scrollW: number };
const cLines = explorerArms.map((a) => {
  const p = pr<RP>(still(`${a.key}.png`));
  return `| ${a.key} | ${p.chart ? `${p.chart.w} by ${p.chart.h}, its top at ${p.chart.t}` : ""} | ${p.chrome?.b} | ${p.floored ? "FLOORED" : "no"} | ${Object.entries(p.overChrome).map(([k, v]) => `${k} ${v}`).join(", ") || "none"} | ${p.nearestBelow ? `${p.nearestBelow.gap} px, ${p.nearestBelow.name}` : ""} |`;
});
type DP = { note: { t: number; b: number; whole: boolean } | null; press: { t: number; b: number; whole: boolean } | null; head: string; region: boolean };
const dLines = depthArms.map((a) => {
  const p = pr<DP>(still(`${a.key}.png`));
  return `| ${a.key} | ${p.head} | ${p.press ? `${p.press.t} to ${p.press.b}, ${p.press.whole ? "whole" : "NOT whole"}` : ""} | ${p.note ? `${p.note.t} to ${p.note.b}, ${p.note.whole ? "whole" : "NOT whole"}` : ""} | ${p.region ? "yes" : "no"} |`;
});
writeFileSync(meas("C-explorer.md"), `# C: the Explorer with rulings 3 and 5 together\n\nThe trail press on a line of its own (ruling 3) and the slim step note under it (ruling 5), the ninth nav item on, on the built Explorer at ${SHA.slice(0, 8)}, reduced motion. The first table is the islands step done (islands at 20), the state item 4 measured, beside today's room, the note alone and the press alone. "Cluster's foot" is the head cluster's lowest px; "over" lists any area a line of the cluster shares with a piece of the room; "nearest below" is the smallest gap from a line of the cluster down to a piece under it. Every result came back with no 4xx and no console error.\n\n| arm | chart drawn | cluster's foot | sheet floored under the chrome | over | nearest below |\n|---|---|---|---|---|---|\n${cLines.join("\n")}\n\n## At depth\n\nThe Glass lesson's "anew" step at /explorer/#seed=42, the head's slide armed by a pointerdown on the Glass as a reader's press arms it, then 0, 2, 4 and 6 presses of Draw nearer: the head cluster's translate, the press's and the note's top and foot in the window.\n\n| arm | head cluster's translate | the press | the note | region drafted |\n|---|---|---|---|---|\n${dLines.join("\n")}\n`);

// B and D's table.
type SP = { press: { edge: number; edgeTo: string; centre: number; centreTo: string; fullMargin: number; fullTo: string } | null };
const roomLines = roomArms.map((a) => {
  const both = pr<{ room: RP; spacing: SP }>(outOf(a));
  const p = both.room;
  const q = both.spacing.press;
  return `| ${a.room.split("#")[0]} | ${a.w} | ${a.arm} | ${p.navLines} | ${p.chrome?.b} | ${p.gapToCorner}${p.gapToCorner !== null && p.gapToCorner < 25.1 ? " UNDER" : ""} | ${p.corner ? `${p.corner.w} by ${p.corner.h}` : ""} | ${p.controlRows} | ${p.cut.join(", ") || "none"} | ${p.chart ? `${p.chart.w} by ${p.chart.h}` : ""} | ${p.floored ? "FLOORED" : "no"} | ${Object.entries(p.overChrome).map(([k, v]) => `${k} ${v}`).join(", ") || "none"} | ${p.nearestBelow ? `${p.nearestBelow.gap} px, ${p.nearestBelow.name}` : ""} | ${p.legendLines} | ${q ? `${q.edge} / ${q.centre} / ${q.fullMargin >= 0 ? "pass" : "FAIL"} (${q.fullMargin} to "${q.fullTo}")` : ""} | ${p.navRight} | ${p.slipBox ? `${p.slipBox.l}, ${p.slipBox.t}` : ""} | ${p.scrollW} |`;
});
writeFileSync(meas("BD-rooms.md"), `# B and D: every room with the ninth nav item and the trail press on its own line\n\nThe nine rooms with a ladder on the built site at ${SHA.slice(0, 8)}, reduced motion, today (eight items, no press) beside the ruled set (the ninth item "Primer" before Q & A, the press "learn this room" on a line of its own under the trail, and in the Print Room the corner wrapping only where it must). "Gap to the corner" is the right-hand corner's left edge less the head cluster's right edge (\`handbook/specs/ui-design.md\`: "at least \`--chrome-x\` apart, less a half pixel", 25.6 px less 0.5). "Cut" lists a corner control whose box is narrower than what it shows, as the room opens. "Over" lists any area a line of the head cluster shares with a piece of the room; "nearest below" is the smallest gap from a line of the cluster down to a piece under it; "floored" is the room's own mark that the sheet runs under the chrome (\`stage-under\`, \`fitStage\` in \`src/site/shared/stage-fit.ts\`). "Press row lines" counts the distinct tops of the room's own roads out and the footnote mark among them, so it compares an arm with today rather than counting lines. "Nav's right end" is where the nav's text ends, and "the slip's top-left" where the room's working panel starts, both in px from the window's top left. "The press's spacing" is the trail press measured as \`measure/2-trail.md\` measures it: its nearest edge / its nearest centre / the full reading of a thumb's 24 px. Two ways to keep the 25.6 px are drawn beside the ruled set: the nav's dots set 0.3em from their words rather than 0.35em, in every room; the kit's corner floor lowered from 19rem to 18.8rem in the three rooms that reach it; and the nav tightened as item 3's B drew it (tracking 0.1em, dots 0.22em), in every room. The Gallery's first row is also drawn reserving the press's line, as it reserves the trail's. "Page width" is the document's laid-out width. Every result came back with no 4xx and no console error.\n\n| room | width | arm | nav lines | cluster's foot | gap to the corner | corner | control rows | cut | chart drawn | floored | over | nearest below | press row lines | the press's spacing | nav's right end | the slip's top-left | page width |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n${roomLines.join("\n")}\n`);
console.log(aSummary.join("\n"));
console.log(cLines.join("\n"));
console.log(dLines.join("\n"));
console.log(roomLines.join("\n"));
