// Home's dress at rest as the browser resolves it (Issue #779 part 2f, the source-text tests moved here): the corner chrome and the legend row on their panel, the notice, the how panel, the faces, the seedrow's corners, the slips' box, and the veil's and the house's reduced-motion stills. Read on the landfall suite's settled home at 1280x800.
import { buttonPoint } from "../../support/home.ts";
import { GRADIENT_STOPS, luminance, nearRgba, PAGE_RGBA, sampleRow, tokenRgba } from "../../support/pixel.ts";
import type { Rgba } from "../../support/pixel.ts";
import { contrast } from "../cluster/trail.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import type { LandfallKit } from "./kit.ts";

type Box = { x: number; y: number; w: number; h: number };
const PANEL: readonly Rgba[] = [tokenRgba("--chart-ink", 0.85), tokenRgba("--chart-ink", 0.72)];
const PARCHMENT = tokenRgba("--parchment");
const paneled = (stops: number[][]) => stops.length === PANEL.length && stops.every((s, i) => nearRgba(s, PANEL[i]!));

const BOX = `((e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })`;

// The ground under a line of text: the median pixel of a one-row strip just clear of the line, inside its panel.
async function groundOf({ send }: SuiteContext, b: Box, dy: number): Promise<[number, number, number]> {
  const row = await sampleRow(send, Math.round(b.x), Math.round(dy < 0 ? b.y + dy : b.y + b.h + dy), Math.round(b.w));
  return [...row].sort((p, q) => luminance(p) - luminance(q))[Math.floor(row.length / 2)]!;
}
const ratio = (ink: number[], ground: [number, number, number]) => contrast([ink[0]!, ink[1]!, ink[2]!], ground);

type Corner = {
  pe: [string, string];
  through: boolean[];
  input: boolean;
  panel: number[][];
  inks: number[][];
  boxes: Box[];
  bare: Box;
  nowrap: string;
  minWidth: string;
};

const CORNER: Payload<Corner> = `(() => {
  const rgba = ${PAGE_RGBA}, stops = ${GRADIENT_STOPS}, box = ${BOX}, q = (s) => document.querySelector(s), cs = (s) => getComputedStyle(q(s));
  const at = (s) => { const b = box(q(s)); return document.elementFromPoint(b.x + b.w / 2, b.y + b.h / 2); };
  const seed = box(q(".lf-seed"));
  return { pe: [cs(".lf-seed").pointerEvents, cs(".seed-controls").pointerEvents],
    through: [".seed-hook", ".seed-gloss"].map((s) => { const h = at(s); return !!h && !h.closest(".lf-seed") && !!h.closest("#lf-stage"); }),
    input: at("#seed-input") === q("#seed-input"), panel: stops(cs(".lf-seed").backgroundImage),
    inks: [rgba(cs(".seed-hook").color), rgba(cs(".seed-gloss").color)], boxes: [box(q(".seed-hook")), box(q(".seed-gloss"))],
    bare: { x: seed.x - 120, y: seed.y + seed.h + 40, w: 100, h: 1 },
    nowrap: cs(".lf-seed .primary").whiteSpace, minWidth: cs(".lf-seed .control").minWidth };
})()`;

export async function l18Corner(k: LandfallKit): Promise<void> {
  await k.scrollToTop();
  const c = await k.evaluate(CORNER);
  const grounds = [await groundOf(k, c.boxes[0]!, -3), await groundOf(k, c.boxes[1]!, 3)];
  const ratios = c.inks.map((ink, i) => ratio(ink, grounds[i]!));
  const bare = ratio(c.inks[1]!, await groundOf(k, c.bare, 0));
  k.check(
    "L18 the corner chrome passes the hand through its text to the chart and takes it back at the seed controls; its hook and gloss wear parchment on the crisp two-stop panel, each reading 4.5:1 or better on it where the same ink over bare chart reads under; Draw it never wraps and the input may yield (#470 plate-reader findings)",
    c.pe[0] === "none" &&
      c.pe[1] === "auto" &&
      c.through.every(Boolean) &&
      c.input &&
      paneled(c.panel) &&
      c.inks.every((i) => nearRgba(i, PARCHMENT)) &&
      ratios.every((r) => r >= 4.5) &&
      bare < 4.5 &&
      c.nowrap === "nowrap" &&
      c.minWidth === "0px",
    JSON.stringify({ ...c, ratios, bare }),
  );
}

type Legend = {
  panel: number[][];
  seed: number[][];
  inks: number[][];
  boxes: Box[];
  pe: [string, string];
  through: boolean;
};

const LEGEND: Payload<Legend> = `(() => {
  const rgba = ${PAGE_RGBA}, stops = ${GRADIENT_STOPS}, box = ${BOX}, q = (s) => document.querySelector(s), cs = (s) => getComputedStyle(q(s));
  const head = box(q(".lf-legend-head")), hit = document.elementFromPoint(head.x + head.w / 2, head.y + head.h / 2);
  return { panel: stops(cs(".lf-legend").backgroundImage), seed: stops(cs(".lf-seed").backgroundImage),
    inks: [rgba(cs(".lf-legend-head").color), rgba(cs(".lf-legend-verb").color)], boxes: [head, box(q(".lf-legend-verb"))],
    pe: [cs(".lf-legend").pointerEvents, cs(".lf-legend-btn").pointerEvents], through: !!hit && !hit.closest(".lf-legend") };
})()`;

export async function l19Legend(k: LandfallKit): Promise<void> {
  await k.scrollToTop();
  const l = await k.evaluate(LEGEND);
  const ratios = [
    ratio(l.inks[0]!, await groundOf(k, l.boxes[0]!, -3)),
    ratio(l.inks[1]!, await groundOf(k, l.boxes[1]!, -2)),
  ];
  k.check(
    "L19 the legend row stands on the seed box's own crisp panel, stop for stop, its head and verb lines in parchment reading 4.5:1 or better there; the row passes the hand through to the stations beneath and its presses take it back (the 2026-09-03 sitting, rulings 11, 23 and 24 on #454)",
    paneled(l.panel) &&
      paneled(l.seed) &&
      l.inks.every((i) => nearRgba(i, PARCHMENT)) &&
      ratios.every((r) => r >= 4.5) &&
      l.pe[0] === "none" &&
      l.pe[1] === "auto" &&
      l.through,
    JSON.stringify({ ...l, ratios }),
  );
}

type Stamp = {
  turn: number;
  outline: [string, string];
  pe: string;
  head: [string, string, number[], string];
  body: [string, number[]];
};

const STAMP: Payload<Stamp> = `(() => {
  const rgba = ${PAGE_RGBA}, cs = (s) => getComputedStyle(document.querySelector(s)), s = cs(".notice-stamp"), h = cs(".stamp-head"), b = cs(".stamp-body");
  const m = new DOMMatrixReadOnly(s.transform);
  return { turn: Math.round(Math.atan2(m.b, m.a) * 1800 / Math.PI) / 10, outline: [s.outlineWidth, s.outlineStyle], pe: s.pointerEvents,
    head: [h.fontSize, h.letterSpacing, rgba(h.color), h.textTransform], body: [b.fontStyle, rgba(b.color)] };
})()`;

export async function l21Stamp({ evaluate, check }: SuiteContext): Promise<void> {
  const s = await evaluate(STAMP);
  check(
    "L21 the Notice to Mariners stamps the deep as the mockup does: turned five degrees back, a 3px double rule, never a control; its head the mockup's 0.72rem at 0.28em in line-tan as written, its body the flourish italic in ink-faded (#459, the #324 re-ratification)",
    s.turn === -5 &&
      s.outline[0] === "3px" &&
      s.outline[1] === "double" &&
      s.pe === "none" &&
      s.head[0] === "11.52px" &&
      s.head[1] === "3.2256px" &&
      nearRgba(s.head[2], tokenRgba("--line-tan")) &&
      s.head[3] === "none" &&
      s.body[0] === "italic" &&
      nearRgba(s.body[1], tokenRgba("--ink-faded")),
    JSON.stringify(s),
  );
}

const PANEL_DRESS: Payload<{ cap: string; width: [string, string]; scroll: [string, string] }> = `(() => {
  const cs = (s) => getComputedStyle(document.querySelector(s)), how = cs("#lf-card-how"), sc = cs("#lf-card-how .lf-card-scroll");
  return { cap: how.maxHeight, width: [how.width, cs("#lf-card-atlas").width], scroll: [sc.overflowY, sc.overscrollBehaviorY] };
})()`;

export async function l22PanelDress({ evaluate, check }: SuiteContext): Promise<void> {
  const p = await evaluate(PANEL_DRESS);
  check(
    "L22 the how panel caps its own height 3rem short of the stage, at the station slips' own width, and its prose scrolls inside it without chaining down to the page (#459, skeptic round 3; Issue #762)",
    p.cap === "calc(100% - 48px)" && p.width[0] === p.width[1] && p.scroll[0] === "auto" && p.scroll[1] === "contain",
    JSON.stringify(p),
  );
}

const FLOURISH = [
  ".lf-shelf-grid figcaption",
  ".underhood",
  ".seed-hook",
  ".seed-gloss",
  ".lf-legend-head",
  ".lf-legend-verb",
  ".lf-more",
  ".lf-card-verb",
  ".lf-station-verb",
  ".stamp-body",
];
const DISPLAY = [
  ".lf-shelf-head",
  ".lf-card-title",
  ".stamp-head",
  ".lf-legend-room",
  ".lf-station-name",
  ".lf-seed .primary",
  ".lf-card-enter",
];

export async function l25Faces({ evaluate, check }: SuiteContext): Promise<void> {
  const faces = await evaluate<Record<string, string | null>>(
    `Object.fromEntries(${JSON.stringify([...FLOURISH, ...DISPLAY])}.map((s) => { const e = document.querySelector(s); return [s, e && getComputedStyle(e).fontFamily]; }))`,
  );
  const off = [
    ...FLOURISH.filter((s) => !/^"IM Fell English",/.test(faces[s] ?? "")),
    ...DISPLAY.filter((s) => !/^"IM Fell English SC",/.test(faces[s] ?? "")),
  ];
  check(
    "L25 home's flourishes speak in the flourish face and its titles and heads in the display face: the shelf's captions, the underhood, the corner's lines, the legend's, the slips' and the stations' verbs, the stamp's body; the shelf's head, the slips' titles and doors, the stamp's head, the legend's rooms, the stations' names and Draw it (#228, #324)",
    off.length === 0,
    off.map((s) => `${s}: ${faces[s]}`).join(" | ") || `${FLOURISH.length + DISPLAY.length} wearers`,
  );
}

export async function l26Corners({ evaluate, check }: SuiteContext): Promise<void> {
  const radii = await evaluate<string[]>(
    `["#seed-input", ".lf-seed .primary"].map((s) => getComputedStyle(document.querySelector(s)).borderRadius)`,
  );
  check(
    "L26 home's seed input and Draw it wear the control idiom's 4px corners, not the seedrow's old 2px skin (#324, Issue #709)",
    radii.every((r) => r === "4px"),
    JSON.stringify(radii),
  );
}

type Pips = { pulses: string[][]; sea: [string, string]; land: number; slips: number[]; transition: [string, string] };

const PIPS: Payload<Pips> = `(() => {
  const cs = (s) => getComputedStyle(document.querySelector(s)), land = new DOMMatrixReadOnly(cs(".lf-station:not(.at-sea) .lf-station-glyph").transform), btn = cs(".lf-station");
  return { pulses: [...document.querySelectorAll(".lf-pulse")].map((p) => [getComputedStyle(p).animationName, ...p.getAnimations().map((a) => a.animationName + ":" + a.playState)]),
    sea: [cs(".lf-station.at-sea .lf-station-glyph").borderRadius, cs(".lf-station.at-sea .lf-station-glyph").transform], land: Math.round(Math.atan2(land.b, land.a) * 180 / Math.PI),
    slips: [...document.querySelectorAll(".lf-station-slip")].map((s) => getComputedStyle(s).display === "none" ? 0 : s.getBoundingClientRect().width),
    transition: [btn.transitionProperty, btn.transitionDuration] };
})()`;
type PipAt = { x: number; y: number; fx: number; fy: number; w: number; h: number; t: number };

// The pip's centre as a fraction of the sheet's own box, which the idle drift carries with it, so only a shift of the pip on the sheet reads as one.
const PIP_AT: Payload<PipAt> = `(() => {
  const p = document.querySelector('.lf-station[data-station="atlas"]').getBoundingClientRect(), s = document.getElementById("lf-sheet").getBoundingClientRect();
  const x = p.x + p.width / 2, y = p.y + p.height / 2;
  return { x, y, fx: (x - s.x) / s.width, fy: (y - s.y) / s.height, w: s.width, h: s.height, t: performance.now() };
})()`;
const REDUCED_PULSE: Payload<string[]> =
  `[...document.querySelectorAll(".lf-pulse")].map((p) => getComputedStyle(p).animationName)`;
const SLIPS_SHOWN: Payload<number[]> =
  `[...document.querySelectorAll(".lf-station-slip")].map((s) => getComputedStyle(s).display === "none" ? 0 : s.getBoundingClientRect().width)`;

const slides = ([props, durations]: [string, string]) => {
  const d = durations.split(", ");
  return props.split(", ").some((p, i) => (p === "transform" || p === "all") && parseFloat(d[i % d.length]!) > 0);
};

// The press is released where it was made, so it is a tap: the slip it opens is set aside again before the next read.
async function heldPip(k: LandfallKit): Promise<{ shift: number; gap: number }> {
  const { evaluate, send, sleep, pressKey } = k;
  await evaluate(buttonPoint('.lf-station[data-station="atlas"]'));
  const rest = await evaluate(PIP_AT);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: rest.x, y: rest.y, button: "left", clickCount: 1 });
  try {
    await sleep(300);
    const held = await evaluate(PIP_AT);
    return { shift: Math.hypot((held.fx - rest.fx) * held.w, (held.fy - rest.fy) * held.h), gap: held.t - rest.t };
  } finally {
    await send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x: rest.x,
      y: rest.y,
      button: "left",
      clickCount: 1,
    });
    await sleep(300);
    await pressKey("Escape", "Escape", 27);
    await sleep(500);
  }
}

async function narrowSlips({ evaluate, send }: SuiteContext): Promise<number[]> {
  await send("Emulation.setDeviceMetricsOverride", { width: 640, height: 800, deviceScaleFactor: 1, mobile: false });
  try {
    return await evaluate(SLIPS_SHOWN);
  } finally {
    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  }
}

async function reducedPulses({ evaluate, send }: SuiteContext): Promise<string[]> {
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  try {
    return await evaluate(REDUCED_PULSE);
  } finally {
    await send("Emulation.setEmulatedMedia", { features: [] });
  }
}

export async function l20Stations(k: LandfallKit): Promise<void> {
  const pips = await k.evaluate(PIPS);
  const reduced = await reducedPulses(k);
  const narrow = await narrowSlips(k);
  const press = await heldPip(k);
  k.check(
    "L20 the stations wear the mockup's dress: every pulse ring breathes, stilled under reduced motion; the at-sea glyph is the round, the land glyph the diamond turned 45 degrees; every name slip shows at the wide sheet and at a 640 window; and the house's button motion never reaches a station, no transition on its anchor transform and no shift on the sheet under a held press (#458)",
    pips.pulses.length === 5 &&
      pips.pulses.every((p) => p[0] === "lf-station-pulse" && p.includes("lf-station-pulse:running")) &&
      reduced.length === 5 &&
      reduced.every((n) => n === "none") &&
      pips.sea[0] === "50%" &&
      pips.sea[1] === "none" &&
      pips.land === 45 &&
      [pips.slips, narrow].every((s) => s.length === 5 && s.every((w) => w > 0)) &&
      !slides(pips.transition) &&
      press.shift < 2,
    JSON.stringify({ pips, reduced, narrow, press }),
  );
}

type SlipBox = { siblings: string[]; floats: string[]; open: boolean; capped: number; landfall: number; clips: string };

// A scratch block far taller than the stage is put into the open slip for one read and taken out again: the cap is what the slip's box does with it.
const SLIP_BOX: Payload<SlipBox> = `(() => {
  const stage = document.getElementById("lf-stage"), slip = document.getElementById("lf-card-gallery"), cs = getComputedStyle(slip);
  const siblings = []; for (let e = stage.nextElementSibling; e; e = e.nextElementSibling) siblings.push(e.tagName + (e.id ? "#" + e.id : ""));
  const tall = document.createElement("div"); tall.style.height = "3000px"; slip.appendChild(tall);
  try { return { siblings, floats: [getComputedStyle(document.querySelector(".lf-seed")).position, cs.position], open: !slip.hidden,
    capped: slip.offsetHeight, landfall: document.querySelector("section.landfall").offsetHeight, clips: cs.overflow }; }
  finally { tall.remove(); }
})()`;
const SIBLINGS = [
  "FORM#seed-form",
  "ASIDE#lf-card-explorer",
  "ASIDE#lf-card-reading-room",
  "ASIDE#lf-card-atlas",
  "ASIDE#lf-card-gallery",
  "ASIDE#lf-card-how",
  "NOSCRIPT",
];

export async function l29SlipBox(k: LandfallKit): Promise<void> {
  const { evaluate, check, clickAt, pressKey, sleep } = k;
  const at = await evaluate(buttonPoint('.lf-legend-btn[data-station="gallery"]'));
  if (!at) throw new Error("L29: no Gallery press on the legend");
  await clickAt(Math.round(at.x), Math.round(at.y));
  try {
    let b = await evaluate(SLIP_BOX);
    for (let i = 0; i < 40 && !b.open; i++) {
      await sleep(75);
      b = await evaluate(SLIP_BOX);
    }
    check(
      "L29 the slips' positioning box is the stage's: after the stage come only the seed form, the four station slips, the how panel and the noscript, the form and the slips float out of flow, and an over-tall slip is capped at the landfall less 2rem and clips what it cannot show (#459, #470)",
      JSON.stringify(b.siblings) === JSON.stringify(SIBLINGS) &&
        b.floats.every((p) => p === "absolute") &&
        b.open &&
        Math.abs(b.capped - (b.landfall - 32)) < 1 &&
        b.clips === "hidden",
      JSON.stringify(b),
    );
  } finally {
    await pressKey("Escape", "Escape", 27);
    await sleep(500);
  }
}

type Veil = { lift: string[]; ring: string[]; needle: string[] };
type Still = { ring: [string, string]; delay: string };

const VEIL: Payload<Veil> = `(() => {
  const v = document.createElement("div"); v.className = "veil lifting";
  v.innerHTML = '<svg class="veil-rose"><circle class="rose-ring"></circle><path class="rose-needle"></path></svg>';
  document.body.appendChild(v);
  try { const run = (e) => e.getAnimations().map((a) => a.animationName); return { lift: run(v), ring: run(v.querySelector(".rose-ring")), needle: run(v.querySelector(".rose-needle")) }; }
  finally { v.remove(); }
})()`;

// Scratch elements read and removed in one evaluate: the rose's ring as the veil carries it, and a bare block given a delayed animation of its own.
const STILL: Payload<Still> = `(() => {
  const r = document.createElement("div"); r.innerHTML = '<svg class="veil-rose"><circle class="rose-ring"></circle></svg>';
  const d = document.createElement("div"); d.style.animation = "lf-scratch 1s linear 2s";
  document.body.append(r, d);
  try { const ring = getComputedStyle(r.querySelector(".rose-ring")); return { ring: [ring.animationName, ring.strokeDashoffset], delay: getComputedStyle(d).animationDelay }; }
  finally { r.remove(); d.remove(); }
})()`;

async function stilled({ evaluate, send }: SuiteContext): Promise<Still> {
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  try {
    return await evaluate(STILL);
  } finally {
    await send("Emulation.setEmulatedMedia", { features: [] });
  }
}

export async function l31Veil(k: SuiteContext): Promise<void> {
  const veil = await k.evaluate(VEIL);
  const still = await stilled(k);
  k.check(
    "L31 the veil lifts, its rings draw and its needle settles by keyframes of home's own, and under reduced motion the rings stand drawn and still (#457)",
    veil.lift.includes("veil-lift") &&
      veil.ring.includes("rose-draw") &&
      veil.needle.includes("needle-settle") &&
      still.ring[0] === "none" &&
      still.ring[1] === "0px",
    JSON.stringify({ veil, still }),
  );
}

export async function l32Blanket(k: SuiteContext): Promise<void> {
  const moving = await k.evaluate(STILL);
  const still = await stilled(k);
  k.check(
    "L32 under reduced motion the house's blanket zeroes every animation's delay, the reason the doors' 10s reveal restates itself above it, while the same block keeps its 2s delay with motion on (#470 skeptic round 1)",
    still.delay === "0s" && moving.delay === "2s",
    JSON.stringify({ moving, still }),
  );
}
