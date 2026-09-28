import { atLandfall, readXform, buttonPoint } from "../../support/home.ts";
import type { SuiteContext } from "../../types.ts";
import type { HomeKit } from "./kit.ts";

export async function h15aDrift({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  await sleep(9600);
  const drift1 = await evaluate(readXform);
  await sleep(900);
  const drift2 = await evaluate(readXform);
  const clampHeld = await evaluate<boolean>(`(() => {
    const stage = document.getElementById("lf-stage");
    const sheet = document.getElementById("lf-sheet");
    const r = stage.getBoundingClientRect();
    const fit = Math.min(r.width / 1500, r.height / 1157.931) * 0.92;
    const m = new DOMMatrixReadOnly(getComputedStyle(sheet).transform);
    const cx = m.e + (1500 * m.a) / 2, cy = m.f + (1157.931 * m.a) / 2;
    return m.a >= fit * 0.65 - 1e-6 && m.a <= 7 + 1e-6 && cx >= -1 && cx <= r.width + 1 && cy >= -1 && cy <= r.height + 1;
  })()`);
  check(
    "H15a left alone after landfall the sheet breathes: the transform moves between two samples nine-plus seconds in, and the clamp still holds",
    drift1 !== null && drift2 !== null && drift1 !== drift2 && clampHeld === true,
    JSON.stringify({ drift1, drift2, clampHeld }),
  );
}

export async function h15bWheelStops({ evaluate, send, check, sleep }: SuiteContext): Promise<void> {
  const stagePt = await evaluate<{ x: number; y: number }>(`(() => { const r = document.getElementById("lf-stage").getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
  await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: Math.round(stagePt.x), y: Math.round(stagePt.y), deltaX: 0, deltaY: -120 });
  await sleep(400);
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
  await sleep(9600);
  const rearm1 = await evaluate(readXform);
  await sleep(900);
  const rearm2 = await evaluate(readXform);
  check(
    "H15c the stop re-armed the idle timer: nine-plus still seconds later the sheet breathes again",
    rearm1 !== null && rearm2 !== null && rearm1 !== rearm2,
    JSON.stringify({ rearm1, rearm2 }),
  );
}

export async function h15dFlightStops({ evaluate, check, sleep, pressKey, clickAt }: HomeKit): Promise<void> {
  // The Reading Room station, not the Explorer: H14c framed it at 0.4 of the stage and the wheel zoomed at center, so it is the one icon this history provably keeps inside the 800-tall stage clip.
  const flightPt = await evaluate(buttonPoint('.lf-station[data-station="reading-room"]'));
  if (flightPt !== null) await clickAt(Math.round(flightPt.x), Math.round(flightPt.y));
  await sleep(2200);
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
