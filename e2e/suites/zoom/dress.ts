// The inked survey's overlay and the card's seats (Issue #779 part 2h): Z23 and Z24 on seed 42.
import { nearRgba, tokenRgba } from "../../support/pixel.ts";
import type { SuiteContext } from "../../types.ts";
import type { ZoomKit } from "./kit.ts";
import { AT_HOME, FOCUS, HIDE, INKED, OVERLAY, PICK, PICKS, SEAT_AT, ZERO_NUDGE } from "./reads.ts";
import type { Seat } from "./reads.ts";
import { mouseMove } from "../../support/input.ts";

const faults = (parts: (true | string)[]): string[] => parts.filter((f): f is string => f !== true);
const near = (a: number, b: number, tolerance: number): boolean => Math.abs(a - b) <= tolerance;

export async function z23SurveyOverlay({ evaluate, check, sleep }: ZoomKit): Promise<void> {
  await evaluate(
    `(() => { const c = document.getElementById("ages"); c.checked = true; c.dispatchEvent(new Event("change", { bubbles: true })); })()`,
  );
  let inked = false;
  try {
    for (let i = 0; i < 120; i++) {
      inked = await evaluate(INKED);
      if (inked) break;
      await sleep(50);
    }
    const d = inked ? await evaluate(OVERLAY) : null;
    check(
      "Z23 the inked survey's overlay rides the mount unshadowed, dressed by the engine's sheet",
      inked &&
        !!d &&
        d.shadow === "none" &&
        d.position === "absolute" &&
        d.pointerEvents === "none" &&
        d.zIndex === "3" &&
        d.overflow === "visible" &&
        near(d.w, d.mapW, 1) &&
        near(d.h, d.mapH, 1) &&
        d.track.fill === "none" &&
        nearRgba(d.track.stroke, tokenRgba("--ink-dark")) &&
        d.track.sw === "3px" &&
        d.track.dash === "2px, 7px" &&
        d.track.cap === "round" &&
        d.track.vector === "non-scaling-stroke" &&
        d.track.opacity === "0.95" &&
        !!d.hull &&
        nearRgba(d.hull.fill, tokenRgba("--parchment-panel")) &&
        nearRgba(d.hull.stroke, tokenRgba("--ink-dark")) &&
        d.hull.sw === "1.5px" &&
        !!d.body &&
        nearRgba(d.body.fill, tokenRgba("--parchment-panel")) &&
        nearRgba(d.body.stroke, tokenRgba("--ink-dark")),
      JSON.stringify({ inked, d }),
    );
  } finally {
    await evaluate(
      `(() => { const c = document.getElementById("ages"); c.checked = false; c.dispatchEvent(new Event("change", { bubbles: true })); })()`,
    );
    for (let i = 0; i < 40; i++) {
      if (!(await evaluate<boolean>(`!!document.querySelector("#map .voyage-overlay")`))) break;
      await sleep(50);
    }
  }
}

// The 0.5px of 2026-10-13 (Issue #779 part 2h): layout resolves to 1/64px, so a seat sits within about 0.05px of its nominal 10px and a card within as much of 16rem, and the guard prover's steps (a gap of 10.9px, a width of 16.05rem) are 0.9px and 0.8px; the runs' payloads print the rects rounded, so the headroom is the principle's and three unmutated Linux executions green (two CI lane A jobs and one runner control).
const seatFaults = (label: string, variant: string, p: Seat, rem: number): string[] => {
  if (!p) return [`${label}: no card`];
  const markX = p.map[0]! + p.nx * p.map[2]!,
    markY = p.map[1]! + p.ny * p.map[3]!;
  const cl = p.card[0]!,
    ct = p.card[1]!,
    cr = p.card[2]!,
    cb = p.card[3]!;
  return faults([
    p.rested || `${label}: the card never rested`,
    (p.flipH === variant.includes("h") && p.flipV === variant.includes("v")) ||
      `${label}: classes ${p.flipH},${p.flipV}`,
    (p.dx === "0px" && p.dy === "0px") || `${label}: nudged ${p.dx},${p.dy}`,
    (variant.includes("h") ? near(cr, markX - 10, 0.5) : near(cl, markX + 10, 0.5)) ||
      `${label}: the anchored ${variant.includes("h") ? "right" : "left"} ${variant.includes("h") ? cr : cl} against the mark ${markX}`,
    (variant.includes("v") ? near(cb, markY - 10, 0.5) : near(ct, markY + 10, 0.5)) ||
      `${label}: the anchored ${variant.includes("v") ? "bottom" : "top"} ${variant.includes("v") ? cb : ct} against the mark ${markY}`,
    near(cr - cl, 16 * rem, 0.5) || `${label}: ${cr - cl} wide, want ${16 * rem}`,
  ]);
};

async function seatAt(
  { evaluate, sleep }: Pick<SuiteContext, "evaluate" | "sleep">,
  variant: string,
  k: number,
  idx: number,
  rem: number,
): Promise<{ row: string; wrong: string[] }> {
  await zoomHome(evaluate, sleep);
  if (k === 4) {
    const at = await evaluate(AT_HOME(idx));
    if (!at) return { row: "", wrong: [`${variant} at k=${k}: no target to seat`] };
    if (!(await evaluate(SEAT_AT(at.px, at.py, variant.includes("h"), variant.includes("v")))))
      return { row: "", wrong: [`${variant} at k=${k}: the camera did not land where the seat asked`] };
  }
  const hidden = await evaluate(HIDE, true);
  const still = await evaluate(ZERO_NUDGE, true);
  if (!(await evaluate(FOCUS(idx)))) return { row: "", wrong: [`${variant} at k=${k}: no hit to focus`] };
  let p = await evaluate(PICK(idx));
  for (let t = 0; t < 20 && p && !p.rested; t++) {
    await sleep(50);
    p = await evaluate(PICK(idx));
  }
  const row = `${variant}@${k}: ${p ? `${p.name} ${p.dx},${p.dy} ${p.card.map(Math.round).join(",")}` : "none"}`;
  const premise =
    hidden && still
      ? []
      : [`${variant} at k=${k}: the card of the town before would not hide or the map would not rest`];
  return { row, wrong: [...premise, ...seatFaults(`${variant} at k=${k}`, variant, p, rem)] };
}

async function zoomHome(evaluate: SuiteContext["evaluate"], sleep: SuiteContext["sleep"]): Promise<void> {
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  for (let t = 0; t < 20; t++) {
    if ((await evaluate<string>(`getComputedStyle(document.getElementById("map")).transform`)) === "none") break;
    await sleep(50);
  }
}

export async function z24CardSeats({ evaluate, send, check, sleep }: SuiteContext): Promise<void> {
  const variants = ["plain", "h", "v", "hv"];
  const picks = await evaluate(PICKS);
  const rem = await evaluate<number>(`parseFloat(getComputedStyle(document.documentElement).fontSize)`);
  const wrong: string[] = [];
  const rows: string[] = [];
  try {
    await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
    await evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur()`);
    await mouseMove(send, 5, 5);
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    const seats = [1, 4].flatMap((k) => variants.map((variant, i) => ({ variant, k, idx: picks[i] ?? -1 })));
    for (const seat of seats) {
      if (seat.idx < 0) {
        wrong.push(`${seat.variant} at k=${seat.k}: no target`);
        continue;
      }
      const read = await seatAt({ evaluate, sleep }, seat.variant, seat.k, seat.idx, rem);
      if (read.row) rows.push(read.row);
      wrong.push(...read.wrong);
    }
  } finally {
    await evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur()`);
    await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
    await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
    await send("Emulation.setEmulatedMedia", { features: [] });
  }
  check(
    "Z24 a card stands at its mark on the side it flips toward, 10px off on both axes, at rest and at depth, in all four variants",
    wrong.length === 0,
    JSON.stringify({ wrong, rows }),
  );
}
