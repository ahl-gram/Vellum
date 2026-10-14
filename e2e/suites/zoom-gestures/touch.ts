// The chart's touch press as the gesture suite drives it (Issue #778): off at every arrival, a browser pinch and a double tap belong to the page, and given, the chart takes the finger as it always did.
import { nearRgba, tokenRgba } from "../../support/pixel.ts";
import { makeSettle } from "../../support/settle.ts";
import { takeChartTouch, touchListeners, touchRead } from "../../support/chart-touch.ts";
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
  await k.sleep(60);
  await tapAt(k, p);
}

// Readiness: the camera has left k = 1 and two reads agree.
async function kLeft(k: GesturesKit, label: string): Promise<number> {
  return makeSettle(k)(ZOOM_K, (d, last) => d !== 1 && last === d, label);
}

// Measurement: six consecutive reads agree, past the camera's 250 ms double-click glide, and the last of them is the answer.
async function kStill(k: GesturesKit, label: string): Promise<number> {
  let same = 0;
  let prev: number | null = null;
  for (let i = 0; i < 120; i++) {
    const now = await k.evaluate(ZOOM_K);
    same = now === prev ? same + 1 : 0;
    prev = now;
    if (same >= 5) return now;
    await k.sleep(50);
  }
  throw new Error(`settle timeout ${label}: ${prev}`);
}

// The press transitions its ground over 0.2s, so a read of the dress waits for two reads of it to agree.
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

async function zg6Pinches(k: GesturesKit): Promise<void> {
  const p = await centre(k);
  await k.evaluate(
    `(window.__zg6 = 0, window.addEventListener("touchstart", () => { window.__zg6++; }, { capture: true, passive: true }), true)`,
  );
  await k.send("Input.synthesizePinchGesture", { x: p.x, y: p.y, scaleFactor: 2, gestureSourceType: "touch" });
  await makeSettle(k)<number>(`window.__zg6`, (d) => d >= 1, "ZG6 the browser's fingers reach the page");
  const scale = await makeSettle(k)(SCALE, (d, last) => d !== 1 && last === d, "ZG6 the page's scale leaves 1");
  const synthesized = await kStill(k, "ZG6 the camera rests after the browser pinch");
  k.check(
    "ZG6 with the touch press off two fingers on the sheet never reach the camera, and a browser pinch there zooms the page instead (k stays 1, the page's scale near 2; ZG4 is the same instrument's other arm) (Issue #778)",
    synthesized === 1 && scale >= 1.8,
    JSON.stringify({ synthesized, scale }),
  );
}

export async function zgTouchOff(k: GesturesKit): Promise<void> {
  await zg5AtRest(k);
  await zg5bGlassPress(k);
  await zg7DoubleTapOff(k);
  await zg6Pinches(k);
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
    "ZG4 with the chart taking touch a browser pinch over the sheet zooms the map and not the page (AC2's touch-action wiring; the dispatched pinch this check used never zoomed the page in any state, measured 2026-10-13) (Issue #778)",
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
  await takeChartTouch(k, true);
  await k.reloadHome("touch-carried");
  const carried = await k.evaluate(touchRead(BOX));
  await takeChartTouch(k, false);
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
