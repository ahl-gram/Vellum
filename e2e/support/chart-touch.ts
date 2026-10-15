// The chart's touch press as a browser check reads and drives it (Issue #778); every suite that gives the chart a finger takes it back and forgets it after its steps.
import { CHART_TOUCH_KEY } from "../../src/site/shared/chart-touch.ts";
import type { Payload, Point, SuiteContext } from "../types.ts";
import { PAGE_RGBA } from "./pixel.ts";
import { makeSettle } from "./settle.ts";

export type TouchRead = {
  readonly shown: boolean;
  readonly pressed: string | null;
  readonly ground: number[] | null;
  readonly zoomable: boolean | null;
  readonly touchAction: string | null;
};

export const touchRead = (box: string): Payload<TouchRead> => `(() => {
  const rgba = ${PAGE_RGBA};
  const press = document.getElementById("zoom-touch");
  const gesture = document.querySelector(${JSON.stringify(box)});
  const r = press ? press.getBoundingClientRect() : null;
  return {
    shown: !!r && r.width > 0,
    pressed: press ? press.getAttribute("aria-pressed") : null,
    ground: press ? rgba(getComputedStyle(press).backgroundColor) : null,
    zoomable: gesture ? gesture.classList.contains("zoomable") : null,
    touchAction: gesture ? getComputedStyle(gesture).touchAction : null,
  };
})()`;

const PRESS_AT: Payload<{ w: number; x: number; y: number; reached: boolean } | null> = `(() => {
  const press = document.getElementById("zoom-touch");
  if (!press) return null;
  const r = press.getBoundingClientRect();
  const x = Math.round(r.x + r.width / 2);
  const y = Math.round(r.y + r.height / 2);
  return { w: r.width, x, y, reached: document.elementFromPoint(x, y) === press };
})()`;

const PRESSED: Payload<string | null> = `document.getElementById("zoom-touch")?.getAttribute("aria-pressed") ?? null`;

export async function takeChartTouch(
  ctx: Pick<SuiteContext, "evaluate" | "touch" | "sleep">,
  on: boolean,
): Promise<void> {
  const at = await ctx.evaluate(PRESS_AT);
  if (at === null || at.w <= 0 || !at.reached) throw new Error("the chart's touch press is not shown or not reachable");
  await ctx.touch("touchStart", [{ x: at.x, y: at.y, id: 0 }]);
  await ctx.touch("touchEnd", []);
  await makeSettle(ctx)(PRESSED, (d) => d === String(on), `the chart's touch press reads ${on ? "pressed" : "off"}`);
}

export async function releaseChartTouch(ctx: Pick<SuiteContext, "evaluate" | "touch" | "sleep">): Promise<void> {
  if ((await ctx.evaluate(PRESSED)) === "true") await takeChartTouch(ctx, false);
}

const FINGERS: Payload<true> = `(() => {
  const w = (window.__fingers = { most: 0, lifted: false });
  const o = { capture: true, passive: true };
  window.addEventListener("touchstart", (e) => { w.most = Math.max(w.most, e.touches.length); }, o);
  for (const t of ["touchend", "touchcancel"]) window.addEventListener(t, (e) => { if (e.touches.length === 0) w.lifted = true; }, o);
  return true;
})()`;

export async function browserPinch(
  ctx: Pick<SuiteContext, "evaluate" | "send" | "sleep">,
  at: Point,
  label: string,
): Promise<void> {
  await ctx.evaluate(FINGERS);
  await ctx.send("Input.synthesizePinchGesture", { x: at.x, y: at.y, scaleFactor: 2, gestureSourceType: "touch" });
  const settle = makeSettle(ctx);
  await settle<number>(`window.__fingers.most`, (d) => d >= 2, `${label} the browser's two fingers reach the page`);
  await settle<boolean>(`window.__fingers.lifted`, (d) => d, `${label} the browser's fingers lift`);
}

export async function touchListeners(ctx: Pick<SuiteContext, "send">, selector: string): Promise<string[]> {
  const found = await ctx.send<{ result: { objectId?: string } }>("Runtime.evaluate", {
    expression: `document.querySelector(${JSON.stringify(selector)})`,
  });
  const objectId = found.result.objectId;
  if (objectId === undefined) throw new Error(`no element for ${selector} to list the listeners of`);
  const got = await ctx.send<{ listeners: { type: string }[] }>("DOMDebugger.getEventListeners", { objectId });
  return got.listeners.map((l) => l.type);
}

export const forgetChartTouch: Payload<boolean> = `(() => { sessionStorage.removeItem(${JSON.stringify(CHART_TOUCH_KEY)}); return true; })()`;
