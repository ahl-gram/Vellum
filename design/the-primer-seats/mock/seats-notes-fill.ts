// Issue #1248 round: fills the notes' tables of lines from `seats-lines-sets.ts` (so the notes and the stills read one list) and sets the menu into them. Run once, after every measurement: node out/1248/mock/seats-notes-fill.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ASIDES, COMMISSIONS, GLOSSES } from "./seats-lines-sets.ts";
import { OUT, TREE } from "./seats-paths.ts";

const file = join(OUT, "notes.md");
const cell = (s: string): string => s.replace(/\|/g, "/");
const lessonRows = GLOSSES.map((g) => `| ${g.room} | ${g.lesson} | ${cell(g.a)}${g.quoted ? " (the room's own words)" : ""} | ${g.b === g.a ? "as (a)" : cell(g.b)} | ${g.c === g.a ? "as (a)" : cell(g.c)} |`).join("\n");
const asideRows = ASIDES.map((r) => `| ${r.room} | ${r.lesson} | ${cell(r.a)} | ${cell(r.b)} |`).join("\n");
const commissionRows = COMMISSIONS.map((c) => `| ${c.room} | ${cell(c.a)} | ${cell(c.b)} | ${cell(c.c)} |`).join("\n");
const menu = readFileSync(join(TREE, "out", "1248", "mock", "seats-menu.md"), "utf8").trim();
const fills: Array<[string, string]> = [
  ["LESSON-ROWS", lessonRows],
  ["ASIDE-ROWS", asideRows],
  ["COMMISSION-ROWS", commissionRows],
  ["MENU-HERE", menu],
  ["WORDS-FIT", "In every group each candidate's box stands as tall as the stand-in's, so none wraps further than the stand-in does (`measure/7-words.md`); the fifth press's verbs leave its width alone (item 1)."],
  ["PENDING-A2", "At 1024 the controls take two lines, Pull a proof under the rest; the corner grows from 109 to 147 px tall and the chart is fitted smaller (499 by 385 to 451 by 348); \"antique\" and \"topographic\" are whole. At 1280 it keeps one line, today's chart (602 by 465) and nearly today's widths. The largest seed is still cut in its box at both widths, as today, and the head cluster still stands 23 px from the corner at 1024."],
  ["PENDING-NAV", "the trimmed twin still passes both readings in all nine rooms, at both widths, with every word; its thinnest margin is 0.6 px (`measure/2-trail-navtight.md`)."],
  ["PRINT-FIX", "A2 at 1024 holds \"topographic\" whole; no arm holds a ten-digit seed whole in its box at 1280."],
];
let text = readFileSync(file, "utf8");
for (const [k, v] of fills) {
  if (!text.includes(k)) throw new Error(`notes.md has no ${k}`);
  text = text.replace(k, v);
}
const renumber: Array<[string, string]> = [
  ["skirts the Gallery's slip. Menu 1.", "skirts the Gallery's slip. Menus 1 and 2."],
  ["way the fifth press stays off the Gallery's slip. Menu 1.", "way the fifth press stays off the Gallery's slip. Menus 1 and 2."],
  ["the press on every room's trail line. Menu 2.", "the press on every room's trail line. Menu 3."],
  ["beside a ninth nav item. Menu 3.", "beside a ninth nav item. Menu 4."],
  ["stands in the Explorer. Menu 4.", "stands in the Explorer. Menu 5."],
  ["on the chart of the atelier. Menu 5.", "on the chart of the atelier. Menu 6."],
  ["the seal in tokens. Menu 6.", "the seal in tokens. Menu 7."],
  ["in its seat. Menus 7 to 20.", "in its seat. Menus 8 to 22."],
  ["Whichever verb menu 15 takes, the seat taken at menu 1 holds.", "Whichever verb menu 17 takes, the seat taken at menu 1 holds."],
  ["Menu 20 asks what becomes of them.", "Menu 22 asks what becomes of them."],
  ["that menus 7 to 20 do not settle", "that menus 8 to 22 do not settle"],
];
for (const [a, b] of renumber) text = text.replace(a, b);
if (/PENDING|-ROWS\n|MENU-HERE|WORDS-FIT|PRINT-FIX/.test(text)) throw new Error("a placeholder is left");
writeFileSync(file, text);
console.log("notes filled");
