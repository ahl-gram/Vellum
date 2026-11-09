// Issue #1155 round: the longer link list Alex asked for (ruling 13, "No, a longer list"), every step's Try it on the live site grouped by ladder, each saying what to do and what to look for, with a sitting note where a ruling is at stake, then the links that show what the rulings do together. Written from the ladder data, so it cannot disagree with ladder.md. Writes links.md and links.html (the page opens on its own from the delivery, with the house faces).
// node out/1155/mock/sitting-links.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { seated } from "./ladder/guide.ts";
import { OUT_1155 } from "./paths.ts";

const LIVE = "https://www.vellumworlds.com";
const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];

const NOTES: Readonly<Record<string, string>> = {
  "/explorer/#dice": "The first thing a newcomer does (ruling 16). Does a whole world in a second feel like the moment that makes a child want the next step?",
  "/explorer/#archipelago": "The first step of the Land. The chart renames itself: would a child notice?",
  "/explorer/#islands": "This row is on screen only because the link made the world an archipelago: the step needs nothing done before it.",
  "/explorer/#sizes": "A row that comes only after a count. Is \"has come too\" enough to say where to look?",
  "/explorer/#held": "The step that teaches why a row waits. Read the held box's note: is it plain enough for a child?",
  "/explorer/#sea-level": "The one slider that moves the chart while you drag.",
  "/explorer/#coast": "Nothing moves until you let go. Do the words prepare you for the pause?",
  "/explorer/#looseness": "Its words are provisional (ruling 14 teaches it now); the drift check reds if the review renames it.",
  "/explorer/#anew": "\"Keep pressing until\": the step names no press count, since the count moves with the window.",
  "/explorer/#hold": "Provisional: the hold's glyph and name may change at its review.",
  "/explorer/#loupe": "Provisional, like the hold. Move the pointer over the chart once it is lit.",
  "/explorer/#in-hand": "A tablet step (ruling 15): on a desktop its press is hidden, and the Primer shows the step with its mark.",
  "/explorer/#card": "A card opens on a click; on the keyboard, Tab to a town and press Enter.",
  "/explorer/#dog-ear": "The longest chain in the product, by the issue's own words; this link lands with it already surveyed.",
  "/explorer/#commission": "A commission. Do it, then copy the address: with the pointing hand's key after the question mark, the copied link would carry the hand too (see the rulings below).",
  "/writing-room/#your-word": "The moment a learner sees which words steer and which only make the chart number.",
  "/reading-room/#play": "With motion turned off on your computer, Play goes straight to the last year: the step says so.",
  "/reading-room/#pace": "Shown only with motion on; under reduced motion there is no pace to choose.",
  "/reading-room/#this-road": "Provisional: the journal's road press is awaiting its review.",
  "/print-room/#road-plate": "Once the road is chosen, the first press reads Ribbon: the round's first draft said Chart, and doing the step caught it.",
  "/explorer/portfolio/#bare": "Open it in a private window, or the table you laid earlier comes back: the Chart Table is kept on the device.",
  "/seed-of-the-day/#share": "Share your find appears only once the place is found.",
  "/ribbon/#enter": "The strips ink in one after another; with motion off they are all there at once. The ink-in's pace is provisional.",
  "/prospect/#year": "Laukuwelua was founded in 451: an earlier year shows its ground before the town rose.",
};

const TOGETHER: ReadonlyArray<readonly [string, string, string]> = [
  ["The Print Room at the 1024 floor", `${LIVE}/print-room/#seed=42`, "Open it in a window exactly 1024 wide and look at the style list beside Pull a proof. With a ninth item on the nav the corner narrows from 358 px to 304 px and the list cuts \"antique\": the build owes its widening (ruling 2)."],
  ["The Prospect's trail line", `${LIVE}/prospect/#seed=42&i=0`, "Under the trail: \"also reached from The Reading Room\". The Primer's own trail will carry \"also reached from Questions & Answers\" once it is both a nav item and a child of Q & A, and the trail press must find a seat that clears this line."],
  ["The pointing hand's key, today", `${LIVE}/explorer/?step=explorer-islands#seed=42&type=archipelago`, "Today the key does nothing. Move the islands slider: the key stays in the bar while the room rewrites its address. Then press Take to The Print Room: the key does not follow (measured in all nine rooms). Copy the bar: the key goes with the link."],
  ["Home's How It Works card", `${LIVE}/`, "Press How It Works at the title cartouche. The road to the Primer would sit at the foot of this card, under \"Draw your own: read the README\"."],
  ["The FAQ's nearest step, out of date", `${LIVE}/faq/`, "\"I found a map I love\": its answer says type, climate and land are not saved, and the address saves them all (a sibling defect, filed separately)."],
];

const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const md: string[] = ["# Every step to try, on the live site", "", `Ruling 13 asked for a longer list than five to seven. These are all 81 steps' Try it links on the live site (it deployed \`089881ad\`, the round's own commit), grouped by ladder in the guide's order, each saying what to do and what to look for, with a sitting note where a ruling is at stake. The links after the ladders show what two rulings do together. A step's link carries everything the step needs, so any one can be tried alone.`, ""];
const html: string[] = [];
let n = 0;
for (const s of seated()) {
  for (const { ladder, name, sub } of [{ ladder: s.ladder, name: s.name, sub: false }, ...s.under.map((u) => ({ ladder: u.ladder, name: u.name, sub: true }))]) {
    md.push(`## ${name}${sub ? " (a room of the Explorer)" : ""}`, "");
    html.push(`<h2>${esc(name)}${sub ? ' <span class="of">a room of the Explorer</span>' : ""}</h2>`);
    let k = 0;
    ladder.lessons.forEach((lesson, li) => {
      md.push(`### ${ROMAN[li]} · ${lesson.title}`, "");
      html.push(`<h3>${ROMAN[li]} · ${esc(lesson.title)}</h3><ol start="${k + 1}">`);
      for (const step of lesson.steps) {
        k++;
        n++;
        const key = `${ladder.route}#${step.id}`;
        const act = step.act.replace(/\{([^}]+)\}/g, "**$1**");
        const note = NOTES[key];
        md.push(`${k}. [${act.replace(/\*\*/g, "")}](${LIVE}${step.at})`, `   Look for: ${step.see}${note ? `  \n   Sitting note: ${note}` : ""}`, "");
        html.push(`<li><a href="${esc(LIVE + step.at)}">${esc(step.act).replace(/\{([^}]+)\}/g, "<b>$1</b>")}</a><p class="see">Look for: ${esc(step.see)}</p>${note ? `<p class="note">${esc(note)}</p>` : ""}</li>`);
      }
      html.push("</ol>");
    });
  }
}
md.push("## What two rulings do together", "");
html.push("<h2>What two rulings do together</h2><ol>");
for (const [title, url, look] of TOGETHER) {
  md.push(`- [${title}](${url}): ${look}`);
  html.push(`<li><a href="${esc(url)}">${esc(title)}</a><p class="see">${esc(look)}</p></li>`);
}
html.push("</ol>");
md.push("", `${n} steps, and ${TOGETHER.length} links for the rulings read together.`, "");
writeFileSync(join(OUT_1155, "links.md"), md.join("\n"));
writeFileSync(
  join(OUT_1155, "links.html"),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=1024"><title>Every step to try, on the live site</title><link rel="stylesheet" href="../../design/kit/fonts.css"><style>
body{margin:0 auto;max-width:900px;padding:32px 40px 60px;background:#2b2118;color:#efe6cf;font-family:"EB Garamond",Georgia,serif;font-size:18px;line-height:1.45}
h1,h2,h3{font-family:"IM Fell English SC",Georgia,serif;font-weight:400;letter-spacing:.05em}h1{font-size:32px;margin:0 0 8px}h2{font-size:24px;border-bottom:1px solid #6b5a40;margin:32px 0 8px}h3{font-size:18px;margin:18px 0 4px;color:#e6d9b8}
h2 .of{font-family:"IM Fell English",Georgia,serif;font-style:italic;font-size:16px;letter-spacing:0;color:#cdbd97}
p.intro{font-family:"IM Fell English",Georgia,serif;font-style:italic;font-size:19px}a{color:#fff7e4}li{margin:0 0 10px}
p.see{margin:2px 0 0;font-family:"IM Fell English",Georgia,serif;font-style:italic;color:#e6d9b8}p.note{margin:2px 0 0;color:#f0e3bd;font-size:16px}p.note::before{content:"Sitting note: ";font-variant-caps:small-caps;letter-spacing:.05em}
</style></head><body><h1>Every step to try, on the live site</h1><p class="intro">All ${n} steps' Try it links, grouped by ladder, each with what to look for; then the links that show what two rulings do together. Every link opens the live site, which deployed the round's own commit.</p>${html.join("\n")}</body></html>`,
);
console.log(`${n} steps, ${TOGETHER.length} together links`);
