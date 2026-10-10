// What a press on the slip's contents does in the Print Room (Issue #779 part 2g): a turn or a thumbnail hands the focus to its own successor without moving the slip.
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { clearMetrics, pressAt } from "./kit.ts";

const TURN = `.slip .contents .turn[data-plate="theme-moisture"]`;
const THUMB = `#pr-contents .plates .thumb[data-plate="theme-climate"]`;
type Steady = { h: number; loaded: boolean };
const STEADY: Payload<Steady> = `(() => { const b = document.querySelector(".slip .slip-body"), imgs = [...document.querySelectorAll("#pr-contents .plates img")];
  return { h: b.scrollHeight, loaded: imgs.length > 0 && imgs.every((i) => i.complete && i.naturalWidth > 0) }; })()`;
const turnTo = (key: string): Payload<boolean> =>
  `(() => { document.querySelector('#pr-contents .turn[data-plate="${key}"]').click(); return true; })()`;

type Seat = { x: number; y: number; hit: boolean; s0: number; over: number } | null;
// The target's centre is put on the slip body's bottom edge, so a focus allowed to scroll would bring its successor into view; a listener after the page's own reads the scroll the moment the press's handler ends.
const SEAT: Payload<Seat> = `(() => {
  const body = document.querySelector(".slip .slip-body"), t = document.querySelector('${TURN}');
  if (!body || !t) return null;
  const br = body.getBoundingClientRect(), tr0 = t.getBoundingClientRect();
  body.scrollTop += tr0.top + tr0.height / 2 - br.bottom;
  const tr = t.getBoundingClientRect(), x = tr.left + Math.min(20, tr.width / 2), y = br.bottom - tr.height / 4;
  window.__pr31dPressed = t;
  document.getElementById("pr-contents").addEventListener("click", () => { window.__pr31dAtHandler = body.scrollTop; }, { once: true });
  return { x, y, hit: document.elementFromPoint(x, y) === t, s0: body.scrollTop, over: body.scrollHeight - body.clientHeight };
})()`;
type Turned = {
  detached: boolean;
  active: boolean;
  connected: boolean;
  same: boolean;
  atHandler: number;
  scroll: number;
  pageY: number;
  here: string | undefined;
};
const TURNED: Payload<Turned> = `(() => {
  const body = document.querySelector(".slip .slip-body"), a = document.activeElement, was = window.__pr31dPressed;
  return { detached: !!was && !was.isConnected, active: !!a && a.matches('${TURN}'), connected: !!a && a.isConnected, same: a === was, atHandler: window.__pr31dAtHandler,
    scroll: body.scrollTop, pageY: window.scrollY, here: (document.querySelector("#pr-contents .turn.here") || { dataset: {} }).dataset.plate };
})()`;

const THUMB_SEAT: Payload<{ x: number; y: number; hit: boolean } | null> = `(() => {
  const body = document.querySelector(".slip .slip-body"), t = document.querySelector('${THUMB}');
  if (!body || !t) return null;
  const br = body.getBoundingClientRect(), tr0 = t.getBoundingClientRect();
  body.scrollTop += tr0.top + tr0.height / 2 - (br.top + br.height / 2);
  const tr = t.getBoundingClientRect(), x = tr.left + tr.width / 2, y = tr.top + tr.height / 2;
  window.__pr31dPressed = t;
  return { x, y, hit: t.contains(document.elementFromPoint(x, y)) };
})()`;
type Thumbed = { detached: boolean; active: boolean; connected: boolean; same: boolean; here: string | undefined };
const THUMBED: Payload<Thumbed> = `(() => { const a = document.activeElement, was = window.__pr31dPressed;
  return { detached: !!was && !was.isConnected, active: !!a && a.matches('${THUMB}'), connected: !!a && a.isConnected, same: a === was,
    here: (document.querySelector("#pr-contents .plates figure.here") || { dataset: {} }).dataset.plate }; })()`;

// Wiring, not the claim: each turn is rendered once before the read, since a list re-rendered before its thumbnails decode collapses and re-grows the slip's scroll (measured 2026-10-10).
async function warmTurns({ evaluate, sleep }: SuiteContext): Promise<void> {
  const settle = makeSettle({ evaluate, sleep });
  for (const key of ["theme-moisture", "theme-climate"]) {
    await evaluate(turnTo(key));
    await settle(STEADY, (d, last) => d.loaded && !!last && d.h === last.h, "print-room-contents-steady");
  }
}

async function pressThumb({
  evaluate,
  send,
  sleep,
}: SuiteContext): Promise<{ at: { hit: boolean } | null; thumbed: Thumbed | null }> {
  const at = await evaluate(THUMB_SEAT);
  if (!at) return { at, thumbed: null };
  await pressAt({ send }, at.x, at.y);
  const thumbed = await makeSettle({ evaluate, sleep })(
    THUMBED,
    (d, last) => !!last && JSON.stringify(d) === JSON.stringify(last),
    "print-room-thumbed",
  );
  return { at, thumbed };
}

export async function pr31dFocusKept(ctx: SuiteContext): Promise<void> {
  const { evaluate, send, check, sleep } = ctx;
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  try {
    await warmTurns(ctx);
    const seat = await evaluate(SEAT);
    if (seat) await pressAt({ send }, seat.x, seat.y);
    const turned = seat
      ? await makeSettle({ evaluate, sleep })(
          TURNED,
          (d, last) => !!last && d.scroll === last.scroll,
          "print-room-turned",
        )
      : null;
    const thumb = await pressThumb(ctx);
    const t = thumb.thumbed;
    check(
      "PR31d a press on the contents hands the focus to its own successor without moving the slip: a real press on a contents row half under the slip body's bottom edge re-renders the list, and the re-rendered turn takes the focus while the slip's scroll and the page's stay where they were; a real press on a plate's thumbnail hands the focus to the re-rendered thumbnail, not its row",
      !!seat &&
        seat.hit &&
        seat.over > 100 &&
        !!turned &&
        turned.here === "theme-moisture" &&
        turned.detached &&
        turned.active &&
        turned.connected &&
        !turned.same &&
        Math.abs(turned.atHandler - seat.s0) <= 2 &&
        Math.abs(turned.scroll - seat.s0) <= 2 &&
        turned.pageY === 0 &&
        !!thumb.at?.hit &&
        !!t &&
        t.here === "theme-climate" &&
        t.detached &&
        t.active &&
        t.connected &&
        !t.same,
      JSON.stringify({ seat, turned, thumb }),
    );
  } finally {
    await clearMetrics(ctx, 1280, 800);
    await evaluate(
      `(() => { const b = document.querySelector(".slip .slip-body"); if (b) b.scrollTop = 0; if (document.activeElement) document.activeElement.blur(); delete window.__pr31dPressed; delete window.__pr31dAtHandler; return true; })()`,
    );
  }
}
