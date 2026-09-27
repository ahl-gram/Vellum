import { readPaceSweep, PACE_LEG_MS } from "../../../src/cli/e2e-pace.ts";
import type { Facts, InstrumentKit } from "./kit.ts";

export async function rs29Pace({ evaluate, check, sleep, setYear, clickPlay }: InstrumentKit, smNow: Facts): Promise<void> {
  await setYear(smNow.present);
  const rs29 = await evaluate<{ role: string | null; label: string | null; labels: string[]; shown: boolean; rest: { pressed: (string | null)[]; pace: number }; after: { pressed: (string | null)[]; pace: number } }>(`(()=>{const g=document.querySelector(".rf-instrument .rf-pace");const b=g?[...g.querySelectorAll("button")]:[];const read=()=>({pressed:b.map((x)=>x.getAttribute("aria-pressed")),pace:window.__vellumAgesState().pace});const rest=read();if(b[2])b[2].click();const after=read();return{role:g&&g.getAttribute("role"),label:g&&g.getAttribute("aria-label"),labels:b.map((x)=>x.textContent),shown:!!g&&getComputedStyle(g).display!=="none",rest,after};})()`);
  await clickPlay();
  await sleep(150);
  await clickPlay();
  await sleep(80);
  const rs29hash = await evaluate<string>(`location.hash`);
  check(
    "RS29 the pace group stands at the readout's right with 1x pressed and reported, a press moves the mark and reaches the engine, and the address never carries it (#493, ruled 2026-09-02)",
    !!rs29 && rs29.role === "group" && rs29.label === "The pace" && rs29.shown && // eslint-disable-line @typescript-eslint/no-unnecessary-condition
      JSON.stringify(rs29.labels) === JSON.stringify(["1\u00d7", "2\u00d7", "4\u00d7"]) &&
      JSON.stringify(rs29.rest.pressed) === JSON.stringify(["true", "false", "false"]) && rs29.rest.pace === 1 &&
      JSON.stringify(rs29.after.pressed) === JSON.stringify(["false", "false", "true"]) && rs29.after.pace === 4 &&
      rs29hash.includes("seed=") && !/pace/.test(rs29hash),
    JSON.stringify({ rs29, rs29hash }),
  );
}

export async function rs30Rate({ evaluate, check, sleep, setYear, clickPlay, playLabel, startSweepSamples, stopSweepSamples }: InstrumentKit, smNow: Facts): Promise<void> {
  // #526: the RATE, off the page's own frame clock. storyAt anchors the sweep to the wall clock, so years per page millisecond is a property of the engine that no runner speed can move, while two years a wall window apart can only be read to a frame of quantization at each end.
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
  const rs30range = await evaluate<{ min: number; max: number }>(`(()=>{const a=window.__vellumAgesState();return{min:a.min,max:a.max};})()`);
  await clickPlay();
  await evaluate(`document.querySelector('.rf-pace button[data-pace="1"]').click()`);
  const rs30 = readPaceSweep(rs30samples, { range: rs30range, paces: [1, 4] });
  check(
    "RS30 the sweep runs at the pace it is set to: each leg fits the rate SWEEP_MS names for it, the press neither jumps the story nor steps the year back, and the sweep is still running (#493 the clock re-anchors; #526 read off the frame clock)",
    rs30.ok && rs30lbl === "Pause",
    `${rs30.detail} label=${rs30lbl}`,
  );
}
