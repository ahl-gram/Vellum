import { centroidOf, dominant, extentOf, pure, sampleRect } from "../../support/pixel.ts";
import { makeSettle } from "../../support/settle.ts";
import { home, press } from "./hold.ts";
import type { ZoomKit } from "./kit.ts";

export type HamletWindow = { e: number; u0: number; v0: number; cx: number; cy: number };
type Witness = { label: string; key: string; cu: number; cv: number; e: number };
type Centroid = { n: number; x: number; y: number };
type Span = { x: number; y: number; w: number; h: number };
type Measure = {
  key: string;
  witnessPx: number;
  dot: Centroid | null;
  ring: Centroid | null;
  span: Span | null;
  near: boolean;
};
type Rect4 = [number, number, number, number];
type EarRead = { ear: Rect4; svgRight: number; svgTop: number; aim: [number, number]; atAim: boolean; hover: boolean };

const DEPTH = 24;
const DOT_PX = 10;
const SAMPLE_PX = 120;
const EAR_PX = 54.4;
const EAR_HOVER_PX = 65.6;
const HAMLETS_AT_LEAST = 8;
// 2026-10-20 at the zoom suite's own window, 3 towns and 6 hamlets over two windows: fixed, the click area 0.18 to 0.88 px and the ring 0.05 to 1.02 px off the painted dot; unfixed, 8.2 to 17.1 px. A witness rounds by at least a quarter pixel times the depth, 6 px; the tolerance is half of that.
const TOLERANCE_PX = 3;
const WITNESS_PX = 6;

const DEEP = `(()=>({k:window.__vellumZoomState().k,hashK:new URLSearchParams(location.hash.slice(1)).get("k")}))()`;

async function deep(k: ZoomKit, cu: number, cv: number): Promise<void> {
  await k.enterAt(DEPTH, cu, cv);
  await makeSettle(k)<{ k: number; hashK: string | null }>(
    DEEP,
    (d) => d.k === DEPTH && d.hashK === "8.0000",
    "zh-deep",
  );
}

// A measurement poll: the first read that satisfies `ok`, else the last, and never a throw, so a mutation reds on the assertion and not on a stopped step.
async function pollLast<T>(k: ZoomKit, payload: string, ok: (v: T) => boolean, tries: number): Promise<T> {
  let last = await k.evaluate<T>(payload);
  for (let i = 1; i < tries && !ok(last); i++) {
    await k.sleep(50);
    last = await k.evaluate<T>(payload);
  }
  return last;
}

const mouse = (k: ZoomKit, x: number, y: number) => k.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });

const WITNESSES = (glyphOf: string, keyOf: string): string =>
  `(()=>{const m=document.getElementById("map").getBoundingClientRect();const k=window.__vellumZoomState().k;const out=[];` +
  `for(const h of document.querySelectorAll("#map .place-hit")){const name=(h.getAttribute("aria-label")||"").split(",")[0];` +
  `const g=${glyphOf};if(!g||!g.querySelector("circle:not(.seat-halo)"))continue;const r=h.getBoundingClientRect();` +
  `const X=(r.left+r.width/2-m.left)/k,Y=(r.top+r.height/2-m.top)/k;` +
  `const e=${DEPTH}*Math.max(Math.abs(X-Math.round(X)),Math.abs(Y-Math.round(Y)));` +
  `out.push({label:h.getAttribute("aria-label"),key:${keyOf},cu:X/(m.width/k),cv:Y/(m.height/k),e});}` +
  `out.sort((a,b)=>b.e-a.e);return out.slice(0,3);})()`;
const TOWN_WITNESSES = WITNESSES(
  `document.querySelector('#map > svg g.settlement[data-idx="'+h.dataset.idx+'"]')`,
  "h.dataset.idx",
);
const HAMLET_WITNESSES = WITNESSES(
  `[...document.querySelectorAll('#map .region-inset svg g.settlement[data-tier="hamlet"]')].find((g)=>g.dataset.name===name)`,
  "name",
);

const PICK_WINDOW =
  `(async()=>{const {defaultRecipe,generateWorld}=await import("/explorer/engine/world/generate.js");` +
  `const {hamletCandidates}=await import("/explorer/engine/society/hamlets.js");` +
  `const {quantizeCenter,lodWindowFor,insetSheetRect,LOD_BANDS}=await import("/explorer/engine/world/lod.js");` +
  `const {marginFor}=await import("/explorer/engine/render/transform.js");` +
  `const world=generateWorld(defaultRecipe(42,{gridW:320,gridH:240}));` +
  `const size=LOD_BANDS[LOD_BANDS.length-1].sizeUV;` +
  `const svg=document.querySelector("#map > svg");const vb=svg.getAttribute("viewBox").split(" ").map(Number);` +
  `const m=marginFor(vb[2]);const mx=m/vb[2],my=m/vb[3];` +
  `const r=document.getElementById("map").getBoundingClientRect();const k=window.__vellumZoomState().k;const W=r.width/k,H=r.height/k;` +
  `const off=(v)=>Math.abs(v-Math.round(v));const seen=new Set();let best=null;` +
  `for(const s of world.settlements){const q=quantizeCenter(s.x/(world.recipe.gridW-1),s.y/(world.recipe.gridH-1),size);` +
  `const key=q.cx+","+q.cy;if(seen.has(key))continue;seen.add(key);const win=lodWindowFor(q.cx,q.cy,size);` +
  `if(hamletCandidates(world,win).length<${HAMLETS_AT_LEAST})continue;const rect=insetSheetRect(win,{mx,my});` +
  `const e=${DEPTH}*Math.hypot(off(rect.x*W),off(rect.y*H));` +
  `if(!best||e>best.e)best={e,u0:win.u0,v0:win.v0,cx:mx+q.cx*(1-2*mx),cy:my+q.cy*(1-2*my)};}` +
  `return best;})()`;

// Reads the world sheet's own box at whatever camera it stands, so it needs no home and nothing here can throw outside a step; a sheet with no such window reads as one that rounds by nothing, which ZH10b reds on.
export async function pickHamletWindow(k: ZoomKit): Promise<HamletWindow> {
  const pick = await k.evaluate<HamletWindow | null>(PICK_WINDOW, true);
  return pick ?? { e: 0, u0: Number.NaN, v0: Number.NaN, cx: 0.5, cy: 0.5 };
}

type InsetRead = {
  band: number;
  committed: boolean;
  insets: number;
  u0: number | null;
  v0: number | null;
  pressed: string | null;
};
const INSET = `(()=>{const s=window.__vellumRegion();const all=[...document.querySelectorAll("#map .region-inset svg")];const last=all[all.length-1];return{band:s.band,committed:s.committed,insets:all.length,u0:last?+last.getAttribute("data-vellum-region-u0"):null,v0:last?+last.getAttribute("data-vellum-region-v0"):null,pressed:document.getElementById("zoom-hold").getAttribute("aria-pressed")};})()`;

async function heldDeepInset(k: ZoomKit, pick: HamletWindow): Promise<InsetRead> {
  await home(k);
  const before = (await k.rgn()).redrafts;
  await k.enterAt(6.5, pick.cx, pick.cy);
  await k.waitRedraft(before);
  await makeSettle(k)<InsetRead>(INSET, (d) => d.committed && d.band === 3 && d.insets === 1, "zh-inset");
  await press(k);
  return k.evaluate<InsetRead>(INSET);
}

async function ensureHeldDeepInset(k: ZoomKit, pick: HamletWindow): Promise<InsetRead> {
  const now = await k.evaluate<InsetRead>(INSET);
  const same =
    now.u0 !== null && now.v0 !== null && Math.abs(now.u0 - pick.u0) < 1e-6 && Math.abs(now.v0 - pick.v0) < 1e-6;
  return now.committed && now.band === 3 && now.pressed === "true" && same ? now : heldDeepInset(k, pick);
}

const hitCentre = (label: string): string =>
  `(()=>{const h=[...document.querySelectorAll("#map .place-hit")].find((x)=>x.getAttribute("aria-label")===${JSON.stringify(label)});const r=h.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};})()`;
const NEAR = (label: string): string =>
  `(()=>{const h=document.querySelector("#map .place-hit.pc-near");return !!h&&h.getAttribute("aria-label")===${JSON.stringify(label)}&&getComputedStyle(h,"::after").opacity==="1";})()`;
const SPAN = (label: string, x: number, y: number): string =>
  `(()=>{const h=[...document.querySelectorAll("#map .place-hit")].find((q)=>q.getAttribute("aria-label")===${JSON.stringify(label)});` +
  `const on=(px,py)=>{const e=document.elementFromPoint(px,py);return !!e&&e.closest(".place-hit")===h;};let a=null,b=null,c=null,d=null;` +
  `for(let s=-20;s<=20;s+=0.25){if(on(${x}+s,${y})){if(a===null)a=s;b=s;}if(on(${x},${y}+s)){if(c===null)c=s;d=s;}}` +
  `return a===null||c===null?null:{x:${x}+(a+b)/2,y:${y}+(c+d)/2,w:b-a,h:d-c};})()`;
const PAINT = (dotSel: string): string =>
  `(()=>{const c=document.querySelector(${JSON.stringify(dotSel)});const s=c.ownerSVGElement;const R=${DOT_PX}*s.viewBox.baseVal.width/s.getBoundingClientRect().width;` +
  `const st=document.createElement("style");st.id="zh-paint";` +
  `st.textContent=${JSON.stringify(dotSel)}+"{fill:#ff0000!important;stroke:none!important;opacity:1!important;r:"+R+"px!important}#map svg text{visibility:hidden!important}.place-hit.pc-near::after{border-color:#0000ff!important;transition:none!important}#place-card{visibility:hidden!important}";` +
  `document.head.appendChild(st);return new Promise((r)=>requestAnimationFrame(()=>requestAnimationFrame(r)));})()`;

async function onDot(k: ZoomKit, w: Witness, dotSel: string): Promise<Measure> {
  await deep(k, w.cu, w.cv);
  await mouse(k, 3, 3);
  await k.evaluate<undefined>(PAINT(dotSel), true);
  const hit = await k.evaluate<{ x: number; y: number }>(hitCentre(w.label));
  const x0 = Math.max(0, Math.round(hit.x - SAMPLE_PX / 2));
  const y0 = Math.max(0, Math.round(hit.y - SAMPLE_PX / 2));
  const dot = centroidOf(await sampleRect(k.send, x0, y0, SAMPLE_PX, SAMPLE_PX), x0, y0, pure(0));
  let near = false;
  let ring: Centroid | null = null;
  let span: Span | null = null;
  if (dot) {
    await mouse(k, dot.x - 3, dot.y);
    await mouse(k, dot.x, dot.y);
    near = await pollLast<boolean>(k, NEAR(w.label), (v) => v, 40);
    ring = centroidOf(await sampleRect(k.send, x0, y0, SAMPLE_PX, SAMPLE_PX), x0, y0, pure(2));
    span = await k.evaluate<Span | null>(SPAN(w.label, dot.x, dot.y));
  }
  await k.evaluate<undefined>(`document.getElementById("zh-paint").remove()`);
  await mouse(k, 3, 3);
  return { key: w.key, witnessPx: w.e, dot, ring, span, near };
}

function onDotFaults(m: Measure): string[] {
  const out: string[] = [];
  const off = (p: { x: number; y: number }) => Math.hypot(p.x - m.dot!.x, p.y - m.dot!.y);
  if (!m.dot) out.push(`${m.key}: no painted dot`);
  if (!m.near) out.push(`${m.key}: the ring never came up`);
  if (!m.ring) out.push(`${m.key}: no painted ring`);
  if (!m.span) out.push(`${m.key}: no click area at the dot`);
  else if (m.span.w < 24 || m.span.w > 28 || m.span.h < 24 || m.span.h > 28)
    out.push(`${m.key}: the click area is ${m.span.w} by ${m.span.h}`);
  if (m.dot && m.span && off(m.span) > TOLERANCE_PX)
    out.push(`${m.key}: the click area is ${off(m.span).toFixed(2)} px off the dot`);
  if (m.dot && m.ring && off(m.ring) > TOLERANCE_PX)
    out.push(`${m.key}: the ring is ${off(m.ring).toFixed(2)} px off the dot`);
  return out;
}

export async function zh10aTownsOnDots(k: ZoomKit): Promise<void> {
  await home(k);
  await press(k);
  const witnesses = await k.evaluate<Witness[]>(TOWN_WITNESSES);
  const measures: Measure[] = [];
  for (const w of witnesses)
    measures.push(await onDot(k, w, `#map > svg g.settlement[data-idx="${w.key}"] circle:not(.seat-halo)`));
  await press(k);
  await home(k);
  const faults = measures.flatMap(onDotFaults);
  k.check(
    "ZH10a at 24 times held, each witness town's ring and click area are centred on its painted dot within 3 px, where a hit placed by a fractional offset stood up to 12 px off (Issue #751)",
    witnesses.length === 3 && witnesses.every((w) => w.e >= WITNESS_PX) && faults.length === 0,
    JSON.stringify({ witnesses, measures, faults }),
  );
}

export async function zh10bHamletsOnDots(k: ZoomKit, pick: HamletWindow): Promise<void> {
  const inset = await heldDeepInset(k, pick);
  const witnesses = await k.evaluate<Witness[]>(HAMLET_WITNESSES);
  const measures: Measure[] = [];
  for (const w of witnesses)
    measures.push(
      await onDot(k, w, `#map .region-inset svg g.settlement[data-name="${w.key}"] circle:not(.seat-halo)`),
    );
  const faults = measures.flatMap(onDotFaults);
  const same =
    inset.u0 !== null &&
    inset.v0 !== null &&
    Math.abs(inset.u0 - pick.u0) < 1e-6 &&
    Math.abs(inset.v0 - pick.v0) < 1e-6;
  k.check(
    "ZH10b at 24 times held on a region sheet, each witness hamlet's ring and click area are centred on its painted dot within 3 px: the hits, the overlay and the drawing each placed exactly (Issue #751)",
    pick.e >= WITNESS_PX && same && witnesses.length === 3 && witnesses[0]!.e >= WITNESS_PX && faults.length === 0,
    JSON.stringify({ pick, inset, witnesses, measures, faults }),
  );
}

const EAR = `(()=>{const e=[...document.querySelectorAll("#map .region-inset .dog-ear")].pop();const sv=[...document.querySelectorAll("#map .region-inset svg")].pop();const r=e.getBoundingClientRect(),s=sv.getBoundingClientRect();const x=r.x+r.width*0.72,y=r.y+r.height*0.28;return{ear:[r.x,r.y,r.width,r.height],svgRight:s.right,svgTop:s.top,aim:[x,y],atAim:document.elementFromPoint(x,y)===e,hover:e.matches(":hover")};})()`;

async function earPaint(
  k: ZoomKit,
): Promise<{ read: EarRead; box: { left: number; top: number; right: number; bottom: number } | null }> {
  const read = await k.evaluate<EarRead>(EAR);
  await k.evaluate<undefined>(
    `(()=>{const s=document.createElement("style");s.id="zh-ear";s.textContent=".dog-ear{background:#00ff00!important}";document.head.appendChild(s);return new Promise((r)=>requestAnimationFrame(()=>requestAnimationFrame(r)));})()`,
    true,
  );
  const x0 = Math.max(0, Math.round(read.ear[0] - 30));
  const y0 = Math.max(0, Math.round(read.ear[1] - 30));
  const rows = await sampleRect(k.send, x0, y0, Math.round(read.ear[2] + 60), Math.round(read.ear[3] + 60));
  await k.evaluate<undefined>(`document.getElementById("zh-ear").remove()`);
  return { read, box: extentOf(rows, x0, y0, dominant(1)) };
}

export async function zh11EarOnCorner(k: ZoomKit, pick: HamletWindow): Promise<void> {
  await ensureHeldDeepInset(k, pick);
  const at = await k.evaluate<{ cu: number; cv: number }>(
    `(()=>{const s=[...document.querySelectorAll("#map .region-inset svg")].pop().getBoundingClientRect();const m=document.getElementById("map").getBoundingClientRect();return{cu:(s.right-m.left)/m.width-0.004,cv:(s.top-m.top)/m.height+0.004};})()`,
  );
  await deep(k, at.cu, at.cv);
  await mouse(k, 3, 3);
  const rest = await earPaint(k);
  await mouse(k, rest.read.aim[0] - 3, rest.read.aim[1]);
  await mouse(k, rest.read.aim[0], rest.read.aim[1]);
  let prev: string | null = null;
  for (let i = 0; i < 20; i++) {
    const r = await k.evaluate<EarRead>(EAR);
    const now = r.hover ? JSON.stringify(r.ear) : null;
    if (now !== null && now === prev) break;
    prev = now;
    await k.sleep(50);
  }
  const hover = await earPaint(k);
  await mouse(k, 3, 3);
  const faults: string[] = [];
  for (const [name, m, want] of [
    ["at rest", rest, EAR_PX],
    ["hovered", hover, EAR_HOVER_PX],
  ] as const) {
    if (!m.box) faults.push(`${name}: no painted ear`);
    else {
      if (Math.abs(m.box.right - m.read.svgRight) > TOLERANCE_PX)
        faults.push(`${name}: right edge ${(m.box.right - m.read.svgRight).toFixed(2)} px off the corner`);
      if (Math.abs(m.box.top - m.read.svgTop) > TOLERANCE_PX)
        faults.push(`${name}: top edge ${(m.box.top - m.read.svgTop).toFixed(2)} px off the corner`);
      if (Math.abs(m.box.right - m.box.left - want) > TOLERANCE_PX)
        faults.push(`${name}: ${m.box.right - m.box.left} px wide, not ${want}`);
    }
  }
  if (!hover.read.hover || !hover.read.atAim) faults.push("hovered: the pointer is not on the ear at its aim");
  k.check(
    "ZH11 at 24 times held, the turned corner sits on the region sheet's own top-right corner within 3 px, at 54.4 px at rest and 65.6 px under a real pointer, and takes the pointer at its aim (Issue #751)",
    faults.length === 0,
    JSON.stringify({ faults, rest, hover }),
  );
}

const CARD = `(()=>{const c=document.getElementById("place-card");const inner=c&&c.querySelector(".pc-inner");if(!c||c.hidden||!inner)return null;const an=inner.getAnimations();return an.length>0&&an.every((a)=>a.playState==="finished")?{tf:getComputedStyle(inner).transform}:null;})()`;
const MID_ROLL = `(()=>{const inner=document.querySelector("#place-card .pc-inner");const a=inner.getAnimations()[0];a.pause();a.currentTime=0.95*a.effect.getComputedTiming().duration;const m34=new DOMMatrix(getComputedStyle(inner).transform).m34;a.finish();return m34;})()`;

export async function zh12CardFlat(k: ZoomKit, pick: HamletWindow): Promise<void> {
  await ensureHeldDeepInset(k, pick);
  const near = await k.evaluate<{ label: string }>(
    `(()=>{const s=[...document.querySelectorAll("#map .region-inset svg")].pop().getBoundingClientRect();const cx=s.left+s.width/2,cy=s.top+s.height/2;let best=null,bd=1e9;for(const h of document.querySelectorAll("#map .place-hit")){const r=h.getBoundingClientRect();const d=Math.hypot(r.left+r.width/2-cx,r.top+r.height/2-cy);if(d<bd){bd=d;best=h;}}return{label:best.getAttribute("aria-label")};})()`,
  );
  const at = await k.evaluate<{ x: number; y: number }>(hitCentre(near.label));
  const m = await k.evaluate<{ cu: number; cv: number }>(
    `(()=>{const m=document.getElementById("map").getBoundingClientRect();return{cu:(${at.x}-m.left)/m.width,cv:(${at.y}-m.top)/m.height};})()`,
  );
  await deep(k, m.cu, m.cv);
  const centre = await k.evaluate<{ x: number; y: number }>(hitCentre(near.label));
  await mouse(k, centre.x - 3, centre.y);
  await mouse(k, centre.x, centre.y);
  const rest = await makeSettle(k)<{ tf: string }>(CARD, () => true, "zh12-card-rest");
  const m34 = await k.evaluate<number>(MID_ROLL);
  await mouse(k, 3, 3);
  k.check(
    "ZH12 a place card at rest at 24 times held carries no 3D transform, so its text is painted with the sheet and not resampled, while its unfold still holds its perspective near its end (Issue #751)",
    (rest.tf === "none" || rest.tf.startsWith("matrix(")) && Math.abs(m34 + 1 / 900) <= 1e-6,
    JSON.stringify({ label: near.label, tf: rest.tf, m34 }),
  );
}

const PAPER = `(()=>{const m=document.getElementById("map").getBoundingClientRect();const s=document.querySelector("#map > svg").getBoundingClientRect();const e=[...document.querySelectorAll("#map .region-inset .dog-ear")].pop();return{mw:m.width,mh:m.height,sw:s.width,sh:s.height,ear:e?getComputedStyle(e).display:null};})()`;

type Paper = { mw: number; mh: number; sw: number; sh: number; ear: string | null };

async function onPaper(k: ZoomKit): Promise<Paper> {
  try {
    await k.send("Emulation.setEmulatedMedia", { media: "print" });
    return await k.evaluate<Paper>(PAPER);
  } finally {
    await k.send("Emulation.setEmulatedMedia", { media: "" });
  }
}

export async function zh13PrintKeepsSheet(k: ZoomKit, pick: HamletWindow): Promise<void> {
  await ensureHeldDeepInset(k, pick);
  const read = await onPaper(k);
  await home(k);
  k.check(
    "ZH13 on paper the held chart keeps its size and the turned corner stands down (Issue #751)",
    read.mw > 100 &&
      read.mh > 100 &&
      Math.abs(read.mw - read.sw) <= 1 &&
      Math.abs(read.mh - read.sh) <= 1 &&
      read.ear === "none",
    JSON.stringify(read),
  );
}
