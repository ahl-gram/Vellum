// The chart's slide with the side panel's fold (Issue #1261): the sheet's own translate and scale, composited, from the box it stood in to its new fit.

export interface SheetBox {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export interface SlideStart {
  readonly dx: number;
  readonly dy: number;
  readonly s: number;
}

const NO_MOVE_PX = 0.5;
const NO_SCALE = 0.001;

export function slideStart(from: SheetBox, to: SheetBox, depth: number): SlideStart | null {
  if (!(to.width > 0) || !(depth > 0)) return null;
  const dx = (from.left + from.width / 2 - (to.left + to.width / 2)) / depth;
  const dy = (from.top + from.height / 2 - (to.top + to.height / 2)) / depth;
  const s = from.width / to.width;
  return Math.abs(dx) < NO_MOVE_PX && Math.abs(dy) < NO_MOVE_PX && Math.abs(s - 1) < NO_SCALE ? null : { dx, dy, s };
}

export function foldTiming(): { readonly ms: number; readonly ease: string } | null {
  const root = getComputedStyle(document.documentElement);
  const ms = parseFloat(root.getPropertyValue("--fold"));
  const ease = root.getPropertyValue("--ease-fold").trim();
  return Number.isFinite(ms) && ms > 0 && ease !== "" ? { ms, ease } : null;
}

export interface SheetSlide {
  readonly stop: () => void;
  /** Resolves true when the slide ran its course or there was none to run, false when a later layout or slide cut it short. */
  readonly slide: (from: SheetBox, reduce: boolean) => Promise<boolean>;
}

export function createSheetSlide(sheet: HTMLElement): SheetSlide {
  let cancel: (() => void) | null = null;
  const stop = (): void => {
    cancel?.();
    cancel = null;
  };
  const slide = (from: SheetBox, reduce: boolean): Promise<boolean> => {
    stop();
    const to = sheet.getBoundingClientRect();
    const depth = to.width / (parseFloat(getComputedStyle(sheet).width) || to.width);
    const start = slideStart(from, to, depth);
    const timing = foldTiming();
    if (start === null || timing === null || reduce) return Promise.resolve(true);
    return new Promise<boolean>((resolve) => {
      let animation: Animation | null = null;
      const mine = (): void => {
        cancelAnimationFrame(frame);
        animation?.cancel();
        resolve(false);
      };
      const end = (done: boolean): void => {
        if (cancel === mine) cancel = null;
        resolve(done);
      };
      const frame = requestAnimationFrame(() => {
        animation = sheet.animate(
          [
            { translate: `${start.dx}px ${start.dy}px`, scale: String(start.s) },
            { translate: "0px 0px", scale: "1" },
          ],
          { duration: timing.ms, easing: timing.ease },
        );
        animation.finished.then(
          () => {
            end(true);
          },
          () => {
            end(false);
          },
        );
      });
      cancel = mine;
    });
  };
  return { stop, slide };
}
