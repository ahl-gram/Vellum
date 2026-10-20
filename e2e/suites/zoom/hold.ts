import { makeStage } from "../../support/home.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Target21 } from "./bands.ts";
import type { ZoomKit } from "./kit.ts";

type Read = {
  band: number;
  committed: boolean;
  redrafts: number;
  pressed: string | null;
  caption: string;
  pencil: boolean;
  insets: number;
  u0: string | null;
  v0: string | null;
  k: number;
  hashK: string | null;
  glide: boolean;
};

// glide reads d3-transition's own bookkeeping: it keeps a node's scheduled and running transitions on __transition and deletes it when the last one ends, so no stalled frame can end a wait on it early.
const READ =
  `(()=>{const s=window.__vellumRegion();const z=window.__vellumZoomState();const svg=document.querySelector("#map .region-inset svg");` +
  `return{band:s.band,committed:s.committed,redrafts:s.redrafts,pressed:document.getElementById("zoom-hold").getAttribute("aria-pressed"),` +
  `caption:document.getElementById("caption").textContent||"",pencil:!!document.querySelector("#map .survey-pencil"),` +
  `insets:document.querySelectorAll("#map .region-inset").length,u0:svg?svg.getAttribute("data-vellum-region-u0"):null,` +
  `v0:svg?svg.getAttribute("data-vellum-region-v0"):null,k:z.k,hashK:new URLSearchParams(location.hash.slice(1)).get("k"),glide:!!document.getElementById("map-viewport").__transition};})()`;

// Asks for 24 and goes straight home in the same task, so no settle runs at the deep camera and nothing is drafted.
const CEILING = `(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:24,x:W/2-12*W,y:H/2-12*H});const k=window.__vellumZoomState().k;window.__vellumZoomTo({k:1,x:0,y:0});return k;})()`;
const LET_GO = `(()=>{document.getElementById("zoom-hold").click();return{glide:!!document.getElementById("map-viewport").__transition};})()`;
const OUT_THEN_LET_GO = `(()=>{document.getElementById("zoom-out").click();document.getElementById("zoom-hold").click();return{k:window.__vellumZoomState().k,glide:!!document.getElementById("map-viewport").__transition,pressed:document.getElementById("zoom-hold").getAttribute("aria-pressed")};})()`;
const ZOOM_THEN_LET_GO = (target: Target21): string =>
  `(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:4,x:W/2-(${target.cx})*4*W,y:H/2-(${target.cy})*4*H});document.getElementById("zoom-hold").click();return{k:window.__vellumZoomState().k,pencil:!!document.querySelector("#map .survey-pencil"),pressed:document.getElementById("zoom-hold").getAttribute("aria-pressed")};})()`;
const OUT_TWICE_THEN_LET_GO = `(()=>{const o=document.getElementById("zoom-out");o.click();o.click();document.getElementById("zoom-hold").click();return{k:window.__vellumZoomState().k,glide:!!document.getElementById("map-viewport").__transition,pencil:!!document.querySelector("#map .survey-pencil"),pressed:document.getElementById("zoom-hold").getAttribute("aria-pressed")};})()`;

const read = (k: ZoomKit) => k.evaluate<Read>(READ);
// Wiring only: ZH1 drove the real press with the mouse.
export const press = (k: ZoomKit) => k.evaluate<undefined>(`document.getElementById("zoom-hold").click()`);
const marked = (r: Read): boolean => r.caption.endsWith("held");

export async function home(k: ZoomKit): Promise<void> {
  const settle = makeSettle(k);
  // A stalled frame mid-glide (more than the 250ms settle debounce, measured on CI) settles at a deep k and drafts a survey that lands after the camera is home, so a home that finds a sheet committed goes again; Issue #938 files the product defect, and the loop goes with its fix.
  for (let i = 0; i < 4; i++) {
    await k.goHome();
    const landed = await settle<Read>(READ, (d) => d.k === 1 && !d.pencil, "zh-home");
    if (!landed.committed) break;
  }
  const r = await settle<Read>(READ, (d) => d.insets === 0 && !d.committed && !d.pencil, "zh-home-fade");
  if (r.pressed === "true") await press(k);
}

async function bandOneInset(k: ZoomKit, target: Target21): Promise<Read> {
  await home(k);
  const before = (await k.rgn()).redrafts;
  await k.enterAt(2, target.cx, target.cy);
  await k.waitRedraft(before);
  return read(k);
}

async function holdBandOne(k: ZoomKit, target: Target21): Promise<Read> {
  await bandOneInset(k, target);
  await press(k);
  return read(k);
}

const waitHashK = (k: ZoomKit, want: string, label: string) =>
  makeSettle(k)<Read>(READ, (d) => d.hashK === want, label);

export async function zh1HeldInsetStays(k: ZoomKit, target: Target21): Promise<void> {
  const first = await bandOneInset(k, target);
  const hit = await k.evaluate<{ x: number; y: number; on: boolean }>(
    `(()=>{const b=document.getElementById("zoom-hold");const r=b.getBoundingClientRect();const x=r.x+r.width/2,y=r.y+r.height/2;return{x,y,on:document.elementFromPoint(x,y)===b};})()`,
  );
  await makeStage(k).clickAt(hit.x, hit.y);
  await k.enterAt(8, target.cx, target.cy);
  // The settle writes the hash before it reaches the redraft line, so a dispatch would already be visible at this read.
  await waitHashK(k, "8.0000", "zh1-held-settle");
  const held = await read(k);
  k.check(
    "ZH1 a held band-1 inset stays on the table at k=8: no redraft, no pencil, the same window, the caption ends held (Issue #751)",
    hit.on &&
      first.band === 1 &&
      first.committed &&
      held.redrafts === first.redrafts &&
      held.band === 1 &&
      held.committed &&
      held.u0 === first.u0 &&
      held.v0 === first.v0 &&
      !held.pencil &&
      marked(held) &&
      held.pressed === "true",
    JSON.stringify({ reachable: hit.on, first, held }),
  );
}

export async function zh2LetGoSettles(k: ZoomKit): Promise<void> {
  const before = await read(k);
  await press(k);
  await k.waitRedraft(before.redrafts);
  const after = await read(k);
  k.check(
    "ZH2 letting go settles at once: the band-3 survey of the camera where it stands is drafted, the press unlit, the mark gone (Issue #751)",
    before.pressed === "true" &&
      marked(before) &&
      after.redrafts > before.redrafts &&
      after.band === 3 &&
      after.committed &&
      after.pressed === "false" &&
      !marked(after),
    JSON.stringify({ before, after }),
  );
}

export async function zh3HeldWorld(k: ZoomKit, target: Target21): Promise<void> {
  await home(k);
  const base = await read(k);
  await press(k);
  await k.enterAt(8, target.cx, target.cy);
  await waitHashK(k, "8.0000", "zh3-held-settle");
  const held = await read(k);
  await press(k);
  await k.waitRedraft(base.redrafts);
  const after = await read(k);
  k.check(
    "ZH3 the bare world sheet held stays bare at k=8, and letting go drafts band 3 (the control) (Issue #751)",
    base.insets === 0 &&
      base.k === 1 &&
      held.pressed === "true" &&
      !held.committed &&
      held.insets === 0 &&
      held.redrafts === base.redrafts &&
      !held.pencil &&
      after.band === 3 &&
      after.committed &&
      after.pressed === "false",
    JSON.stringify({ base, held, after }),
  );
}

async function viaHome(k: ZoomKit): Promise<void> {
  await k.evaluate(`document.getElementById("zoom-reset").click()`);
  await makeSettle(k)<Read>(READ, (d) => !d.glide && d.k === 1, "zh4-home-lands");
}

async function viaDraw(k: ZoomKit): Promise<void> {
  await k.evaluate(`document.getElementById("draw").click()`);
  await k.waitSettled("zh4-draw");
}

async function viaTurn(k: ZoomKit): Promise<void> {
  await k.evaluate(`document.getElementById("verso-turn").click()`);
  await k.waitTurned("zh4-turn");
}

async function viaInk(k: ZoomKit): Promise<void> {
  await k.evaluate(
    `(()=>{const c=document.getElementById("ages");c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));})()`,
  );
  await k.waitInked("zh4-ink");
}

type Homed = { lit: Read; after: Read; ceiling: number };

async function letGoBy(k: ZoomKit, target: Target21, path: () => Promise<void>): Promise<Homed> {
  const lit = await holdBandOne(k, target);
  await path();
  const after = await read(k);
  const ceiling = await k.evaluate<number>(CEILING);
  return { lit, after, ceiling };
}

function homeCheck(k: ZoomKit, name: string, r: Homed): void {
  k.check(
    name,
    r.lit.band === 1 &&
      r.lit.committed &&
      r.lit.pressed === "true" &&
      r.after.pressed === "false" &&
      !marked(r.after) &&
      r.after.k === 1 &&
      r.ceiling === 8,
    JSON.stringify(r),
  );
}

export async function zh4aVoicedHome(k: ZoomKit, target: Target21): Promise<void> {
  const r = await letGoBy(k, target, () => viaHome(k));
  homeCheck(
    k,
    "ZH4a the voiced home lets the hold go first: unlit, the mark gone, the ceiling back at 8 (Issue #751)",
    r,
  );
}

export async function zh4bDraw(k: ZoomKit, target: Target21): Promise<void> {
  const r = await letGoBy(k, target, () => viaDraw(k));
  homeCheck(k, "ZH4b a draw lets the hold go first: unlit, the mark gone, the ceiling back at 8 (Issue #751)", r);
}

export async function zh4cTurn(k: ZoomKit, target: Target21): Promise<void> {
  const r = await letGoBy(k, target, () => viaTurn(k));
  homeCheck(
    k,
    "ZH4c the turned sheet lets the hold go first: unlit, the mark gone, the ceiling back at 8 (Issue #751)",
    r,
  );
  await viaTurn(k);
}

export async function zh4dInk(k: ZoomKit, target: Target21): Promise<void> {
  const r = await letGoBy(k, target, () => viaInk(k));
  homeCheck(
    k,
    "ZH4d the survey ink lets the hold go first: unlit, the mark gone, the ceiling back at 8 (Issue #751)",
    r,
  );
  await k.evaluate(
    `(()=>{const c=document.getElementById("ages");c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));})()`,
  );
}

export async function zh5DraftDropped(k: ZoomKit, target: Target21): Promise<void> {
  await home(k);
  const base = await read(k);
  const cx = Math.min(0.9, Math.max(0.1, target.cx + 0.2));
  // The press lands in the microtask after the dispatching task, before the worker's reply can be handled, where two separate evaluates would leave a window for a fast job to land between them (Gate 2 item 14).
  await k.evaluate(
    `(()=>{const obs=new MutationObserver((recs)=>{for(const r of recs){for(const n of r.addedNodes){` +
      `if(n.classList&&n.classList.contains("survey-pencil")){obs.disconnect();document.getElementById("zoom-hold").click();return;}}}});` +
      `obs.observe(document.getElementById("map"),{childList:true});const vp=document.getElementById("map-viewport");` +
      `const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:4,x:W/2-(${cx})*4*W,y:H/2-(${target.cy})*4*H});})()`,
  );
  const lit = await makeSettle(k)<Read>(READ, (d) => d.pressed === "true", "zh5-press-lit");
  // Resolves only after the region job queued ahead of it: the one render worker runs first in first out with no cancellation.
  await k.evaluate(
    `window.__vellumRunJob({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:300,legend:false,arms:false,beasts:false}})`,
    true,
  );
  const after = await read(k);
  k.check(
    "ZH5 pressing the hold drops a draft still in flight: the pencil goes, the caption is held, and the survey that lands never commits (Issue #751)",
    base.insets === 0 &&
      lit.pencil === false &&
      lit.caption === "held" &&
      after.redrafts === base.redrafts &&
      !after.committed &&
      after.insets === 0,
    JSON.stringify({ base, lit, after }),
  );
}

export async function zh5bKeepsCaption(k: ZoomKit, target: Target21): Promise<void> {
  await home(k);
  await viaDraw(k);
  const drawn = await read(k);
  await press(k);
  const worldHeld = await read(k);
  await press(k);
  const first = await bandOneInset(k, target);
  const cx = Math.min(0.9, Math.max(0.1, target.cx + 0.2));
  // As ZH5: the press lands in the microtask after the dispatching task, with a finer draft in flight over a committed inset.
  await k.evaluate(
    `(()=>{const obs=new MutationObserver((recs)=>{for(const r of recs){for(const n of r.addedNodes){` +
      `if(n.classList&&n.classList.contains("survey-pencil")){obs.disconnect();document.getElementById("zoom-hold").click();return;}}}});` +
      `obs.observe(document.getElementById("map"),{childList:true});const vp=document.getElementById("map-viewport");` +
      `const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:4,x:W/2-(${cx})*4*W,y:H/2-(${target.cy})*4*H});})()`,
  );
  const lit = await makeSettle(k)<Read>(READ, (d) => d.pressed === "true", "zh5b-press-lit");
  await k.evaluate(
    `window.__vellumRunJob({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:300,legend:false,arms:false,beasts:false}})`,
    true,
  );
  const after = await read(k);
  k.check(
    "ZH5b the hold keeps the caption it finds: a world's draw caption when no draft is in flight, and a committed inset's own title when one is, each with the mark added (Issue #751)",
    drawn.caption !== "" &&
      worldHeld.caption === `${drawn.caption} · held` &&
      first.band === 1 &&
      first.committed &&
      !lit.pencil &&
      lit.caption === `${first.caption} · held` &&
      after.redrafts === first.redrafts &&
      after.band === 1,
    JSON.stringify({
      drawn: drawn.caption,
      worldHeld: worldHeld.caption,
      first: first.caption,
      lit: lit.caption,
      after,
    }),
  );
}

const FIRST_HAMLET = (name: string | null): string =>
  `(()=>{const gs=[...document.querySelectorAll('#map .region-inset svg g.settlement[data-tier="hamlet"]')];` +
  `const g=gs.find((x)=>x.querySelector("text")&&(${JSON.stringify(name)}===null||x.dataset.name===${JSON.stringify(name)}));` +
  `return g?{name:g.dataset.name,h:g.querySelector("text").getBoundingClientRect().height}:null;})()`;

type Label = { name: string; h: number };

export async function zh6HeldCeiling(k: ZoomKit, target: Target21): Promise<void> {
  const settle = makeSettle(k);
  await home(k);
  const before = (await k.rgn()).redrafts;
  await k.enterAt(6.5, target.cx, target.cy);
  await k.waitRedraft(before);
  const rest = await settle<Label>(
    FIRST_HAMLET(null),
    (d, last) => !!last && Math.abs(d.h - last.h) < 1e-6,
    "zh6-label",
  );
  await press(k);
  const was = await read(k);
  await k.enterAt(24, target.cx, target.cy);
  const deep = await read(k);
  const big = await k.evaluate<Label | null>(FIRST_HAMLET(rest.name));
  const hashed = await settle<Read>(READ, (d) => d.hashK !== was.hashK, "zh6-held-hash");
  const letGo = await k.evaluate<{ glide: boolean }>(LET_GO);
  const back = await settle<Read>(READ, (d) => !d.glide, "zh6-glide-back");
  await k.enterAt(24, target.cx, target.cy);
  const unheld = await read(k);
  const want = 24 / 6.5;
  k.check(
    "ZH6 held, the camera reaches 24 and the hamlet's label is 24 / 6.5 times its first size, the address says 8, letting go glides back to 8, and unheld 24 lands on 8 (Issue #751)",
    deep.k === 24 &&
      !!big &&
      // 2026-10-20 at the Z21 target: 24.3076 / 6.5835 = 3.6923 against 24 / 6.5 = 3.6923; a growth that tracked a ceiling of 8 would read 1.23, so 2% is headroom for a pixel of label rounding and nothing else.
      Math.abs(big.h / rest.h / want - 1) < 0.02 &&
      hashed.hashK === "8.0000" &&
      letGo.glide &&
      Math.abs(back.k - 8) < 1e-6 &&
      back.band === 3 &&
      back.committed &&
      back.pressed === "false" &&
      unheld.k === 8,
    JSON.stringify({ rest, big, want, deepK: deep.k, hashK: hashed.hashK, letGo, back, unheldK: unheld.k }),
  );
}

export async function zh7LetGoMidGlide(k: ZoomKit, target: Target21): Promise<void> {
  await home(k);
  const before = (await k.rgn()).redrafts;
  await k.enterAt(6.5, target.cx, target.cy);
  await k.waitRedraft(before);
  await press(k);
  await k.enterAt(24, target.cx, target.cy);
  const lit = await read(k);
  // One task, so no frame runs between the presses: the camera is still at 24 and "Stand off" has queued a glide toward 24 / 1.4 when the let-go reads it, the case where reading the camera instead of the glide's pending target lands at 24 / 1.4 * 8 / 24 = 5.71.
  const now = await k.evaluate<{ k: number; glide: boolean; pressed: string | null }>(OUT_THEN_LET_GO);
  const rest = await makeSettle(k)<Read>(READ, (d) => !d.glide, "zh7-landing");
  k.check(
    "ZH7 letting go while a glide out from above 8 is in flight lands the camera on 8, not further out (Issue #751)",
    lit.pressed === "true" &&
      lit.k === 24 &&
      now.k === 24 &&
      now.glide &&
      now.pressed === "false" &&
      Math.abs(rest.k - 8) < 1e-6 &&
      rest.pressed === "false",
    JSON.stringify({ lit: { k: lit.k, pressed: lit.pressed }, now, rest }),
  );
}

export async function zh8LetGoGlidingOut(k: ZoomKit, target: Target21): Promise<void> {
  await bandOneInset(k, target);
  await press(k);
  await k.enterAt(4, target.cx, target.cy);
  const lit = await waitHashK(k, "4.0000", "zh8-held-settle");
  // One task: two presses of "Stand off" queue a glide toward 4 / 1.96 and the let-go meets it before any frame, so a survey sent at the press would already show its pencil here; at 4 against the held band-1 sheet a settle would send band 2.
  const now = await k.evaluate<{ k: number; glide: boolean; pencil: boolean; pressed: string | null }>(
    OUT_TWICE_THEN_LET_GO,
  );
  const rest = await makeSettle(k)<Read>(READ, (d) => !d.glide, "zh8-landing");
  k.check(
    "ZH8 letting go while a glide toward a depth at or under 8 is in flight drafts nothing at the press, and the glide lands where it was headed (Issue #751)",
    lit.band === 1 &&
      lit.committed &&
      lit.pressed === "true" &&
      !lit.pencil &&
      now.k === 4 &&
      now.glide &&
      !now.pencil &&
      now.pressed === "false" &&
      Math.abs(rest.k - 4 / 1.96) < 1e-6,
    JSON.stringify({ lit, now, rest }),
  );
}

export async function zh9LetGoJustMoved(k: ZoomKit, target: Target21): Promise<void> {
  await bandOneInset(k, target);
  await press(k);
  const lit = await read(k);
  // One task: the camera moves to 4, which arms its settle, and the let-go meets that armed settle; a settle at once would send band 2 here and show its pencil, and the armed one sends it 250 ms later with the hold off.
  const now = await k.evaluate<{ k: number; pencil: boolean; pressed: string | null }>(ZOOM_THEN_LET_GO(target));
  const landed = await k.waitRedraft(lit.redrafts);
  k.check(
    "ZH9 letting go just after the camera moved drafts nothing at the press, and the settle already armed drafts the band for where the camera stopped (Issue #751)",
    lit.band === 1 &&
      lit.committed &&
      lit.pressed === "true" &&
      !lit.pencil &&
      now.k === 4 &&
      !now.pencil &&
      now.pressed === "false" &&
      landed.redrafts > lit.redrafts &&
      landed.band === 2 &&
      landed.committed,
    JSON.stringify({ lit, now, landed }),
  );
}
