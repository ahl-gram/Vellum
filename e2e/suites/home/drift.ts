import { DRIFT_SCALE, IDLE_DELAY_MS } from "../../../src/site/home/drift.ts";
import { atLandfall, buttonPoint, readCam, readXform } from "../../support/home.ts";
import { makeSettle, makeStable } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import type { HomeKit } from "./kit.ts";

// 2026-10-26: the sine.inOut start moves the printed transform about 0.25 s in; 3000 ms is runner-stall headroom, unswept (no browser reading when set); lane C CI read H15a at 9.2 s.
const DRIFT_HEADROOM_MS = 3000;
// 2026-10-26: the wheel's zoom is applied with duration 0, so 9 tries keep the 400 ms the old pause allowed.
const WHEEL_TRIES = 9;
export const DRIFT_TRIES = Math.ceil((IDLE_DELAY_MS + DRIFT_HEADROOM_MS) / 50);

const BREATH: Payload<{ xform: string | null; clampHeld: boolean }> = `({ xform: ${readXform}, clampHeld: (() => {
  const stage = document.getElementById("lf-stage");
  const sheet = document.getElementById("lf-sheet");
  const r = stage.getBoundingClientRect();
  const fit = Math.min(r.width / 1500, r.height / 1157.931) * 0.92;
  const m = new DOMMatrixReadOnly(getComputedStyle(sheet).transform);
  const cx = m.e + (1500 * m.a) / 2, cy = m.f + (1157.931 * m.a) / 2;
  return m.a >= fit * 0.65 - 1e-6 && m.a <= 7 + 1e-6 && cx >= -1 && cx <= r.width + 1 && cy >= -1 && cy <= r.height + 1;
})() })`;

const FLIGHT: Payload<{ open: boolean; xform: string | null }> =
  `(() => { const card = document.getElementById("lf-card-reading-room"); const cs = card ? getComputedStyle(card) : null; return { open: !!card && !card.hidden && cs.visibility !== "hidden" && Number(cs.opacity) > 0.95, xform: ${readXform} }; })()`;

async function breathes({ evaluate, sleep }: Pick<SuiteContext, "evaluate" | "sleep">, label: string) {
  const settle = makeSettle({ evaluate, sleep });
  const rest = await evaluate(readXform);
  const first = await settle(BREATH, (d) => d.xform !== null && d.xform !== rest, label, DRIFT_TRIES);
  await sleep(900);
  const second = await evaluate(BREATH);
  return { rest, first, second };
}

export async function h15aDrift({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  const { rest, first, second } = await breathes({ evaluate, sleep }, "H15a the drift started");
  check(
    "H15a left alone after landfall the sheet breathes: the transform moves between two samples once the idle delay has run, and the clamp still holds",
    rest !== null && second.xform !== null && first.xform !== second.xform && second.clampHeld,
    JSON.stringify({ rest, first, second }),
  );
}

export async function h15bWheelStops({ evaluate, send, check, sleep }: SuiteContext): Promise<void> {
  const stagePt = await evaluate<{ x: number; y: number }>(
    `(() => { const r = document.getElementById("lf-stage").getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`,
  );
  const stable = makeStable(makeSettle({ evaluate, sleep }));
  const before = await evaluate(readCam);
  await send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: Math.round(stagePt.x),
    y: Math.round(stagePt.y),
    deltaX: 0,
    deltaY: -120,
  });
  await stable(readCam, "H15b the wheel's zoom landed", {
    departed: (d) => before !== null && Math.abs(d.scale / before.scale - 1) > DRIFT_SCALE - 1,
    tries: WHEEL_TRIES,
  });
  const still1 = await evaluate(readXform);
  await sleep(900);
  const still2 = await evaluate(readXform);
  await sleep(900);
  const still3 = await evaluate(readXform);
  check(
    "H15b a real wheel stops the drift at once: the zoom lands and the transform holds still through three samples",
    still1 !== null && still1 === still2 && still2 === still3,
    JSON.stringify({ still1, still2, still3 }),
  );
}

export async function h15cRearmed({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  const { rest, first, second } = await breathes({ evaluate, sleep }, "H15c the drift started again");
  check(
    "H15c the stop re-armed the idle timer: once the idle delay has run again, the sheet breathes again",
    rest !== null && second.xform !== null && first.xform !== second.xform,
    JSON.stringify({ rest, first, second }),
  );
}

export async function h15dFlightStops({ evaluate, check, sleep, pressKey, clickAt }: HomeKit): Promise<void> {
  // The Reading Room station, not the Explorer: H14c framed it at 0.4 of the stage and the wheel zoomed at center, so it is the one icon this history provably keeps inside the 800-tall stage clip.
  const flightPt = await evaluate(buttonPoint('.lf-station[data-station="reading-room"]'));
  if (flightPt !== null) {
    await clickAt(Math.round(flightPt.x), Math.round(flightPt.y));
    await makeStable(makeSettle({ evaluate, sleep }))(FLIGHT, "H15d the station flight landed", {
      departed: (d) => d.open,
    });
  }
  const flight1 = await evaluate(readXform);
  await sleep(900);
  const flight2 = await evaluate(readXform);
  check(
    "H15d this sub's own station flight stops the drift too: after the flight settles the transform holds still",
    flightPt !== null && flight1 !== null && flight1 === flight2,
    JSON.stringify({ flightPt, flight1, flight2 }),
  );
  await pressKey("Escape", "Escape", 27);
}

export async function h16NoDrift({ evaluate, send, check, sleep, settleHome }: HomeKit): Promise<void> {
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const settled16 = await settleHome();
  await sleep(9800);
  const calm1 = await evaluate(readXform);
  await sleep(900);
  const calm2 = await evaluate(readXform);
  await send("Emulation.setEmulatedMedia", { features: [] });
  check(
    "H16 reduced motion gets no drift at all: nine-plus seconds of stillness stay still",
    atLandfall(settled16) && calm1 !== null && calm1 === calm2,
    JSON.stringify({ calm1, calm2 }),
  );
}
