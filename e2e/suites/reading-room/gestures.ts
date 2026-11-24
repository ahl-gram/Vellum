// What a hover, a key, a press, a Read and print do in the Reading Room (Issue #779 part 2g): the Glass and paper, and a counter Read refitting to the folio it writes.
import { mouseMove } from "../../support/input.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { clearMetrics, pressAt } from "../print-room/kit.ts";
import { homeCamera, lensRest, ZOOM_IN } from "../print-room/print.ts";
import { BAR, RR_LENS, scrubTo } from "./kit.ts";

const park = (send: SuiteContext["send"]) => mouseMove(send, 1, 1);

type Paper = { strip: string; t: string };
const PAPER: Payload<Paper> = `(() => ({ strip: getComputedStyle(document.querySelector(".strip")).display, t: ${RR_LENS}.t }))()`;

export async function rr40Glass(ctx: SuiteContext): Promise<void> {
  const { evaluate, send, check, sleep } = ctx;
  await send("Emulation.setEmulatedMedia", { media: "", features: [] });
  await clearMetrics({ evaluate, send, sleep }, 1440, 900);
  await park(send);
  try {
    const rest = await evaluate(RR_LENS);
    const press = await evaluate(ZOOM_IN);
    if (press) await pressAt({ send }, press.x, press.y);
    const leaned = await lensRest(ctx, "leaned", "reading-room-leaned", RR_LENS);
    await send("Emulation.setEmulatedMedia", { media: "print" });
    const paper = await evaluate(PAPER);
    await send("Emulation.setEmulatedMedia", { media: "" });
    const screen = await evaluate(PAPER);
    await homeCamera(ctx, RR_LENS);
    check(
      "RR40 the Glass leans the chart to 1.4 at a real press, while paper prints the chart untransformed with the strip gone (the screen the control)",
      rest.k === 1 &&
        press?.hit === "zoom-in" &&
        leaned.zoomed &&
        Math.abs(leaned.k - 1.4) < 0.005 &&
        paper.strip === "none" &&
        paper.t === "none" &&
        screen.strip !== "none" &&
        screen.t !== "none",
      JSON.stringify({ rest, press, leaned, paper, screen }),
    );
  } finally {
    await send("Emulation.setEmulatedMedia", { media: "" });
    await homeCamera(ctx, RR_LENS);
    await park(send);
  }
}

type Fit = { h: number; folio: number; sub: string; status: string | null; seed: number | null; size: number[] };
const FIT: Payload<Fit> = `(() => { const s = window.__vellumReadingRoomState ? window.__vellumReadingRoomState() : null;
  return { h: parseFloat(document.getElementById("sheet").style.height), folio: document.querySelector(".corner.bl.folio").getBoundingClientRect().top,
    sub: document.getElementById("folio-sub").textContent, status: (document.querySelector(".rf-status") || {}).textContent ?? null, seed: s && s.seed, size: [innerWidth, innerHeight] }; })()`;
const READ_AT: Payload<{ x: number; y: number; hit: boolean }> =
  `(() => { const b = document.querySelector(".rr-read"), r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
  return { x, y, hit: document.elementFromPoint(x, y) === b }; })()`;

async function refitAfterRead(
  ctx: SuiteContext,
): Promise<{ before: Fit; blanked: Fit; read: { hit: boolean }; drawn: Fit }> {
  const { evaluate, send, sleep } = ctx;
  const settle = makeSettle({ evaluate, sleep });
  await evaluate<boolean>(scrubTo("max"));
  const before = await settle(
    FIT,
    (d, last) => d.size[0] === 1440 && !!last && d.h === last.h && d.sub !== "",
    "reading-room-fit-rest",
  );
  await evaluate<boolean>(
    `(() => { const s = document.getElementById("folio-sub"); window.__rr41Sub = s.textContent; s.textContent = ""; window.dispatchEvent(new Event("resize")); return true; })()`,
  );
  const blanked = await settle(
    FIT,
    (d, last) => d.h !== before.h && !!last && d.h === last.h,
    "reading-room-fit-blanked",
  );
  const read = await evaluate(READ_AT);
  await pressAt({ send }, read.x, read.y);
  const drawn = await settle(
    FIT,
    (d, last) => d.sub !== "" && d.status === "" && d.seed === 42 && !!last && d.h === last.h && d.folio === last.folio,
    "reading-room-fit-drawn",
    240,
  );
  return { before, blanked, read, drawn };
}

export async function rr41ReadRefits(ctx: SuiteContext): Promise<void> {
  const { evaluate, check } = ctx;
  const bar = await evaluate(BAR);
  try {
    const { before, blanked, read, drawn } = await refitAfterRead(ctx);
    check(
      "RR41 a Read refits the room to the folio it writes: with the survey line blanked the fitted sheet grows into the room the shorter folio leaves (the premise), and a real press on Read writes the line back and the sheet returns to the fit it had",
      read.hit &&
        blanked.h > before.h + 1 &&
        blanked.folio > before.folio + 1 &&
        drawn.folio < blanked.folio - 1 &&
        drawn.h < blanked.h - 1 &&
        Math.abs(drawn.h - before.h) <= 1,
      JSON.stringify({ before, blanked, read, drawn }),
    );
  } finally {
    await evaluate<boolean>(
      `(() => { const s = document.getElementById("folio-sub"); if (s.textContent === "" && window.__rr41Sub) { s.textContent = window.__rr41Sub; window.dispatchEvent(new Event("resize")); } delete window.__rr41Sub; return true; })()`,
    );
    await evaluate<boolean>(scrubTo(bar));
    await park(ctx.send);
  }
}
