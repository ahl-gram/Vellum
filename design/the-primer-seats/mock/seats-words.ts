// Issue #1248 round, item 7: every stand-in word (N10), each candidate set into its own seat on the real built pages (the Primer page and the step slip of the Issue #1155 round laid over them, home's station as item 1 draws it), at the size it is shown, as a still and a twice-size crop. Each crop's seat is measured for its width and its lines, so a word that wraps or crowds its row shows as a number. Writes shots/7-words/ and measure/7-words.md.
// node out/1248/mock/seats-words.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { primerJs, ringJs, type StripOpts } from "./inject.ts";
import { EXPLORER } from "./ladder/explorer.ts";
import { shootWithCrops, type CropItem } from "./seats-crop.ts";
import { probeOf, readResults } from "./seats-shoot.ts";
import { cardJs, fifthPressJs, openJs, pipJs, relayJs, STAND_IN, styleJs } from "./seats-home-js.ts";
import { measureFile, pictureUrl, SHA, shotDir } from "./seats-paths.ts";
import { navJs } from "./inject.ts";
import { NARROW_CSS, PRESS_CSS, pressJs } from "./seats-shared.ts";
import { ASIDES, COMMISSIONS, GLOSSES } from "./seats-lines-sets.ts";

const j = JSON.stringify;
const swap = (css: string, text: string, all = true): string => `{const es=[...document.querySelectorAll(${j(css)})];if(!es.length)throw new Error("no ${css.replace(/"/g, "'")}");${all ? "es" : "es.slice(0,1)"}.forEach((e)=>{e.textContent=${j(text)};});}`;
const swapMark = (from: string, to: string): string => `{[...document.querySelectorAll(".primer .mark")].filter((e)=>e.textContent===${j(from)}).forEach((e)=>{e.textContent=${j(to)};});}`;
const page = (only: string[], extra = ""): string => primerJs({ seat: "ninth", label: "Primer", pictures: pictureUrl, nextRoads: true, only, sealed: new Set(["/explorer/#dice"]) }) + extra;
const islands = EXPLORER.lessons.find((l) => l.id === "land")!.steps[1]!;
const strip = (verb: string, back: string): StripOpts => ({ verb, head: "The Explorer · the Land, step 2 of 6", step: islands, dots: { total: 6, done: 1 }, left: [`<a href="/primer/#explorer-land">${back}</a>`], right: [`<a href="#" class="dim">Next step</a>`], seat: { x: 40, y: 200 } });
const SEAT_PROBE = (css: string): string => `(()=>{const e=document.querySelector(${j(css)});if(!e)return null;const r=e.getBoundingClientRect();const g=document.createRange();g.selectNodeContents(e);const rs=[...g.getClientRects()].filter((q)=>q.width>0&&q.height>0);return{w:Math.round(r.width),h:Math.round(r.height),lines:new Set(rs.map((q)=>Math.round(q.bottom))).size};})()`;

type Group = { key: string; question: string; seat: string; options: Array<{ key: string; words: string; js: string }>; url: string; w: number; h: number; target: string; measure: string; minW?: number };
const G: Group[] = [
  { key: "w1-try-it", question: "The press beside each step that opens its room", seat: "the Primer page, a step's row", url: "/faq/", w: 1280, h: 800, target: "#explorer-dice", measure: "#explorer-dice .try", minW: 900,
    options: ["Try it", "Set to it", "Show me", "Open the room"].map((t, i) => ({ key: String.fromCharCode(97 + i), words: t, js: page(["/explorer/"], swap(".primer .try a", t)) })) },
  { key: "w2-begin-again", question: "The press that clears the seals", seat: "the Primer page's closing note, in its prose and its press", url: "/faq/", w: 1280, h: 800, target: "#afterward", measure: "#afterward .again", minW: 900,
    options: ["Begin again", "Wipe the slate", "Start afresh", "Clear the seals"].map((t, i) => ({ key: String.fromCharCode(97 + i), words: t, js: page([], swap(".closing .again", t) + swap(".closing .ch.btn", t)) })) },
  { key: "w3-trail-press", question: "The press on every room's trail line", seat: "the Prospect's head cluster at 1024, the press seated as item 2's A2, the twin trimmed", url: "/prospect/#seed=42&i=0", w: 1024, h: 768, target: "header.chrome", measure: ".learn1248", minW: 680,
    options: ["learn this room", "this room's steps", "a primer for this room", "how this room works"].map((t, i) => ({ key: String.fromCharCode(97 + i), words: t, js: styleJs("learn1248css", PRESS_CSS) + navJs("ninth", "Primer", false) + pressJs("a2-twin-trimmed", t) + relayJs })) },
  { key: "w4-slip-verb", question: "The step slip's verb line", seat: "the step slip in the Explorer (its seat is item 4's, not ruled)", url: "/explorer/#seed=42&type=archipelago", w: 1280, h: 800, target: ".strip1155", measure: ".strip1155 .s-verb", minW: 420,
    options: [["From The Primer", "a"], ["Learn one", "b"], ["A step from The Primer", "c"]].map(([t, k]) => ({ key: k!, words: t!, js: ringJs("[data-row=islands]", strip(t!, "Back to The Primer")) })) },
  { key: "w5-road-back", question: "The step slip's road back to the page", seat: "the step slip in the Explorer", url: "/explorer/#seed=42&type=archipelago", w: 1280, h: 800, target: ".strip1155", measure: ".strip1155 .s-row", minW: 420,
    options: [["Back to The Primer", "a"], ["Return to The Primer", "b"], ["Back to the steps", "c"]].map(([t, k]) => ({ key: k!, words: t!, js: ringJs("[data-row=islands]", strip("From The Primer", t!)) })) },
  { key: "w6-next-road", question: "The road at the foot of each room's steps", seat: "the Primer page, the Explorer's foot", url: "/faq/", w: 1280, h: 800, target: ".primer .next", measure: ".primer .next a", minW: 900,
    options: ["Next, the steps of", "Turn the page to", "Go on to", "Onward to"].map((t, i) => ({ key: String.fromCharCode(97 + i), words: t, js: page(["/explorer/", "/writing-room/"], swap(".primer .next i", t, false)) })) },
];
const MARK_SETS = [
  ["a", ["on a tablet", "with motion on", "play: no wrong answer", "a commission"]],
  ["b", ["by touch", "needs motion", "just for fun", "a challenge"]],
  ["c", ["at a tablet", "when motion is on", "a game, no wrong answer", "a task set"]],
] as const;
const STAND = MARK_SETS[0][1];
const MARK_STEPS: Array<[string, string]> = [["#explorer-in-hand", "/explorer/"], ["#reading-room-pace", "/reading-room/"], ["#explorer-dice", "/explorer/"], ["#explorer-commission", "/explorer/"]];
G.push(
  ...MARK_STEPS.map(([target], m) => ({
    key: `w7-mark-${["tablet", "motion", "play", "commission"][m]}`,
    question: "The marks on a step",
    seat: `the Primer page, the step that carries "${STAND[m]}"`,
    url: "/faq/",
    w: 1280,
    h: 800,
    target,
    measure: `${target} .mark`,
    minW: 900,
    options: MARK_SETS.map(([k, set]) => ({ key: k, words: set[m]!, js: page(["/explorer/", "/reading-room/"], STAND.map((s, i) => swapMark(s, set[i]!)).join("")) })),
  })),
);
G.push({
  key: "w8-closing-head",
  question: "The closing note's verb and head",
  seat: "the Primer page's closing note",
  url: "/faq/",
  w: 1280,
  h: 800,
  target: "#afterward",
  measure: "#afterward .c-title",
  minW: 900,
  options: [["Lean on these", "When the steps are done", "a"], ["Afterward", "Where to turn next", "b"], ["Keep at hand", "For a quicker answer", "c"]].map(([v, t, k]) => ({ key: k!, words: `${v} / ${t}`, js: page([], swap(".closing .c-verb", v!) + swap(".closing .c-title", t!) + swap('#index li.lean a.sec', t!)) })),
});
const homeAt = (verb: string, extra = ""): string => { const w = { ...STAND_IN, verb }; return pipJs(w) + fifthPressJs(w) + cardJs(w) + styleJs("seats1248", NARROW_CSS) + relayJs + extra; };
G.push({
  key: "w9-station-verb",
  question: "The home station's verb, on its pip and its legend press",
  seat: "home's legend row at 1024, the row drawn as item 1's B",
  url: "/",
  w: 1024,
  h: 768,
  target: "#lf-legend",
  measure: '#lf-legend .lf-legend-btn[data-station="primer"]',
  options: ["Learn one", "Learn how", "Start here", "Learn the rooms", "Learn to make one"].map((t, i) => ({ key: String.fromCharCode(97 + i), words: t, js: homeAt(t) })),
});
const CARDS: Array<{ key: string; where: string; prose: string; road: string }> = [
  { key: "a", where: STAND_IN.where, prose: STAND_IN.prose, road: STAND_IN.road },
  { key: "b", where: "at Poalo, a river harbour of the Ratoa Atolls", prose: "New to the atelier? Learn its rooms one small step at a time: each step opens its room already set, and a hand points at what to press.", road: "Open the Primer →" },
  { key: "c", where: "at Poalo, a village of the Ratoa Atolls", prose: "A primer for every room, one small thing to do at a time. Each step opens its room ready for you, and seals itself once it is done.", road: "Begin the steps →" },
];
G.push({
  key: "w10-station-card",
  question: "The home station's card: its where line, its prose and its road",
  seat: "home, the Primer's card open after the chart flies to Poalo, 1280",
  url: "/",
  w: 1280,
  h: 800,
  target: "#lf-card-primer",
  measure: "#lf-card-primer",
  options: CARDS.map((c) => {
    const w = { ...STAND_IN, where: c.where, prose: c.prose, road: c.road };
    return { key: c.key, words: `${c.where} / ${c.prose} / ${c.road}`, js: pipJs(w) + fifthPressJs(w) + cardJs(w) + styleJs("seats1248", NARROW_CSS) + relayJs + openJs("primer") };
  }),
});

const LINE_ROOMS = ["/explorer/", "/writing-room/", "/reading-room/", "/print-room/"];
const wrapHead = (id: string): string => `{const sec=document.querySelector("section#${id}");if(!sec)throw new Error("no lesson ${id}");const h=sec.querySelector("h3");const a=sec.querySelector("p.aside");const w=document.createElement("div");w.className="lhead1248";h.before(w);w.appendChild(h);if(a)w.appendChild(a);}`;
const glossSet = (set: "a" | "b" | "c" | "d"): string => GLOSSES.map((g) => `{const e=document.querySelector("section#${g.key} h3 .gloss");if(e)${set === "d" ? "e.remove()" : `e.textContent=${j(g[set])}`};}`).join("");
const SAMPLE = ["explorer-number", "explorer-land", "explorer-glass", "explorer-press", "print-room-proof", "reading-room-watch"];
for (const id of SAMPLE)
  G.push({
    key: `w11-lesson-line-${id}`,
    question: "The small line under each lesson's name",
    seat: `the Primer page, the head of the lesson "${GLOSSES.find((g) => g.key === id)!.lesson}"`,
    url: "/faq/",
    w: 1280,
    h: 800,
    target: `section#${id} .lhead1248`,
    measure: `section#${id} h3`,
    minW: 900,
    options: (["a", "b", "c", "d"] as const).map((k) => ({ key: k, words: k === "d" ? "(none)" : GLOSSES.find((g) => g.key === id)![k], js: page(LINE_ROOMS, glossSet(k) + wrapHead(id)) })),
  });
for (const r of ASIDES)
  G.push({
    key: `w12-comfort-${r.key}`,
    question: "The comfort line under a lesson's name",
    seat: `the Primer page, the head of the lesson "${r.lesson}"`,
    url: "/faq/",
    w: 1280,
    h: 800,
    target: `section#${r.key} .lhead1248`,
    measure: `section#${r.key} .lhead1248`,
    minW: 900,
    options: (["a", "b", "c"] as const).map((k) => ({ key: k, words: k === "c" ? "(none)" : r[k], js: page(["/explorer/"], `{const e=document.querySelector("section#${r.key} p.aside");${k === "c" ? "e.remove();" : `e.textContent=${j(r[k])};`}}` + wrapHead(r.key)) })),
  });
for (const c of COMMISSIONS)
  G.push({
    key: `w13-${c.key}`,
    question: "A commission's target",
    seat: `the Primer page, ${c.room}'s commission`,
    url: "/faq/",
    w: 1280,
    h: 800,
    target: `#${c.key}`,
    measure: `#${c.key} .act`,
    minW: 900,
    options: (["a", "b", "c"] as const).map((k) => ({ key: k, words: c[k], js: page(["/explorer/", "/writing-room/"], `{const e=document.querySelector("#${c.key} .act");if(!e)throw new Error("no ${c.key}");e.textContent=${j(c[k])};}`) })),
  });

const items: CropItem[] = G.flatMap((g) => g.options.map((o) => ({ url: g.url, w: g.w, h: g.h, js: o.js + relayJs, target: g.target, pad: 16, minW: g.minW ?? 0, full: join(shotDir("7-words"), `${g.key}-${o.key}.png`), crop: join(shotDir("7-words"), `${g.key}-${o.key}-2x.png`), probe: SEAT_PROBE(g.measure) })));
const out = process.argv[2] === "report" ? readResults("7-words-full").map((r, i) => ({ item: items[i]!, extra: (probeOf<{ extra: unknown }>(r)).extra })) : shootWithCrops("7-words", items);
let k = 0;
const sections = G.map((g) => {
  const rows = g.options.map((o) => {
    const m = out[k++]!.extra as { w: number; h: number; lines: number } | null;
    return `| ${o.key} | ${o.words} | ${m ? `${m.w} by ${m.h} px` : "not found"} | \`shots/7-words/${g.key}-${o.key}-2x.png\` |`;
  });
  return `## ${g.key}: ${g.question}\n\nSeat: ${g.seat}. Measured: \`${g.measure}\`.\n\n| option | words | its box | crop |\n|---|---|---|---|\n${rows.join("\n")}\n`;
});
writeFileSync(measureFile("7-words.md"), `# Item 7: every stand-in word, in its seat, measured\n\nEach candidate set into its seat on the real built pages at ${SHA.slice(0, 8)}, reduced motion (\`node out/1248/mock/seats-words.ts\` from the design tree), the Issue #1155 round's Primer page and step slip laid over them. "Its box" is the measured element's width and height: a candidate that wraps further than the stand-in stands taller than it. (\`node out/1248/mock/seats-words.ts report\` rewrites this file from the saved results without shooting again.) Every result came back with no 4xx and no console error.\n\n${sections.join("\n")}`);
console.log(sections.join("\n"));
