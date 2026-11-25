// Issue #1256 round: one contact sheet per question, today's Primer or the first round's stand-in first as the control, then each answer captioned, written to the main checkout's `out/1256/sheets/` with the shot list that photographs them (served from the main checkout's root, so the house faces come from `design/kit/fonts.css`).
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { OUT } from "./paths.ts";
import { Q, STILLS } from "./spec.ts";
import { cropOut, fullOut } from "./shots.ts";

const SHEETS = resolve(OUT, "sheets");
const WEB = (abs: string): string => abs.replace(resolve(OUT, "..", ".."), "");
const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const X = resolve(OUT, Q.x, "stills");

interface Cell {
  readonly src: string;
  readonly caption: string;
}
interface Row {
  readonly head: string;
  readonly cells: readonly Cell[];
}

const fileOf = (folder: string, file: string): string => resolve(OUT, folder, "stills", file);
const still = (file: string): Cell => {
  const s = STILLS.find((x) => x.file === file);
  if (s === undefined) throw new Error(`no still ${file}`);
  return { src: fullOut(s).includes("/measure/") ? cropOut(s)! : fullOut(s), caption: `${s.caption}${s.hypothetical ? " (HYPOTHETICAL)" : ""} <code>${file}</code>` };
};
const crop = (file: string): Cell => {
  const s = STILLS.find((x) => x.file === file);
  if (s === undefined) throw new Error(`no still ${file}`);
  const c = cropOut(s)!;
  return { src: c, caption: `${s.caption}, at twice the size <code>${c.split("/").pop()}</code>` };
};
const ctrl = (file: string, caption: string): Cell => ({ src: resolve(X, file), caption: `${caption} <code>${file}</code>` });
const TODAY_1280 = ctrl("x-today-returner-1280.png", "Today, the control: the Primer as it ships, at the same seals");
const TODAY_1024 = ctrl("x-today-returner-1024.png", "Today at 1024");
const STAND_IN = ctrl("x-stand-in-e-chart.png", "The first round's stand-in (Issue #1155), which this round replaces");

const SHEET_LIST: readonly { readonly name: string; readonly title: string; readonly rows: readonly Row[] }[] = [
  {
    name: "sheet-q1-where-the-chart-stands",
    title: "Question 1: where the chart stands on the Primer",
    rows: [
      { head: "At 1280 by 800, the first screen", cells: [TODAY_1280, still("q1-a-at-the-head-of-the-page-1280.png"), still("q1-b-in-the-index-slip-1280.png"), still("q1-c-behind-a-press-1280.png"), still("q1-d-at-the-head-with-a-card-1280.png")] },
      { head: "At 1024 by 768, the first screen", cells: [TODAY_1024, still("q1-a-at-the-head-of-the-page-1024.png"), still("q1-b-in-the-index-slip-1024.png"), still("q1-c-behind-a-press-1024.png"), still("q1-d-at-the-head-with-a-card-1024.png")] },
      { head: "Close up, and the other moments", cells: [still("q1-a-at-the-head-of-the-page-1280-2x.png"), still("q1-b-in-the-index-slip-1280-2x.png"), still("q1-c-behind-a-press-shut-1280.png"), still("q1-a-at-the-head-of-the-page-first-visit-1280.png")] },
      { head: "On a page of one step at a time (Issue #1392, not ruled: drawn only to show how each seat would read there)", cells: [still("q1-a-at-the-head-of-the-page-one-step-1280.png"), still("q1-b-in-the-index-slip-one-step-1280.png")] },
    ],
  },
  {
    name: "sheet-q2-what-stands-for-a-lesson",
    title: "Question 2: what stands for a lesson",
    rows: [
      { head: "At 1280", cells: [STAND_IN, crop("q2-a-a-waypoint-for-each-lesson-1280.png"), crop("q2-b-a-ring-of-steps-round-each-room-1280.png")] },
      { head: "At 1024", cells: [crop("q2-a-a-waypoint-for-each-lesson-1024.png"), crop("q2-b-a-ring-of-steps-round-each-room-1024.png")] },
    ],
  },
  {
    name: "sheet-q3-what-the-seals-ink",
    title: "Question 3: what the seals ink",
    rows: [
      { head: "At 1280", cells: [STAND_IN, crop("q3-a-the-roads-you-have-taken-1280.png"), crop("q3-b-the-lessons-alone-1280.png"), crop("q3-c-the-primers-own-route-1280.png")] },
      { head: "At 1024", cells: [crop("q3-a-the-roads-you-have-taken-1024.png"), crop("q3-b-the-lessons-alone-1024.png"), crop("q3-c-the-primers-own-route-1024.png")] },
    ],
  },
  {
    name: "sheet-q4-to-q7-the-smaller-questions",
    title: "Questions 4 to 7: the tablet step, where you are, the other places and their names, the words",
    rows: [
      { head: "4. A lesson with a step this device cannot take (the Glass, v), at 1280 and 1024", cells: [crop("q4-a-done-when-what-can-be-done-here-is-done-1280.png"), crop("q4-b-done-only-when-every-step-is-1280.png"), crop("q4-a-done-when-what-can-be-done-here-is-done-1024.png"), crop("q4-b-done-only-when-every-step-is-1024.png"), still("q4-a-the-card-1280.png")] },
      { head: "5. How the chart marks your place, at 1280 and 1024", cells: [ctrl("x-today-head-chart-open-1280.png", "Today: the chart of the atelier, opened from the head, already says 'you are here' on the Primer's isle"), crop("q5-a-the-room-lit-and-the-hand-1280.png"), crop("q5-b-you-are-here-1280.png"), crop("q5-a-the-room-lit-and-the-hand-1024.png"), crop("q5-b-you-are-here-1024.png")] },
      { head: "6. The other places, and whose names", cells: [crop("q6-a-every-place-in-the-rooms-own-names-1280.png"), crop("q6-b-every-place-in-the-head-charts-names-1280.png"), crop("q6-c-only-the-rooms-with-lessons-1280.png")] },
      { head: "7. The words (my stand-ins), at 1280 and 1024", cells: [still("q7-the-words-under-the-chart-1280.png"), still("q7-the-words-on-the-card-1280.png"), still("q7-the-words-under-the-chart-1024.png"), still("q7-the-words-on-the-card-1024.png")] },
    ],
  },
];

const CSS = `
body{margin:0;padding:28px 32px 40px;background:#2b2118;color:#efe6cf;font-family:'EB Garamond',serif}
h1{font-family:'IM Fell English SC',serif;font-weight:400;letter-spacing:.06em;font-size:30px;margin:0 0 4px}
.sub{font-family:'IM Fell English',serif;font-style:italic;margin:0 0 18px;color:#e6d9b8}
h2{font-family:'IM Fell English SC',serif;font-weight:400;letter-spacing:.05em;font-size:20px;margin:22px 0 8px;border-bottom:1px solid #6b5a40;padding-bottom:4px}
.row{display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:16px;align-items:start}
figure{margin:0}
img{display:block;width:100%;height:auto;border:1px solid #6b5a40}
figcaption{font-size:15px;line-height:1.35;margin:6px 0 0}
code{font-size:12px;color:#d8c9a3;display:block;margin-top:2px}
`;

const page = (title: string, rows: readonly Row[]): string => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title>
<link rel="stylesheet" href="/design/kit/fonts.css"><style>${CSS}</style></head><body>
<h1>${esc(title)}</h1><p class="sub">Issue #1256, the chart of lessons. Drawn at 94ad4392 over the built Primer; every answer shown against the round's recommendation for the other questions. The first picture of a row is today's, where one exists.</p>
${rows.map((r) => `<h2>${esc(r.head)}</h2><div class="row" style="--n:${Math.max(3, r.cells.length)}">${r.cells.map((c) => `<figure><img src="${WEB(c.src)}" alt=""><figcaption>${c.caption}</figcaption></figure>`).join("")}</div>`).join("\n")}
</body></html>`;

mkdirSync(SHEETS, { recursive: true });
const shots = SHEET_LIST.map((s) => {
  writeFileSync(resolve(SHEETS, `${s.name}.html`), page(s.title, s.rows));
  return { url: `/out/1256/sheets/${s.name}.html`, width: 2400, height: 1400, mobile: false, out: resolve(SHEETS, `${s.name}.png`), full: true, waitMs: 1200, probe: "document.documentElement.scrollWidth" };
});
writeFileSync(resolve(SHEETS, "sheet-shots.json"), JSON.stringify(shots, null, 1));
console.log(resolve(SHEETS, "sheet-shots.json"), fileOf(Q.x, "x"));
