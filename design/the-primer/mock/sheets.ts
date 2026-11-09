// Issue #1155 round: the contact sheets, the control first, each still captioned, every figure in a caption read from a measurement file in measure/. Served from the main checkout's root so a sheet reaches the stills and the house faces in design/kit/fonts.css; writes the sheets and `sheet-shots.json` for the shared camera.
// node out/1155/mock/sheets.ts   then   node scripts/design/shoot.ts <out>/sheets/sheet-shots.json --site <main checkout>
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";
import { everyStep } from "./ladder/guide.ts";
import { EXPLORER } from "./ladder/explorer.ts";
import { landingFile } from "./landings.ts";
import { MAIN, OUT_1155, TREE } from "./paths.ts";
import { actHtml } from "./primer.ts";

type Meta = { file: string; dir: string; caption: string; kind: "full" | "crop" };
const metas = JSON.parse(readFileSync(join(OUT_1155, "measure", "stills-meta.json"), "utf8")) as Meta[];
const results = JSON.parse(readFileSync(join(OUT_1155, "measure", "stills-results.json"), "utf8")) as Array<{ http4xx: string[]; consoleErrors: string[] }>;
if (results.some((r) => r.http4xx.length || r.consoleErrors.length)) throw new Error("a still heard a 4xx or a console error");
const cap = (file: string): string => metas.find((m) => m.file === file)?.caption ?? file;
const url = (rel: string): string => "/" + relative(MAIN, join(OUT_1155, rel));
const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/`/g, "");

const fig = (rel: string, width: number, caption: string): string =>
  `<figure style="width:${width}px"><img src="${url(rel)}" style="width:${width}px" alt=""><figcaption>${caption} <code>${esc(rel)}</code></figcaption></figure>`;
const still = (file: string, width: number, extra = ""): string => fig(`shots/stills/${file}`, width, `${esc(cap(file))}.${extra ? ` <span class="m">${extra}</span>` : ""}`);

const page = (title: string, intro: string, body: string, width: number): string => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=${width}">
<link rel="stylesheet" href="/design/kit/fonts.css"><title>${esc(title)}</title><style>
body{margin:0;padding:28px 32px 40px;background:#2b2118;color:#efe6cf;font-family:"EB Garamond",Georgia,serif;width:${width - 64}px}
h1{font-family:"IM Fell English SC",Georgia,serif;font-weight:400;font-size:32px;letter-spacing:.06em;margin:0 0 6px}
h2{font-family:"IM Fell English SC",Georgia,serif;font-weight:400;font-size:22px;letter-spacing:.06em;margin:26px 0 10px;border-bottom:1px solid #6b5a40;padding-bottom:4px}
p.intro{font-family:"IM Fell English",Georgia,serif;font-style:italic;font-size:19px;margin:0 0 20px;max-width:1700px;line-height:1.4}
.row{display:flex;flex-wrap:wrap;gap:26px;align-items:flex-start;margin-bottom:22px}
figure{margin:0}img{display:block;border:1px solid #6b5a40}
figcaption{font-size:16px;line-height:1.38;margin-top:7px;color:#efe6cf}figcaption .m{color:#e6d9b8}figcaption code,code{font-size:12.5px;color:#cdbd97}
table{border-collapse:collapse;font-size:16px}td,th{border:1px solid #6b5a40;padding:4px 9px;text-align:left;vertical-align:top}th{font-family:"IM Fell English SC",Georgia,serif;font-weight:400;letter-spacing:.05em}
</style></head><body><h1>${esc(title)}</h1><p class="intro">${intro}</p>${body}</body></html>`;

// What the measurement files say, read here so a caption cannot drift from them.
const md = (f: string): string => readFileSync(join(OUT_1155, "measure", f), "utf8");
const checkLine = md("check.md").split("\n").find((l) => l.includes(" pass. "))!;
const mutateLine = md("check-mutate.md").split("\n").find((l) => l.includes("went red"))!;
const topRow = md("top-row.md").split("\n").filter((l) => l.startsWith("| /")).map((l) => l.split("|").map((c) => c.trim()));
const gap = (room: string, w: string, name: string): string => topRow.find((c) => c[1] === room && c[2] === w && c[3] === name)?.[5] ?? "?";
const cut = (room: string, w: string, name: string): string => topRow.find((c) => c[1] === room && c[2] === w && c[3] === name)?.[8] ?? "?";

const thousands = (n: number): string => String(n).replace(/\B(?=(\d{3})+$)/g, ",");
const TOP_KEYS = ["a", "a-plain", "a-folded", "a-sitting", "e"];
const heights: Record<string, string> = Object.fromEntries((JSON.parse(md("tops-results.json")) as Array<{ probe: string }>).map((r, i) => [TOP_KEYS[i]!, thousands((JSON.parse(r.probe) as { _height: number })._height)]));
const slipRows = md("slip-and-press.md").split("\n").filter((l) => l.startsWith("| d-") || l.startsWith("| c-")).map((l) => l.split("|").map((c) => c.trim()));
const slipCover = (key: string): string => slipRows.find((c) => c[1] === key)?.[3] ?? "?";
const learnRows = md("slip-and-press.md").split("\n").filter((l) => /^\| \/[a-z-/]+ \| 1024 /.test(l)).map((l) => l.split("|").map((c) => c.trim()));
const sheets: Array<{ name: string; width: number; html: string }> = [];

sheets.push({
  name: "sheet-1-what-it-is",
  width: 2760,
  html: page(
    "What kind of thing the guide is, at full scale",
    "Today first (there is no guide: the nearest things are the Portfolio's empty-visit plate, the Questions &amp; Answers page and the notes on the Broadside), then the five directions, each drawn over the real built pages at 089881ad, seed 42 throughout. A: a reading page whose steps open the live rooms. B: a working room where the slip is the lesson. C: a tour inside each room. D: A's page, and the room rings the step's control on arrival. E (the designer's own): A's page opening on a chart of the lessons.",
    `<h2>Today, the control</h2><div class="row">${still("control-portfolio-plate.png", 880)}${still("control-faq.png", 880)}${still("control-footnote.png", 880)}</div>
<h2>A, B and C</h2><div class="row">${still("a-top.png", 880)}${still("b-before.png", 880)}${still("c-explorer.png", 880)}</div>
<h2>D and E</h2><div class="row">${still("d-explorer.png", 880)}${still("d-explorer-done.png", 880)}${still("e-chart.png", 880)}</div>`,
    2760,
  ),
});

sheets.push({
  name: "sheet-2-at-twice-the-size",
  width: 2760,
  html: page(
    "The same, cropped at twice the size, where the words are read",
    "Legibility lives here and glance lives on the first sheet. Each crop is the same shot as its full-scale still, at device scale 2.",
    `<div class="row">${still("control-portfolio-plate-2x.png", 860)}${still("control-faq-2x.png", 860)}${still("control-footnote-2x.png", 860)}</div>
<div class="row">${still("a-land-2x.png", 860)}${still("b-before-2x.png", 600)}${still("c-explorer-2x.png", 1100)}</div>
<div class="row">${still("d-explorer-done-2x.png", 1100)}${still("e-chart-2x.png", 1000)}${still("a-closing-2x.png", 600)}</div>`,
    2760,
  ),
});

sheets.push({
  name: "sheet-3-the-primer",
  width: 2760,
  html: page(
    "A, the Primer: a reading page, every step a road into its room",
    `Laid over the built Questions &amp; Answers page, so it wears the house's own document-room shell: the band, the head cluster, the index slip, the sheet. The ladder is rendered from the data in <code>mock/ladder/</code> and nothing else. The whole page runs ${heights["a"]} px tall at 1280 with every room open (${heights["a-plain"]} px without the pictures); laid one room at a time it is ${heights["a-folded"]} px, the Explorer's own steps most of it (measure/tops-results.json).`,
    `<div class="row">${still("a-top.png", 880)}${still("a-land.png", 880)}${still("a-subroom.png", 880)}</div>
<div class="row">${still("a-next.png", 880)}${still("a-closing.png", 880)}${still("a-plain-land.png", 880)}</div><div class="row">${still("a-sitting-land.png", 880)}</div>
<div class="row">${still("a-1024.png", 704)}${still("a-try-it-lands.png", 880)}${fig("shots/stills/a-folded-full.png", 300, `A laid one room at a time, the whole page at a glance (${heights["a-folded"]} px tall at 1280).`)}</div>`,
    2760,
  ),
});

sheets.push({
  name: "sheet-4-in-the-rooms",
  width: 2760,
  html: page(
    "B, C and D: the guide inside the rooms",
    "B moves nothing: it withholds every row the reader has not reached, so the one left showing is the real control, wired, and the chart it redraws is the engine's. C and D ring the real control where it stands and point the house's manicule at it. Each \"done\" still is the room after the reader's action really ran.",
    `<h2>B, the Schoolroom</h2><div class="row">${still("b-before.png", 880)}${still("b-after.png", 880)}${still("b-1024.png", 704)}</div>
<h2>C, a tour inside each room</h2><div class="row">${still("c-entry-2x.png", 880)}${still("c-explorer.png", 880)}${still("c-explorer-done.png", 880)}</div><div class="row">${still("c-reading-room.png", 880)}${still("c-print-room.png", 880)}</div>
<h2>D, the Primer and the pointing hand</h2><div class="row">${still("d-explorer.png", 880)}${still("d-explorer-done.png", 880)}${still("d-prospect.png", 880)}</div><div class="row">${still("d-ribbon.png", 880)}</div>
<h2>D and C at the 1024 floor, and D in every chart dress</h2><div class="row">${fig("shots/stills/d-explorer-1024.png", 880, `D at 1024 by 768: the step's slip covers ${slipCover("d-explorer-1024")} of the chart, where at 1280 it covers ${slipCover("d-explorer-1280")}; it clears the Glass, the Broadside and the press row.`)}${fig("shots/stills/d-explorer-done-1024.png", 880, `D done, at 1024 by 768: ${slipCover("d-explorer-done-1024")} of the chart under the slip.`)}${fig("shots/stills/c-explorer-1024.png", 880, `C at 1024 by 768: ${slipCover("c-explorer-1024")} of the chart under the slip.`)}</div>
<div class="row">${fig("shots/stills/d-explorer-ink-1280.png", 880, "D over the ink chart.")}${fig("shots/stills/d-explorer-topographic-1280.png", 880, "D over the topographic chart.")}${fig("shots/stills/d-explorer-nautical-1280.png", 880, "D over the nautical chart.")}</div>`,
    2760,
  ),
});

const tr = (room: string, name: string, w = "1024"): string => fig(`measure/top-row/${room.replace(/\//g, "") === "explorerportfolio" ? "explorer-portfolio" : room.replace(/\//g, "")}-${w}-${name}.png`, 1024, `${room} at ${w}, ${name === "today" ? "today, eight items" : `a ninth item, ${name}`}: gap to the corner ${gap(room, w, name === "today" ? "today (eight items)" : name)} px; cut: ${esc(cut(room, w, name === "today" ? "today (eight items)" : name))}.`);
sheets.push({
  name: "sheet-5-where-it-lives",
  width: 2200,
  html: page(
    "Where the guide is reached from",
    "A ninth item on the nav's top line was measured in every room at 1024 and 1280 under three names (measure/top-row.md). Every room keeps its one nav line with Primer and Hornbook; with Schoolroom the nav runs under the corner in the Print Room, the Ribbon and the Portfolio (and by 2 px in the Prospect), which the house's corners sweep refuses. With any ninth item the Print Room's corner gives way to the kit's width at 1024 and its style list then cuts \"antique\". With scripts off nothing was measured (UNVERIFIABLE): the errata already records two corners under the eighth item.",
    `<div class="row">${tr("/print-room/", "today")}${tr("/print-room/", "Primer")}</div><div class="row">${tr("/print-room/", "Hornbook")}${tr("/print-room/", "Schoolroom")}</div>
<div class="row">${tr("/prospect/", "Schoolroom")}${tr("/explorer/portfolio/", "Schoolroom")}</div>
<h2>The Primer's station on home (N7, M1, M2)</h2><div class="row">${fig("shots/stills/home-pip-poalo-1280.png", 1000, "Moored at Poalo, a harbour of the Ratoa Atolls, in the chart's empty north-west: clear at 1024 and 1280, the farthest of the eight clear places from every station (measure/pip-sweep.md). The designer's recommendation.")}${fig("shots/stills/home-pip-poalo-card-1024.png", 1000, "Its card open at 1024 by 768, cloned from How It Works's, with a road in the stations' own form; every word a stand-in for the seats round.")}</div><div class="row">${fig("shots/stills/home-pip-key-1024.png", 1000, "At the chart's key, the most fitting mooring: at 1024 it runs under the Glass (measure/home-pip.md).")}${fig("shots/stills/home-pip-nailo-1024.png", 1000, "At Nailo on the western shore: at 1024 it lies over the Notice to Mariners stamp.")}</div><div class="row">${fig("shots/stills/home-pip-key-legend-1024.png", 1000, "M1 was ruled from this still: a fifth press on the legend row, Learn one / The Primer, shot with the pip at the key; five presses keep one line at 1024.")}${fig("shots/stills/home-pip-poalo-legend-1024.png", 1000, "Drawn after the sitting, not yet ruled: the two rulings together, the pip at Poalo (M2, ruled from the first still on this row) and the fifth press (M1, ruled from the still before this one), the words stand-ins. Sub 2's sitting ratifies it. Five presses keep one line at 1024; the row grows from 656 to 781 px and stands 61 px from the Glass, and its fifth press covers the A of A Gallery of Worlds, 1,108 square px, which Sub 2 settles (measure/home-pip.md).")}${fig("shots/stills/home-pip-poalo-legend-1280.png", 1000, "The same at 1280 by 800: one line, 189 px from the Glass.")}</div>
<h2>Off the top line</h2><div class="row">${still("p-child-2x.png", 1000)}${still("p-road.png", 1000, "With a fourth press the Explorer's press row takes two lines at 1280, where the Broadside spec keeps it on one (BR2).")}</div><div class="row">${still("p-home.png", 1000)}${fig("shots/stills/c-entry-2x.png", 1000, `The trail line's "learn this room" press, at twice the size. Measured at 1024 in nine rooms (measure/slip-and-press.md): it stands ${(learnRows[0]?.[4] ?? "?").split(",")[0]} from the nav line above it in every room but one, where today's chart-of-the-atelier press beside it stands 11.1 px; in the Prospect it touches the trail's "also reached from" line (${learnRows.find((c) => c[1] === "/prospect/")?.[4] ?? "?"}). As drawn it is too close, and would need a seat of its own.`)}</div>`,
    2200,
  ),
});

const NAMES: ReadonlyArray<{ name: string; nav: string; tagline: string; verb: string; where: string; why: string }> = [
  { name: "The Primer", nav: "Primer", tagline: "every room, one small step at a time", verb: "Learn one", where: "every room, one small step at a time", why: "A child's first schoolbook (the New England Primer, from the 1690s): one small picture and one line to a letter. Plain, and it says what it is to anyone. On the nav at 1024 it leaves 23 px in the tightest rooms." },
  { name: "The Hornbook", nav: "Hornbook", tagline: "the first lessons, held in the hand", verb: "Learn one", where: "the first lessons, held in the hand", why: "A child's first lesson-board, the 1400s to the 1700s: one printed sheet under a pane of horn, with a handle. The most delight, the least known; a reader may need the tagline to know it. On the nav at 1024 it leaves 3 px." },
  { name: "The Schoolroom", nav: "Schoolroom", tagline: "every control, learned on a live chart", verb: "Learn one", where: "one control at a time, on a live chart", why: "A room, named like the Reading Room, the Writing Room and the Print Room, so it fits direction B best. On the nav at 1024 it runs under three rooms' corners by 10 px, so it cannot take the top line as the nav stands." },
  { name: "The Copybook", nav: "Copybook", tagline: "do as the page does, one line at a time", verb: "Learn one", where: "do as the page does, one line at a time", why: "The book a pupil copied fair lines from, line under line. Says practice; says less about rooms. Not measured on the nav." },
];
const nameCard = (n: (typeof NAMES)[number]): string => `<div class="nc"><div class="folio"><p class="rn">${n.name}</p><p class="tg">${n.tagline}</p></div><p class="nav">Today · Explorer · Writing Room · Reading Room · Print Room · Gallery · <u>${n.nav}</u> · Q &amp; A · Glossary</p>
<div class="slip"><p class="v">${n.verb}</p><p class="t">${n.name}</p><p class="w">${n.where}</p></div><p class="road"><i>Learn this room in</i><b>${n.name}</b></p><p class="why">${n.why}</p></div>`;
sheets.push({
  name: "sheet-6-the-name",
  width: 2200,
  html: page(
    "The name, in the house's own forms",
    "Each candidate as the room's name in its corner, as a nav item, as a slip's head and as a road out of a room. None of them is in use on the site (searched across src/pages, src/site, src/layouts and src/render). Two words are taken already: the home page's card is \"How It Works\" (verb \"See how\"), and in code a \"rung\" is the Glass's level of detail (<code>RUNGS</code> in <code>src/site/shared/table-address.ts</code>), so the guide's steps are called steps. References: <code>refs/images/new-england-primer-1773.jpg</code>, <code>refs/images/hornbook-1700s.jpg</code> (both public domain by refs/refs.json).",
    `<style>.nc{width:1000px;background:#3a2c1f;border:1px solid #6b5a40;padding:18px 22px 16px;box-sizing:border-box}.folio{text-align:right}.rn{font-family:"IM Fell English SC";font-size:30px;letter-spacing:.06em;margin:0}.tg{font-family:"IM Fell English";font-style:italic;font-size:18px;margin:0}
.nav{font-family:"IM Fell English SC";font-size:15px;letter-spacing:.08em;margin:12px 0}.nav u{text-underline-offset:4px}
.slip{background:#f4ecd8;color:#4a3826;border:1px solid #b9a77f;width:360px;padding:12px 16px;margin:10px 0}.slip .v{font-family:"IM Fell English";font-style:italic;margin:0;color:#6b5a40}.slip .t{font-family:"IM Fell English SC";font-size:26px;letter-spacing:.05em;margin:0}.slip .w{font-family:"IM Fell English SC";font-size:12px;letter-spacing:.12em;margin:0;color:#6b5a40}
.road{display:inline-block;background:#f0e3bd;color:#4a3826;border:1px solid #4a3826;border-radius:3px;padding:6px 16px;text-align:center;margin:4px 0 10px}.road i{display:block;font-family:"IM Fell English";font-size:15px}.road b{font-family:"IM Fell English SC";font-weight:400;font-size:18px;letter-spacing:.07em}.why{font-size:18px;line-height:1.4;margin:6px 0 0}</style>
<div class="row">${NAMES.map(nameCard).join("")}</div><div class="row">${fig("refs/images/new-england-primer-1773.jpg", 420, "The New England Primer, 1773, letters A to F (public domain, refs/refs.json).")}${fig("refs/images/hornbook-1700s.jpg", 300, "A hornbook, perhaps 1700 to 1750 (public domain, refs/refs.json).")}${fig("refs/images/manicule.jpg", 420, "A manicule, the pointing hand C and D lay beside a control (public domain, refs/refs.json).")}</div>`,
    2200,
  ),
});

const land = EXPLORER.lessons.find((l) => l.id === "land")!;
const fine = land.steps.map((s, i) => `<li><b>${i + 4}</b> ${actHtml(s)}<br><i>${esc(s.see)}</i></li>`).join("");
const MIDDLE = [
  ["Choose {archipelago} from {type}, drag {islands} toward {many}, then choose {of every size}.", "The isle breaks into a sea of isles, each a size of its own."],
  ["Choose {polar} from {climate}.", "Pine woods and tundra, and the snow line comes down; the coast stays put."],
  ["Type Iceland in the {shape} box and choose it; then choose {archipelago} again.", "The land takes Iceland's outline, and the islands wait in the held box, which says why."],
];
const mid = MIDDLE.map(([a, s], i) => `<li><b>${i + 4}</b> ${esc(a!).replace(/\{([^}]+)\}/g, '<span class="ch">$1</span>')}<br><i>${esc(s!)}</i></li>`).join("");
sheets.push({
  name: "sheet-7-the-grain",
  width: 2200,
  html: page(
    "How big a step is: the Land at three grains",
    "The same lesson three ways. Fine is what every still draws: one action to a step, the control's words in the sentence. The middle grain folds a row's variations into one step. The coarse grain is the Portfolio plate's own grain (<code>PLATE_STEPS</code> in <code>src/site/explorer/portfolio/how-plate.ts</code>), a whole panel in one line. The middle and coarse wordings are this sheet's alone, written to show the grain, and were never checked against the page.",
    `<style>.g{width:640px;background:#f4ecd8;color:#4a3826;padding:16px 22px;box-sizing:border-box;border:1px solid #b9a77f}.g h3{font-family:"IM Fell English SC";font-weight:400;font-size:22px;letter-spacing:.06em;margin:0 0 2px}.g p.k{font-family:"IM Fell English";font-style:italic;margin:0 0 10px;color:#6b5a40}.g ol{list-style:none;margin:0;padding:0}.g li{border-top:1px solid #cdbd97;padding:8px 0;font-size:18px;line-height:1.4;font-weight:600}.g li i{font-family:"IM Fell English";font-weight:400;color:#6b5a40}.g li b{font-family:"IM Fell English SC";font-weight:400;color:#6b5a40;margin-right:8px}.ch{font-weight:400;border:1px solid #857257;background:#f8f1e0;border-radius:3px;padding:0 5px}</style>
<div class="row"><div class="g"><h3>Fine, as drawn</h3><p class="k">${land.steps.length} steps, one action each</p><ol>${fine}</ol></div><div class="g"><h3>Middle</h3><p class="k">${MIDDLE.length} steps, one row each</p><ol>${mid}</ol></div><div class="g"><h3>Coarse</h3><p class="k">1 step, the panel whole</p><ol><li><b>ii</b> Shape the land: the type, the climate and the shape each reshape the world, and a row the world cannot use waits in the held box.<br><i>A whole lesson in a line, as the Portfolio's plate tells the Chart Table.</i></li></ol></div></div>`,
    2200,
  ),
});

const src = (rel: string, from: number, to: number): string => esc(readFileSync(join(TREE, rel), "utf8").split("\n").slice(from - 1, to).join("\n"));
const lineOf = (rel: string, needle: string): number => readFileSync(join(TREE, rel), "utf8").split("\n").findIndex((l) => l.includes(needle)) + 1;
const islandsAt = lineOf("out/1155/mock/ladder/explorer.ts", 'id: "islands"');
sheets.push({
  name: "sheet-8-how-it-grows",
  width: 2200,
  html: page(
    "How the guide grows with the site, and how it fails a check when a room changes",
    `What a contributor writes, copied from the round's own data files, and what the round's prototype checks did on the built site. ${esc(checkLine)} ${esc(mutateLine)}`,
    `<style>pre{background:#f4ecd8;color:#3d2f1f;font-size:15px;line-height:1.35;padding:14px 16px;border:1px solid #b9a77f;margin:0;white-space:pre-wrap;width:1020px;box-sizing:border-box}.box{width:1040px}.box h3{font-family:"IM Fell English SC";font-weight:400;font-size:20px;letter-spacing:.05em;margin:0 0 6px}.box p{font-size:17px;line-height:1.4;margin:6px 0 10px}</style>
<div class="row"><div class="box"><h3>One more step: one entry in a lesson</h3><p>The braces are the control's own words; each must have its Words entry, and the browser check holds the two to the room.</p><pre>${src("out/1155/mock/ladder/explorer.ts", islandsAt - 1, islandsAt + 7)}</pre></div>
<div class="box"><h3>One more room: one ladder, one line in the list</h3><p>A subroom needs nothing more: the route tree already seats it under the room it opens from (<code>seatOf</code> in <code>src/layouts/nav.ts</code>), and the guide reads that seat. A room with no ladder fails a unit check over the route tree (<code>untaught</code> below), the way a route with no place fails the chart of the atelier's test today. Run, not described (measure/growth.md): with the Ribbon's ladder taken away, untaught names /ribbon/; with a new subroom of the Explorer in the tree and no ladder, it names that route; given its ladder, the subroom is seated under the Explorer by its place in the tree alone.</p><pre>${src("out/1155/mock/ladder/guide.ts", lineOf("out/1155/mock/ladder/guide.ts", "export const LADDERS"), lineOf("out/1155/mock/ladder/guide.ts", "export const LADDERS") + 3)}\n\n${src("out/1155/mock/ladder/guide.ts", lineOf("out/1155/mock/ladder/guide.ts", "export function untaught"), lineOf("out/1155/mock/ladder/guide.ts", "export function untaught") + 3)}</pre></div></div>
<div class="row"><div class="box"><h3>The words a step quotes, and how a check finds them</h3><pre>${src("out/1155/mock/ladder/shape.ts", 4, 24)}</pre></div><div class="box"><h3>What the check reads on the live page</h3><p>Every step's own address opened, what the reader did first done, then each quoted control found, asked whether a reader could reach it (shown, not held, not covered at its centre) and whether it carries exactly the quoted words; and the address checked for every key it carried. ${esc(checkLine)}</p><p>${esc(mutateLine)} The six changes: a row's label renamed, a press removed from the Glass, an option taken out of a list, a press renamed, a held note reworded, a press folded out of sight (measure/check-mutate.md).</p></div></div>`,
    2200,
  ),
});

const rows = everyStep();
const checks = (JSON.parse(readFileSync(join(OUT_1155, "measure", "check-results.json"), "utf8")) as Array<{ probe: string }>).map((r) => JSON.parse(r.probe) as { reads: Array<{ ok?: boolean; fits: boolean }> });
const cell = (i: number): string => {
  const { ladder, step } = rows[i]!;
  const good = checks[i]!.reads.every((x) => x.ok === true && x.fits);
  return `<figure style="width:420px"><img src="${url(`shots/pictures/${landingFile(ladder.route, step.id)}`)}" style="width:420px" alt=""><figcaption><b>${esc(ladder.route)} · ${esc(step.id)}</b>: ${actHtml(step)} <span class="m">${good ? "check passes" : "check RED"}</span></figcaption></figure>`;
};
sheets.push({
  name: "sheet-9-every-step",
  width: 2760,
  html: page(
    "Every step, and the room once it is done",
    `The whole ladder at a glance: ${rows.length} steps across nine rooms, each pictured from its own still on the built site (once done where the step has a doing, else on arrival), each marked with what the drift check read. The full text is <code>ladder.md</code>.`,
    `<div class="row">${rows.map((_, i) => cell(i)).join("")}</div>`,
    2760,
  ),
});

mkdirSync(join(OUT_1155, "sheets"), { recursive: true });
const shots = sheets.map((s) => {
  writeFileSync(join(OUT_1155, "sheets", `${s.name}.html`), s.html);
  return { url: url(`sheets/${s.name}.html`), width: s.width, height: 1200, mobile: false, out: join(OUT_1155, "sheets", `${s.name}.png`), waitMs: 1500, full: true, probe: "document.documentElement.scrollWidth" };
});
writeFileSync(join(OUT_1155, "sheets", "sheet-shots.json"), JSON.stringify(shots, null, 1));
console.log(`${shots.length} sheets`);
