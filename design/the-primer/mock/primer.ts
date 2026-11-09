// Issue #1155 round: the guide page, rendered as HTML strings from the ladder data alone, so the page a contributor gets is exactly what the data says. Laid over the real built FAQ by a shot's script (inject.ts), so it wears the house's own document-room shell, nav, band and index slip. Every name here ("The Primer", "Try it", "Begin again") is a stand-in for the sitting to name.
import { LEANED_ON, seated, type Seated } from "./ladder/guide.ts";
import type { Ladder, Step, Words } from "./ladder/shape.ts";

export const NAME = "The Primer";
export const TAGLINE = "every room, one small step at a time";

const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];

/** A braced word drawn as the control it names, so the reader knows it on arrival. */
function chip(w: Words | undefined, text: string): string {
  if (w?.read === "road") {
    const [verb, ...room] = splitRoad(text);
    return `<span class="ch road"><i>${esc(verb)}</i> <b>${esc(room.join(" "))}</b></span>`;
  }
  if (w?.read === "option") return `<span class="ch opt">${esc(text)}</span>`;
  if (/^[☀-⟿]$/.test(text)) return `<span class="ch glyph">${esc(text)}</span>`;
  if (w && (w.css.includes(".land-end") || w.css.startsWith("label[") || w.read === "label" || w.css === "#sizes-label")) return `<span class="ch word">${esc(text)}</span>`;
  return `<span class="ch btn">${esc(text)}</span>`;
}

const ROOMS = ["The Explorer", "The Print Room", "The Reading Room", "The Portfolio", "The Wayfarer's Ribbon", "The Prospect", "The Sheet", "The Vegetation Plate", "The Engraving", "The Next Sheet"];
function splitRoad(text: string): string[] {
  const room = ROOMS.find((r) => text.endsWith(r));
  if (!room) return [text];
  return [text.slice(0, text.length - room.length).trim(), room];
}

export function actHtml(step: Step): string {
  return esc(step.act).replace(/\{([^}]+)\}/g, (_, t: string) => {
    const raw = t.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
    return chip(step.words.find((w) => w.says === raw || (w.match !== undefined && raw.startsWith(w.says))), raw);
  });
}

export interface PageOpts {
  readonly pictures?: (route: string, id: string) => string | null;
  readonly sealed?: ReadonlySet<string>;
  readonly ringed?: boolean;
  readonly nextRoads?: boolean;
  readonly only?: readonly string[];
  /** The sitting's view: marks the steps whose control waits on a post-use review. Never shown to a reader. */
  readonly sitting?: boolean;
}

const stepHtml = (ladder: Ladder, step: Step, n: number, o: PageOpts): string => {
  const key = `${ladder.route}#${step.id}`;
  const pic = o.pictures?.(ladder.route, step.id) ?? null;
  const seal = o.sealed?.has(key) ? `<span class="seal" title="done, kept in this browser">${n}</span>` : `<span class="num">${n}</span>`;
  const marks = [
    o.sitting && step.provisional ? `<span class="mark prov" title="${esc(step.provisional)}">for the sitting: its control waits on a review</span>` : "",
    step.only === "touch" ? `<span class="mark">on a tablet</span>` : "",
    step.only === "motion" ? `<span class="mark">with motion on</span>` : "",
    step.kind === "commission" ? `<span class="mark comm">a commission</span>` : step.kind === "play" ? `<span class="mark">play: no wrong answer</span>` : "",
  ].join("");
  const room = (step.at.split("#")[0] ?? "/").replace(/\/$/, "/");
  return `<li class="step${step.kind === "commission" ? " commission" : ""}${o.sealed?.has(key) ? " done" : ""}" id="${esc(ladder.route.replace(/\//g, "-").replace(/^-|-$/g, ""))}-${esc(step.id)}">
${seal}<div class="body"><p class="act">${actHtml(step)}</p><p class="see">${esc(step.see)}</p>
<p class="try"><a href="${esc(step.at)}">Try it</a><span class="in">opens ${esc(roomName(room))} at this step</span>${marks}</p></div>
${pic ? `<img class="pic" src="${esc(pic)}" alt="">` : `<span class="pic none"></span>`}</li>`;
};

const NAMES: Readonly<Record<string, string>> = {
  "/explorer/": "the Explorer",
  "/writing-room/": "the Writing Room",
  "/reading-room/": "the Reading Room",
  "/print-room/": "the Print Room",
  "/prospect/": "the Prospect",
  "/ribbon/": "the Ribbon",
  "/explorer/portfolio/": "the Portfolio",
  "/seed-of-the-day/": "Today",
  "/gallery/": "the Gallery",
};
const roomName = (route: string): string => NAMES[route] ?? route;

const secId = (route: string): string => route.replace(/\//g, "-").replace(/^-|-$/g, "") || "home";

function ladderHtml(s: Seated, next: Seated | null, o: PageOpts, sub: boolean): string {
  const l = s.ladder;
  let n = 0;
  const lessons = l.lessons
    .map((lesson, i) => {
      const steps = lesson.steps.map((st) => stepHtml(l, st, ++n, o)).join("\n");
      return `<section class="lesson" id="${secId(l.route)}-${lesson.id}"><h3><span class="rn">${ROMAN[i]}</span> ${esc(lesson.title)}<span class="gloss">${esc(lesson.gloss)}</span></h3>${lesson.aside ? `<p class="aside">${esc(lesson.aside)}</p>` : ""}<ol class="steps">${steps}</ol></section>`;
    })
    .join("\n");
  const road = o.nextRoads && next ? `<p class="next"><a href="#${secId(next.ladder.route)}"><i>Next, the steps of</i> <b>${esc(next.name)}</b></a></p>` : "";
  return `<section class="room${sub ? " sub" : ""}" id="${secId(l.route)}"><h2 id="${secId(l.route)}-h">${esc(s.name)}${sub ? `<span class="of">a room of ${esc(roomName(l.route === "/explorer/portfolio/" || l.route === "/prospect/" || l.route === "/ribbon/" ? "/explorer/" : l.route))}</span>` : ""}</h2>
<p class="what">${esc(l.what)}${l.entered ? ` <span class="entered">You come to it ${esc(l.entered)}.</span>` : ""}</p>${lessons}${road}</section>`;
}

export const stepCount = (): number => seated().reduce((n, s) => n + [s, ...s.under].reduce((m, x) => m + x.ladder.lessons.reduce((k, le) => k + le.steps.length, 0), 0), 0);
export const roomCount = (): number => seated().reduce((n, s) => n + 1 + s.under.length, 0);

export function opening(): string {
  return `<div class="opening"><p class="lede">Each step is one small thing to do, and each comes easy once the one before it is done.</p>
<p>Press <a class="inline-try" href="#explorer">Try it</a> beside a step and its room opens already set for that step, so you may begin anywhere and skip whatever you know. Nothing you do there can spoil a world: every world comes back from its number.</p></div>`;
}

export function closing(): string {
  return `<section class="closing" id="afterward"><p class="c-verb">Lean on these</p><h2 class="c-title" id="afterward-h">When the steps are done</h2>
<p class="c-where">for a quicker answer, any time</p>
<p>You may take these steps again whenever you like, from the first. <span class="ch btn">Begin again</span> clears the marks of the steps you have done from this browser, and touches nothing else: your worlds and your Chart Table stay as you left them.</p>
<p>For a quicker answer than a whole ladder, <a href="${LEANED_ON[0]}">Questions &amp; Answers</a> says how the worlds are made, and <a href="${LEANED_ON[1]}">the Glossary</a> says what every word on a chart means.</p>
<p class="c-foot"><a class="again" href="#top">Begin again</a></p></section>`;
}

export function sheetHtml(o: PageOpts = {}): string {
  const rooms = seated();
  const flat: Array<{ s: Seated; sub: boolean }> = rooms.flatMap((s) => [{ s, sub: false }, ...s.under.map((u) => ({ s: u, sub: true }))]);
  const shown = flat.filter(({ s }) => !o.only || o.only.includes(s.ladder.route));
  return `<div class="primer">${opening()}${shown.map(({ s, sub }, i) => ladderHtml(s, flat[flat.indexOf(shown[i]!) + 1]?.s ?? null, o, sub)).join("\n")}${closing()}</div>`;
}

export function indexHtml(): string {
  const item = (s: Seated, sub: boolean): string => {
    const n = s.ladder.lessons.reduce((k, l) => k + l.steps.length, 0);
    const lessons = s.ladder.lessons.map((l, i) => `<li data-for="${secId(s.ladder.route)}-${l.id}"><a href="#${secId(s.ladder.route)}-${l.id}">${ROMAN[i]} · ${esc(l.title)}</a></li>`).join("");
    return `<li data-sec="${secId(s.ladder.route)}" class="${sub ? "sub" : ""}"><a class="sec" href="#${secId(s.ladder.route)}">${esc(s.name)}<span class="count">${n}</span></a><ol class="entries">${lessons}</ol></li>`;
  };
  return seated().map((s) => item(s, false) + s.under.map((u) => item(u, true)).join("")).join("") + `<li data-sec="afterward" class="lean"><a class="sec" href="#afterward">When the steps are done</a></li>`;
}

export const PRIMER_CSS = `
.primer{max-width:46rem;margin:0 auto;color:var(--ink-dark)}
.primer .opening{border-bottom:1px solid var(--line-tan);padding-bottom:1.1rem;margin-bottom:1.6rem}
.primer .lede{font-family:var(--font-flourish);font-style:italic;font-size:1.32rem;line-height:1.35;color:var(--ink-brown);margin:0 0 .6rem}
.primer .opening p{margin:.3rem 0;font-size:1.04rem}
.primer h2{column-span:none;font-size:1.5rem;letter-spacing:.08em;margin:2.6rem 0 .5rem;border-bottom:1px solid var(--line-tan);padding-bottom:.25rem;display:flex;align-items:baseline;gap:.8rem}
.primer .room:first-of-type h2{margin-top:0}
.primer .room.sub{margin-left:1.6rem;padding-left:1.1rem;border-left:3px double var(--line-tan)}
.primer .room.sub h2{font-size:1.22rem}
.primer h2 .of{font-family:var(--font-flourish);font-style:italic;font-size:.95rem;letter-spacing:0;color:var(--ink-brown)}
.primer .what{font-size:1.05rem;margin:.2rem 0 1rem}
.primer .what .entered{font-family:var(--font-flourish);font-style:italic;color:var(--ink-brown)}
.primer h3{font-family:var(--font-display);font-weight:400;font-size:1.06rem;letter-spacing:.09em;margin:1.5rem 0 .4rem;display:flex;align-items:baseline;gap:.55rem;flex-wrap:wrap}
.primer h3 .rn{font-family:var(--font-flourish);font-style:italic;color:var(--ink-brown);letter-spacing:0}
.primer h3 .gloss{font-family:var(--font-flourish);font-style:italic;font-size:.92rem;letter-spacing:0;color:var(--ink-brown)}
.primer .aside{font-family:var(--font-flourish);font-style:italic;color:var(--ink-brown);margin:.1rem 0 .7rem;font-size:.98rem}
.primer ol.steps{list-style:none;margin:0;padding:0}
.primer li.step{display:grid;grid-template-columns:2.3rem 1fr 13.5rem;gap:0 1rem;padding:.75rem 0 .8rem;border-top:1px solid var(--line-faint);align-items:start}
.primer li.step .num{font-family:var(--font-display);font-size:1.05rem;color:var(--ink-brown);text-align:right;padding-top:.08rem}
.primer li.step .seal{justify-self:end;display:grid;place-items:center;width:1.9rem;height:1.9rem;border-radius:50%;background:radial-gradient(circle at 35% 30%,#a2392a,var(--iron-red) 70%);color:var(--parchment-bright);font-family:var(--font-display);font-size:.85rem;box-shadow:0 1px 2px rgb(from var(--chart-ink) r g b / .5),inset 0 0 0 2px rgb(255 255 255 / .12)}
.primer .act{margin:0;font-size:1.12rem;line-height:1.45;font-weight:600}
.primer .see{margin:.2rem 0 .35rem;font-family:var(--font-flourish);font-style:italic;color:var(--ink-brown);font-size:1.02rem;line-height:1.4}
.primer .try{margin:0;display:flex;align-items:baseline;flex-wrap:wrap;gap:.25rem .6rem;font-size:.9rem}
.primer .try a{font-family:var(--font-display);letter-spacing:.08em;font-size:.86rem;color:var(--ink-dark);background:var(--control-gold);border:1px solid var(--ink-dark);border-radius:3px;padding:.06rem .6rem .1rem;text-decoration:none}
.primer .try .in{font-family:var(--font-flourish);font-style:italic;color:var(--ink-brown)}
.primer .mark{font-size:.78rem;letter-spacing:.04em;font-variant-caps:small-caps;color:var(--ink-brown);border:1px dashed var(--line-tan);padding:0 .35rem;border-radius:2px}
.primer .mark.prov{border-color:#2f5d8a;color:#2f5d8a;border-style:solid}
.primer .mark.comm{border-style:solid;border-color:var(--iron-red);color:var(--iron-red)}
.primer .pic{width:13.5rem;height:auto;border:1px solid var(--line-tan);box-shadow:0 3px 9px rgb(from var(--chart-ink) r g b / .25);display:block}
.primer .pic.none{border:none;box-shadow:none}
.primer li.commission{background:linear-gradient(90deg,rgb(from var(--control-gold) r g b / .55),transparent 80%)}
.primer .ch{font-weight:400;white-space:nowrap;font-size:.95em;padding:0 .34em .04em;border-radius:3px;border:1px solid var(--ink-faded);background:var(--control-cream);color:var(--ink-dark)}
.primer .ch.opt::after{content:" \\25BE";font-size:.75em;color:var(--ink-brown)}
.primer .ch.word{border:none;background:none;padding:0;font-variant-caps:small-caps;letter-spacing:.03em;border-bottom:1px dotted var(--ink-brown);border-radius:0}
.primer .ch.glyph{font-family:var(--font-serif-fallback);font-size:1.05em}
.primer .ch.road{background:var(--control-gold);border-color:var(--ink-dark)}
.primer .ch.road i{font-family:var(--font-flourish);font-size:.92em}
.primer .ch.road b{font-family:var(--font-display);font-weight:400;font-size:.86em;letter-spacing:.07em}
.primer .ch.btn{font-family:var(--font-body)}
.primer .next{margin:1.2rem 0 0;text-align:right}
.primer .next a{display:inline-block;text-decoration:none;color:var(--ink-dark);background:var(--control-gold);border:1px solid var(--ink-dark);border-radius:3px;padding:.25rem .8rem}
.primer .next i{font-family:var(--font-flourish);display:block;font-size:.85rem}
.primer .next b{font-family:var(--font-display);font-weight:400;letter-spacing:.08em}
.primer .closing{margin:3rem 0 0;padding:1.4rem 1.6rem 1.2rem;border:1px solid var(--ink-dark);outline:3px double var(--line-tan);outline-offset:5px;background:var(--parchment-bright)}
.primer .closing .c-verb{margin:0;font-family:var(--font-flourish);font-style:italic;color:var(--ink-brown)}
.primer .closing .c-title{border:none;margin:.1rem 0 0;padding:0;font-size:1.5rem}
.primer .closing .c-where{margin:0 0 .8rem;font-family:var(--font-display);font-size:.74rem;letter-spacing:.12em;color:var(--ink-brown)}
.primer .closing p{font-size:1.06rem}
.primer .closing .c-foot{text-align:right;margin:.6rem 0 0}
.primer .closing .again{font-family:var(--font-display);letter-spacing:.08em;color:var(--parchment-bright);background:var(--ink-dark);border-radius:3px;padding:.2rem .9rem;text-decoration:none}
#index .index > li.sub{margin-left:1rem}
#index .index > li.lean{margin-top:.6rem}
`;
