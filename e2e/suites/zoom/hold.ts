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
};

const READ =
  `(()=>{const s=window.__vellumRegion();const z=window.__vellumZoomState();const svg=document.querySelector("#map .region-inset svg");` +
  `return{band:s.band,committed:s.committed,redrafts:s.redrafts,pressed:document.getElementById("zoom-hold").getAttribute("aria-pressed"),` +
  `caption:document.getElementById("caption").textContent||"",pencil:!!document.querySelector("#map .survey-pencil"),` +
  `insets:document.querySelectorAll("#map .region-inset").length,u0:svg?svg.getAttribute("data-vellum-region-u0"):null,` +
  `v0:svg?svg.getAttribute("data-vellum-region-v0"):null,k:z.k,hashK:new URLSearchParams(location.hash.slice(1)).get("k")};})()`;

const read = (k: ZoomKit) => k.evaluate<Read>(READ);
// Wiring only: ZH1 drove the real press with the mouse.
const press = (k: ZoomKit) => k.evaluate(`document.getElementById("zoom-hold").click()`);
const marked = (r: Read): boolean => r.caption.endsWith("held");

// Home, with the inset's fade run out, and the hold free whatever the last check left.
async function home(k: ZoomKit): Promise<void> {
  const settle = makeSettle(k);
  await k.goHome();
  const r = await settle<Read>(READ, (d) => d.k === 1 && d.insets === 0 && !d.committed && !d.pencil, "zh-home");
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

async function letGoBy(k: ZoomKit, target: Target21, name: string, path: () => Promise<void>): Promise<string[]> {
  const lit = await holdBandOne(k, target);
  await path();
  const after = await read(k);
  const ok = lit.band === 1 && lit.committed && lit.pressed === "true" && after.pressed === "false" && !marked(after);
  return ok ? [] : [`${name}: ${JSON.stringify({ lit, after })}`];
}

export async function zh4HomesLetGo(k: ZoomKit, target: Target21): Promise<void> {
  const faults: string[] = [];
  faults.push(...(await letGoBy(k, target, "the voiced home", () => viaHome(k))));
  faults.push(...(await letGoBy(k, target, "a draw", () => viaDraw(k))));
  faults.push(...(await letGoBy(k, target, "the turned sheet", () => viaTurn(k))));
  await viaTurn(k);
  faults.push(...(await letGoBy(k, target, "the survey ink", () => viaInk(k))));
  await k.evaluate(
    `(()=>{const c=document.getElementById("ages");c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));})()`,
  );
  k.check(
    "ZH4 every path that homes the camera lets the hold go first: the voiced home, a draw, the turned sheet and the survey ink (Issue #751)",
    faults.length === 0,
    faults.join(" | ") || "four cases, each lit before and unlit after",
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
  await k.enterAt(24, target.cx, target.cy);
  const deep = await read(k);
  const big = await k.evaluate<Label | null>(FIRST_HAMLET(rest.name));
  const hashed = await waitHashK(k, "8.0000", "zh6-held-hash");
  await press(k);
  const back = await settle<Read>(READ, (d) => Math.abs(d.k - 8) < 1e-6, "zh6-glide-back");
  await k.enterAt(24, target.cx, target.cy);
  const unheld = await read(k);
  const want = 24 / 6.5;
  k.check(
    "ZH6 held, the camera reaches 24 and the hamlet's label is 24 / 6.5 times its first size, the address says 8, letting go glides back to 8, and unheld 24 lands on 8 (Issue #751)",
    deep.k === 24 &&
      !!big &&
      Math.abs(big.h / rest.h / want - 1) < 0.02 &&
      hashed.hashK === "8.0000" &&
      back.band === 3 &&
      back.committed &&
      back.pressed === "false" &&
      unheld.k === 8,
    JSON.stringify({ rest, big, want, deepK: deep.k, hashK: hashed.hashK, back, unheldK: unheld.k }),
  );
}

export async function zh7LetGoMidGlide(k: ZoomKit, target: Target21): Promise<void> {
  await home(k);
  const before = (await k.rgn()).redrafts;
  await k.enterAt(6.5, target.cx, target.cy);
  await k.waitRedraft(before);
  await press(k);
  await k.enterAt(8, target.cx, target.cy);
  const lit = await read(k);
  // A d3 transition takes its first frame on the next timer tick, so two clicks in one task see the glide's target and not a frame of it: the let-go meets a glide in flight with the camera still at exactly 8.
  await k.evaluate(
    `(()=>{document.getElementById("zoom-in").click();document.getElementById("zoom-hold").click();})()`,
  );
  let agreed = 0;
  const rest = await makeSettle(k)<Read>(
    READ,
    (d, last) => {
      agreed = last && Math.abs(d.k - last.k) < 1e-9 ? agreed + 1 : 0;
      return agreed >= 2;
    },
    "zh7-landing",
  );
  k.check(
    "ZH7 letting go while a glide toward a deeper k is in flight lands the camera on 8, not on the glide's own end (Issue #751)",
    lit.pressed === "true" && lit.k === 8 && Math.abs(rest.k - 8) < 1e-6 && rest.pressed === "false",
    JSON.stringify({ lit: lit.k, rest }),
  );
}
