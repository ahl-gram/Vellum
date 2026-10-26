import { browserPinch, touchRead } from "../../support/chart-touch.ts";
import { readCam } from "../../support/home.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Point } from "../../types.ts";
import type { LandfallKit } from "./kit.ts";
import { roomy, stagePoint, stillCam } from "./reads.ts";

async function l9aMouseWitness({ send }: Pick<LandfallKit, "send">, stagePt9: Point | null): Promise<void> {
  if (stagePt9 !== null) {
    await send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      x: stagePt9.x,
      y: stagePt9.y,
      button: "left",
      buttons: 1,
      clickCount: 1,
    });
    await send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: stagePt9.x + 60,
      y: stagePt9.y + 90,
      button: "left",
      buttons: 1,
    });
    await send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x: stagePt9.x + 60,
      y: stagePt9.y + 90,
      button: "left",
      clickCount: 1,
    });
  }
}

export async function l9aOneFinger(
  { evaluate, send, check, sleep, touch, camNow }: LandfallKit,
  stagePt9: Point | null,
): Promise<void> {
  const touchAction9 = await evaluate<string | null>(
    `(() => { const s = document.getElementById("lf-stage"); return s ? getComputedStyle(s).touchAction : null; })()`,
  );
  // The drag heads INTO clamp headroom (+x,+y): the original (-x,-y) gesture aimed at the corner the camera was already parked on, so stillness held with every gate deleted (guard-prover round 2).
  const bodyLocked9 = await evaluate<string>(`getComputedStyle(document.body).overflow`);
  const belowFold9 = await evaluate<number>(`document.scrollingElement.scrollHeight - window.innerHeight`);
  const oneBefore = await camNow();
  if (stagePt9 !== null) {
    await touch("touchStart", [{ x: stagePt9.x, y: stagePt9.y, id: 0 }]);
    await touch("touchMove", [{ x: stagePt9.x + 60, y: stagePt9.y + 90, id: 0 }]);
    await touch("touchEnd", []);
  }
  await sleep(300);
  const oneAfter = await camNow();
  await l9aMouseWitness({ send }, stagePt9);
  const mouseWitness = await camNow();
  check(
    "L9a one finger never drives the map, and the fixture can prove it: the touch drag leaves the whole camera untouched while the SAME drag by mouse carries the sheet, the stage declares pan-y, and the body is unlocked with the shelf below the fold to scroll to (#472 retired the #461 lock; that the one-finger swipe then MOVES the page is CDP-blind, phone-owed like the pan-y line itself)",
    stagePt9 !== null &&
      stillCam(oneBefore, oneAfter) &&
      touchAction9 === "pan-y" &&
      bodyLocked9 !== "hidden" &&
      belowFold9 > 0 &&
      mouseWitness !== null &&
      oneAfter !== null &&
      Math.abs(mouseWitness.x - oneAfter.x) > 30,
    JSON.stringify({ touchAction9, bodyLocked9, belowFold9, oneBefore, oneAfter, mouseWitness }),
  );
}

export async function l9bPinch(
  { check, pinch, camNow, gestureMark, gestureEnded }: LandfallKit,
  stagePt9: Point | null,
): Promise<void> {
  const twoBefore = await camNow();
  if (stagePt9 !== null) {
    const lifted = await gestureMark();
    await pinch(stagePt9.x, stagePt9.y, 60, 180);
    await gestureEnded(lifted, "L9b the pinch's fingers lifted");
  }
  const twoAfter = await camNow();
  check(
    "L9b two fingers drive the map: a real pinch-out zooms the sheet in",
    twoBefore !== null && twoAfter !== null && twoAfter.scale > twoBefore.scale * 1.3,
    JSON.stringify({ twoBefore, twoAfter }),
  );
}

export async function l9cTwoFingerPan(
  { evaluate, check, camNow, headroom, twoFingerDrag, recenter }: LandfallKit,
  stagePt9: Point | null,
): Promise<void> {
  await recenter();
  const room9c = await headroom();
  const startClear9c =
    stagePt9 === null
      ? null
      : await evaluate<boolean>(`(() => {
    const hit = (x, y) => document.elementFromPoint(x, y)?.closest("button, a, input, select") ?? null;
    return hit(${stagePt9.x - 40}, ${stagePt9.y}) === null && hit(${stagePt9.x + 40}, ${stagePt9.y}) === null;
  })()`);
  const panBefore = await camNow();
  if (stagePt9 !== null) await twoFingerDrag(stagePt9);
  const panAfter = await camNow();
  const panDelta =
    panBefore !== null && panAfter !== null
      ? { dx: panAfter.x - panBefore.x, dy: panAfter.y - panBefore.y, sRatio: panAfter.scale / panBefore.scale }
      : null;
  check(
    "L9c two fingers PAN the map: at a proven off-clamp fixture whose finger points are PROVEN off every control, the sheet follows the midpoint, right direction and near-full magnitude, the scale exactly held",
    stagePt9 !== null &&
      roomy(room9c) &&
      startClear9c === true &&
      panDelta !== null &&
      panDelta.dx > 25 &&
      panDelta.dx < 55 &&
      panDelta.dy > 18 &&
      panDelta.dy < 42 &&
      Math.abs(panDelta.sRatio - 1) < 1e-6,
    JSON.stringify({ room9c, startClear9c, panBefore, panAfter, panDelta }),
  );
}

async function tapTwice({ touch, sleep }: LandfallKit, p: Point): Promise<void> {
  for (const gap of [60, 0]) {
    await touch("touchStart", [{ x: p.x, y: p.y, id: 0 }]);
    await touch("touchEnd", []);
    await sleep(gap);
  }
}

const PAST_DIVE_MS = 800; // home's dive flies 0.6s
export async function l9iTouchOff(k: LandfallKit): Promise<void> {
  const { evaluate, check, camNow, sleep } = k;
  const pt = await evaluate(stagePoint);
  if (pt === null) throw new Error("home has no stage to read");
  const read = await evaluate(touchRead("#lf-stage"));
  const onControl = await evaluate<boolean>(
    `document.elementFromPoint(${pt.x}, ${pt.y})?.closest("button, a, input, select") != null`,
  );
  const before = await camNow();
  await evaluate(
    `(window.__l9iDbl = 0, document.getElementById("lf-stage").addEventListener("dblclick", () => { window.__l9iDbl++; }, true), true)`,
  );
  await tapTwice(k, pt);
  await makeSettle(k)<number>(
    `window.__l9iDbl`,
    (d) => d >= 1,
    "L9i the double tap reaches the stage as a double click",
  );
  await sleep(PAST_DIVE_MS);
  const after = await makeSettle(k)(readCam, (d, last) => stillCam(d, last), "L9i the camera rests");
  check(
    "L9i where touch is the main pointer home's stage takes no finger until the touch press is pressed: touch-action manipulation and no class, and a double tap leaves the camera where it was (Issue #778)",
    read.shown &&
      read.pressed === "false" &&
      read.zoomable === false &&
      read.touchAction === "manipulation" &&
      !onControl &&
      stillCam(before, after),
    JSON.stringify({ read, onControl, before, after }),
  );
}

export async function l9jBrowserPinch(k: LandfallKit): Promise<void> {
  const { evaluate, check, camNow } = k;
  const pt = await evaluate(stagePoint);
  if (pt === null) throw new Error("home has no stage to read");
  const before = await camNow();
  await browserPinch(k, pt, "L9j");
  const after = await makeSettle(k)(readCam, (d, last) => stillCam(d, last), "L9j the camera rests");
  const scale = await evaluate<number>(`visualViewport.scale`);
  check(
    "L9j with the touch press off a browser pinch's two fingers on home's stage reach the page and never move the map (the page's own zoom is a phone pass item) (Issue #778)",
    stillCam(before, after),
    JSON.stringify({ scale, before, after }),
  );
}
