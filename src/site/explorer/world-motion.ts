import { sheetEl, versoBtn } from "./elements.ts";

export function createMotion(hold: HTMLElement): { busy: () => boolean; setDrawing: (on: boolean) => void } {
  let drawing = false;
  const busy = (): boolean => drawing || sheetEl.classList.contains("turning");
  const sync = (): void => hold.setAttribute("aria-disabled", String(busy()));
  new MutationObserver(sync).observe(sheetEl, { attributes: true, attributeFilter: ["class"] });
  return {
    busy,
    setDrawing: (on) => {
      drawing = on;
      versoBtn.disabled = on;
      sync();
    },
  };
}
