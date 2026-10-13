// The chart's touch press (Issue #778): where touch is the main pointer a finger moves the page until the reader gives it to the chart.
export const CHART_TOUCH_KEY = "vellum.chart-touch.v1";
export const TOUCH_PRIMARY = "(hover: none) and (pointer: coarse)";

export function touchHeld(getStorage: () => Storage): boolean {
  try {
    return getStorage().getItem(CHART_TOUCH_KEY) === "1";
  } catch {
    return false;
  }
}

export function holdTouch(getStorage: () => Storage, on: boolean): void {
  try {
    getStorage().setItem(CHART_TOUCH_KEY, on ? "1" : "0");
  } catch {}
}

export type TouchPress = {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
  addEventListener(type: "click", fn: () => void): void;
};
export type TouchEnv = { readonly device: boolean; readonly getStorage: () => Storage };

export function bindChartTouch(press: TouchPress | null, take: (on: boolean) => void, env: TouchEnv): void {
  if (press === null || !env.device) return;
  press.removeAttribute("hidden");
  const boot = touchHeld(env.getStorage);
  press.setAttribute("aria-pressed", String(boot));
  take(boot);
  press.addEventListener("click", () => {
    const next = press.getAttribute("aria-pressed") !== "true";
    holdTouch(env.getStorage, next);
    press.setAttribute("aria-pressed", String(next));
    take(next);
  });
}

export const pageTouchEnv = (): TouchEnv => ({
  device: window.matchMedia(TOUCH_PRIMARY).matches,
  getStorage: () => sessionStorage,
});
