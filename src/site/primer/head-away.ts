// The Primer's head in its slid-away state (Issue #1392 D3): the wordmark, the motto and the nav stand above the window at rest, leaving the trail and its line as a thin top line on a band shrunk to fit it, and the shared holds bring the head and the band's ground back.
import { OFF, type Measured, type SlideAway } from "../shared/slide-away-bind.ts";
import { bindOnPage, watchPointer } from "../shared/slide-away-page.ts";
import { headTravel } from "../shared/slide-away.ts";
import { translateOf } from "../shared/room-seats.ts";

export const HEAD_AWAY = "head-away";
export const BAND_PAINT = "--band-paint";

export const awayAt = (navFoot: number): Measured => ({ fill: 1, from: 1, up: headTravel(navFoot), down: 0 });

export const bandAway = (bandRem: number, up: number, remPx: number): number => bandRem + up / remPx;

export function bindHeadAway(doc: Document = document): SlideAway | null {
  const head = doc.querySelector<HTMLElement>("header.chrome");
  const nav = head?.querySelector("nav.rooms") ?? null;
  if (head === null || nav === null) return null;
  const root = doc.documentElement;
  const slide = bindOnPage(head, null);
  let full = 0;
  const paint = (): void => {
    if (head.style.getPropertyValue("translate") === "") root.style.setProperty(BAND_PAINT, `${full}rem`);
    else root.style.removeProperty(BAND_PAINT);
  };
  const measure = (): Measured => {
    root.style.removeProperty("--band-h");
    const rem = parseFloat(getComputedStyle(root).fontSize);
    full = parseFloat(getComputedStyle(root).getPropertyValue("--band-h"));
    const range = doc.createRange();
    range.selectNodeContents(nav);
    const m = awayAt(range.getBoundingClientRect().bottom - translateOf(getComputedStyle(head).translate).y);
    root.style.setProperty("--band-h", `${bandAway(full, m.up, rem)}rem`);
    paint();
    return m;
  };
  new MutationObserver(paint).observe(head, { attributes: true, attributeFilter: ["style"] });
  root.classList.add(HEAD_AWAY);
  slide.arm();
  slide.follow(1, measure());
  const again = (): void => slide.measured(measure());
  void doc.fonts.ready.then(again);
  window.addEventListener("resize", again);
  new ResizeObserver(again).observe(head);
  watchPointer(doc, slide, head, () => OFF);
  return slide;
}
