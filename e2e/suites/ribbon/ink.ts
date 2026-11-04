// The Ribbon's ink-in (Issue #432, its soft edge Issue #1229) on seed 42's default road: the first plate of a visit and Turn about's plate reveal up each strip in reading order over bare paper, along a soft edge, and land whole, a picked journey's plate arrives whole, a lean mid-reveal lands it whole at once, and reduced motion lands it whole at once.
import { mouseMove, sendClick } from "../../support/input.ts";
import { PAGE_RGBA, sampleRect, sampleRow, tokenRgba, type Rgb } from "../../support/pixel.ts";
import { withReducedMotion } from "../../support/reduced-motion.ts";
import { makeSettle, makeStable } from "../../support/settle.ts";
import type { Payload } from "../../types.ts";
import { partInkedRows } from "./edge.ts";
import type { RibbonKit } from "./kit.ts";

type Ink = {
  cls: boolean;
  play: string | null;
  duration: number | null;
  ink: number;
  strip: number;
  mask: string;
  ground: number[];
  transform: string;
  hovered: boolean;
  zoomed: boolean;
  decoded: boolean;
  adds: number;
  removes: number;
  ends: number[];
  rect: number[];
  groundAnims: number;
};
const INK: Payload<Ink> = `(() => { const rgba = ${PAGE_RGBA}, p = document.getElementById("rb-plate"), m = document.getElementById("map"), w = window.__rbInk || { adds: 0, removes: 0, ends: [] };
  const a = p.getAnimations().find((x) => x.animationName === "rb-ink"), r = p.getBoundingClientRect(), cs = getComputedStyle(p);
  return { cls: p.classList.contains("rb-inking"), play: a ? a.playState : null, duration: a ? a.effect.getComputedTiming().duration : null, ink: parseFloat(cs.getPropertyValue("--rb-ink")),
    strip: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--rb-ink-strip")), mask: cs.maskImage, ground: rgba(getComputedStyle(m).backgroundColor),
    transform: cs.transform, hovered: p.matches(":hover"), zoomed: document.getElementById("map-viewport").classList.contains("zoomed"),
    decoded: !p.hidden && p.complete && p.naturalWidth > 0, adds: w.adds, removes: w.removes, ends: w.ends.slice(), rect: [r.left, r.top, r.width, r.height], groundAnims: m.getAnimations().length }; })()`;
const WITNESS = `(() => { const w = (window.__rbInk = { adds: 0, removes: 0, ends: [] }); document.addEventListener("animationend", (e) => { if (e.animationName === "rb-ink") w.ends.push(e.elapsedTime); }, true); const plate = () => document.getElementById("rb-plate"); let had = !!plate() && plate().classList.contains("rb-inking");
  new MutationObserver(() => { const p = plate(), has = !!p && p.classList.contains("rb-inking"); if (has === had) return; had = has; if (has) w.adds++; else w.removes++; })
    .observe(document, { subtree: true, attributes: true, attributeFilter: ["class"] }); return true; })()`;
type Plate = { W: number; H: number; strips: { x0: number; y0: number; w: number; h: number }[] };
const STRIPS: Payload<Plate> = `(async () => { const gen = await import("/explorer/engine/world/generate.js"), inp = await import("/explorer/engine/itinerary/input.js"), lay = await import("/explorer/engine/itinerary/dress/layout.js");
  const st = window.__vellumRibbonState(), input = inp.buildRibbonInput(gen.generateWorld(gen.defaultRecipe(st.seed)), st.from, st.to);
  return { W: lay.RIBBON_W, H: lay.RIBBON_H, strips: lay.layoutRibbon(input).strips.map((s) => ({ x0: s.x0, y0: s.y0, w: s.w, h: s.h })) }; })()`;
const seekTo = (f: number): Payload<boolean> =>
  `(() => { const a = document.getElementById("rb-plate").getAnimations().find((x) => x.animationName === "rb-ink"); if (!a) return false; a.pause(); a.currentTime = ${f} * a.effect.getComputedTiming().duration; return true; })()`;
const FRAMES: Payload<boolean> = `new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(true))))`;
const FINISH: Payload<boolean> = `(() => { const a = document.getElementById("rb-plate").getAnimations().find((x) => x.animationName === "rb-ink"); if (!a) return false; a.finish(); return true; })()`;
const pick = (id: string): Payload<number | null> =>
  `(() => { const sel = document.getElementById(${JSON.stringify(id)}), cur = sel.value, opt = [...sel.options].find((o) => o.value !== cur); if (!opt) return null; sel.value = opt.value; sel.dispatchEvent(new Event("change")); return Number(opt.value); })()`;
const HOLD_AT_PRESS: Payload<{ cls: boolean; play: string }> =
  `(() => { const p = document.getElementById("rb-plate"), a = p.getAnimations().find((x) => x.animationName === "rb-ink");
  if (a) a.currentTime = 0.6 * a.effect.getComputedTiming().duration; document.getElementById("rb-swap").click(); return { cls: p.classList.contains("rb-inking"), play: getComputedStyle(p).animationPlayState }; })()`;
const centreOf = (selector: string): Payload<{ x: number; y: number; ok: boolean }> =>
  `(() => { const b = document.querySelector(${JSON.stringify(selector)}), r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, e = document.elementFromPoint(x, y); return { x, y, ok: !!e && b.contains(e) }; })()`;

const PAPER = tokenRgba("--chart-paper");
const HALF = 0.5;
// 2026-11-03, seeds 42 and 15 at 1280 and 1024 (the plate reader's run): the bare frame differs from the whole plate by at most 4 per channel outside the holes; 8 is twice the worst
const INK_NOISE = 8;
const NEAR_ZERO_S = 0.01;
// the painted banner's middle line, RIBBON_MARGIN + 24 in bannerCloth in src/itinerary/dress/plate.ts
const TITLE_ROW = 50;
// the colophon's glyph band, its baseline RIBBON_H - RIBBON_MARGIN + 9 in colophon in src/itinerary/dress/plate.ts
const COLOPHON = [717, 725] as const;
const COLOPHON_HALF_WIDTH = 130;
const LAST_SEEK = 0.999;
const FOOT_ROW = 0.98;
const HEAD_ROW = 0.02;
// 2026-11-03, seed 42's default road at the harness's window, the planned files built from 5ad7be3f: a hard edge reads 0 plate units part inked (a feather of 0) or 1.3 (one row, the clip it replaces), feathers of 75, 150 and 300 read 56.6 to 59.1, 114.4 to 117 and 235.2 to 241.7; read in plate units, so a layout a few pixels off scales out, 10 is under a fifth of the narrowest and over seven times the hard edge (Issue #1229 plan)
const BAND_FLOOR = 10;
const UNDER_CHROME = "a sampled point under the chrome";
const onGround = (p: readonly number[]): boolean => PAPER.every((v, i) => i === 3 || Math.abs(p[i]! - v) <= 2);

type Look = { share: number[]; hits: boolean[] };
const toScreen = (rect: number[], plate: Plate, x: number, y: number): [number, number] => [
  rect[0]! + (x / plate.W) * rect[2]!,
  rect[1]! + (y / plate.H) * rect[3]!,
];

async function sharesOnGround(k: RibbonKit, plate: Plate, y: number, spans: [number, number][]): Promise<number[]> {
  const { rect } = await k.evaluate(INK);
  const lo = Math.min(...spans.map((s) => s[0]));
  const hi = Math.max(...spans.map((s) => s[1]));
  const a = Math.floor(toScreen(rect, plate, lo, y)[0]);
  const b = Math.ceil(toScreen(rect, plate, hi, y)[0]);
  const row = await sampleRow(k.send, a, Math.round(toScreen(rect, plate, lo, y)[1]), b - a);
  return spans.map(([x0, x1]) => {
    const from = Math.max(0, Math.round(toScreen(rect, plate, x0, y)[0] - a));
    const to = Math.min(row.length - 1, Math.round(toScreen(rect, plate, x1, y)[0] - a));
    let on = 0;
    for (let i = from; i <= to; i++) if (onGround(row[i]!)) on++;
    return to < from ? NaN : on / (to - from + 1);
  });
}

async function look(k: RibbonKit, plate: Plate, y: number): Promise<Look> {
  const share = await sharesOnGround(
    k,
    plate,
    y,
    plate.strips.map((s): [number, number] => [s.x0 + 0.2 * s.w, s.x0 + 0.8 * s.w]),
  );
  const { rect } = await k.evaluate(INK);
  const points = plate.strips.map((s) => toScreen(rect, plate, s.x0 + s.w / 2, y));
  const hits = await k.evaluate<boolean[]>(
    `(${JSON.stringify(points)}).map(([x, y]) => { const e = document.elementFromPoint(x, y); return !!e && !!e.closest("#map-viewport"); })`,
  );
  return { share, hits };
}

async function titleShare(k: RibbonKit, plate: Plate): Promise<number> {
  const [share] = await sharesOnGround(k, plate, TITLE_ROW, [[plate.W / 2 - 300, plate.W / 2 + 300]]);
  return share!;
}

async function colophonBand(k: RibbonKit, plate: Plate): Promise<Rgb[][]> {
  const { rect } = await k.evaluate(INK);
  const [x0, y0] = toScreen(rect, plate, plate.W / 2 - COLOPHON_HALF_WIDTH, COLOPHON[0]);
  const [x1, y1] = toScreen(rect, plate, plate.W / 2 + COLOPHON_HALF_WIDTH, COLOPHON[1]);
  return sampleRect(k.send, Math.floor(x0), Math.ceil(y0), Math.ceil(x1 - x0) + 1, Math.floor(y1) - Math.ceil(y0));
}

async function colophonFaults(k: RibbonKit, plate: Plate): Promise<string[]> {
  await k.evaluate(seekTo(0));
  await k.evaluate(FRAMES, true);
  const bare = await colophonBand(k, plate);
  await k.evaluate(seekTo(LAST_SEEK));
  await k.evaluate(FRAMES, true);
  const whole = await colophonBand(k, plate);
  const moved = bare.flat().filter((p, i) => p.some((v, c) => Math.abs(v - whole.flat()[i]![c]!) > INK_NOISE)).length;
  return moved === 0 && bare.length > 0 ? [] : ["the colophon stands from the first frame"];
}

const hiddenAll = (share: number[]): boolean => share.every((s) => s > HALF);
const revealedAll = (share: number[]): boolean => share.every((s) => s < HALF);

async function seen(k: RibbonKit, plate: Plate, f: number, y: number, faults: string[]): Promise<number[]> {
  await k.evaluate(seekTo(f));
  await k.evaluate(FRAMES, true);
  const { share, hits } = await look(k, plate, y);
  if (!hits.every(Boolean)) faults.push(UNDER_CHROME);
  return share;
}

const midOf = (plate: Plate): number => plate.strips[0]!.y0 + plate.strips[0]!.h / 2;
const atHeight = (plate: Plate, fraction: number): number => plate.strips[0]!.y0 + fraction * plate.strips[0]!.h;

async function orderFaults(k: RibbonKit, plate: Plate): Promise<string[]> {
  const faults: string[] = [];
  const n = plate.strips.length;
  const start = await seen(k, plate, 0, midOf(plate), faults);
  const title = await titleShare(k, plate);
  if (!hiddenAll(start) || !(title < HALF)) faults.push("the plate arrives on bare paper, its title standing");
  if (!hiddenAll(await seen(k, plate, 0, atHeight(plate, FOOT_ROW), faults)))
    faults.push("a waiting strip bare to its foot");
  for (let i = 0; i < n; i++) {
    const share = await seen(k, plate, (i + 0.75) / n, midOf(plate), faults);
    if (!share.every((s, j) => (j <= i ? s < HALF : s > HALF))) faults.push(`in reading order: strip ${i}`);
  }
  for (let i = 0; i < n; i++) {
    const low = (await seen(k, plate, (i + 0.5) / n, atHeight(plate, 0.85), faults))[i]!;
    const high = (await seen(k, plate, (i + 0.5) / n, atHeight(plate, 0.15), faults))[i]!;
    if (!(low < HALF && high > HALF)) faults.push(`foot to head: strip ${i}`);
  }
  const head = await seen(k, plate, LAST_SEEK, atHeight(plate, HEAD_ROW), faults);
  if (!revealedAll(head.slice(0, -1))) faults.push("a strip whole to its head once its turn is over");
  return faults;
}

type Block = [number, number, number, number];

const blockOf = (rect: number[], plate: Plate, i: number): Block => {
  const s = plate.strips[i]!;
  const [x0, y0] = toScreen(rect, plate, s.x0 + 0.2 * s.w, s.y0).map((v) => Math.ceil(v));
  const [x1, y1] = toScreen(rect, plate, s.x0 + 0.8 * s.w, s.y0 + s.h).map((v) => Math.floor(v));
  return [x0!, y0!, x1! - x0!, y1! - y0!];
};

async function shotAt(k: RibbonKit, f: number, block: Block): Promise<Rgb[][]> {
  await k.evaluate(seekTo(f));
  await k.evaluate(FRAMES, true);
  return sampleRect(k.send, ...block);
}

async function edgeFaults(k: RibbonKit, plate: Plate): Promise<{ faults: string[]; edges: number[] }> {
  const { rect } = await k.evaluate(INK);
  const n = plate.strips.length;
  const edges: number[] = [];
  for (let i = 0; i < n; i++) {
    const block = blockOf(rect, plate, i);
    const bare = await shotAt(k, i / n, block);
    const band = await shotAt(k, (i + 0.5) / n, block);
    const whole = await shotAt(k, Math.min((i + 1) / n, LAST_SEEK), block);
    const part = partInkedRows(band, bare, whole, INK_NOISE);
    edges.push(Number(((part * plate.H) / rect[3]!).toFixed(1)));
  }
  return { faults: edges.flatMap((e, i) => (e >= BAND_FLOOR ? [] : [`along a soft edge: strip ${i}`])), edges };
}

async function heldFaults(k: RibbonKit, plate: Plate): Promise<string[]> {
  const faults: string[] = [];
  const stable = makeStable(makeSettle({ evaluate: k.evaluate, sleep: k.sleep }));
  await k.evaluate(seekTo(0.5));
  await k.evaluate(FRAMES, true);
  const { rect } = await k.evaluate(INK);
  const [x, y] = toScreen(rect, plate, plate.W / 2, TITLE_ROW);
  await mouseMove(k.send, x, y);
  const hovered = await stable(INK, "ribbon-ink-hovered", { departed: (d) => d.hovered });
  if (hovered.transform !== "none") faults.push("the plate stands still under the pointer while it inks");
  await mouseMove(k.send, 1, 1);
  await k.send("Emulation.setEmulatedMedia", { media: "print" });
  try {
    const printed = await k.evaluate(INK);
    if (printed.mask !== "none" || printed.ground[3] !== 0) faults.push("paper prints the whole plate");
  } finally {
    await k.send("Emulation.setEmulatedMedia", { media: "" });
  }
  return faults;
}

async function landingFaults(k: RibbonKit, plate: Plate): Promise<string[]> {
  const faults: string[] = [];
  const stable = makeStable(makeSettle({ evaluate: k.evaluate, sleep: k.sleep }));
  await k.evaluate(FINISH);
  const landed = await stable(INK, "ribbon-ink-landed", { departed: (d) => d.play === null });
  const { share, hits } = await look(k, plate, midOf(plate));
  if (!hits.every(Boolean)) faults.push(UNDER_CHROME);
  if (landed.cls || landed.mask !== "none" || landed.ground[3] !== 0 || !revealedAll(share))
    faults.push("the plate lands whole: no class, no mask, no ground");
  const { rect } = landed;
  const [x, y] = toScreen(rect, plate, plate.strips[0]!.x0 + plate.strips[0]!.w / 2, midOf(plate));
  await mouseMove(k.send, x, y);
  const lifted = await stable(INK, "ribbon-lift-back", { departed: (d) => d.hovered });
  if (lifted.transform === "none")
    faults.push("the house lift is back once the plate has landed (the control: a read that can see a lift)");
  await mouseMove(k.send, 1, 1);
  await stable(INK, "ribbon-lift-gone", { departed: (d) => !d.hovered });
  return faults;
}

export async function rb21InksIn(k: RibbonKit): Promise<number> {
  const settle = makeSettle({ evaluate: k.evaluate, sleep: k.sleep });
  const label =
    "RB21 the first plate of a visit inks in on seed 42's default road: it arrives on bare paper to every strip's foot with its title and colophon standing, its strips revealed one after another from the bottom-left, each from its foot to its head along a soft edge and whole to its head once its turn is over, over the strip token times the strip count, the plate standing still under a resting pointer and printing whole while it inks, and it lands whole with no mask and no ground, the house lift back once it has (the control)";
  await mouseMove(k.send, 1, 1);
  await k.goto("#seed=42");
  await k.opened("seed 42, inking in");
  const arriving = await settle(INK, (d) => d.play === "running" || (d.decoded && !d.cls), "ribbon-ink-starts");
  if (arriving.play !== "running") {
    k.check(label, false, JSON.stringify({ arriving }));
    return 0;
  }
  await k.evaluate(seekTo(0));
  const plate = await k.evaluate(STRIPS, true);
  const faults: string[] = [];
  if (!(Math.abs(arriving.duration! - plate.strips.length * arriving.strip) < 0.5))
    faults.push("the run lasts the strip token times the strip count");
  faults.push(...(await orderFaults(k, plate)));
  const soft = await edgeFaults(k, plate);
  faults.push(...soft.faults);
  faults.push(...(await colophonFaults(k, plate)));
  faults.push(...(await heldFaults(k, plate)));
  faults.push(...(await landingFaults(k, plate)));
  const landed = await k.evaluate(INK);
  k.check(
    label,
    faults.length === 0,
    JSON.stringify({ faults: [...new Set(faults)], edges: soft.edges, arriving, landed }),
  );
  return arriving.duration!;
}

export async function rb22TurnAbout(k: RibbonKit): Promise<void> {
  const settle = makeSettle({ evaluate: k.evaluate, sleep: k.sleep });
  const stable = makeStable(settle);
  const faults: string[] = [];
  await k.evaluate(WITNESS);
  const picked = await k.evaluate(pick("rb-to"));
  const afterPick = await k.opened("a picked destination", (s) => s.to === picked);
  const f0 = afterPick.from;
  const picker = await k.evaluate(INK);
  if (picker.adds !== 0 || picker.cls || picker.mask !== "none")
    faults.push("a picked destination's plate arrives whole, with no ink");
  const swap = await k.evaluate(centreOf("#rb-swap"));
  if (!swap.ok) faults.push("Turn about takes the press");
  await sendClick(k.send, swap.x, swap.y);
  await k.opened("turned about", (s) => s.from === picked);
  const turned = await settle(INK, (d) => d.play === "running" || (d.decoded && !d.cls), "ribbon-ink-turned");
  if (turned.play !== "running" || turned.adds !== 1) faults.push("Turn about's plate inks in afresh");
  const held = await k.evaluate(HOLD_AT_PRESS);
  if (!held.cls || held.play !== "paused")
    faults.push("Turn about holds the reveal where it stands until the turned plate arrives");
  await k.opened("turned back", (s) => s.from === f0);
  const back = await settle(INK, (d) => d.play === "running" || (d.decoded && !d.cls), "ribbon-ink-turned-back");
  if (back.play !== "running" || !(back.ink < 0.5)) faults.push("the turned plate runs its own reveal from bare paper");
  await k.evaluate(seekTo(0.4));
  const row = await k.evaluate(centreOf("#rb-itinerary li:nth-child(2) .lean"));
  if (!row.ok) faults.push("the row takes the press");
  await sendClick(k.send, row.x, row.y);
  const leaned = await stable(INK, "ribbon-ink-leaned", { departed: (d) => d.zoomed });
  if (leaned.cls || leaned.mask !== "none" || leaned.ground[3] !== 0 || leaned.removes !== leaned.adds)
    faults.push("a lean mid-reveal lands the plate whole at once");
  await mouseMove(k.send, 1, 1);
  await k.glassHome();
  const addsBefore = (await k.evaluate(INK)).adds;
  const departed = await k.evaluate(pick("rb-from"));
  await k.opened("a picked departure", (s) => s.from === departed);
  const departure = await k.evaluate(INK);
  if (departure.adds !== addsBefore || departure.cls || departure.mask !== "none")
    faults.push("a picked departure's plate arrives whole, with no ink");
  k.check(
    "RB22 a picked destination's or departure's plate arrives whole with no ink, Turn about's plate inks in afresh and holds a reveal still running until the turned plate arrives, and a lean pressed mid-reveal lands the plate whole at once",
    faults.length === 0,
    JSON.stringify({ faults, picker, turned, held, leaned, departure }),
  );
}

async function turnAboutByHand(k: RibbonKit, from: number): Promise<{ faults: string[]; running: Ink }> {
  const settle = makeSettle({ evaluate: k.evaluate, sleep: k.sleep });
  const faults: string[] = [];
  const swap = await k.evaluate(centreOf("#rb-swap"));
  if (!swap.ok) faults.push("Turn about takes the press");
  await sendClick(k.send, swap.x, swap.y);
  await k.opened("turned under full motion", (s) => s.from === from);
  const running = await settle(INK, (d) => d.play === "running" || (d.decoded && !d.cls), "ribbon-ink-full-turn");
  if (running.play !== "running") faults.push("Turn about inks at full motion");
  return { faults, running };
}

type Landed = { rest: Ink; whole: boolean };

async function underReduced<T>(k: RibbonKit, body: () => Promise<T>): Promise<T> {
  const box: { value?: T } = {};
  await withReducedMotion(k, async () => {
    box.value = await body();
  });
  return box.value as T;
}

const reducedArrival = (k: RibbonKit): Promise<Landed> =>
  underReduced(k, async () => {
    const stable = makeStable(makeSettle({ evaluate: k.evaluate, sleep: k.sleep }));
    await k.goto("#seed=42");
    await k.opened("seed 42 under reduced motion");
    const rest = await stable(INK, "ribbon-ink-reduced", { departed: (d) => d.decoded && d.play === null });
    const plate = await k.evaluate(STRIPS, true);
    const { share, hits } = await look(k, plate, midOf(plate));
    return { rest, whole: revealedAll(share) && hits.every(Boolean) };
  });

const reducedSwitch = (k: RibbonKit, endsBefore: number): Promise<Ink> =>
  underReduced(k, async () => {
    const stable = makeStable(makeSettle({ evaluate: k.evaluate, sleep: k.sleep }));
    return stable(INK, "ribbon-ink-collapsed", { departed: (d) => d.ends.length > endsBefore && d.groundAnims === 0 });
  });

export async function rb23Reduced(k: RibbonKit, fullMs: number): Promise<void> {
  const faults: string[] = [];
  const { identifier } = await k.send<{ identifier: string }>("Page.addScriptToEvaluateOnNewDocument", {
    source: WITNESS,
  });
  try {
    const { rest, whole } = await reducedArrival(k);
    if (rest.adds !== 0 || rest.cls || rest.mask !== "none" || rest.ground[3] !== 0 || !whole)
      faults.push("under reduced motion the first plate lands whole at once, taking no reveal");
    if (!(fullMs > 1)) faults.push("the same run's full motion inked (RB21, the control)");
    const before = await k.state();
    const turn = await turnAboutByHand(k, before!.to);
    faults.push(...turn.faults);
    let after: Ink | null = null;
    if (turn.running.play === "running") {
      after = await reducedSwitch(k, turn.running.ends.length);
      const end = after.ends[after.ends.length - 1];
      if (!(end !== undefined && end < NEAR_ZERO_S))
        faults.push("reduced motion switched on mid-reveal ends the run at once: its own end reports under 10 ms");
      if (after.cls || after.mask !== "none" || after.ground[3] !== 0) faults.push("and lands whole");
    }
    k.check(
      // 2026-11-03: rewritten for a red on CI: RB23, run 41719348554, Issue #432: the wait after the reduced-motion switch took two equal reads of #map's ground while its 0.01 ms transition was still pending, so it now departs only once #map lists no animation
      "RB23 under reduced motion the first plate of a visit lands whole at once, taking no reveal (RB21's inked arrival the control), and a reveal running when reduced motion is turned on ends at once, its own end reporting a run of under 10 ms, and lands whole",
      faults.length === 0,
      JSON.stringify({ faults, fullMs, rest, running: turn.running, after }),
    );
  } finally {
    await k.send("Page.removeScriptToEvaluateOnNewDocument", { identifier });
  }
}
