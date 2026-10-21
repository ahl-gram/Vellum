import { sheetEl, versoBtn } from "./elements.ts";

export type Motion = {
  readonly busy: () => boolean;
  readonly setDrawing: (on: boolean) => void;
  readonly watch: (fn: () => void) => void;
};

export function createMotion(hold: HTMLElement, loupe: HTMLElement): Motion {
  let drawing = false;
  const watchers: (() => void)[] = [];
  const busy = (): boolean => drawing || sheetEl.classList.contains("turning");
  const sync = (): void => {
    hold.setAttribute("aria-disabled", String(busy()));
    loupe.setAttribute("aria-disabled", String(busy()));
    for (const fn of watchers) fn();
  };
  new MutationObserver(sync).observe(sheetEl, { attributes: true, attributeFilter: ["class"] });
  return {
    busy,
    setDrawing: (on) => {
      drawing = on;
      versoBtn.disabled = on;
      sync();
    },
    watch: (fn) => {
      watchers.push(fn);
    },
  };
}
