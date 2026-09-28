import { atLandfall } from "../../support/home.ts";
import type { Cam } from "../../support/home.ts";
import type { Point } from "../../types.ts";
import type { LandfallKit } from "./kit.ts";
import { stagePoint } from "./reads.ts";

type Floor = Awaited<ReturnType<typeof l1dStandOff>>;

export async function l1aConsumed({ check, sleep, lastWheel, camNow, wheelAt }: LandfallKit, settled1: Cam | null, pt: Point | null): Promise<void> {
  await wheelAt(pt, -120);
  await sleep(150);
  const mid = { prevented: await lastWheel(), cam: await camNow() };
  check(
    "L1a mid-range a real wheel is consumed: the zoom steps and the event is defaultPrevented",
    // @ts-expect-error atLandfall has already read false for a null settle, so a null never reaches here
    atLandfall(settled1) && mid.prevented === true && mid.cam !== null && mid.cam.scale > settled1.scale * 1.05,
    JSON.stringify({ settled1, mid }),
  );
}

export async function l1bCloseClamp({ evaluate, check, sleep, lastWheel, camNow, scrollY, wheelAt }: LandfallKit, pt: Point | null): Promise<void> {
  let sat = await camNow();
  for (let i = 0; i < 24 && pt !== null; i++) {
    await wheelAt(pt, -480);
    await sleep(90);
    const next = await camNow();
    if (next !== null && sat !== null && Math.abs(next.scale - sat.scale) < 1e-9) { sat = next; break; }
    sat = next;
  }
  await evaluate(`window.__lfWheel = []`);
  await wheelAt(pt, -120);
  await sleep(150);
  const atMax = { prevented: await lastWheel(), cam: await camNow(), y: await scrollY() };
  check(
    "L1b at the close-in clamp (scale 7) a further wheel-in is released: no zoom step, not defaultPrevented, and the page holds (nothing above to scroll to)",
    // @ts-expect-error a null camera means the stage vanished between two reads of one page; a null throws here, outside any step, and the runner reds the whole suite as stopped early
    sat !== null && Math.abs(sat.scale - 7) < 1e-6 && atMax.prevented === false && Math.abs(atMax.cam.scale - 7) < 1e-6 && atMax.y === 0,
    JSON.stringify({ sat, atMax }),
  );
}

export async function l1cNotDeadZone({ check, sleep, camNow, wheelAt }: LandfallKit, pt: Point | null): Promise<void> {
  await wheelAt(pt, 120);
  await sleep(150);
  const backOff = await camNow();
  check(
    "L1c the release is limit-specific, not a dead zone: the very next wheel-out zooms again",
    backOff !== null && backOff.scale < 7 - 1e-6,
    JSON.stringify({ backOff }),
  );
}

export async function l1dStandOff({ sleep, camNow, wheelAt }: LandfallKit, pt: Point | null) {
  let floor = await camNow();
  for (let i = 0; i < 24 && pt !== null; i++) {
    await wheelAt(pt, 480);
    await sleep(90);
    const next = await camNow();
    if (next !== null && floor !== null && Math.abs(next.scale - floor.scale) < 1e-9) { floor = next; break; }
    floor = next;
  }
  return floor;
}

export async function l1dReleased({ evaluate, check, sleep, lastWheel, camNow, scrollY, wheelAt, freshGesture }: LandfallKit, floor: Floor): Promise<void> {
  await freshGesture();
  const pt2 = await evaluate(stagePoint);
  await evaluate(`window.__lfWheel = []`);
  const yBefore = await scrollY();
  await wheelAt(pt2, 120);
  let atMin = null;
  for (let i = 0; i < 20; i++) {
    await sleep(100);
    const y = await scrollY();
    if (y > 0) { atMin = { prevented: await lastWheel(), cam: await camNow(), y }; break; }
  }
  const bodyLocked1d = await evaluate<string>(`getComputedStyle(document.body).overflow`);
  check(
    "L1d at the stand-off clamp (0.65 of fit) a fresh wheel-out is released to the page: the wheel is not prevented, the camera holds, and the shelf scrolls into view (#472; the #461 body lock is retired)",
    floor !== null && Math.abs(floor.scale - floor.fit * 0.65) < 1e-6 && yBefore === 0 && atMin !== null
      // @ts-expect-error a null camera means the stage vanished between two reads of one page; a null throws here, outside any step, and the runner reds the whole suite as stopped early
      && atMin.prevented === false && Math.abs(atMin.cam.scale - floor.scale) < 1e-9 && atMin.y > 0
      && bodyLocked1d !== "hidden",
    JSON.stringify({ floor, yBefore, atMin, bodyLocked1d }),
  );
}

export async function l1eAbsorbed({ evaluate, check, sleep, camNow, scrollY, wheelAt, freshGesture }: LandfallKit, pt: Point | null, floor: Floor): Promise<void> {
  // L1e retries until one CDP round trip lands both wheels inside one stream (timeStamp-proven), so a slow lane re-attempts instead of certifying a broken fixture.
  await evaluate(`(window.__lfW2 = [], window.addEventListener("wheel", (e) => window.__lfW2.push({ p: e.defaultPrevented, t: e.timeStamp }), { passive: true }), true)`);
  let usedUp = null;
  for (let i = 0; i < 5 && pt !== null && usedUp === null; i++) {
    await freshGesture();
    await wheelAt(pt, -240);
    await sleep(400);
    await evaluate(`window.__lfW2 = []`);
    await wheelAt(pt, 4000);
    await wheelAt(pt, 480);
    await sleep(250);
    const log = await evaluate<{ p: boolean; t: number }[]>(`window.__lfW2`);
    if (log !== null && log.length === 2 && log[1]!.t - log[0]!.t < 280) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
      usedUp = { log, y: await scrollY(), cam: await camNow() };
    }
  }
  check(
    "L1e the flick that reaches the outer clamp is absorbed: a clamp-parked wheel in the same stream, inside the absorb window, stays consumed and the page holds (#472, 2026-08-28 ruling)",
    usedUp !== null && usedUp.log[0]!.p === true && usedUp.log[1]!.p === true && usedUp.y === 0
      && floor !== null && usedUp.cam !== null && Math.abs(usedUp.cam.scale - floor.scale) < 1e-9,
    JSON.stringify({ usedUp }),
  );
}
