import { dropExpectedCancellations } from "../../support/console.ts";
import { buttonPoint } from "../../support/home.ts";
import type { Cam } from "../../support/home.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import type { HomeKit } from "./kit.ts";

type Flight = Awaited<ReturnType<typeof h14aFlight>>;

export async function h14aFlight({ evaluate, sleep, clickAt }: HomeKit) {
  const atlasPt = await evaluate(buttonPoint('.lf-station[data-station="atlas"]'));
  if (atlasPt !== null) await clickAt(Math.round(atlasPt.x), Math.round(atlasPt.y));
  let visited = null;
  for (let i = 0; i < 80; i++) {
    try {
      visited = await evaluate<{
        scale: number;
        fit: number;
        anchorX: number;
        anchorY: number;
        stageW: number;
        stageH: number;
        open: boolean;
        contained: boolean;
        anchorClear: boolean;
        enterReach: boolean;
        closeReach: boolean;
        controlsReach: boolean;
        title: string | null;
        enter: string | null;
        arms: number;
      } | null>(`(() => {
        const stage = document.getElementById("lf-stage");
        const sheet = document.getElementById("lf-sheet");
        const btn = document.querySelector('.lf-station[data-station="atlas"]');
        const card = document.getElementById("lf-card-atlas");
        if (!stage || !sheet || !btn || !card) return null;
        const r = stage.getBoundingClientRect();
        const fit = Math.min(r.width / 1500, r.height / 1157.931) * 0.92;
        const m = new DOMMatrixReadOnly(getComputedStyle(sheet).transform);
        const cs = getComputedStyle(card);
        const anchorX = Number(btn.dataset.nx) * 1500 * m.a + m.e;
        const anchorY = Number(btn.dataset.ny) * 1157.931 * m.a + m.f;
        const cr = card.getBoundingClientRect();
        const reach = (el) => {
          if (!el) return false;
          const b = el.getBoundingClientRect();
          const hit = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
          return hit !== null && (hit === el || el.contains(hit));
        };
        const anchorVX = r.left + anchorX, anchorVY = r.top + anchorY;
        return {
          scale: m.a, fit,
          anchorX, anchorY, stageW: r.width, stageH: r.height,
          open: !card.hidden && cs.visibility !== "hidden" && Number(cs.opacity) > 0.95,
          contained: cr.top >= r.top - 0.5 && cr.bottom <= r.bottom + 0.5 && cr.left >= r.left - 0.5 && cr.right <= r.right + 0.5,
          anchorClear: !(anchorVX >= cr.left && anchorVX <= cr.right && anchorVY >= cr.top && anchorVY <= cr.bottom),
          enterReach: reach(card.querySelector(".lf-card-enter")), closeReach: reach(card.querySelector(".lf-card-close")),
          controlsReach: reach(document.getElementById("zoom-in")) && reach(document.getElementById("zoom-out")),
          title: card.querySelector(".lf-card-title")?.textContent ?? null,
          enter: card.querySelector(".lf-card-enter")?.getAttribute("href") ?? null,
          arms: card.querySelectorAll(".lf-card-arms img").length,
        };
      })()`);
      if (visited !== null && visited.open && Math.abs(visited.scale - visited.fit * 2.6) < 1e-3) break;
    } catch {}
    await sleep(75);
  }
  return { atlasPt, visited };
}

export async function h14aCardFits(
  { check, shoot }: SuiteContext,
  settled14: Cam | null,
  atlasPt: Flight["atlasPt"],
  visited: Flight["visited"],
): Promise<void> {
  check(
    "H14a a real click on the Atlas station flies the camera to 2.6 of fit, the anchor at 0.4 of the stage clear of the slip, the slip whole inside the stage with its enter, close, and the zoom controls all under the hand, arms aboard",
    visited !== null &&
      visited.open &&
      Math.abs(visited.scale - visited.fit * 2.6) < 1e-3 &&
      Math.abs(visited.anchorX - visited.stageW * 0.4) < 2 &&
      Math.abs(visited.anchorY - visited.stageH / 2) < 2 &&
      visited.contained &&
      visited.anchorClear &&
      visited.enterReach &&
      visited.closeReach &&
      visited.controlsReach &&
      visited.title === "The Atlas of Rahai" &&
      visited.enter === "atlas/" &&
      visited.arms === 3,
    JSON.stringify({ settled14: !!settled14, atlasPt, visited }),
  );
  await shoot("home-station-card.png");
}

export async function h14bEscape({ evaluate, check, sleep, pressKey }: HomeKit): Promise<void> {
  await pressKey("Escape", "Escape", 27);
  let closed14 = null;
  for (let i = 0; i < 30; i++) {
    try {
      closed14 = await evaluate<boolean>(`document.getElementById("lf-card-atlas").hidden`);
    } catch {}
    if (closed14 === true) break;
    await sleep(75);
  }
  check("H14b a real Escape sets the slip aside", closed14 === true, `hidden=${closed14}`);
}

export async function h14dPipHover({ evaluate, send, check, sleep, pressKey }: HomeKit): Promise<void> {
  // The house button lift must never reach a station (its anchor transform IS its position and counter-scale): a real hover once shifted the pip 17px and shrank it to the raw camera scale.
  const pipBox: Payload<{ cx: number; cy: number; w: number; glyphW: number; btnBg: string }> = `(() => {
    const btn = document.querySelector('.lf-station[data-station="atlas"]');
    const b = btn.getBoundingClientRect();
    const g = btn.querySelector(".lf-station-glyph").getBoundingClientRect();
    return { cx: b.x + b.width / 2, cy: b.y + b.height / 2, w: b.width, glyphW: g.width,
      btnBg: getComputedStyle(btn).backgroundColor };
  })()`;
  // A real 0 flies the camera home first so the pip sits at a deterministic on-screen spot: one CI lane caught the camera slid to its left clamp edge here (x-only, cause unrecorded), and a hover dispatched at an off-viewport pip proves nothing. The Escape above also refocused its opener, so the hover claim needs a bare rest state.
  await evaluate(`document.getElementById("lf-stage").focus()`);
  await pressKey("0", "Digit0", 48);
  await sleep(1700);
  await evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 20, y: 20, button: "none" });
  await sleep(450);
  const pipRest = await evaluate(pipBox);
  await send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: Math.round(pipRest.cx),
    y: Math.round(pipRest.cy),
    button: "none",
  });
  await sleep(450);
  const pipHover = await evaluate(pipBox);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 20, y: 20, button: "none" });
  await sleep(450);
  check(
    "H14d a real hover keeps the pip on its anchor at its size, its button square unpainted, while the glyph grows the mockup's quarter",
    Math.abs(pipHover.cx - pipRest.cx) < 0.5 &&
      Math.abs(pipHover.cy - pipRest.cy) < 0.5 &&
      Math.abs(pipHover.w - pipRest.w) < 0.5 &&
      Math.abs(pipRest.w - 34) < 0.5 &&
      Math.abs(pipHover.glyphW / pipRest.glyphW - 1.25) < 0.02 &&
      pipHover.btnBg === "rgba(0, 0, 0, 0)",
    JSON.stringify({ pipRest, pipHover }),
  );
}

export async function h14cLegend({ evaluate, check, sleep, pressKey, clickAt }: HomeKit): Promise<void> {
  const legendPt = await evaluate(buttonPoint('.lf-legend-btn[data-station="reading-room"]'));
  if (legendPt !== null) await clickAt(Math.round(legendPt.x), Math.round(legendPt.y));
  let legendCard = null;
  for (let i = 0; i < 80; i++) {
    try {
      legendCard = await evaluate<{ open: boolean; title: string | null } | null>(`(() => {
        const card = document.getElementById("lf-card-reading-room");
        if (!card) return null;
        const cs = getComputedStyle(card);
        return { open: !card.hidden && cs.visibility !== "hidden" && Number(cs.opacity) > 0.95,
          title: card.querySelector(".lf-card-title")?.textContent ?? null };
      })()`);
      if (legendCard !== null && legendCard.open) break;
    } catch {}
    await sleep(75);
  }
  check(
    "H14c the legend strip is a real alternative: a real click on its Reading Room entry unfurls that slip",
    legendCard !== null && legendCard.open && legendCard.title === "The Reading Room",
    JSON.stringify({ legendPt, legendCard }),
  );
  await pressKey("Escape", "Escape", 27);
  await sleep(500);
}

export function h17Clean(ctx: SuiteContext, errBase3: number, httpBase3: number): void {
  const { check, consoleErrors, http4xx } = ctx;
  const errDelta3 = dropExpectedCancellations(consoleErrors.slice(errBase3));
  const httpDelta3 = http4xx.slice(httpBase3).filter((u) => !/favicon/i.test(u));
  check(
    "H17 the station and drift flow is clean (no console errors, no new 4xx)",
    errDelta3.length === 0 && httpDelta3.length === 0,
    [...errDelta3, ...httpDelta3].join(" | ") || "clean",
  );
}
