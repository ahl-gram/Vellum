import { readPaceSweep, PACE_LEG_MS } from "../../support/pace.ts";
import { nearRgba, PAGE_RGBA, tokenRgba } from "../../support/pixel.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Payload } from "../../types.ts";
import type { Facts, InstrumentKit } from "./kit.ts";

export async function rs29Pace(
  { evaluate, check, sleep, setYear, clickPlay }: InstrumentKit,
  smNow: Facts,
): Promise<void> {
  await setYear(smNow.present);
  const rs29 = await evaluate<{
    role: string | null;
    label: string | null;
    labels: string[];
    shown: boolean;
    rest: { pressed: (string | null)[]; pace: number };
    after: { pressed: (string | null)[]; pace: number };
  }>(
    `(()=>{const g=document.querySelector(".rf-instrument .rf-pace");const b=g?[...g.querySelectorAll("button")]:[];const read=()=>({pressed:b.map((x)=>x.getAttribute("aria-pressed")),pace:window.__vellumAgesState().pace});const rest=read();if(b[2])b[2].click();const after=read();return{role:g&&g.getAttribute("role"),label:g&&g.getAttribute("aria-label"),labels:b.map((x)=>x.textContent),shown:!!g&&getComputedStyle(g).display!=="none",rest,after};})()`,
  );
  await clickPlay();
  await sleep(150);
  await clickPlay();
  await sleep(80);
  const rs29hash = await evaluate<string>(`location.hash`);
  check(
    "RS29 the pace group stands at the readout's right with 1x pressed and reported, a press moves the mark and reaches the engine, and the address never carries it (#493, ruled 2026-09-02)",
    rs29.role === "group" &&
      rs29.label === "The pace" &&
      rs29.shown &&
      JSON.stringify(rs29.labels) === JSON.stringify(["1\u00d7", "2\u00d7", "4\u00d7"]) &&
      JSON.stringify(rs29.rest.pressed) === JSON.stringify(["true", "false", "false"]) &&
      rs29.rest.pace === 1 &&
      JSON.stringify(rs29.after.pressed) === JSON.stringify(["false", "false", "true"]) &&
      rs29.after.pace === 4 &&
      rs29hash.includes("seed=") &&
      !/pace/.test(rs29hash),
    JSON.stringify({ rs29, rs29hash }),
  );
}

export async function rs30Rate(
  { evaluate, check, sleep, setYear, clickPlay, playLabel, startSweepSamples, stopSweepSamples }: InstrumentKit,
  smNow: Facts,
): Promise<void> {
  // Issue #526: the RATE, off the page's own frame clock. storyAt anchors the sweep to the wall clock, so years per page millisecond is a property of the engine that no runner speed can move, while two years a wall window apart can only be read to a frame of quantization at each end.
  await evaluate(`document.querySelector('.rf-pace button[data-pace="1"]').click()`);
  await setYear(smNow.minFounded);
  await clickPlay();
  await sleep(200);
  await startSweepSamples();
  await sleep(PACE_LEG_MS);
  await evaluate(`document.querySelector('.rf-pace button[data-pace="4"]').click()`);
  await sleep(PACE_LEG_MS);
  const rs30samples = await stopSweepSamples();
  const rs30lbl = await playLabel();
  const rs30range = await evaluate<{ min: number; max: number }>(
    `(()=>{const a=window.__vellumAgesState();return{min:a.min,max:a.max};})()`,
  );
  await clickPlay();
  await evaluate(`document.querySelector('.rf-pace button[data-pace="1"]').click()`);
  const rs30 = readPaceSweep(rs30samples, { range: rs30range, paces: [1, 4] });
  check(
    "RS30 the sweep runs at the pace it is set to: each leg fits the rate SWEEP_MS names for it, the press neither jumps the story nor steps the year back, and the sweep is still running (#493 the clock re-anchors; #526 read off the frame clock)",
    rs30.ok && rs30lbl === "Pause",
    `${rs30.detail} label=${rs30lbl}`,
  );
}

type Press = {
  x: number;
  y: number;
  hover: boolean;
  focus: boolean;
  pressed: boolean;
  t: string;
  size: string[];
  ground: number[];
  ink: number[];
};
type Pace = { group: string[]; presses: Press[] };
const PACE: Payload<Pace> = `(() => { const rgba = ${PAGE_RGBA}, g = document.querySelector(".rf-instrument .rf-pace"), gs = getComputedStyle(g);
  return { group: [gs.flexGrow, gs.flexShrink], presses: [...g.querySelectorAll("button")].map((b) => { const r = b.getBoundingClientRect(), cs = getComputedStyle(b);
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, hover: b.matches(":hover"), focus: b.matches(":focus-visible"), pressed: b.getAttribute("aria-pressed") === "true",
      t: cs.transform, size: [cs.width, cs.height], ground: rgba(cs.backgroundColor), ink: rgba(cs.color) }; }) }; })()`;

const chosen = (p: Press): boolean =>
  p.pressed && nearRgba(p.ground, tokenRgba("--parchment")) && nearRgba(p.ink, tokenRgba("--ink-dark"));
const washed = (p: Press): boolean =>
  !p.pressed && nearRgba(p.ground, tokenRgba("--ink-dark")) && nearRgba(p.ink, tokenRgba("--parchment-bright"));
const resting = (p: Press): boolean =>
  !p.pressed && nearRgba(p.ground, tokenRgba("--chart-ink", 0.5)) && nearRgba(p.ink, tokenRgba("--line-tan"));
const stillAt = (i: number, cond: (p: Press) => boolean) => (d: Pace, last: Pace | null) =>
  cond(d.presses[i]!) && !!last && d.presses[i]!.t === last.presses[i]!.t;

async function paceUnderHand({ evaluate, send, sleep }: InstrumentKit): Promise<Record<string, Pace>> {
  const settle = makeSettle({ evaluate, sleep });
  const tab = async () => {
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  };
  const rest = await evaluate(PACE);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: rest.presses[1]!.x, y: rest.presses[1]!.y });
  const hovered = await settle(
    PACE,
    stillAt(1, (p) => p.hover),
    "pace-hovered",
  );
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: rest.presses[0]!.x, y: rest.presses[0]!.y });
  const chosenHovered = await settle(
    PACE,
    stillAt(0, (p) => p.hover),
    "pace-chosen-hovered",
  );
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
  await evaluate<boolean>(`(() => { document.querySelector(".rf-range").focus(); return true; })()`);
  await tab();
  const chosenKeyed = await settle(
    PACE,
    stillAt(0, (p) => p.focus && !p.hover),
    "pace-chosen-keyed",
  );
  await tab();
  const keyed = await settle(
    PACE,
    stillAt(1, (p) => p.focus && !p.hover),
    "pace-keyed",
  );
  return { rest, hovered, chosenHovered, chosenKeyed, keyed };
}

export async function rs31PaceDress(k: InstrumentKit): Promise<void> {
  const { evaluate, send, check } = k;
  try {
    const r = await paceUnderHand(k);
    check(
      "RS31 the pace keeps the strip's dress against the house button skin: the group never flexes, each press the mockup's 1.9 by 1.6rem, the chosen one on parchment at rest, under the hand and under a keyboard's focus, the others ink on line-tan at rest (the control) and washed dark under a real hover and a real Tab",
      JSON.stringify(r.rest!.group) === JSON.stringify(["0", "0"]) &&
        r.rest!.presses.length === 3 &&
        r.rest!.presses.every(
          (p) => Math.abs(parseFloat(p.size[0]!) - 30.4) < 0.05 && Math.abs(parseFloat(p.size[1]!) - 25.6) < 0.05,
        ) &&
        chosen(r.rest!.presses[0]!) &&
        resting(r.rest!.presses[1]!) &&
        washed(r.hovered!.presses[1]!) &&
        chosen(r.chosenHovered!.presses[0]!) &&
        chosen(r.chosenKeyed!.presses[0]!) &&
        washed(r.keyed!.presses[1]!),
      JSON.stringify(r),
    );
  } finally {
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
    await evaluate<boolean>(`(() => { if (document.activeElement) document.activeElement.blur(); return true; })()`);
  }
}
