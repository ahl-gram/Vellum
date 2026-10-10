// What a hover, a key, a press, a Read and print do in the Reading Room (Issue #779 part 2g): the revealed plate's unfurl and lift, the Glass, its silent refit and paper, and a counter Read refitting to the folio it writes.
import { makeSettle } from "../../support/settle.ts";
import { nearRgba, PAGE_RGBA, SHADE, tokenRgba } from "../../support/pixel.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { clearMetrics, pressAt } from "../print-room/kit.ts";
import { glideLanded, homeCamera, lensRest, midGlideRefit, ZOOM_IN } from "../print-room/print.ts";
import { RR_LENS } from "./kit.ts";

const park = (send: SuiteContext["send"]) => send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
const tab = async (send: SuiteContext["send"]): Promise<void> => {
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
};

type Unfurl = { name: string; fill: string; origin: string; half: number; open: number[] | null; end: number | null };
// The reveal re-run by hiding and showing the stage, paused at its first frame and one millisecond before its last; the angle is the matrix3d's tilt about x.
const UNFURL: Payload<Unfurl | null> = `(() => { const f = document.querySelector(".rr-prospect"), i = f && f.querySelector("img"); if (!i) return null;
  const cs = getComputedStyle(i), base = { name: cs.animationName, fill: cs.animationFillMode, origin: cs.transformOrigin, half: i.getBoundingClientRect().width / 2 };
  const tilt = () => { const m = /^matrix3d\\(([^)]*)\\)$/.exec(getComputedStyle(i).transform); if (!m) return 0; const v = m[1].split(",").map(Number); return Math.atan2(v[6], v[5]) * 180 / Math.PI; };
  f.hidden = true; void i.offsetWidth; f.hidden = false;
  const a = i.getAnimations().find((x) => x.animationName === "prospectUnfurl"); if (!a) return { ...base, open: null, end: null };
  a.pause(); a.currentTime = 0; const open = [Number(getComputedStyle(i).opacity), tilt()];
  a.currentTime = a.effect.getComputedTiming().endTime - 1; const end = tilt(); a.finish();
  return { ...base, open, end };
})()`;

type Plate = {
  x: number;
  y: number;
  hit: boolean;
  hover: boolean;
  focus: boolean;
  t: string;
  shadow: { colour: number[]; geometry: string } | null;
};
const PLATE: Payload<Plate> = `(() => { const rgba = ${PAGE_RGBA}, shade = ${SHADE}, i = document.querySelector(".rr-prospect img"), a = i.closest("a"), r = i.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2, cs = getComputedStyle(i);
  return { x, y, hit: document.elementFromPoint(x, y) === i, hover: a.matches(":hover"), focus: a.matches(":focus-visible"), t: cs.transform, shadow: shade(cs.boxShadow) };
})()`;

const lifted = (p: Plate): boolean => {
  const m = /^matrix\(([^)]*)\)$/.exec(p.t)?.[1]?.split(",").map(Number);
  if (!m || !p.shadow) return false;
  const turn = (Math.atan2(m[1]!, m[0]!) * 180) / Math.PI;
  return (
    Math.abs(turn + 0.5) < 0.05 &&
    Math.abs(m[5]! + 2) < 0.05 &&
    p.shadow.geometry === "0px 6px 16px 0px" &&
    nearRgba(p.shadow.colour, tokenRgba("--chart-ink", 0.2))
  );
};
const still = (d: Plate, last: Plate | null): boolean => !!last && d.t === last.t;

async function plateLifts(ctx: SuiteContext): Promise<{ hovered: Plate; keyed: Plate; away: Plate }> {
  const { evaluate, send, sleep } = ctx;
  const settle = makeSettle({ evaluate, sleep });
  const at = await evaluate(PLATE);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: at.x, y: at.y });
  const hovered = await settle(PLATE, (d, last) => d.hit && d.hover && still(d, last), "reading-room-plate-hovered");
  await park(send);
  const away = await settle(
    PLATE,
    (d, last) => !d.hover && d.t === "none" && still(d, last),
    "reading-room-plate-rested",
  );
  await evaluate<boolean>(`(() => { document.querySelector("#journal .slip-fold").focus(); return true; })()`);
  await tab(send);
  const keyed = await settle(PLATE, (d, last) => d.focus && !d.hover && still(d, last), "reading-room-plate-keyed");
  return { hovered, keyed, away };
}

export async function rr42PlateReveal(ctx: SuiteContext): Promise<void> {
  const { evaluate, send, check, sleep } = ctx;
  await clearMetrics({ evaluate, send, sleep }, 1440, 900);
  await park(send);
  try {
    const unfurl = await evaluate(UNFURL);
    const { hovered, keyed, away } = await plateLifts(ctx);
    const opened = !!unfurl?.open && unfurl.open[0] === 0 && Math.abs(unfurl.open[1]!) > 20;
    check(
      "RR42 the revealed plate unfurls from its top edge with a backwards fill, opening at a real angle and released at its rest, so a real hover and a keyboard focus each lift and tip it by the raise tokens, and the pointer gone rests it",
      !!unfurl &&
        unfurl.name === "prospectUnfurl" &&
        unfurl.fill === "backwards" &&
        Math.abs(parseFloat(unfurl.origin) - unfurl.half) < 0.01 &&
        unfurl.origin.endsWith(" 0px") &&
        opened &&
        Math.abs(unfurl.end ?? 90) < 1 &&
        lifted(hovered) &&
        lifted(keyed) &&
        away.t === "none",
      JSON.stringify({ unfurl, hovered, keyed, away }),
    );
  } finally {
    await park(send);
    await evaluate<boolean>(`(() => { if (document.activeElement) document.activeElement.blur(); return true; })()`);
  }
}

type Paper = { strip: string; t: string };
const PAPER: Payload<Paper> = `(() => ({ strip: getComputedStyle(document.querySelector(".strip")).display, t: ${RR_LENS}.t }))()`;

export async function rr40Glass(ctx: SuiteContext): Promise<void> {
  const { evaluate, send, check } = ctx;
  await send("Emulation.setEmulatedMedia", { media: "", features: [] });
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
    const glide = await midGlideRefit(ctx, RR_LENS);
    check(
      "RR40 the Glass leans the chart to 1.4 at a real press and the silent refit lands a glide a resize interrupts, while paper prints the chart untransformed with the strip gone (the screen the control)",
      rest.k === 1 &&
        press?.hit === "zoom-in" &&
        leaned.zoomed &&
        Math.abs(leaned.k - 1.4) < 0.005 &&
        paper.strip === "none" &&
        paper.t === "none" &&
        screen.strip !== "none" &&
        screen.t !== "none" &&
        glideLanded(glide),
      JSON.stringify({ rest, press, leaned, paper, screen, glide }),
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
const scrub = (edge: "min" | "max"): string =>
  `(() => { const r = document.querySelector(".rf-range"); r.value = r.${edge}; r.dispatchEvent(new Event("input", { bubbles: true })); return true; })()`;

// A blanked survey line shortens the folio, so the fit grows into the room it leaves until a draw writes the line and refits.
async function refitAfterRead(
  ctx: SuiteContext,
): Promise<{ before: Fit; blanked: Fit; read: { hit: boolean }; drawn: Fit }> {
  const { evaluate, send, sleep } = ctx;
  const settle = makeSettle({ evaluate, sleep });
  await evaluate<boolean>(scrub("max"));
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
    await evaluate<boolean>(scrub("min"));
    await park(ctx.send);
  }
}
