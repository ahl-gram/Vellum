// The chart's touch press as the gesture suite drives it (Issue #778): off at every arrival, a browser pinch and a double tap belong to the page, and given, the chart takes the finger as it always did.
import { nearRgba, tokenRgba } from "../../support/pixel.ts";
import { makeSettle } from "../../support/settle.ts";
import {
  browserPinch,
  releaseChartTouch,
  takeChartTouch,
  touchListeners,
  touchRead,
} from "../../support/chart-touch.ts";
import type { TouchRead } from "../../support/chart-touch.ts";
import type { Payload, Point } from "../../types.ts";
import { CHART_ROOM_FLOOR } from "../stage/stage.ts";
import type { GesturesKit } from "../zoom-gestures.ts";

const BOX = "#map-viewport";
const KEEP = (types: readonly string[]): boolean => types.includes("wheel") && types.includes("mousedown");
const noTouch = (types: readonly string[]): boolean => !types.some((t) => t.startsWith("touch"));
const ZOOM_K: Payload<number> = `window.__vellumZoomState().k`;
const SCALE: Payload<number> = `visualViewport.scale`;

async function centre(k: GesturesKit): Promise<Point> {
  return k.evaluate<Point>(
    `(() => { const v = document.querySelector("${BOX}"); v.scrollIntoView({ block: "center" }); const r = v.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; })()`,
  );
}

async function tapAt(k: GesturesKit, p: Point): Promise<void> {
  await k.touch("touchStart", [{ x: p.x, y: p.y, id: 0 }]);
  await k.touch("touchEnd", []);
}

async function doubleTap(k: GesturesKit, p: Point): Promise<void> {
  await tapAt(k, p);
  await k.sleep(60, "pace: the gap between the two taps of a double tap");
  await tapAt(k, p);
}

async function kLeft(k: GesturesKit, label: string): Promise<number> {
  return makeSettle(k)(ZOOM_K, (d, last) => d !== 1 && last === d, label);
}

// Six consecutive reads agree (five repeats at 50 ms: 250 ms, past the camera's 250 ms double-click glide).
const STILL_REPEATS = 5;
async function kStill(k: GesturesKit, label: string): Promise<number> {
  let same = 0;
  let prev: number | null = null;
  for (let i = 0; i < 120; i++) {
    const now = await k.evaluate(ZOOM_K);
    same = now === prev ? same + 1 : 0;
    prev = now;
    if (same >= STILL_REPEATS) return now;
    await k.sleep(50);
  }
  throw new Error(`settle timeout ${label}: ${prev}`);
}

async function dressRead(k: GesturesKit, box: string, label: string): Promise<TouchRead> {
  return makeSettle(k)(
    touchRead(box),
    (d, last) => !!last && JSON.stringify(d.ground) === JSON.stringify(last.ground),
    label,
  );
}

export async function zg1cDeskHidesTouch(k: GesturesKit): Promise<void> {
  const r = await k.evaluate(touchRead(BOX));
  k.check(
    "ZG1c where touch is not the main pointer the chart's touch press stays hidden and the gesture box keeps its class and touch-action none (Issue #778)",
    !r.shown && r.pressed === "false" && r.zoomable === true && r.touchAction === "none",
    JSON.stringify(r),
  );
}

async function zg5AtRest(k: GesturesKit): Promise<void> {
  await k.reloadHome("touch-off-boot");
  const r = await k.evaluate(touchRead(BOX));
  const types = await touchListeners(k, BOX);
  k.check(
    "ZG5 where touch is the main pointer the chart's touch press shows, off at every arrival, and the Explorer's gesture box takes no finger: no class, touch-action manipulation, no touch listener, its wheel and mouse kept (Issue #778)",
    r.shown &&
      r.pressed === "false" &&
      !r.zoomable &&
      r.touchAction === "manipulation" &&
      noTouch(types) &&
      KEEP(types),
    JSON.stringify({ r, types }),
  );
}

async function zg5bGlassPress(k: GesturesKit): Promise<void> {
  const at = await k.evaluate<{ x: number; y: number; reached: boolean }>(
    `(() => { const b = document.getElementById("zoom-in"); const r = b.getBoundingClientRect(); const x = Math.round(r.x + r.width / 2), y = Math.round(r.y + r.height / 2); return { x, y, reached: document.elementFromPoint(x, y) === b }; })()`,
  );
  if (!at.reached) throw new Error("Draw nearer is not reachable at its own centre");
  await tapAt(k, at);
  const now = await kLeft(k, "ZG5b the camera glides to the step");
  k.check(
    "ZG5b with the touch press off a real tap on Draw nearer still glides the chart to 1.4 (Issue #778)",
    Math.abs(now - 1.4) < 0.01,
    JSON.stringify({ k: now }),
  );
  await k.evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
}

async function zg7DoubleTapOff(k: GesturesKit): Promise<void> {
  const p = await centre(k);
  await k.evaluate(
    `(window.__zg7 = 0, document.querySelector("${BOX}").addEventListener("dblclick", () => { window.__zg7++; }, true), true)`,
  );
  await doubleTap(k, p);
  await makeSettle(k)<number>(`window.__zg7`, (d) => d >= 1, "ZG7 the double tap reaches the box as a double click");
  const now = await kStill(k, "ZG7 the camera rests");
  k.check(
    "ZG7 with the touch press off a double tap on the sheet reaches the box as a double click and never zooms the chart (measured 2026-10-13: without the filter's refusal it takes k to 2) (Issue #778)",
    now === 1,
    JSON.stringify({ k: now }),
  );
}

export async function zg6Pinches(k: GesturesKit): Promise<void> {
  await k.evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  const p = await centre(k);
  await browserPinch(k, p, "ZG6");
  const synthesized = await kStill(k, "ZG6 the camera rests after the browser pinch");
  const scale = await k.evaluate(SCALE);
  k.check(
    "ZG6 with the touch press off a browser pinch's two fingers on the sheet reach the page and never the camera, k staying 1 (the page's own zoom is a phone pass item; ZG4 is the same pinch with the press on) (Issue #778)",
    synthesized === 1,
    JSON.stringify({ synthesized, scale }),
  );
}

export async function zgTouchOff(k: GesturesKit): Promise<void> {
  await zg5AtRest(k);
  await zg5bGlassPress(k);
  await zg7DoubleTapOff(k);
}

export async function zg8TouchTaken(k: GesturesKit): Promise<void> {
  await k.reloadHome("touch-on-boot");
  await makeSettle(k)(SCALE, (d) => d === 1, "the page kept the browser pinch's scale across a reload");
  await takeChartTouch(k, true);
  const r = await dressRead(k, BOX, "ZG8 the lit dress rests");
  const types = await touchListeners(k, BOX);
  k.check(
    "ZG8 a real tap on the touch press gives the chart the finger: pressed and lit, the class and touch-action none back, the touch listeners bound (Issue #778)",
    r.pressed === "true" &&
      r.zoomable === true &&
      r.touchAction === "none" &&
      nearRgba(r.ground, tokenRgba("--parchment-bright")) &&
      types.includes("touchstart") &&
      types.includes("touchmove"),
    JSON.stringify({ r, types }),
  );
  await zg8bDoubleTapOn(k);
}

async function zg8bDoubleTapOn(k: GesturesKit): Promise<void> {
  const p = await centre(k);
  await doubleTap(k, p);
  const now = await kLeft(k, "ZG8b the double tap's zoom rests");
  k.check(
    "ZG8b with the chart taking touch the same double tap zooms the chart to 2, the control that proves ZG7's gesture lands (Issue #778)",
    Math.abs(now - 2) < 0.01,
    JSON.stringify({ k: now }),
  );
  await k.evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
}

export async function zg4BrowserPinch(k: GesturesKit): Promise<void> {
  await k.evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  const p = await centre(k);
  await k.send("Input.synthesizePinchGesture", { x: p.x, y: p.y, scaleFactor: 2, gestureSourceType: "touch" });
  const zoomed = await kLeft(k, "ZG4 the browser pinch's zoom rests");
  const page = await k.evaluate<{ scale: number; touchAction: string }>(
    `({ scale: visualViewport.scale, touchAction: getComputedStyle(document.querySelector("${BOX}")).touchAction })`,
  );
  k.check(
    "ZG4 with the chart taking touch a browser pinch over the sheet zooms the map and not the page (AC2's touch-action wiring, read from the computed style: while the camera listens no pinch the harness sends zooms the page, the box at none or at auto, measured 2026-10-13) (Issue #778)",
    page.touchAction === "none" && zoomed > 1.3 && Math.abs(page.scale - 1) < 0.01,
    JSON.stringify({ k: zoomed, ...page }),
  );
  await k.evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
}

export async function zg8cTakenBack(k: GesturesKit): Promise<void> {
  await takeChartTouch(k, false);
  const r = await dressRead(k, BOX, "ZG8c the dress rests");
  const types = await touchListeners(k, BOX);
  k.check(
    "ZG8c taken back on an attached camera, the press reads off though the tap still hovers it, and the box gives the finger to the page again: no class, manipulation, no touch listener (Issue #778)",
    r.pressed === "false" &&
      r.zoomable === false &&
      r.touchAction === "manipulation" &&
      !nearRgba(r.ground, tokenRgba("--parchment-bright")) &&
      noTouch(types),
    JSON.stringify({ r, types }),
  );
}

export async function zg9Rooms(k: GesturesKit): Promise<void> {
  const faults: string[] = [];
  const routes = ["/", ...CHART_ROOM_FLOOR.filter((r) => r !== "/explorer/")];
  for (const route of routes) {
    await k.send("Page.navigate", { url: "about:blank" });
    await k.send("Page.navigate", { url: `http://127.0.0.1:${k.PORT}${route}` });
    const box = route === "/" ? "#lf-stage" : BOX;
    const r = await makeSettle(k)(touchRead(box), (d) => d.shown, `ZG9 ${route} shows the touch press`, 200);
    const types = route === "/" ? [] : await touchListeners(k, box);
    const fine = r.pressed === "false" && r.zoomable === false && r.touchAction === "manipulation";
    if (!fine || (route !== "/" && !(KEEP(types) && noTouch(types)))) {
      faults.push(`${route}: ${JSON.stringify({ r, types })}`);
    }
  }
  k.check(
    "ZG9 every other chart room and home show the touch press and boot it off on an attached camera: no class, manipulation, no touch listener (Issue #778)",
    faults.length === 0,
    faults.length ? faults.join("; ") : `${routes.length} rooms held`,
  );
}

export async function zg10Carried(k: GesturesKit): Promise<void> {
  await makeSettle(k)(SCALE, (d) => d === 1, "ZG10 the page is back at scale 1 before the tap");
  await takeChartTouch(k, true);
  await k.reloadHome("touch-carried");
  const carried = await k.evaluate(touchRead(BOX));
  await releaseChartTouch(k);
  const back = await k.evaluate(touchRead(BOX));
  k.check(
    "ZG10 given in one room, the press boots given in the next, and the suite takes it back for the lane (Issue #778)",
    carried.pressed === "true" &&
      carried.zoomable === true &&
      carried.touchAction === "none" &&
      back.pressed === "false",
    JSON.stringify({ carried, back }),
  );
}

type PressAt = Point & { on: boolean };
type LoupeRead = {
  hidden: boolean;
  touchable: boolean;
  cx: number;
  cy: number;
  vx: number;
  vy: number;
  pe: string;
  gx: number;
  gy: number;
  gpe: string;
  gdisplay: string;
  pressed: string | null;
};
type Cam = { k: number; x: number; y: number };

const PRESS_AT = `(() => { const b = document.getElementById("zoom-loupe"); b.scrollIntoView({ block: "center" }); const r = b.getBoundingClientRect(); const x = Math.round(r.x + r.width / 2), y = Math.round(r.y + r.height / 2); return { x, y, on: b.contains(document.elementFromPoint(x, y)) }; })()`;
const LOUPE_READ = `(() => { const l = document.querySelector(".loupe"); const b = document.getElementById("zoom-loupe"); const pressed = b ? b.getAttribute("aria-pressed") : null; const v = document.getElementById("map-viewport").getBoundingClientRect(); const vx = v.left + v.width / 2, vy = v.top + v.height / 2; const g = l ? l.querySelector(".loupe-glass") : null; const grip = l ? l.querySelector(".loupe-grip") : null; if (!l || !g || !grip) return { hidden: true, touchable: false, cx: 0, cy: 0, vx, vy, pe: "", gx: 0, gy: 0, gpe: "", gdisplay: "", pressed }; const gr = g.getBoundingClientRect(), pr = grip.getBoundingClientRect(); return { hidden: l.hidden, touchable: l.classList.contains("touchable"), cx: gr.left + gr.width / 2, cy: gr.top + gr.height / 2, vx, vy, pe: getComputedStyle(l).pointerEvents, gx: pr.left + pr.width / 2, gy: pr.top + pr.height / 2, gpe: getComputedStyle(grip).pointerEvents, gdisplay: getComputedStyle(grip).display, pressed }; })()`;
const CAMERA = `window.__vellumZoomState()`;

async function pollRead<T>(k: GesturesKit, payload: string, ok: (d: T) => boolean): Promise<T> {
  let last = await k.evaluate<T>(payload);
  for (let i = 1; i < 40 && !ok(last); i++) {
    await k.sleep(50);
    last = await k.evaluate<T>(payload);
  }
  return last;
}

const sameCam = (a: Cam, b: Cam, dx = 0): boolean =>
  Math.abs(a.x - b.x - dx) <= 2 && Math.abs(a.y - b.y) <= 1e-6 && Math.abs(a.k - b.k) <= 1e-6;
const rounded = (x: number, y: number): Point => ({ x: Math.round(x), y: Math.round(y) });

export async function zg11LoupeDrag(k: GesturesKit): Promise<void> {
  const press = await k.evaluate<PressAt>(PRESS_AT);
  await tapAt(k, press);
  const l1 = await pollRead<LoupeRead>(k, LOUPE_READ, (d) => !d.hidden);
  const lit =
    !l1.hidden &&
    l1.touchable &&
    Math.hypot(l1.cx - l1.vx, l1.cy - l1.vy) <= 1 &&
    l1.pe === "none" &&
    l1.gpe === "auto" &&
    l1.gdisplay === "block" &&
    l1.pressed === "true";
  let moved = false;
  let camStill = false;
  let doubleTapped = false;
  let bodyPans = false;
  let outOfHand = "";
  if (!l1.hidden) {
    const vp = await k.vpRect();
    await k.evaluate(`window.__vellumZoomTo({k:2,x:${vp.W / 2}-${vp.W},y:${vp.H / 2}-${vp.H}})`);
    const l2 = await pollRead<LoupeRead>(k, LOUPE_READ, (d) => !d.hidden);
    const s0 = await k.evaluate<Cam>(CAMERA);
    const from = rounded(l2.gx, l2.gy);
    await k.touchPan(from.x, from.y, from.x + 60, from.y);
    const l3 = await pollRead<LoupeRead>(k, LOUPE_READ, (d) => Math.abs(d.cx - l2.cx - 60) <= 2);
    const s1 = await k.evaluate<Cam>(CAMERA);
    moved = Math.abs(l3.cx - l2.cx - 60) <= 2 && Math.abs(l3.cy - l2.cy) <= 2;
    camStill = sameCam(s1, s0);
    await doubleTap(k, rounded(l3.gx, l3.gy));
    const kNow = await kStill(k, "ZG11 the camera rests after the double tap on the grip");
    doubleTapped = Math.abs(kNow - 2) < 0.01 && sameCam(await k.evaluate<Cam>(CAMERA), s0);
    const body = rounded(l3.cx, l3.cy - 40);
    await k.touchPan(body.x, body.y, body.x - 50, body.y);
    const sBody = await pollRead<Cam>(k, CAMERA, (d) => Math.abs(d.x - s0.x + 50) <= 2);
    const lBody = await pollRead<LoupeRead>(k, LOUPE_READ, () => true);
    bodyPans = sameCam(sBody, s0, -50) && Math.hypot(lBody.cx - l3.cx, lBody.cy - l3.cy) <= 1;
    await takeChartTouch(k, false);
    outOfHand = (await k.evaluate<LoupeRead>(LOUPE_READ)).gpe;
    await takeChartTouch(k, true);
  }
  await tapAt(k, await k.evaluate<PressAt>(PRESS_AT));
  const off = await pollRead<LoupeRead>(k, LOUPE_READ, (d) => d.hidden);
  await k.evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  k.check(
    "ZG11 where touch is the main pointer a tap on the loupe's press shows the lens mid-chart with its grip; only the grip takes a finger, only while the chart is in hand; a drag or a double tap on the grip leaves the camera still, and a pan begun on the lens's body moves the camera under a lens that stays put (Issue #751)",
    press.on && lit && moved && camStill && doubleTapped && bodyPans && outOfHand === "none" && off.hidden,
    JSON.stringify({ press, l1, moved, camStill, doubleTapped, bodyPans, outOfHand, off: off.hidden }),
  );
}
