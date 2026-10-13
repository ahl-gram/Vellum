import { PAGE_RGBA, nearRgba, tokenRgba } from "../../support/pixel.ts";
import { sendKey } from "../../support/home.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import type { ZoomKit } from "./kit.ts";
import { ringAtRest, ringScale } from "./reads.ts";
import type { Cam } from "./reads.ts";

export async function zSetup({ evaluate, shoot, waitSettled }: SuiteContext): Promise<void> {
  await evaluate(
    `(()=>{for(const id of ["ages"]){const c=document.getElementById(id);if(c.checked){c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));}}document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("draw").click();})()`,
  );
  await waitSettled("zoom-base");
  await evaluate(`window.__vellumSetRedraftEnabled(false)`);
  await shoot("explorer-zoom-k1.png");
}

export async function z1ZoomTo({ evaluate, check }: SuiteContext): Promise<void> {
  const z1 = await evaluate<{ s: Cam; matrix: string; origin: string; zoomed: boolean }>(
    `(()=>{window.__vellumZoomTo({k:3,x:-20,y:-15});const s=window.__vellumZoomState();const m=document.getElementById("map");const cs=getComputedStyle(m);return{s,matrix:cs.transform,origin:cs.transformOrigin,zoomed:document.getElementById("map-viewport").classList.contains("zoomed")};})()`,
  );
  check(
    "Z1 zoomTo lands the expected transform on #map (matrix + top-left origin, .zoomed, getState reads it)",
    z1.matrix === "matrix(3, 0, 0, 3, -20, -15)" &&
      z1.origin === "0px 0px" &&
      z1.s.k === 3 &&
      z1.s.x === -20 &&
      z1.s.y === -15 &&
      z1.zoomed === true,
    JSON.stringify(z1),
  );
}

export async function z2MaxClamp({ evaluate, check, shoot }: SuiteContext): Promise<void> {
  const z2 = await evaluate<{ s: Cam; ex: number; ey: number; W: number; H: number }>(
    `(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:99,x:-99999,y:-99999});const s=window.__vellumZoomState();return{s,ex:-(7*W),ey:-(7*H),W,H};})()`,
  );
  check(
    "Z2 clamps at the max extent (k->8, pan pinned to the far edge so the sheet still covers the viewport)",
    z2.s.k === 8 && Math.abs(z2.s.x - z2.ex) < 0.5 && Math.abs(z2.s.y - z2.ey) < 0.5,
    JSON.stringify(z2),
  );
  await shoot("explorer-zoom-k8.png");
}

export async function zK4Shot({ evaluate, shoot }: SuiteContext): Promise<void> {
  await evaluate(
    `(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:4,x:-(3*W)/2,y:-(3*H)/2});})()`,
  );
  await shoot("explorer-zoom-k4.png");
}

export async function z3MinClamp({ evaluate, check }: SuiteContext): Promise<void> {
  const z3 = await evaluate<{ s: Cam; matrix: string; inline: string; zoomed: boolean }>(
    `(()=>{window.__vellumZoomTo({k:0.1,x:500,y:500});const s=window.__vellumZoomState();const m=document.getElementById("map");return{s,matrix:getComputedStyle(m).transform,inline:m.style.transform,zoomed:document.getElementById("map-viewport").classList.contains("zoomed")};})()`,
  );
  check(
    "Z3 clamps at the min extent (k->1, pan->home; idle DOM restored: transform none, no .zoomed)",
    z3.s.k === 1 && z3.s.x === 0 && z3.s.y === 0 && z3.matrix === "none" && z3.inline === "" && z3.zoomed === false,
    JSON.stringify(z3),
  );
}

export async function z4RoundTrip({ evaluate, check }: SuiteContext): Promise<void> {
  const z4 = await evaluate<{ a: Cam; b: Cam }>(
    `(()=>{window.__vellumZoomTo({k:2,x:-10,y:-10});const a=window.__vellumZoomState();window.__vellumZoomTo(a);const b=window.__vellumZoomState();return{a,b};})()`,
  );
  check(
    "Z4 getState round-trips an in-bounds transform (k=2, x=-10, y=-10)",
    z4.a.k === 2 && z4.a.x === -10 && z4.a.y === -10 && z4.b.k === z4.a.k && z4.b.x === z4.a.x && z4.b.y === z4.a.y,
    JSON.stringify(z4),
  );
}

export async function z6PinnedCard({ evaluate, check, shoot, sleep }: SuiteContext): Promise<void> {
  const z6 = await evaluate<{ ok: false } | { ok: true; shown: boolean; pinned: boolean; scaled: boolean }>(
    `(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:2,x:-W/2,y:-H/2});const vr=vp.getBoundingClientRect();const cx=vr.left+vr.width/2,cy=vr.top+vr.height/2;const hits=[...document.querySelectorAll("#map .place-hit")];let best=null,bd=Infinity;for(const h of hits){const r=h.getBoundingClientRect();if(r.width===0)continue;const d=Math.hypot(r.left+r.width/2-cx,r.top+r.height/2-cy);if(d<bd){bd=d;best=h;}}if(!best)return{ok:false};best.click();const card=document.getElementById("place-card");const m=document.getElementById("map");return{ok:true,shown:!card.hidden,pinned:card.classList.contains("pinned"),scaled:getComputedStyle(m).transform.startsWith("matrix(2, 0, 0, 2,")};})()`,
  );
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
  const z8 = await evaluate<
    { ok: false } | { ok: true; w1: number; w8: number; cardK1: string; cardK8: string; mapK8: string }
  >(`(()=>{
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
  const z8b = await evaluate<
    | { ok: false; x?: undefined; y?: undefined }
    | { ok: true; x: number; y: number; hitW: number; overlayK: string | null; mapK: string }
  >(`(()=>{
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
  // Poll, never sleep: opacity below has NO tolerance, and Issue #381's second lane stretched this 180ms grow-in past a fixed 400ms once in eight runs (o=0.906, still climbing).
  let z8bRing = await readRing();
  for (let i = 0; i < 60 && !ringAtRest(z8bRing); i++) {
    await sleep(50);
    z8bRing = await readRing();
  }
  const z8bScale = ringScale(z8bRing);
  check(
    "Z8b a hovered hit holds its designed ~26px box at zoom, ring pseudo at scale(1), var on the overlay never #map (#331)",
    z8b.ok &&
      z8bRing.hover &&
      Math.abs(z8bScale - 1) <= 0.02 &&
      parseFloat(z8bRing.o) === 1 &&
      z8b.overlayK === "4" &&
      z8b.mapK === "" &&
      Math.abs(z8b.hitW - 26) <= 1,
    JSON.stringify({ z8b, z8bRing, z8bScale }),
  );
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5 });
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
}

type RingRead = {
  content: string;
  width: string;
  height: string;
  bw: string;
  bs: string;
  bc: number[];
  radius: string;
  opacity: string;
  transform: string;
};
type Hit = {
  rect: [number, number, number, number];
  nx: number;
  ny: number;
  map: [number, number, number, number];
  near: boolean;
  focused: boolean;
  hovered: boolean;
  ring: RingRead;
};
const HIT = (idx: number): Payload<Hit | null> => `(() => { const rgba = ${PAGE_RGBA};
  const t = document.querySelector('#map .place-hit[data-idx="${idx}"]'); if (!t) return null;
  const m = document.getElementById("map"), b = t.getBoundingClientRect(), mb = m.getBoundingClientRect(), s = getComputedStyle(t, "::after");
  return { rect: [b.left, b.top, b.width, b.height], nx: parseFloat(t.style.left) / 100, ny: parseFloat(t.style.top) / 100,
    map: [mb.left, mb.top, mb.width, mb.height], near: t.classList.contains("pc-near"), focused: document.activeElement === t, hovered: t.matches(":hover"),
    ring: { content: s.content, width: s.width, height: s.height, bw: s.borderTopWidth, bs: s.borderTopStyle, bc: rgba(s.borderTopColor), radius: s.borderTopLeftRadius, opacity: s.opacity, transform: s.transform } }; })()`;

const TARGET: Payload<{ t: number; p: number } | null> =
  `(() => { const vp = document.getElementById("map-viewport"), vr = vp.getBoundingClientRect();
  const cx = vr.left + vr.width / 2, cy = vr.top + vr.height / 2;
  const hits = [...document.querySelectorAll("#map .place-hit")].map((h) => { const r = h.getBoundingClientRect(); return { idx: Number(h.dataset.idx), x: r.left + r.width / 2, y: r.top + r.height / 2 }; }).filter((h) => h.idx >= 1);
  let best = null, bd = Infinity; for (const h of hits) { const d = Math.hypot(h.x - cx, h.y - cy); if (d < bd) { bd = d; best = h; } }
  if (!best) return null;
  return { t: best.idx, p: hits.some((h) => h.idx === best.idx - 1) ? best.idx - 1 : -1 }; })()`;

const CENTRE = (
  idx: number,
): Payload<boolean> => `(() => { const vp = document.getElementById("map-viewport"), t = document.querySelector('#map .place-hit[data-idx="${idx}"]');
  if (!t) return false; const vr = vp.getBoundingClientRect(), r = t.getBoundingClientRect();
  const px = r.left + r.width / 2 - vr.left, py = r.top + r.height / 2 - vr.top;
  window.__vellumZoomTo({ k: 4, x: vp.clientWidth / 2 - 4 * px, y: vp.clientHeight / 2 - 4 * py }); return true; })()`;

const SHOWN = (
  idx: number,
): Payload<{ focused: boolean; visible: boolean; opacity: string; transform: string } | null> =>
  `(() => { const t = document.querySelector('#map .place-hit[data-idx="${idx}"]'); if (!t) return null;
  const s = getComputedStyle(t, "::after");
  return { focused: document.activeElement === t, visible: t.matches(":focus-visible"), opacity: s.opacity, transform: s.transform }; })()`;

const park = async ({ evaluate, send }: Pick<SuiteContext, "evaluate" | "send">): Promise<void> => {
  await evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur()`);
  await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5 });
};
const scaleOf = (m: string): number => Number((/^matrix\(([-\d.]+)/.exec(m) || [])[1] ?? "NaN");
const faults = (parts: (true | string)[]): string[] => parts.filter((f): f is string => f !== true);

const ringFaults = (label: string, r: RingRead, opacity: string, scale: number, tolerance: number): string[] =>
  faults([
    r.content === '""' || `${label}: ring content ${r.content}`,
    (r.width === "20px" && r.height === "20px") || `${label}: ring ${r.width}x${r.height}`,
    (r.bw === "2px" && r.bs === "solid") || `${label}: ring border ${r.bw} ${r.bs}`,
    nearRgba(r.bc, tokenRgba("--ink-dark")) || `${label}: ring colour ${JSON.stringify(r.bc)}`,
    r.radius === "50%" || `${label}: ring radius ${r.radius}`,
    r.opacity === opacity || `${label}: ring opacity ${r.opacity}, want ${opacity}`,
    Math.abs(scaleOf(r.transform) - scale) <= tolerance ||
      `${label}: ring scale ${scaleOf(r.transform)}, want ${scale}`,
  ]);

const hitFaults = (label: string, h: Hit | null): string[] => {
  if (!h) return [`${label}: no hit`];
  const markX = h.map[0] + h.nx * h.map[2],
    markY = h.map[1] + h.ny * h.map[3],
    cx = h.rect[0] + h.rect[2] / 2,
    cy = h.rect[1] + h.rect[3] / 2;
  return faults([
    (Math.abs(cx - markX) <= 0.5 && Math.abs(cy - markY) <= 0.5) ||
      `${label}: box centre ${cx},${cy} against the mark ${markX},${markY}`,
    (Math.abs(h.rect[2] - 26) <= 1 && Math.abs(h.rect[3] - 26) <= 1) || `${label}: box ${h.rect[2]}x${h.rect[3]}`,
    (!h.near && !h.focused && !h.hovered) || `${label}: the hit is raised, focused or hovered`,
    ...ringFaults(label, h.ring, "0", 0.85, 0.005),
  ]);
};

export async function z22HitAndRing({ evaluate, send, check, sleep }: SuiteContext): Promise<void> {
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5 });
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  const target = await evaluate(TARGET);
  type Shown = { focused: boolean; visible: boolean; opacity: string; transform: string } | null;
  const shownOf = async (idx: number): Promise<Shown> => {
    let last = await evaluate(SHOWN(idx));
    for (let i = 0; i < 30 && last; i++) {
      if (last.focused && last.opacity === "1") break;
      await sleep(50);
      last = await evaluate(SHOWN(idx));
    }
    return last;
  };
  const read: { at1: Hit | null; at4: Hit | null; shown: Shown } = { at1: null, at4: null, shown: null };
  try {
    if (target && target.t >= 0) {
      read.at1 = await evaluate(HIT(target.t));
      await evaluate(CENTRE(target.t));
      read.at4 = await evaluate(HIT(target.t));
      if (target.p >= 0) {
        await evaluate(
          `document.querySelector('#map .place-hit[data-idx="${target.p}"]').focus({ preventScroll: true })`,
        );
        await sendKey(send, "Tab", "Tab", 9);
        read.shown = await shownOf(target.t);
      }
    }
  } finally {
    await park({ evaluate, send });
  }
  const { at1, at4, shown } = read;
  const wrong = faults([
    (!!target && target.t >= 0 && target.p >= 0) || "no target or no town one index below it",
    ...hitFaults("k=1", at1),
    ...hitFaults("k=4", at4),
    (!!shown &&
      shown.focused &&
      shown.visible &&
      shown.opacity === "1" &&
      Math.abs(scaleOf(shown.transform) - 1) <= 0.02) ||
      `the keyboard ring: ${JSON.stringify(shown)}`,
  ]);
  check(
    "Z22 a hit holds its 26px box on its mark at rest and at depth, its resting ring 20px at 0.85 with no division of its own, and a keyboard's focus grows the ring to 1 at depth",
    wrong.length === 0,
    JSON.stringify({ wrong, target, at1, at4, shown }),
  );
}

type Row = {
  idx: number;
  rested: boolean;
  flipH: boolean;
  flipV: boolean;
  dx: number;
  dy: number;
  card: [number, number, number, number];
  box: [number, number, number, number];
};
const REST_ONE: (idx: number) => Payload<{ rested: boolean; flipH: boolean; flipV: boolean } | null> = (idx) =>
  `(async () => { const card = document.getElementById("place-card"), h = document.querySelector('.place-overlay .place-hit[data-idx="${idx}"]');
  if (!h) return null; h.focus({ preventScroll: true });
  const name = (h.getAttribute("aria-label") || "").split(", ")[0], frame = () => new Promise((r) => requestAnimationFrame(r));
  let rested = false;
  for (let i = 0; i < 12; i++) {
    const inner = card.querySelector(".pc-inner"), a = inner ? inner.getAnimations() : [];
    if (!card.hidden && (card.querySelector(".pc-name") || {}).textContent === name && a.length > 0 && a.every((v) => v.playState === "finished")) { rested = true; break; }
    await frame();
  }
  return { rested, flipH: card.classList.contains("flip-h"), flipV: card.classList.contains("flip-v") }; })()`;

const REAPPLY: Payload<boolean> = `(() => { window.__vellumZoomTo(window.__vellumZoomState()); return true; })()`;

const RECT: Payload<{
  card: [number, number, number, number];
  box: [number, number, number, number];
  dx: number;
  dy: number;
} | null> = `(() => { const card = document.getElementById("place-card"), vp = document.getElementById("map-viewport");
  if (!card) return null; const r = card.getBoundingClientRect(), b = vp.getBoundingClientRect();
  return { card: [r.left, r.top, r.right, r.bottom], box: [b.left, b.top, b.right, b.bottom],
    dx: parseFloat(card.style.getPropertyValue("--pc-dx") || "0"), dy: parseFloat(card.style.getPropertyValue("--pc-dy") || "0") }; })()`;

const HITS: Payload<number[]> =
  `[...document.querySelectorAll(".place-overlay .place-hit")].map((h) => Number(h.dataset.idx))`;

export async function z25ClampFlush({ evaluate, send, check }: SuiteContext): Promise<void> {
  await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
  await evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5 });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const rows: Row[] = [];
  try {
    await evaluate(
      `(() => { const vp = document.getElementById("map-viewport"); window.__vellumZoomTo({ k: 4, x: -(3 * vp.clientWidth) / 2, y: -(3 * vp.clientHeight) / 2 }); })()`,
    );
    const hits = await evaluate(HITS);
    for (const idx of hits) {
      const rest = await evaluate(REST_ONE(idx));
      if (!rest) continue;
      // The clamp measured the card in the same task that wrote its anchor, where this page's style has not landed yet, so a camera re-apply re-clamps against the settled box (the path every redraft's fresh card takes); the rect is then read from node, which is where the settled style lands.
      await evaluate(REAPPLY);
      const r = await evaluate(RECT);
      if (!r) continue;
      rows.push({
        idx,
        rested: rest.rested,
        flipH: rest.flipH,
        flipV: rest.flipV,
        dx: r.dx,
        dy: r.dy,
        card: r.card,
        box: r.box,
      });
    }
  } finally {
    await evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur()`);
    await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
    await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
    await send("Emulation.setEmulatedMedia", { features: [] });
  }
  const wrong: string[] = [];
  if (rows.length === 0) wrong.push("no cards read");
  const flush = (r: Row): string[] => {
    const [cl, ct, cr, cb] = r.card,
      [bl, bt, br, bb] = r.box;
    return faults([
      r.rested || `hit ${r.idx}: the card never rested`,
      (cl >= bl - 0.5 && cr <= br + 0.5 && ct >= bt - 0.5 && cb <= bb + 0.5) ||
        `hit ${r.idx}: card ${cl},${ct},${cr},${cb} outside ${bl},${bt},${br},${bb}`,
      r.dx === 0 || Math.abs(cr - br) <= 0.5 || Math.abs(cl - bl) <= 0.5 || `hit ${r.idx}: dx ${r.dx} off neither edge`,
      r.dy === 0 || Math.abs(cb - bb) <= 0.5 || Math.abs(ct - bt) <= 0.5 || `hit ${r.idx}: dy ${r.dy} off neither edge`,
    ]);
  };
  for (const r of rows) wrong.push(...flush(r));
  const witness = ["plain", "h", "v", "hv"].filter(
    (v) => !rows.some((r) => variantOf(r) === v && r.dx !== 0) || !rows.some((r) => variantOf(r) === v && r.dy !== 0),
  );
  if (witness.length) wrong.push(`no nudge witness on ${witness.join(", ")}`);
  check(
    "Z25 every card shown at depth is nudged flush into its box, in all four variants on both axes",
    wrong.length === 0,
    JSON.stringify({ wrong, hits: rows.length, variants: rows.map((r) => `${r.idx}:${variantOf(r)}:${r.dx},${r.dy}`) }),
  );
}

async function sweepSeats(evaluate: SuiteContext["evaluate"]): Promise<Row[]> {
  const rows: Row[] = [];
  for (const idx of await evaluate(HITS)) {
    const rest = await evaluate(REST_ONE(idx));
    if (!rest) continue;
    // The clamp measured the card in the same task that wrote its anchor, where this page's style has not landed yet, so a camera re-apply re-clamps against the settled box (the path every redraft's fresh card takes); the rect is then read from node, which is where the settled style lands.
    await evaluate(REAPPLY);
    const r = await evaluate(RECT);
    if (!r) continue;
    rows.push({
      idx,
      rested: rest.rested,
      flipH: rest.flipH,
      flipV: rest.flipV,
      dx: r.dx,
      dy: r.dy,
      card: r.card,
      box: r.box,
    });
  }
  return rows;
}

const variantOf = (r: Row): string => (r.flipH ? "h" : "") + (r.flipV ? "v" : "") || "plain";
