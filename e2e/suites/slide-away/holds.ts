// The slide-away's arming and the Reading Room's strip (Issue #1034): a zoom a room makes for the reader waits for the reader's own, and the Reading Room's folio goes under its strip and comes back under a mouse on Play.
import { LINGER_MS, REST_MS } from "../../../src/site/shared/slide-away-bind.ts";
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { LENS, lensRest } from "../print-room/print.ts";
import { pressAt } from "../print-room/kit.ts";
import { RR_LENS } from "../reading-room/kit.ts";
import { aimAt, motionOn, mouseTo } from "../stage/slide-kit.ts";
import {
  EASE_MS,
  awayFaults,
  fillOf,
  fillPressOf,
  gather,
  openRoom,
  PIECES,
  pressGlass,
  ROOMS,
  still,
  travelsOf,
} from "./kit.ts";
import type { Pieces } from "./kit.ts";

const ROW_LEAN = "#rb-itinerary button.lean";
const CENTRE: Payload<{ x: number; y: number }> =
  `(() => { const r = document.getElementById("map-viewport").getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`;
const TRANSFORM: Payload<string> = `getComputedStyle(document.getElementById("map")).transform`;

async function leanedFrom(ctx: SuiteContext, before: string, label: string): Promise<boolean> {
  let moved = false;
  for (let i = 0; i < 40 && !moved; i++) {
    moved = (await ctx.evaluate(TRANSFORM)) !== before;
    if (!moved) await ctx.sleep(50);
  }
  await lensRest(ctx, "still", label, LENS);
  return moved;
}

async function enterOnSecondRow(ctx: SuiteContext): Promise<boolean> {
  const focused = await ctx.evaluate<boolean>(
    `(() => { const b = document.querySelectorAll(${JSON.stringify(ROW_LEAN)})[1]; if (!b) return false; b.focus(); return document.activeElement === b; })()`,
  );
  if (!focused) throw new Error("SW5: the second itinerary row's lean button took no focus");
  const before = await ctx.evaluate(TRANSFORM);
  const key = { key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 };
  await ctx.send("Input.dispatchKeyEvent", { type: "keyDown", ...key, text: "\r" });
  await ctx.send("Input.dispatchKeyEvent", { type: "keyUp", ...key });
  return leanedFrom(ctx, before, "SW5 Enter");
}

const allHome = (reads: readonly Pieces[]): boolean =>
  reads.every((p) => Math.abs(p.head.ty) <= 0.5 && Math.abs(p.folio.ty) <= 0.5);

export async function sw5RowLean(ctx: SuiteContext): Promise<void> {
  const room = ROOMS.find((r) => r.id === "Ribbon")!;
  const faults: string[] = [];
  const home = await openRoom(ctx, room, 1280, 800, "SW5");
  const fill = fillOf(home, "sheet");
  const travels = travelsOf(home);
  await motionOn(ctx, async () => {
    const row = await ctx.evaluate(aimAt(ROW_LEAN));
    if (!row.hit) throw new Error("SW5: the first itinerary row's lean button is covered at its centre");
    const before = await ctx.evaluate(TRANSFORM);
    await pressAt(ctx, row.x, row.y);
    if (!(await leanedFrom(ctx, before, "SW5 press"))) faults.push("the row's press leaned nothing");
    const leaned = await ctx.evaluate(PIECES);
    if (!(leaned.k >= fill))
      faults.push(`the lean landed at ${leaned.k.toFixed(3)}, short of the fill ${fill.toFixed(3)} (the witness)`);
    if (!allHome(await gather(ctx, 1000))) faults.push("a row's press moved a piece");
    if (!(await enterOnSecondRow(ctx))) faults.push("Enter on the second row leaned nothing");
    if (!allHome(await gather(ctx, 1000))) faults.push("Enter on a row moved a piece");
    const at = await ctx.evaluate(CENTRE);
    const kBefore = (await ctx.evaluate(PIECES)).k;
    await ctx.wheel(at.x, at.y, -100);
    await makeSettle(ctx)(PIECES, (d) => Math.abs(d.k - kBefore) > 1e-3, "SW5 wheel", 60);
    await lensRest(ctx, "still", "SW5 wheel", LENS);
    faults.push(...awayFaults(await still(ctx, "SW5 wheel"), travels, "after the reader's wheel"));
  });
  ctx.check(
    "SW5 on the Ribbon at 1280x800, an itinerary row pressed or keyed leans the Glass past the fill and the head cluster and the chart folio stay home, and the reader's own first wheel over the chart sends them to their thin lines (Alex, 2026-10-23, Issue #997 ruling 7)",
    faults.length === 0,
    `fill ${fill.toFixed(4)}` + (faults.length ? `; ${faults.join("; ")}` : ""),
  );
}

type Rest = { x: number; y: number; growTop: number; playBottom: number; hitPlay: boolean };

const PLAY_REST: Payload<Rest> = `(() => {
  const play = document.querySelector(".rf-play"), folio = document.querySelector(".corner.bl");
  const p = play.getBoundingClientRect(), f = folio.getBoundingClientRect();
  const growTop = f.top - Math.abs(parseFloat(getComputedStyle(folio, "::before").top) || 0);
  const x = p.left + p.width / 2, y = (growTop + p.bottom) / 2, e = document.elementFromPoint(x, y);
  return { x, y, growTop, playBottom: p.bottom, hitPlay: !!e && !!e.closest(".rf-play") };
})()`;
const UNDER_STRIP: Payload<boolean> = `(() => { const r = new Range(); r.selectNodeContents(document.getElementById("folio-title")); const b = r.getBoundingClientRect(), e = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return !!e && !!e.closest(".strip"); })()`;

export async function sw6Strip(ctx: SuiteContext): Promise<void> {
  const room = ROOMS.find((r) => r.id === "Reading Room")!;
  const faults: string[] = [];
  const home = await openRoom(ctx, room, 1280, 800, "SW6");
  const travels = travelsOf(home);
  const n = fillPressOf(fillOf(home, "sheet"));
  if (n !== 2) faults.push(`the fill lies at press ${n}, not the second (the witness)`);
  await motionOn(ctx, async () => {
    await pressGlass(ctx, RR_LENS, "SW6 press 1");
    await pressGlass(ctx, RR_LENS, "SW6 press 2");
    const a = await still(ctx, "SW6 fill");
    faults.push(...awayFaults(a, travels, "past the fill"));
    if (!(a.stripTop !== null && a.stripTop < a.folio.title[0]))
      faults.push(`the title is not under the strip: ${a.stripTop} against ${a.folio.title[0]}`);
    if (!(await ctx.evaluate(UNDER_STRIP))) faults.push("the strip does not paint over the slid title");
    const at = await ctx.evaluate(PLAY_REST);
    if (!(at.growTop < at.playBottom && at.hitPlay))
      faults.push(`the rest point is not on Play and on the slid panel at once: ${JSON.stringify(at)}`);
    await mouseTo(ctx, at.x, at.y);
    const held = await gather(ctx, REST_MS + EASE_MS + 1000);
    if (!held.slice(-2).every((p) => Math.abs(p.folio.ty) <= 0.5))
      faults.push(`a mouse resting on Play left the folio at ${JSON.stringify(held.slice(-2).map((p) => p.folio.ty))}`);
    if (held.some((p) => Math.abs(p.head.ty - travels.up) > 0.5))
      faults.push("the head left its thin line under a mouse on Play");
    await mouseTo(ctx, at.x + 1, at.y);
    const kept = await gather(ctx, LINGER_MS + EASE_MS + 1000);
    if (!kept.slice(-2).every((p) => Math.abs(p.folio.ty) <= 0.5))
      faults.push(`a second move on Play let the folio go: ${JSON.stringify(kept.slice(-2).map((p) => p.folio.ty))}`);
  });
  ctx.check(
    "SW6 on the Reading Room at 1280x800, past the fill the chart folio's title stands under the instrument strip, and a mouse resting on Play's lower half, where the slid folio's panel lies, brings the whole folio back up over the chart and keeps it there while it stays, the head staying at its thin line (Alex, 2026-10-23, Issue #997 ruling 2)",
    faults.length === 0,
    faults.length ? faults.join("; ") : "the folio came back under a mouse on Play and stayed",
  );
}
