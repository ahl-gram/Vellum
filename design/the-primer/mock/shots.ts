// Issue #1155 round: the still list. Today's look as the control, then each direction laid over the real built pages at 1280 by 800 (and 1024 by 768 where the floor matters), each at full scale and as a 2x crop, then where the guide is reached from. Writes `measure/stills-shots.json` and `measure/stills-meta.json`; shoot with --site <tree>/out/1155/site --reduced-motion.
// node out/1155/mock/shots.ts tops   (shoot measure/tops-shots.json into measure/tops-results.json)   then   node out/1155/mock/shots.ts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { script, type Act } from "./drive.ts";
import { learnPressJs, navJs, primerJs, relayJs, ringJs, styleJs, type PrimerPage, type StripOpts } from "./inject.ts";
import { EXPLORER } from "./ladder/explorer.ts";
import { PRINT_ROOM, PROSPECT, READING_ROOM, RIBBON } from "./ladder/rooms.ts";
import type { Step } from "./ladder/shape.ts";
import { OUT_1155 } from "./paths.ts";
import { pictureUrl } from "./pictures.ts";
import { chartOfLessons, CHART_CSS } from "./chart-of-lessons.ts";
import { schoolroomJs, schoolroomDoneJs } from "./schoolroom.ts";

const SEALED = new Set(["/explorer/#dice", "/explorer/#draw", "/explorer/#enter"]);
const stepOf = (lessons: typeof EXPLORER.lessons, lesson: string, id: string): Step =>
  lessons.find((l) => l.id === lesson)!.steps.find((s) => s.id === id)!;

const FOLDED = `.primer .room:not(#explorer) .lesson,.primer .room:not(#explorer) .next{display:none}.primer .room:not(#explorer) h2::after{content:"open these steps \\203A";margin-left:auto;font-family:var(--font-display);font-size:.72rem;letter-spacing:.1em;color:var(--ink-dark);background:var(--control-gold);border:1px solid var(--ink-dark);border-radius:3px;padding:.1rem .5rem}.primer .room:not(#explorer){margin-bottom:.4rem}`;
type Variant = { readonly key: string; readonly page: PrimerPage };
const PAGES: readonly Variant[] = [
  { key: "a", page: { seat: "ninth", label: "Primer", pictures: pictureUrl, sealed: SEALED, nextRoads: true } },
  { key: "a-plain", page: { seat: "ninth", label: "Primer", nextRoads: true } },
  { key: "a-folded", page: { seat: "ninth", label: "Primer", pictures: pictureUrl, sealed: SEALED, nextRoads: true, extraCss: FOLDED } },
  { key: "a-sitting", page: { seat: "ninth", label: "Primer", pictures: pictureUrl, nextRoads: true, sitting: true } },
  { key: "e", page: { seat: "ninth", label: "Primer", pictures: pictureUrl, sealed: SEALED, nextRoads: true, top: chartOfLessons(SEALED), extraCss: CHART_CSS } },
];
const TOPS = `JSON.stringify(Object.fromEntries([["_height",document.documentElement.scrollHeight],...[...document.querySelectorAll(".primer section[id], .primer li.step[id], .col1155")].map((e)=>[e.id,Math.round(e.getBoundingClientRect().top+scrollY)])]))`;

type Meta = { readonly file: string; readonly dir: string; readonly caption: string; readonly kind: "full" | "crop" };
const shots: object[] = [];
const metas: Meta[] = [];

function add(file: string, dir: string, caption: string, url: string, acts: readonly Act[], o: { w?: number; h?: number; clip?: { x: number; y: number; width: number; height: number; scale?: number }; full?: boolean } = {}): void {
  const w = o.w ?? 1280,
    h = o.h ?? 800;
  shots.push({
    url,
    width: w,
    height: h,
    mobile: false,
    out: join(OUT_1155, "shots", "stills", file),
    waitMs: 400,
    script: script(acts),
    scriptWaitMs: 500,
    probe: "document.documentElement.scrollWidth",
    ...(o.clip ? { clip: o.clip } : {}),
    ...(o.full ? { full: true } : {}),
  });
  metas.push({ file, dir, caption, kind: o.clip?.scale === 2 ? "crop" : "full" });
}

const pair = (base: string, dir: string, caption: string, url: string, acts: readonly Act[], crop: { x: number; y: number; width: number; height: number }, o: { w?: number; h?: number; scrollY?: number } = {}): void => {
  const y = o.scrollY ?? 0;
  add(`${base}.png`, dir, caption, url, acts, { w: o.w, h: o.h, clip: { x: 0, y, width: o.w ?? 1280, height: o.h ?? 800 } });
  add(`${base}-2x.png`, dir, `${caption}, at twice its size`, url, acts, { w: o.w, h: o.h, clip: { ...crop, y: crop.y + y, scale: 2 } });
};

const mode = process.argv[2] ?? "stills";
if (mode === "tops") {
  const list = PAGES.map((v) => ({ url: "/faq/", width: 1280, height: 800, mobile: false, out: join(OUT_1155, "measure", "tops", `${v.key}.png`), waitMs: 400, script: script([{ kind: "eval", js: primerJs(v.page) }]), scriptWaitMs: 400, probe: TOPS }));
  mkdirSync(join(OUT_1155, "measure", "tops"), { recursive: true });
  writeFileSync(join(OUT_1155, "measure", "tops-shots.json"), JSON.stringify(list, null, 1));
  console.log(`${list.length} shots`);
} else {
  const topsRaw = JSON.parse(readFileSync(join(OUT_1155, "measure", "tops-results.json"), "utf8")) as Array<{ probe: string }>;
  const tops = Object.fromEntries(PAGES.map((v, i) => [v.key, JSON.parse(topsRaw[i]!.probe) as Record<string, number>]));
  const at = (key: string, id: string, above = 190): number => Math.min(Math.max(0, (tops[key]![id] ?? 0) - above), (tops[key]!["_height"] ?? 0) - 800);
  const page = (key: string, extra = "", scroll?: number): Act[] => {
    const v = PAGES.find((p) => p.key === key)!;
    return [{ kind: "eval", js: primerJs(v.page) + extra + (scroll !== undefined ? `window.scrollTo(0,${scroll});for(let k=0;k<8;k++)await tick();` : "") }];
  };

  // Today's look, the control. The Portfolio's bare plate is shot first, in the browser's fresh profile, so nothing has been laid on its table.
  pair("control-portfolio-plate", "control", "Today: the Portfolio's first visit, its three-step plate, the house's one piece of in-page how-to", "/explorer/portfolio/", [], { x: 85, y: 141, width: 655, height: 546 });
  // 2026-11-05: the answer stands at 2991 px down the built FAQ at 1280 by 800 and the page scrolls 2738 px at most (probes of the built page), so the shot scrolls as far as it goes.
  const faqY = 2738;
  pair("control-faq", "control", "Today: Questions & Answers at its nearest thing to a step, 'I found a map I love'", "/faq/", [{ kind: "eval", js: `{const e=document.getElementById("i-found-a-map-i-love-how-do-i-get-it-back");window.scrollTo(0,${faqY});for(let k=0;k<8;k++)await tick();}` }], { x: 30, y: 150, width: 700, height: 360 }, { scrollY: faqY });
  pair("control-footnote", "control", "Today: help in place, the shape row's note open on the Broadside", "/explorer/#seed=42", [{ kind: "eval", js: `{const a=document.querySelector('a.fn[data-note="note-shape"]');a.focus();a.dispatchEvent(new PointerEvent("pointerenter",{bubbles:true,pointerType:"mouse"}));a.dispatchEvent(new MouseEvent("mouseenter",{bubbles:true}));for(let k=0;k<10;k++)await tick();}` }], { x: 780, y: 200, width: 480, height: 340 });

  // A, the Primer: a reading page laid over the FAQ's document room.
  pair("a-top", "a", "A, the Primer: its first screen, the ninth item on the nav, the index of rooms with the subrooms under the Explorer, the first three steps sealed", "/faq/", page("a"), { x: 110, y: 330, width: 780, height: 470 });
  pair("a-land", "a", "A: the Land, each control drawn as itself in the sentence, the room once done beside it", "/faq/", page("a", "", at("a", "explorer-land")), { x: 110, y: 180, width: 780, height: 480 }, { scrollY: at("a", "explorer-land") });
  pair("a-subroom", "a", "A: a subroom's ladder, the Wayfarer's Ribbon, seated under the Explorer", "/faq/", page("a", "", at("a", "ribbon")), { x: 110, y: 180, width: 780, height: 480 }, { scrollY: at("a", "ribbon") });
  pair("a-next", "a", "A: a ladder's foot, its commission and the road on to the next room's steps", "/faq/", page("a", "", at("a", "prospect", 560)), { x: 110, y: 160, width: 780, height: 520 }, { scrollY: at("a", "prospect", 560) });
  pair("a-closing", "a", "A: the closing note, what to lean on afterwards and how to begin again", "/faq/", page("a", "", at("a", "afterward", 300)), { x: 110, y: 230, width: 780, height: 470 }, { scrollY: at("a", "afterward", 300) });
  pair("a-plain-land", "a", "A without the pictures: the Land as words and drawn controls alone", "/faq/", page("a-plain", "", at("a-plain", "explorer-land")), { x: 110, y: 180, width: 780, height: 480 }, { scrollY: at("a-plain", "explorer-land") });
  pair("a-sitting-land", "a", "For the sitting only, never for a reader: the Land with every step whose control waits on the Broadside's post-use review marked in blue", "/faq/", page("a-sitting", "", at("a-sitting", "explorer-land")), { x: 110, y: 180, width: 780, height: 480 }, { scrollY: at("a-sitting", "explorer-land") });
  pair("a-1024", "a", "A at the 1024 by 768 floor", "/faq/", page("a"), { x: 20, y: 300, width: 680, height: 420 }, { w: 1024, h: 768 });
  add("a-folded-full.png", "a", "A laid one room at a time: the Explorer's steps open, every other room folded to its head and what it is, the whole page at a glance", "/faq/", page("a-folded"), { full: true });
  add("a-try-it-lands.png", "a", "A: where a step's Try it lands, the real Explorer at that step's own address (islands, seed 42 as an archipelago)", "/explorer/#seed=42&type=archipelago", []);

  // B, the Schoolroom: a working room on the Explorer's engine, the slip turned into the lesson and only the taught control to hand.
  pair("b-before", "b", "B, the Schoolroom: step 4, the real type row left in its own panel and every row not yet reached withheld, the Glass, the Press and the Drawer withheld too", "/explorer/#seed=42", [{ kind: "eval", js: schoolroomJs() }], { x: 780, y: 130, width: 480, height: 560 });
  pair("b-after", "b", "B: the same step once done, the chart redrawn as an archipelago by the real control, and the next row brought out", "/explorer/#seed=42", [{ kind: "eval", js: schoolroomJs() + schoolroomDoneJs() }], { x: 780, y: 130, width: 480, height: 560 });
  add("b-1024.png", "b", "B at the 1024 by 768 floor", "/explorer/#seed=42", [{ kind: "eval", js: schoolroomJs() }], { w: 1024, h: 768 });

  // C, a tour inside each room.
  const land = stepOf(EXPLORER.lessons, "land", "archipelago");
  const tour = (step: Step, head: string, done?: string): StripOpts => ({ verb: "Learning the room", head, step, dots: { total: 6, done: 0 }, left: [`<a href="#">Leave the lesson</a>`], right: [`<a href="#" class="dim">Skip</a>`], ...(done ? { done: { next: done } } : {}), seat: { css: "#broadside", side: "left" } });
  pair("c-entry", "c", "C, a tour inside the room: its way in, a press on the trail's line beside the chart of the atelier's, in every room", "/explorer/#seed=42", [{ kind: "eval", js: learnPressJs("learn this room") + relayJs }], { x: 0, y: 0, width: 700, height: 150 });
  pair("c-explorer", "c", "C: the Explorer's tour at the Land's first step, the type list ringed where it stands", "/explorer/#seed=42", [{ kind: "eval", js: learnPressJs("learn this room") + ringJs("[data-row=type]", tour(land, "The Land, step 1 of 6")) }], { x: 380, y: 160, width: 860, height: 420 });
  pair("c-explorer-done", "c", "C: the same step once the reader has chosen archipelago, the tour seeing it done", "/explorer/#seed=42", [{ kind: "set", css: "#type", value: "archipelago" }, { kind: "eval", js: learnPressJs("learn this room") + ringJs("[data-row=type]", tour(land, "The Land, step 1 of 6", "Next, islands ›")) }], { x: 380, y: 160, width: 860, height: 420 });
  const play = stepOf(READING_ROOM.lessons, "watch", "play");
  pair("c-reading-room", "c", "C: the Reading Room's tour, Play ringed", "/reading-room/#seed=42", [{ kind: "eval", js: learnPressJs("learn this room") + ringJs(".rf-play", { ...tour(play, "Watch a world live, step 1 of 6"), seat: { x: 120, y: 330 } }) }], { x: 0, y: 300, width: 760, height: 500 });
  const bind = stepOf(PRINT_ROOM.lessons, "atlas", "bind");
  pair("c-print-room", "c", "C: the Print Room's tour, Bind the atlas ringed", "/print-room/#seed=42", [{ kind: "eval", js: learnPressJs("learn this room") + ringJs("#pr-bind", { ...tour(bind, "The Bound Atlas, step 1 of 3"), seat: { css: "#pr-bind", side: "left" } }) }], { x: 380, y: 140, width: 880, height: 440 });

  // D, the Primer and the pointing hand: A's page, and on arrival the room rings the step's control and knows when it is done.
  const islands = stepOf(EXPLORER.lessons, "land", "islands");
  const fromPrimer = (step: Step, head: string, total: number, doneAt: number, ring: string, done?: string, seat?: StripOpts["seat"]): StripOpts => ({
    verb: "From The Primer",
    head,
    step,
    dots: { total, done: doneAt },
    left: [`<a href="/primer/#explorer-land">Back to The Primer</a>`],
    right: [`<a href="#" class="dim">Next step</a>`],
    ...(done ? { done: { next: done } } : {}),
    seat: seat ?? { css: ring, side: "left" },
  });
  pair("d-explorer", "d", "D, the Primer and the pointing hand: Try it on the Land's second step lands with the islands row ringed and the step in hand", "/explorer/#seed=42&type=archipelago", [{ kind: "eval", js: ringJs("[data-row=islands]", fromPrimer(islands, "The Explorer · the Land, step 2 of 6", 6, 1, "#broadside")) }], { x: 380, y: 160, width: 860, height: 440 });
  pair("d-explorer-done", "d", "D: the same step once the islands slider is let go: the room sees the readout move and offers the next step", "/explorer/#seed=42&type=archipelago", [{ kind: "set", css: "#islands", value: "20" }, { kind: "eval", js: ringJs("[data-row=islands]", fromPrimer(islands, "The Explorer · the Land, step 2 of 6", 6, 1, "#broadside", "Next, sizes ›")) }], { x: 380, y: 160, width: 860, height: 440 });
  const year = stepOf(PROSPECT.lessons, "plate", "year");
  pair("d-prospect", "d", "D on a subroom: the Prospect's year step, the year box ringed", "/prospect/#seed=42&i=0", [{ kind: "eval", js: ringJs("#pp-year-form", fromPrimer(year, "The Prospect · step 3 of 5", 5, 2, "#pp-year-form", undefined, { css: "#pp-year-form", side: "below" })) }], { x: 600, y: 0, width: 680, height: 420 });
  const lean = stepOf(RIBBON.lessons, "road", "lean");
  pair("d-ribbon", "d", "D on a subroom: the Ribbon's lean step, a row of the itinerary ringed", "/ribbon/#seed=42&a=0", [{ kind: "eval", js: ringJs("#rb-itinerary li:nth-child(4) .lean", fromPrimer(lean, "The Wayfarer's Ribbon · step 4 of 6", 6, 3, "#rb-itinerary li:nth-child(4) .lean")) }], { x: 380, y: 300, width: 880, height: 440 });

  // E, the chart of lessons: the Primer opened on a chart of the atelier drawn large, every room a place, every lesson a waypoint, the steps done inked.
  pair("e-chart", "e", "E, the chart of lessons: the Primer opens on the atelier's own chart drawn large, each lesson a waypoint on the road, those done inked", "/faq/", page("e"), { x: 110, y: 190, width: 780, height: 560 });

  // Where the guide is reached from.
  const ROOMS = ["/explorer/#seed=42", "/print-room/#seed=42", "/ribbon/#seed=42&a=0", "/writing-room/", "/reading-room/#seed=42", "/prospect/#seed=42&i=0", "/gallery/", "/faq/", "/seed-of-the-day/", "/explorer/portfolio/"];
  for (const r of ROOMS) {
    const name = r.split("/")[1] || "home";
    add(`p-ninth-${name === "explorer" && r.includes("portfolio") ? "portfolio" : name}-1024.png`, "p", `A ninth item on the nav, Primer, at the 1024 floor: ${name}`, r, [{ kind: "eval", js: navJs("ninth", "Primer", false) + relayJs }], { w: 1024, h: 768, clip: { x: 0, y: 0, width: 1024, height: 200 } });
  }
  pair("p-child", "p", "The Primer as a child of Questions & Answers: off the nav's top line, named by the trail", "/faq/", page("a").map((a) => (a.kind === "eval" ? { ...a, js: a.js.replace(navJs("ninth", "Primer", true, "The Primer"), navJs("child", "The Primer", true)) } : a)), { x: 0, y: 0, width: 700, height: 150 });
  pair("p-road", "p", "A road out to the guide from the room's own press row, here the Explorer's", "/explorer/#seed=42", [{ kind: "eval", js: `{const row=document.querySelector(".legend .legend-row")||document.querySelector(".legend");const a=document.createElement("a");a.className="legend-btn";a.href="/primer/#explorer";a.innerHTML='<span class="verb">Learn this room in</span><span class="room">The Primer</span>';row.appendChild(a);}` + relayJs }], { x: 300, y: 620, width: 700, height: 180 });
  pair("p-home", "p", "Home's How It Works card, with a road out to the guide", "/", [{ kind: "eval", js: `{const b=document.querySelector('.lf-station[data-station="how"]');if(b)b.click();for(let k=0;k<10;k++)await tick();const c=document.getElementById("lf-card-how");const a=document.createElement("a");a.className="lf-card-enter";a.href="/primer/";a.textContent="Learn every room, one small step at a time \\u2192";c.appendChild(a);for(let k=0;k<4;k++)await tick();}` }], { x: 640, y: 80, width: 640, height: 640 });

  mkdirSync(join(OUT_1155, "shots", "stills"), { recursive: true });
  writeFileSync(join(OUT_1155, "measure", "stills-shots.json"), JSON.stringify(shots, null, 1));
  writeFileSync(join(OUT_1155, "measure", "stills-meta.json"), JSON.stringify(metas, null, 1));
  console.log(`${shots.length} shots`);
}
