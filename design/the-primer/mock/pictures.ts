// Issue #1155 round: the picture beside each step, cut from that step's own still once done (shots/landings), or where the step has no doing of its own, from its arrival (measure/check). Each crop box is the room's chart or slip as the built page laid it out at 1280 by 800 (the boxes were read off the page by a probe, measure/boxes.json). Writes shots/pictures/.
// node out/1155/mock/pictures.ts
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { everyStep } from "./ladder/guide.ts";
import { landingFile } from "./landings.ts";
import { OUT_1155 } from "./paths.ts";

type Box = readonly [number, number, number, number];
export const BOXES: Readonly<Record<string, Box>> = {
  "/explorer/": [13, 145, 703, 543],
  "/reading-room/": [121, 145, 583, 450],
  "/print-room/": [111, 146, 602, 465],
  "/writing-room/": [59, 141, 707, 546],
  "/prospect/": [57, 163, 710, 524],
  "/ribbon/": [51, 183, 723, 504],
  "/explorer/portfolio/": [85, 141, 655, 546],
  "/seed-of-the-day/": [95, 141, 635, 491],
  "/gallery/": [0, 130, 1280, 670],
};
const SLIP: Box = [801, 147, 416, 510];
const RIGHT: Box = [880, 100, 380, 600];
const FOOT: Box = [0, 540, 1280, 260];
const STRIP: Box = [0, 600, 1280, 200];
const CARD: Box = [0, 300, 720, 400];
const GLASS: Box = [430, 540, 420, 260];

const OVERRIDE: Readonly<Record<string, Box>> = {
  "/explorer/#held": SLIP,
  "/explorer/#hold": GLASS,
  "/explorer/#in-hand": GLASS,
  "/explorer/#card": CARD,
  "/explorer/#view-prospect": CARD,
  "/explorer/#take-road": CARD,
  "/explorer/#lay-prospect": CARD,
  "/explorer/#drawer": FOOT,
  "/explorer/#to-portfolio": FOOT,
  "/explorer/#dog-ear": [500, 120, 500, 300],
  "/explorer/#to-print": [300, 680, 560, 120],
  "/explorer/#to-journal": [300, 680, 560, 120],
  "/writing-room/#write": RIGHT,
  "/writing-room/#your-word": RIGHT,
  "/writing-room/#explore-it": [400, 680, 560, 120],
  "/reading-room/#play": STRIP,
  "/reading-room/#ages": STRIP,
  "/reading-room/#pace": STRIP,
  "/reading-room/#journal": RIGHT,
  "/reading-room/#this-road": RIGHT,
  "/print-room/#bind": RIGHT,
  "/print-room/#keep": RIGHT,
  "/print-room/#impression": [300, 600, 620, 200],
  "/print-room/#road-plate": [300, 600, 620, 200],
  "/prospect/#note": RIGHT,
  "/prospect/#lay": RIGHT,
  "/ribbon/#lean": RIGHT,
  "/ribbon/#pill": RIGHT,
  "/explorer/portfolio/#take": FOOT,
  "/explorer/portfolio/#turn-down": [500, 120, 500, 300],
  "/seed-of-the-day/#notes": RIGHT,
  "/seed-of-the-day/#sound": RIGHT,
  "/seed-of-the-day/#share": RIGHT,
  "/seed-of-the-day/#dispatch": RIGHT,
};

const fileOf = (route: string, id: string): string => landingFile(route, id);

export const pictureUrl = (route: string, id: string): string | null => {
  const f = join(OUT_1155, "shots", "pictures", fileOf(route, id));
  return existsSync(f) ? `/round/shots/pictures/${fileOf(route, id)}` : null;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync(join(OUT_1155, "shots", "pictures"), { recursive: true });
  const made: string[] = [];
  for (const { ladder, step } of everyStep()) {
    const key = `${ladder.route}#${step.id}`;
    const landing = join(OUT_1155, "shots", "landings", fileOf(ladder.route, step.id));
    const arrival = join(OUT_1155, "measure", "check", `${ladder.route.replace(/\//g, "_")}${step.id}.png`);
    const from = existsSync(landing) ? landing : arrival;
    const atRoute = step.at.split("#")[0]!;
    const box = OVERRIDE[key] ?? BOXES[atRoute] ?? BOXES[ladder.route]!;
    const out = join(OUT_1155, "shots", "pictures", fileOf(ladder.route, step.id));
    const r = spawnSync("magick", [from, "-crop", `${box[2]}x${box[3]}+${box[0]}+${box[1]}`, "+repage", "-resize", "432x", out], { encoding: "utf8" });
    if (r.status !== 0) throw new Error(`${key}: ${r.stderr}`);
    made.push(`${key}\t${from.includes("landings") ? "done" : "arrival"}\t${box.join(",")}`);
  }
  writeFileSync(join(OUT_1155, "measure", "pictures.tsv"), `step\tfrom\tbox\n${made.join("\n")}\n`);
  console.log(`${made.length} pictures`);
}
