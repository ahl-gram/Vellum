// Issue #1155 round, direction E (bold, the designer's own): the guide opens on the chart of the atelier drawn large, from its real places, roads and coast (`PLACES`, `ROADS` and `COAST` in `src/layouts/atelier-chart.ts`), every room with a ladder carrying its lessons as waypoints, the reader's road through them drawn as the survey's dashed track and inked as far as the steps done. A room added to the site must take a place on that chart already (`test/site/atelier-chart.test.ts`), so a new room's lessons have somewhere to stand on the day it ships.
import { COAST, PIP_R, PLACES, ROADS, roadPath } from "../../../src/layouts/atelier-chart.ts";
import { LADDERS, LEANED_ON } from "./ladder/guide.ts";

const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];
const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** Lessons ring their room's place from its upper right, round below it, to its upper left, leaving the top for the room's name; the radius grows with the count so eight lessons still clear one another. */
const ringOf = (x: number, y: number, n: number): Array<[number, number]> => {
  const r = n > 4 ? 25 : 18;
  return Array.from({ length: n }, (_, i) => {
    const deg = n === 1 ? 90 : -30 + (i * 240) / (n - 1);
    const a = (deg * Math.PI) / 180;
    return [Math.round((x + r * Math.cos(a)) * 10) / 10, Math.round((y + r * Math.sin(a)) * 10) / 10];
  });
};

const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const countWord = (n: number): string => WORDS[n] ?? String(n);
const labelLift = (route: string): number => {
  const l = LADDERS.find((x) => x.route === route);
  return l === undefined ? 9 : l.lessons.length > 4 ? 37 : 26;
};

export function chartOfLessons(sealed: ReadonlySet<string>): string {
  const home = PLACES["/"]!;
  const here = PLACES["/explorer/"]!;
  const inked = `M${home.x} ${home.y} Q ${(home.x + here.x) / 2 + 12} ${(home.y + here.y) / 2 - 10} ${here.x} ${here.y}`;
  const lessons = LADDERS.flatMap((l) => {
    const p = PLACES[l.route]!;
    const ring = ringOf(p.x, p.y, l.lessons.length);
    return l.lessons.map((lesson, i) => {
      const done = lesson.steps.every((s) => sealed.has(`${l.route}#${s.id}`));
      const [x, y] = ring[i]!;
      return `<g class="col-way${done ? " done" : ""}"><circle cx="${x}" cy="${y}" r="5.4"/><text x="${x}" y="${y + 2.3}">${ROMAN[i]}</text></g>`;
    });
  });
  const leaned = LEANED_ON.map((r) => PLACES[r]!).map((p) => `<text class="col-lean" x="${p.x}" y="${p.y + 14}">lean on it afterwards</text>`).join("");
  const places = Object.entries(PLACES)
    .filter(([r]) => r !== "/atlas/")
    .map(([r, p]) => `<g class="col-place ${p.rank}${LADDERS.some((l) => l.route === r) ? " taught" : ""}"><circle cx="${p.x}" cy="${p.y}" r="${PIP_R[p.rank]}"/><text x="${p.x}" y="${p.y - labelLift(r)}">${esc(p.name)}</text></g>`)
    .join("");
  const svg = `<svg class="col-chart" viewBox="20 40 520 330" role="img" aria-label="A chart of the lessons: every room a place, every lesson a waypoint">
<path class="col-sea" d="${COAST}"/><path class="col-land" d="${COAST}"/>
${ROADS.map((r) => `<path class="col-road" d="${roadPath(r)}"/>`).join("")}
<path class="col-track inked" d="${inked}"/>
${places}${lessons.join("")}${leaned}<g class="col-you"><circle cx="${here.x}" cy="${here.y}" r="31"/><text x="${here.x}" y="${here.y + 44}">you are here: ii · The Land</text></g>
<g class="col-rose" transform="translate(508 344)"><circle r="12"/><path d="M0 -12 L2.7 -2.7 L12 0 L2.7 2.7 L0 12 L-2.7 2.7 L-12 0 L-2.7 -2.7 Z"/></g>
<text class="col-title" x="40" y="362">A Chart of the Lessons</text></svg>`;
  const ex = LADDERS[0]!;
  const card = `<div class="col-card"><p class="cc-verb">${countWord(ex.lessons.length).replace(/^./, (m) => m.toUpperCase())} lessons at</p><p class="cc-name">The Explorer</p><ol>${ex.lessons.map((l, i) => `<li class="${l.steps.every((s) => sealed.has(`${ex.route}#${s.id}`)) ? "done" : ""}"><span>${ROMAN[i]}</span> ${esc(l.title)}<em>${l.steps.length} steps</em></li>`).join("")}</ol><p class="cc-go"><a href="#explorer-land">Begin at ii · The Land</a></p></div>`;
  return `<div class="col1155" id="chart-of-lessons"><p class="col-lede">The rooms of the atelier, and the lessons that wait in each. Choose a room on the chart, or begin at the first step below.</p><div class="col-wrap">${svg}${card}</div></div>`;
}

export const CHART_CSS = `
.col1155{margin:0 0 1.6rem}
.col1155 .col-lede{font-family:var(--font-flourish);font-style:italic;font-size:1.2rem;color:var(--ink-brown);margin:0 0 .6rem}
.col1155 .col-wrap{position:relative;border:1px solid var(--line-tan);outline:3px double var(--line-tan);outline-offset:4px;background:var(--chart-paper)}
.col1155 .col-chart{display:block;width:100%;height:auto}
.col-sea{fill:none;stroke:#cfd9c9;stroke-width:16}
.col-land{fill:#ead9b4;stroke:var(--ink-brown);stroke-width:1.1}
.col-road{fill:none;stroke:var(--ink-faded);stroke-width:.8;stroke-dasharray:1.5 2}
.col-track{fill:none;stroke:var(--ink-dark);stroke-width:1.3;stroke-dasharray:4 3;opacity:.55}
.col-track.inked{stroke:var(--iron-red);stroke-dasharray:none;opacity:1;stroke-width:1.8}
.col-place circle{fill:var(--parchment-bright);stroke:var(--ink-dark);stroke-width:1.2}
.col-place.taught circle{fill:var(--control-gold)}
.col-place text{font-family:var(--font-display);font-size:9.5px;letter-spacing:.06em;text-anchor:middle;fill:var(--ink-dark);paint-order:stroke;stroke:#ead9b4;stroke-width:3px}
.col-place.village text,.col-place.isle text{font-size:8.5px}
.col-way circle{fill:var(--parchment-bright);stroke:var(--ink-brown);stroke-width:.9}
.col-way text{font-family:var(--font-flourish);font-style:italic;font-size:6.6px;text-anchor:middle;fill:var(--ink-dark)}
.col-way.done circle{fill:var(--iron-red);stroke:var(--iron-red)}
.col-way.done text{fill:var(--parchment-bright)}
.col-lean{font-family:var(--font-flourish);font-style:italic;font-size:7px;text-anchor:middle;fill:var(--ink-brown)}
.col-rose circle{fill:none;stroke:var(--ink-brown);stroke-width:.8}.col-rose path{fill:var(--ink-brown)}
.col-title{font-family:var(--font-display);font-size:13px;letter-spacing:.1em;fill:var(--ink-dark)}
.col-you circle{fill:none;stroke:var(--iron-red);stroke-width:1;stroke-dasharray:2 2}.col-you text{font-family:var(--font-flourish);font-style:italic;font-size:8px;text-anchor:middle;fill:var(--iron-red)}
.col1155 .col-card{position:absolute;left:1.5%;top:3%;width:15.5rem;background:var(--parchment-panel);border:1px solid var(--ink-dark);border-radius:4px;box-shadow:var(--sheet-shadow);padding:.6rem .85rem .7rem}
.col1155 .cc-verb{margin:0;font-family:var(--font-flourish);font-style:italic;color:var(--ink-brown);font-size:.88rem}
.col1155 .cc-name{margin:0 0 .35rem;font-family:var(--font-display);letter-spacing:.08em;font-size:1.05rem}
.col1155 .col-card ol{list-style:none;margin:0;padding:0;font-size:.92rem}
.col1155 .col-card li{display:flex;gap:.4rem;align-items:baseline;border-top:1px solid var(--line-faint);padding:.12rem 0}
.col1155 .col-card li span{font-family:var(--font-flourish);font-style:italic;width:1.6rem;color:var(--ink-brown)}
.col1155 .col-card li em{margin-left:auto;font-size:.8rem;color:var(--ink-brown)}
.col1155 .col-card li.done span{color:var(--iron-red)}
.col1155 .col-card li.done{text-decoration:line-through;text-decoration-color:rgb(from var(--iron-red) r g b / .6)}
.col1155 .cc-go{margin:.45rem 0 0;text-align:right}
.col1155 .cc-go a{font-family:var(--font-display);letter-spacing:.07em;font-size:.8rem;color:var(--ink-dark);background:var(--control-gold);border:1px solid var(--ink-dark);border-radius:3px;padding:.12rem .55rem;text-decoration:none}
`;
