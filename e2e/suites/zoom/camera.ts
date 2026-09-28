import type { SuiteContext } from "../../types.ts";
import type { ZoomKit } from "./kit.ts";
import { ringAtRest, ringScale } from "./reads.ts";
import type { Cam } from "./reads.ts";

export async function zSetup({ evaluate, shoot, waitSettled }: SuiteContext): Promise<void> {
  await evaluate(`(()=>{for(const id of ["ages"]){const c=document.getElementById(id);if(c.checked){c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));}}document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("draw").click();})()`);
  await waitSettled("zoom-base");
  await evaluate(`window.__vellumSetRedraftEnabled(false)`);
  await shoot("explorer-zoom-k1.png");
}

export async function z1ZoomTo({ evaluate, check }: SuiteContext): Promise<void> {
  const z1 = await evaluate<{ s: Cam; matrix: string; origin: string; zoomed: boolean }>(`(()=>{window.__vellumZoomTo({k:3,x:-20,y:-15});const s=window.__vellumZoomState();const m=document.getElementById("map");const cs=getComputedStyle(m);return{s,matrix:cs.transform,origin:cs.transformOrigin,zoomed:document.getElementById("map-viewport").classList.contains("zoomed")};})()`);
  check(
    "Z1 zoomTo lands the expected transform on #map (matrix + top-left origin, .zoomed, getState reads it)",
    z1.matrix === "matrix(3, 0, 0, 3, -20, -15)" && z1.origin === "0px 0px" &&
      z1.s.k === 3 && z1.s.x === -20 && z1.s.y === -15 && z1.zoomed === true,
    JSON.stringify(z1),
  );
}

export async function z2MaxClamp({ evaluate, check, shoot }: SuiteContext): Promise<void> {
  const z2 = await evaluate<{ s: Cam; ex: number; ey: number; W: number; H: number }>(`(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:99,x:-99999,y:-99999});const s=window.__vellumZoomState();return{s,ex:-(7*W),ey:-(7*H),W,H};})()`);
  check(
    "Z2 clamps at the max extent (k->8, pan pinned to the far edge so the sheet still covers the viewport)",
    z2.s.k === 8 && Math.abs(z2.s.x - z2.ex) < 0.5 && Math.abs(z2.s.y - z2.ey) < 0.5,
    JSON.stringify(z2),
  );
  await shoot("explorer-zoom-k8.png");
}

export async function zK4Shot({ evaluate, shoot }: SuiteContext): Promise<void> {
  await evaluate(`(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:4,x:-(3*W)/2,y:-(3*H)/2});})()`);
  await shoot("explorer-zoom-k4.png");
}

export async function z3MinClamp({ evaluate, check }: SuiteContext): Promise<void> {
  const z3 = await evaluate<{ s: Cam; matrix: string; inline: string; zoomed: boolean }>(`(()=>{window.__vellumZoomTo({k:0.1,x:500,y:500});const s=window.__vellumZoomState();const m=document.getElementById("map");return{s,matrix:getComputedStyle(m).transform,inline:m.style.transform,zoomed:document.getElementById("map-viewport").classList.contains("zoomed")};})()`);
  check(
    "Z3 clamps at the min extent (k->1, pan->home; idle DOM restored: transform none, no .zoomed)",
    z3.s.k === 1 && z3.s.x === 0 && z3.s.y === 0 && z3.matrix === "none" && z3.inline === "" && z3.zoomed === false,
    JSON.stringify(z3),
  );
}

export async function z4RoundTrip({ evaluate, check }: SuiteContext): Promise<void> {
  const z4 = await evaluate<{ a: Cam; b: Cam }>(`(()=>{window.__vellumZoomTo({k:2,x:-10,y:-10});const a=window.__vellumZoomState();window.__vellumZoomTo(a);const b=window.__vellumZoomState();return{a,b};})()`);
  check(
    "Z4 getState round-trips an in-bounds transform (k=2, x=-10, y=-10)",
    z4.a.k === 2 && z4.a.x === -10 && z4.a.y === -10 && z4.b.k === z4.a.k && z4.b.x === z4.a.x && z4.b.y === z4.a.y,
    JSON.stringify(z4),
  );
}

export async function z6PinnedCard({ evaluate, check, shoot, sleep }: SuiteContext): Promise<void> {
  const z6 = await evaluate<{ ok: false } | { ok: true; shown: boolean; pinned: boolean; scaled: boolean }>(`(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:2,x:-W/2,y:-H/2});const vr=vp.getBoundingClientRect();const cx=vr.left+vr.width/2,cy=vr.top+vr.height/2;const hits=[...document.querySelectorAll("#map .place-hit")];let best=null,bd=Infinity;for(const h of hits){const r=h.getBoundingClientRect();if(r.width===0)continue;const d=Math.hypot(r.left+r.width/2-cx,r.top+r.height/2-cy);if(d<bd){bd=d;best=h;}}if(!best)return{ok:false};best.click();const card=document.getElementById("place-card");const m=document.getElementById("map");return{ok:true,shown:!card.hidden,pinned:card.classList.contains("pinned"),scaled:getComputedStyle(m).transform.startsWith("matrix(2, 0, 0, 2,")};})()`);
  check(
    "Z6 a card pinned while zoomed shows over the scaled chart (AC2: pinned card rides its mark)",
    z6.ok && z6.shown && z6.pinned && z6.scaled,
    JSON.stringify(z6),
  );
  await sleep(700); // let the pinned unfurl (--unfurl 650ms) settle
  await shoot("explorer-zoom-card.png");
  await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))`);
}

export async function z8CardConstant({ evaluate, check, shoot, sleep }: SuiteContext): Promise<void> {
  const z8 = await evaluate<{ ok: false } | { ok: true; w1: number; w8: number; cardK1: string; cardK8: string; mapK8: string }>(`(()=>{
    const vp=document.getElementById("map-viewport");
    window.__vellumZoomTo({k:1,x:0,y:0});
    const vr=vp.getBoundingClientRect();const cx=vr.left+vr.width/2,cy=vr.top+vr.height/2;
    const hits=[...document.querySelectorAll("#map .place-hit")];
    let best=null,bd=Infinity;for(const h of hits){const r=h.getBoundingClientRect();if(r.width===0)continue;const d=Math.hypot(r.left+r.width/2-cx,r.top+r.height/2-cy);if(d<bd){bd=d;best=h;}}
    if(!best)return{ok:false};
    const br=best.getBoundingClientRect();
    const px=br.left+br.width/2-vr.left, py=br.top+br.height/2-vr.top; // the place's local coords at k=1
    best.click();
    const card=document.getElementById("place-card");
    const m=document.getElementById("map");
    const w1=card.getBoundingClientRect().width;
    const cardK1=card.style.getPropertyValue("--zoom-k"); // the card's own inline var at home
    const W=vp.clientWidth,H=vp.clientHeight;
    window.__vellumZoomTo({k:8,x:W/2-8*px,y:H/2-8*py}); // centre the pinned place so its card is in view
    const w8=card.getBoundingClientRect().width;
    const cardK8=card.style.getPropertyValue("--zoom-k"); // published on the CARD, so it counter-scales
    const mapK8=getComputedStyle(m).getPropertyValue("--zoom-k").trim(); // MUST stay empty on #map (else labels jiggle)
    return{ok:true,w1,w8,cardK1,cardK8,mapK8};
  })()`);
  check(
    "Z8 a pinned card stays a constant screen size while zoomed, and --zoom-k rides the card not #map (no label jiggle)",
    z8.ok && Math.abs(z8.w8 - z8.w1) <= 2 && z8.cardK8 === "8" && z8.cardK1 === "" && z8.mapK8 === "",
    JSON.stringify(z8),
  );
  await sleep(700); // let the pinned unfurl (--unfurl 650ms) settle before the shot
  await shoot("explorer-zoom-card-k8.png");
  await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))`);
}

export async function z8bHoverRing({ evaluate, send, check, sleep, readRing }: ZoomKit): Promise<void> {
  const z8b = await evaluate<{ ok: false; x?: undefined; y?: undefined } | { ok: true; x: number; y: number; hitW: number; overlayK: string | null; mapK: string }>(`(()=>{
    const vp=document.getElementById("map-viewport");
    window.__vellumZoomTo({k:1,x:0,y:0});
    const vr=vp.getBoundingClientRect();const cx=vr.left+vr.width/2,cy=vr.top+vr.height/2;
    const hits=[...document.querySelectorAll("#map .place-hit")];
    let best=null,bd=Infinity;for(const h of hits){const r=h.getBoundingClientRect();if(r.width===0)continue;const d=Math.hypot(r.left+r.width/2-cx,r.top+r.height/2-cy);if(d<bd){bd=d;best=h;}}
    if(!best)return{ok:false};
    const br=best.getBoundingClientRect();
    const px=br.left+br.width/2-vr.left, py=br.top+br.height/2-vr.top;
    const W=vp.clientWidth,H=vp.clientHeight;
    window.__vellumZoomTo({k:4,x:W/2-4*px,y:H/2-4*py});
    const r4=best.getBoundingClientRect();
    const overlay=document.querySelector("#map .place-overlay");
    return{ok:true,x:Math.round(r4.left+r4.width/2),y:Math.round(r4.top+r4.height/2),hitW:r4.width,
      overlayK:overlay?overlay.style.getPropertyValue("--zoom-k"):null,
      mapK:getComputedStyle(document.getElementById("map")).getPropertyValue("--zoom-k").trim()};
  })()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: z8b.x ?? 0, y: z8b.y ?? 0 });
  // Poll, never sleep: opacity below has NO tolerance, and #381's second lane stretched this 180ms grow-in past a fixed 400ms once in eight runs (o=0.906, still climbing).
  let z8bRing = await readRing();
  for (let i = 0; i < 60 && !ringAtRest(z8bRing); i++) {
    await sleep(50);
    z8bRing = await readRing();
  }
  const z8bScale = ringScale(z8bRing);
  check(
    "Z8b a hovered hit holds its designed ~26px box at zoom, ring pseudo at scale(1), var on the overlay never #map (#331)",
    z8b.ok && z8bRing.hover && Math.abs(z8bScale - 1) <= 0.02 && parseFloat(z8bRing.o) === 1 &&
      z8b.overlayK === "4" && z8b.mapK === "" && Math.abs(z8b.hitW - 26) <= 1,
    JSON.stringify({ z8b, z8bRing, z8bScale }),
  );
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5 });
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
}
