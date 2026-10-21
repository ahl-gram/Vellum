// The loupe's browser checks (Issue #751 pull request 2): a lens in the gesture box, read where it stands, where it stands aside and, against the camera's own paint, whether it shows what is under it at twice the depth.
import { nearRgba, PAGE_RGBA, registration, sampleRect, tokenRgba } from "../../support/pixel.ts";
import type { Registration, Rgb } from "../../support/pixel.ts";
import { makeSettle } from "../../support/settle.ts";
import { makeStage } from "../../support/home.ts";
import { home, press } from "./hold.ts";
import { sheetAtRest } from "./hold-dress.ts";
import { ensureHeldDeepInset, pollLast } from "./registration.ts";
import type { HamletWindow } from "./registration.ts";
import type { ZoomKit } from "./kit.ts";

type Point = { x: number; y: number };
type Centre = Point & { L: number; T: number; W: number; H: number; iw: number; ih: number };
type Press = Point & { on: boolean; pressed: string | null };
type Lens = {
  exists: boolean;
  parent: string | null;
  inMap: boolean;
  mapSvgs: number;
  hidden: boolean | null;
  rect: [number, number, number, number] | null;
  pe: string | null;
  ariaHidden: string | null;
  src: string | null;
  pressed: string | null;
  away: string | null;
  ground: number[] | null;
};
type Patch = { rows: Rgb[][]; still: boolean };

const PATCH_PX = 140;
const SEARCH_PX = 8;
// 2026-10-20, Chromium headless at the harness window and at 1024 by 768, four world points at 2 times and five region points at 13 and 24 times: built right, the best shift within 1 px and the correlation 0.84 to 0.99 over patches whose spread was 17 to 46; without the power, or the region sheet at the copy's origin, at most 0.17; sized in whole pixels, 3 to 6 px off.
const SHIFT_PX = 1;
const MATCH_AT_LEAST = 0.5;
const TEXTURE_AT_LEAST = 10;
const INSIDE_PX = 150;

const PRESS = `(()=>{const b=document.getElementById("zoom-loupe");if(!b)return null;const r=b.getBoundingClientRect();const x=r.x+r.width/2,y=r.y+r.height/2;return{x,y,on:b.contains(document.elementFromPoint(x,y)),pressed:b.getAttribute("aria-pressed")};})()`;
const CENTRE = `(()=>{const v=document.getElementById("map-viewport");const r=v.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,L:r.left,T:r.top,W:r.width,H:r.height,iw:innerWidth,ih:innerHeight};})()`;
const LENS = `(()=>{const rgba=${PAGE_RGBA};const l=document.querySelector(".loupe");const g=l?l.querySelector(".loupe-glass"):null;const r=g?g.getBoundingClientRect():null;const b=document.getElementById("zoom-loupe");const w=l?l.querySelector(".loupe-world"):null;return{exists:!!l,parent:l&&l.parentElement?l.parentElement.id:null,inMap:!!document.querySelector("#map .loupe"),mapSvgs:document.querySelectorAll("#map > svg").length,hidden:l?l.hidden:null,rect:r?[r.left,r.top,r.width,r.height]:null,pe:l?getComputedStyle(l).pointerEvents:null,ariaHidden:l?l.getAttribute("aria-hidden"):null,src:w?w.src:null,pressed:b.getAttribute("aria-pressed"),away:b.getAttribute("aria-disabled"),ground:rgba(getComputedStyle(b).backgroundColor)};})()`;
const LOADED = `(()=>{const l=document.querySelector(".loupe");if(!l||l.hidden)return false;return[...l.querySelectorAll("img")].filter((i)=>!i.hidden).every((i)=>i.complete&&i.naturalWidth>0);})()`;
const STATE = `window.__vellumZoomState()`;
const DEEP = `(()=>({k:window.__vellumZoomState().k,hashK:new URLSearchParams(location.hash.slice(1)).get("k")}))()`;
const CAPITAL_IDX = `(()=>{const g=document.querySelector("#map > svg .settlement-capital");const s=g?g.closest("g.settlement"):null;return s?s.dataset.idx:null;})()`;
const CAPITAL_LABEL = `(()=>{const g=document.querySelector("#map > svg .settlement-capital");const s=g?g.closest("g.settlement"):null;const t=s?s.querySelector("text"):null;if(!t)return null;const r=t.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};})()`;
const hitCentre = (idx: string | null): string =>
  `(()=>{const h=document.querySelector('#map .place-hit[data-idx="'+${JSON.stringify(idx)}+'"]');if(!h)return null;const r=h.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};})()`;
const QUIET = `(()=>{const s=document.createElement("style");s.id="zl-quiet";s.textContent="#place-card,.place-overlay,.survey-pencil{visibility:hidden!important}";document.head.appendChild(s);})()`;
const UNQUIET = `(()=>{const s=document.getElementById("zl-quiet");if(s)s.remove();})()`;
const HAMLET_DOT = (box: Centre): string =>
  `(()=>{const m=${INSIDE_PX};const L=${box.L},T=${box.T},R=${box.L + box.W},B=${box.T + box.H};const cx=${box.x},cy=${box.y};` +
  `const hs=[...document.querySelectorAll("#map .region-inset svg g.settlement[data-tier='hamlet'] circle:not(.seat-halo)")].map((c)=>{const r=c.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};})` +
  `.filter((p)=>p.x>=L+m&&p.x<=R-m&&p.y>=T+m&&p.y<=B-m&&p.x>=m&&p.x<=innerWidth-m&&p.y>=m&&p.y<=innerHeight-m);` +
  `hs.sort((a,b)=>Math.hypot(a.x-cx,a.y-cy)-Math.hypot(b.x-cx,b.y-cy));return hs[0]||null;})()`;

const mouse = (k: ZoomKit, x: number, y: number) => k.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
const key = (k: ZoomKit, type: "keyDown" | "keyUp") =>
  k.send(
    "Input.dispatchKeyEvent",
    type === "keyDown"
      ? { type, key: "l", code: "KeyL", windowsVirtualKeyCode: 76, text: "l" }
      : { type, key: "l", code: "KeyL", windowsVirtualKeyCode: 76 },
  );
const lens = (k: ZoomKit) => k.evaluate<Lens>(LENS);
const shown = (d: Lens): boolean => d.hidden === false;
const hiddenNow = (d: Lens): boolean => d.hidden === true;
const centred = (d: Lens, p: Point): boolean =>
  !!d.rect && Math.hypot(d.rect[0] + d.rect[2] / 2 - p.x, d.rect[1] + d.rect[3] / 2 - p.y) <= 1;

async function clickLoupe(k: ZoomKit): Promise<boolean> {
  const p = await k.evaluate<Press | null>(PRESS);
  if (!p) return false;
  await makeStage(k).clickAt(p.x, p.y);
  return p.on;
}

async function setLoupe(k: ZoomKit, on: boolean): Promise<void> {
  const p = await k.evaluate<Press | null>(PRESS);
  if (p && p.pressed !== String(on) && !(await clickLoupe(k))) throw new Error("the loupe's press is not reachable");
}

async function still(k: ZoomKit, at: Point): Promise<Patch> {
  const x = Math.max(0, Math.round(at.x - PATCH_PX / 2));
  const y = Math.max(0, Math.round(at.y - PATCH_PX / 2));
  let rows = await sampleRect(k.send, x, y, PATCH_PX, PATCH_PX);
  for (let i = 0; i < 12; i++) {
    await k.sleep(100);
    const next = await sampleRect(k.send, x, y, PATCH_PX, PATCH_PX);
    const same = JSON.stringify(next) === JSON.stringify(rows);
    rows = next;
    if (same) return { rows, still: true };
  }
  return { rows, still: false };
}

async function printedDisplay(k: ZoomKit): Promise<string | null> {
  try {
    await k.send("Emulation.setEmulatedMedia", { media: "print" });
    return await k.evaluate<string | null>(
      `(()=>{const l=document.querySelector(".loupe");return l?getComputedStyle(l).display:null;})()`,
    );
  } finally {
    await k.send("Emulation.setEmulatedMedia", { media: "" });
  }
}

export async function zl1PressShowsLens(k: ZoomKit): Promise<void> {
  await home(k);
  await setLoupe(k, false);
  const reached = await clickLoupe(k);
  const c = await k.evaluate<Centre>(CENTRE);
  await mouse(k, c.x, c.y);
  const on = await pollLast<Lens>(k, LENS, shown, 40);
  const printed = await printedDisplay(k);
  await mouse(k, 3, 3);
  const left = await pollLast<Lens>(k, LENS, hiddenNow, 40);
  await clickLoupe(k);
  const off = await pollLast<Lens>(k, LENS, (d) => d.pressed === "false", 40);
  const [x, y, w, h] = on.rect ?? [0, 0, 0, 0];
  const want = tokenRgba("--parchment-bright");
  k.check(
    "ZL1 the loupe's press shows a 240 px lens centred on the pointer, seated in the gesture box and never in the chart mount, lit while on and printed as nothing, and leaving the chart hides it (Issue #751)",
    reached &&
      on.exists &&
      on.parent === "map-viewport" &&
      !on.inMap &&
      on.mapSvgs === 1 &&
      shown(on) &&
      Math.abs(w - 240) <= 0.5 &&
      Math.abs(h - 240) <= 0.5 &&
      Math.hypot(x + w / 2 - c.x, y + h / 2 - c.y) <= 1 &&
      on.pe === "none" &&
      on.ariaHidden === "true" &&
      on.pressed === "true" &&
      on.away === "false" &&
      nearRgba(on.ground, want) &&
      printed === "none" &&
      hiddenNow(left) &&
      off.pressed === "false",
    JSON.stringify({ reached, on, printed, left: left.hidden, off: off.pressed }),
  );
}

type Turn = {
  target: string;
  turning: boolean;
  hidden: boolean | null;
  p1: string | null;
  p2: string | null;
  away: string | null;
  holdAway: string | null;
};
// `.click()` is wiring in TURN and VERSO_CLICK: a real click would carry the pointer off the chart, which hides the lens on its own.
const FRAME = `await new Promise((r)=>requestAnimationFrame(r));`;
const TURN = `(async()=>{const s=document.getElementById("style");const target=s.value==="antique"?"topographic":"antique";s.value=target;s.dispatchEvent(new Event("change",{bubbles:true}));const sheet=document.getElementById("sheet");for(let i=0;i<400&&!sheet.classList.contains("turning");i++)await new Promise((r)=>setTimeout(r,10));const turning=sheet.classList.contains("turning");${FRAME}const l=document.querySelector(".loupe");const hidden=l?l.hidden:null;const b=document.getElementById("zoom-loupe");b.click();const p1=b.getAttribute("aria-pressed");b.click();const p2=b.getAttribute("aria-pressed");return{target,turning,hidden,p1,p2,away:b.getAttribute("aria-disabled"),holdAway:document.getElementById("zoom-hold").getAttribute("aria-disabled")};})()`;
const VERSO_CLICK = `(async()=>{document.getElementById("verso-turn").click();${FRAME}const l=document.querySelector(".loupe");return l?l.hidden:null;})()`;
const LANDED = `(()=>{const s=document.getElementById("sheet");const i=document.querySelector(".sheet-inner");return!!s&&!!i&&s.classList.contains("versoed")&&new DOMMatrix(getComputedStyle(i).transform).m11<-0.999;})()`;
const FLIP_DONE = `!document.getElementById("sheet").classList.contains("flip3d")`;

export async function zl2StandsAsideInMotion(k: ZoomKit): Promise<void> {
  await home(k);
  await setLoupe(k, true);
  const c = await k.evaluate<Centre>(CENTRE);
  await mouse(k, c.x, c.y);
  const before = await pollLast<Lens>(k, LENS, shown, 40);
  const mid = await k.evaluate<Turn>(TURN, true);
  await k.waitSettled("zl2-turn");
  await sheetAtRest(k, "zl2-rest");
  await mouse(k, c.x + 1, c.y);
  const after = await pollLast<Lens>(k, LENS, shown, 40);
  const fetched = await k.evaluate<string>(
    `fetch(${JSON.stringify(String(before.src))}).then(()=>"resolved",()=>"refused")`,
    true,
  );
  const verso = await k.evaluate<boolean | null>(VERSO_CLICK, true);
  await makeSettle(k)<boolean>(LANDED, (d) => d, "zl2-verso");
  const turningBack = await k.evaluate<boolean | null>(VERSO_CLICK, true);
  await makeSettle(k)<boolean>(FLIP_DONE, (d) => d, "zl2-recto");
  await mouse(k, c.x, c.y);
  const recto = await pollLast<Lens>(k, LENS, shown, 40);
  await setLoupe(k, false);
  k.check(
    "ZL2 while a world is drawn or turned the lens stands aside and its press, like the hold's, is ignored and heard as unavailable, the lens also standing aside while the sheet is off its recto; a turned draw hands it the new sheet and refuses the old url (Issue #751)",
    shown(before) &&
      mid.turning &&
      mid.hidden === true &&
      mid.p1 === "true" &&
      mid.p2 === "true" &&
      mid.away === "true" &&
      mid.holdAway === "true" &&
      shown(after) &&
      after.pressed === "true" &&
      after.away === "false" &&
      after.src !== before.src &&
      fetched === "refused" &&
      verso === true &&
      turningBack === true &&
      shown(recto),
    JSON.stringify({ before: before.hidden, mid, after, fetched, verso, turningBack, recto: recto.hidden }),
  );
}

type Arm = Registration & {
  found: boolean;
  loaded: boolean;
  still: [boolean, boolean];
  clamped: boolean;
  intErr: number;
};
const NONE: Arm = {
  found: false,
  loaded: false,
  still: [false, false],
  clamped: true,
  intErr: 0,
  dx: 99,
  dy: 99,
  ncc: -2,
  std: 0,
};
const insideBoth = (p: Point, b: Centre): boolean =>
  p.x - INSIDE_PX >= b.L &&
  p.x + INSIDE_PX <= b.L + b.W &&
  p.y - INSIDE_PX >= b.T &&
  p.y + INSIDE_PX <= b.T + b.H &&
  p.x >= INSIDE_PX &&
  p.x <= b.iw - INSIDE_PX &&
  p.y >= INSIDE_PX &&
  p.y <= b.ih - INSIDE_PX;
type Cam = { k: number; x: number; y: number };

async function lensVersusCamera(k: ZoomKit, at: Point): Promise<Arm> {
  await setLoupe(k, true);
  await mouse(k, at.x, at.y);
  const loaded = await pollLast<boolean>(k, LOADED, (d) => d, 40);
  const seen = await still(k, at);
  await setLoupe(k, false);
  const z = await k.evaluate<Cam>(STATE);
  const b = await k.evaluate<Centre>(CENTRE);
  const lx = at.x - b.L;
  const ly = at.y - b.T;
  const want = { k: z.k * 2, x: lx - (lx - z.x) * 2, y: ly - (ly - z.y) * 2 };
  await k.evaluate(`window.__vellumZoomTo(${JSON.stringify(want)})`);
  await makeSettle(k)<{ k: number; hashK: string | null }>(
    DEEP,
    (d) => d.k === want.k && d.hashK === Math.min(want.k, 8).toFixed(4),
    "zl3-camera",
  );
  const got = await k.evaluate<Cam>(STATE);
  const cam = await still(k, at);
  const r = registration(seen.rows, cam.rows, SEARCH_PX);
  await k.evaluate(`window.__vellumZoomTo(${JSON.stringify(z)})`);
  const intErr =
    Math.max((Math.abs(b.W - Math.round(b.W)) * lx) / b.W, (Math.abs(b.H - Math.round(b.H)) * ly) / b.H) * want.k;
  const clamped = [got.x - want.x, got.y - want.y, got.k - want.k].some((d) => Math.abs(d) > 1e-6);
  return { ...r, found: true, loaded, still: [seen.still, cam.still], clamped, intErr };
}

const armOk = (a: Arm): boolean =>
  a.found &&
  a.loaded &&
  a.still[0] &&
  a.still[1] &&
  !a.clamped &&
  Math.abs(a.dx) <= SHIFT_PX &&
  Math.abs(a.dy) <= SHIFT_PX &&
  a.ncc >= MATCH_AT_LEAST &&
  a.std >= TEXTURE_AT_LEAST;

async function worldArm(k: ZoomKit): Promise<Arm> {
  await home(k);
  await press(k);
  const at = await k.evaluate<Point | null>(CAPITAL_LABEL);
  const b = await k.evaluate<Centre>(CENTRE);
  const arm = at && insideBoth(at, b) ? await lensVersusCamera(k, at) : NONE;
  await home(k);
  return arm;
}

async function regionArm(k: ZoomKit, pick: HamletWindow): Promise<Arm> {
  await ensureHeldDeepInset(k, pick);
  await k.enterAt(12, pick.cx, pick.cy);
  await makeSettle(k)<{ k: number; hashK: string | null }>(DEEP, (d) => d.k === 12 && d.hashK === "8.0000", "zl3-deep");
  const b = await k.evaluate<Centre>(CENTRE);
  const at = await k.evaluate<Point | null>(HAMLET_DOT(b));
  return at ? lensVersusCamera(k, at) : NONE;
}

async function bothArms(k: ZoomKit, pick: HamletWindow): Promise<{ world: Arm; region: Arm }> {
  try {
    await k.evaluate(QUIET);
    const world = await worldArm(k);
    return { world, region: await regionArm(k, pick) };
  } finally {
    await k.evaluate(UNQUIET);
    await setLoupe(k, false);
    await home(k);
  }
}

export async function zl3LensRegisters(k: ZoomKit, pick: HamletWindow): Promise<void> {
  const { world, region } = await bothArms(k, pick);
  k.check(
    "ZL3 the lens shows the chart under the pointer at twice the camera's depth, its paint registering with the camera's own at that depth, over the world sheet and over a region sheet held at 24 times (Issue #751)",
    armOk(world) && armOk(region),
    JSON.stringify({ world, region }),
  );
}

export async function zl4HeldKey(k: ZoomKit): Promise<void> {
  await home(k);
  await setLoupe(k, false);
  // `.focus()` is wiring: the key path is under test, and a real click on the chart could pin a town's card.
  await k.evaluate(`document.getElementById("map-viewport").focus()`);
  const c = await k.evaluate<Centre>(CENTRE);
  const p1 = { x: c.x - 100, y: c.y - 60 };
  await mouse(k, p1.x, p1.y);
  const r0 = await lens(k);
  await key(k, "keyDown");
  const r1 = await pollLast<Lens>(k, LENS, shown, 40);
  await key(k, "keyUp");
  const r2 = await pollLast<Lens>(k, LENS, hiddenNow, 40);
  await mouse(k, 3, 3);
  await key(k, "keyDown");
  const r3 = await pollLast<Lens>(k, LENS, shown, 40);
  await k.evaluate(`document.getElementById("seed").focus()`);
  const r4 = await pollLast<Lens>(k, LENS, hiddenNow, 40);
  await key(k, "keyUp");
  const idx = await k.evaluate<string | null>(CAPITAL_IDX);
  await k.evaluate(
    `(()=>{const h=document.querySelector('#map .place-hit[data-idx="'+${JSON.stringify(idx)}+'"]');if(h)h.focus();})()`,
  );
  await key(k, "keyDown");
  const r5 = await pollLast<Lens>(k, LENS, shown, 40);
  await k.evaluate(`document.getElementById("seed").focus()`);
  const r6 = await pollLast<Lens>(k, LENS, hiddenNow, 40);
  await key(k, "keyUp");
  const label = await k.evaluate<string | null>(`document.getElementById("map-viewport").getAttribute("aria-label")`);
  const reads = [r0, r1, r2, r3, r4, r5, r6];
  k.check(
    "ZL4 holding L while the chart has the keyboard shows the lens under the pointer, or at the chart's centre with no pointer over the chart, and letting go or the keyboard leaving the map, from the map or from a town on it, hides it, the press untouched (Issue #751)",
    hiddenNow(r0) &&
      shown(r1) &&
      centred(r1, p1) &&
      hiddenNow(r2) &&
      shown(r3) &&
      centred(r3, c) &&
      hiddenNow(r4) &&
      shown(r5) &&
      hiddenNow(r6) &&
      reads.every((d) => d.pressed === "false") &&
      !!label &&
      label.endsWith("hold L for the loupe."),
    JSON.stringify({ reads: reads.map((d) => d.hidden), idx, label }),
  );
}

type Rect = { x: number; y: number; w: number; h: number };
const CARD = `(()=>{const c=document.getElementById("place-card");if(!c||c.hidden)return null;const a=c.querySelector(".pc-inner").getAnimations();if(!a.length||!a.every((x)=>x.playState==="finished"))return null;const r=c.getBoundingClientRect();return{x:r.left,y:r.top,w:r.width,h:r.height};})()`;

export async function zl5StandsAsideOverCard(k: ZoomKit): Promise<void> {
  await home(k);
  await setLoupe(k, true);
  const idx = await k.evaluate<string | null>(CAPITAL_IDX);
  const t = await k.evaluate<Point>(hitCentre(idx));
  await mouse(k, t.x, t.y);
  const card = await makeSettle(k)<Rect | null>(CARD, (d) => !!d, "zl5-card");
  const onTown = await pollLast<Lens>(k, LENS, shown, 40);
  const mx = card.x + card.w / 2;
  await mouse(k, mx, card.y + card.h / 2);
  const onCard = await pollLast<Lens>(k, LENS, hiddenNow, 40);
  const cardStill = await k.evaluate<boolean>(`!document.getElementById("place-card").hidden`);
  await mouse(k, mx > t.x ? t.x - 150 : t.x + 150, t.y);
  const offCard = await pollLast<Lens>(k, LENS, shown, 40);
  await setLoupe(k, false);
  k.check(
    "ZL5 the lens stands aside while the pointer is on a shown place card and comes back off it (Issue #751)",
    shown(onTown) && hiddenNow(onCard) && cardStill && shown(offCard),
    JSON.stringify({ onTown: onTown.hidden, onCard: onCard.hidden, cardStill, offCard: offCard.hidden }),
  );
}

const AGES = (on: boolean): string =>
  `(()=>{const c=document.getElementById("ages");c.checked=${on};c.dispatchEvent(new Event("change",{bubbles:true}));})()`;
const TRACK_START = `(()=>{const o=document.querySelector("#map > .voyage-overlay");const t=o?o.querySelector(".voyage-track"):null;if(!o||!t)return null;const vb=o.viewBox.baseVal;const p=(t.getAttribute("points")||"").trim().split(/\\s+/)[0].split(",").map(Number);const r=o.getBoundingClientRect();return{x:r.left+p[0]*r.width/vb.width,y:r.top+p[1]*r.height/vb.height};})()`;
const TRACK_COPY = `(()=>{const src=document.querySelector("#map > .voyage-overlay .voyage-track");const c=document.querySelector(".loupe-sheet .voyage-overlay .voyage-track");return{copies:document.querySelectorAll(".loupe .voyage-overlay").length,same:!!c&&!!src&&c.getAttribute("points")===src.getAttribute("points"),stroke:c?getComputedStyle(c).stroke:"",srcStroke:src?getComputedStyle(src).stroke:null};})()`;

type TrackCopy = { copies: number; same: boolean; stroke: string; srcStroke: string | null };

async function trackRead(k: ZoomKit): Promise<{ copy: TrackCopy; overlays: number }> {
  try {
    await k.evaluate(AGES(true));
    await k.waitInked("zl6");
    await setLoupe(k, true);
    const at = await k.evaluate<Point | null>(TRACK_START);
    if (at) await mouse(k, at.x, at.y);
    const copy = await pollLast<TrackCopy>(k, TRACK_COPY, (d) => d.copies === 1, 40);
    await setLoupe(k, false);
    return { copy, overlays: await k.evaluate<number>(`document.querySelectorAll(".voyage-overlay").length`) };
  } finally {
    await setLoupe(k, false);
    await k.evaluate(AGES(false));
    await home(k);
  }
}

export async function zl6TrackRides(k: ZoomKit): Promise<void> {
  await home(k);
  const { copy, overlays } = await trackRead(k);
  k.check(
    "ZL6 the inked survey track rides along in the lens, dressed as the chart's, and the copy goes with the lens (Issue #751)",
    copy.copies === 1 && copy.same && copy.stroke !== "" && copy.stroke === copy.srcStroke && overlays === 1,
    JSON.stringify({ copy, overlays }),
  );
}
