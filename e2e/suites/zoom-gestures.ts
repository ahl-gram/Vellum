// Glass gestures e2e (Issue #166): suite-zoom's behaviour re-proven through REAL CDP input (mouse wheel, touch, device metrics); runs right after suite-zoom and restores its clean desktop home before suite-cards; the chart takes a finger only once its touch press is pressed (Issue #778), so ZG5 to ZG7 read it off, ZG9 reads every other room off, ZG10 carries it from room to room and takes it back, ZG8 presses it for ZG2 to ZG4, ZG8c takes it back, and the suite forgets it before the next. d3-zoom binds its touch listeners ONLY when the page BOOTS as a touch device (defaultTouchable reads navigator.maxTouchPoints at attach time), so the touch block enables emulation and then RELOADS. NEVER dispatch a real touch while touch emulation is off (it wedges Chrome's touch input pipeline for the WHOLE session; a real mouse wheel is safe, only touch poisons), and NEVER change the emulation config after a real touch (later touches route to native page pinch-zoom and a clear+reload does NOT recover it), and NEVER load a page in the touch block after a dispatched two-finger touch (later touches then reach no listener, a tap landing only as its click, and a pinch zooms the page whatever touch-action says; measured 2026-10-13 on main's build too, Issue #778), so every page load comes before ZG2's pinch, the touch-off pinch is the browser's own (Input.synthesizePinchGesture) and is read for its two fingers and the camera, never for the page's own zoom (linux Chrome on CI never moves visualViewport.scale under it, where Brave on macOS zooms the page to 2; measured 2026-10-13, Issue #778), and ALL touch checks run under ONE tablet-metric emulation set (1024x768, Issue #761) enabled once and left alone.
import { forgetChartTouch } from "../support/chart-touch.ts";
import { makeStep } from "../support/step.ts";
import type { SuiteContext } from "../types.ts";
import {
  zg10Carried,
  zg1cDeskHidesTouch,
  zg4BrowserPinch,
  zg8TouchTaken,
  zg6Pinches,
  zg8cTakenBack,
  zg9Rooms,
  zgTouchOff,
} from "./zoom-gestures/touch.ts";

export type GesturesKit = ReturnType<typeof gesturesKit>;

export async function run(ctx: SuiteContext): Promise<void> {
  const { setMobileViewport, clearMobile } = ctx;
  // ZG1 and ZG1b are deliberately not stepped: nothing in them throws, the wheel and the state read both return.
  const step = makeStep(ctx);
  const k = gesturesKit(ctx);

  await zg1WheelZooms(k);
  await step("ZG1c", () => zg1cDeskHidesTouch(k));
  await setMobileViewport(1024, 768);
  await step("ZG5, ZG5b, ZG7", () => zgTouchOff(k));
  await step("ZG6", () => zg6Pinches(k));
  await step("ZG9", () => zg9Rooms(k));
  await step("ZG10", () => zg10Carried(k));
  await step("ZG8, ZG8b, ZG2, ZG3, ZG4, ZG8c", async () => {
    await zg8TouchTaken(k);
    await zg2TouchGestures(k);
    await zg4BrowserPinch(k);
    await zg8cTakenBack(k);
  });
  await k.evaluate(forgetChartTouch);

  // clearMobile stays OUTSIDE every step: the runner compensates for a suite left at phone metrics in onSuiteError, which a contained step no longer reaches.
  await clearMobile();
  await step("ZG restore", () => zgRestore(k));
}

function gesturesKit(ctx: SuiteContext) {
  const { evaluate, send, waitReady, waitSettled, PORT } = ctx;
  async function reloadHome(label: string): Promise<void> {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#seed=42&style=antique` });
    await waitReady();
    await evaluate(`window.__vellumSetRedraftEnabled(false)`);
    await waitSettled(label);
  }
  const vpRect = () =>
    evaluate<{ L: number; T: number; W: number; H: number }>(
      `(()=>{const v=document.getElementById("map-viewport");const r=v.getBoundingClientRect();return{L:r.left,T:r.top,W:v.clientWidth,H:v.clientHeight};})()`,
    );
  const state = () => evaluate<{ k: number; x: number; y: number }>(`window.__vellumZoomState()`);
  return { ...ctx, reloadHome, vpRect, state };
}

async function zg1WheelZooms({ evaluate, check, shoot, sleep, wheel, vpRect, state }: GesturesKit): Promise<void> {
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  let r = await vpRect();
  const px = Math.round(r.W * 0.3),
    py = Math.round(r.H * 0.5);
  await wheel(r.L + px, r.T + py, -240);
  await sleep(80);
  const zg1 = await state();
  check(
    "ZG1 a real mouse wheel zooms in about the cursor (AC1: exact pointer-fixed transform)",
    zg1.k > 1.05 && Math.abs(zg1.x - px * (1 - zg1.k)) < 1 && Math.abs(zg1.y - py * (1 - zg1.k)) < 1,
    JSON.stringify({ zg1, predictedX: px * (1 - zg1.k), predictedY: py * (1 - zg1.k) }),
  );
  await shoot("explorer-gesture-wheel.png");

  r = await vpRect();
  await wheel(r.L + px, r.T + py, 600);
  await sleep(80);
  const zg1b = await state();
  check(
    "ZG1b a real wheel the other way zooms back out (k decreases toward the floor)",
    zg1b.k < zg1.k,
    JSON.stringify(zg1b),
  );
}

async function zg2TouchGestures({
  evaluate,
  check,
  shoot,
  sleep,
  pinch,
  touchPan,
  vpRect,
  state,
}: GesturesKit): Promise<void> {
  await zg2aTablet(evaluate, check);
  const scrollToMap = () =>
    evaluate<undefined>(`document.getElementById("map-viewport").scrollIntoView({block:"center"})`);
  await scrollToMap();
  await sleep(60);

  const r = await vpRect();
  const cx = Math.round(r.L + r.W * 0.5),
    cy = Math.round(r.T + r.H * 0.5);
  await pinch(cx, cy, 70, 170);
  await sleep(100);
  const zg2 = await state();
  check(
    "ZG2 a real two-finger pinch zooms the map (AC1: k = start_k * spread ratio, 70->170 ≈ 2.43)",
    Math.abs(zg2.k - 170 / 70) < 0.15,
    JSON.stringify(zg2),
  );
  await shoot("explorer-gesture-pinch.png");

  const before = await state();
  await touchPan(cx, cy, cx - 80, cy - 60);
  await sleep(100);
  const after = await state();
  check(
    "ZG3 a real one-finger drag pans by the screen delta (AC1)",
    Math.abs(after.x - before.x - -80) < 2 && Math.abs(after.y - before.y - -60) < 2 && after.k === before.k,
    JSON.stringify({ before, after }),
  );
}

async function zg2aTablet(evaluate: GesturesKit["evaluate"], check: GesturesKit["check"]): Promise<void> {
  const tablet = await evaluate<{ width: number; scale: number; coarse: boolean }>(
    `({width:document.documentElement.clientWidth,scale:visualViewport.scale,coarse:matchMedia("(hover: none) and (pointer: coarse)").matches})`,
  );
  check(
    "ZG2a the touch block runs on a tablet at the 1024 floor (Issue #761): the page lays out 1024 wide at scale 1 under a coarse pointer",
    tablet.width === 1024 && tablet.scale === 1 && tablet.coarse,
    JSON.stringify(tablet),
  );
}

async function zgRestore({ evaluate, waitSettled, reloadHome }: GesturesKit): Promise<void> {
  await reloadHome("gesture-restore");
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  await evaluate(
    `(()=>{const c=document.getElementById("ages");if(c&&c.checked){c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));}document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("draw").click();})()`,
  );
  await waitSettled("post-gesture-restore");
}
