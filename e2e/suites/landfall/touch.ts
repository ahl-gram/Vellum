import type { Point } from "../../types.ts";
import type { LandfallKit } from "./kit.ts";
import { roomy, stillCam } from "./reads.ts";

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
  await sleep(300);
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

export async function l9bPinch({ check, sleep, pinch, camNow }: LandfallKit, stagePt9: Point | null): Promise<void> {
  const twoBefore = await camNow();
  if (stagePt9 !== null) await pinch(stagePt9.x, stagePt9.y, 60, 180);
  await sleep(300);
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
