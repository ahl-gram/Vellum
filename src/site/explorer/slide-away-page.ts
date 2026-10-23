// The Explorer's slide-away on its page (Issue #996): the head cluster's and the chart folio's measurements on every layout, the reader's first zoom, pan or key, and a moving mouse or pen read against each piece.
import { bindSlideAway, OFF, type Measured, type SlideAway, type Spot } from "./slide-away-bind.ts";
import {
  arms,
  fillDepth,
  folioTravel,
  followStart,
  grown,
  headTravel,
  holdZone,
  reachOf,
  steers,
  within,
  type Edges,
} from "./slide-away.ts";
import { rectOf, translateOf } from "../shared/room-seats.ts";
import { pageBottom, pageBox, pageX, pageY } from "../shared/page-box.ts";
import { chartDrawer, mapViewport, sheetEl, stageEl } from "./elements.ts";

export interface PageSlideDeps {
  readonly reduce: () => boolean;
  readonly firstPress: number;
  readonly tokenMs: (name: string, fallback: number) => number;
}

interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

const pageEdges = (r: Box): Edges => ({
  left: pageX(r.left, window.scrollX),
  top: pageY(r.top, window.scrollY),
  right: pageX(r.right, window.scrollX),
  bottom: pageY(r.bottom, window.scrollY),
});

function lineFoot(el: Element | null, shift: number): number | null {
  if (el === null) return null;
  const range = document.createRange();
  range.selectNodeContents(el);
  const r = range.getBoundingClientRect();
  return r.height > 0 ? pageBottom(r) - shift : null;
}

const shiftOf = (el: Element): number => translateOf(getComputedStyle(el).translate).y;

// The fold's class lands at once and the refit 340 ms later, and a measure between them (the survey line landing in the folio) would pair the new class with the old sheet, so the room is read as the layout last wrote it: the reserve it left for an open slip.
function roomRight(slip: HTMLElement | null): number {
  if (slip === null || !(parseFloat(stageEl.style.getPropertyValue("--reserve-right")) > 0)) return pageBox().w;
  return pageBox().w - parseFloat(getComputedStyle(slip).right) - slip.getBoundingClientRect().width;
}

function measure(head: HTMLElement, folio: HTMLElement, slip: HTMLElement | null, firstPress: number): Measured | null {
  const sheet = rectOf(sheetEl);
  if (sheet === null) return null;
  const fill = fillDepth(pageEdges(sheet), { left: 0, top: 0, right: roomRight(slip), bottom: pageBox().h });
  const nav = lineFoot(head.querySelector("nav.rooms"), shiftOf(head));
  const title = lineFoot(folio.querySelector("#folio-title"), shiftOf(folio));
  return {
    fill,
    from: followStart(fill, firstPress),
    up: nav === null ? 0 : headTravel(nav),
    down: title === null ? 0 : folioTravel(pageBox().h, title),
  };
}

function spotOf(el: HTMLElement, toward: "top" | "bottom", x: number, y: number): Spot {
  const home = rectOf(el);
  if (home === null) return OFF;
  const reach = reachOf(getComputedStyle(el, "::before"));
  return {
    on: within(x, y, grown(pageEdges(el.getBoundingClientRect()), reach)),
    near: within(x, y, holdZone(pageEdges(home), reach, toward, pageBox().h)),
  };
}

function watchLayout(head: HTMLElement, folio: HTMLElement, remeasure: () => void): void {
  const style = new MutationObserver(remeasure);
  style.observe(sheetEl, { attributes: true, attributeFilter: ["style"] });
  style.observe(stageEl, { attributes: true, attributeFilter: ["style"] });
  const size = new ResizeObserver(remeasure);
  size.observe(head);
  size.observe(folio);
  window.addEventListener("resize", remeasure);
  void document.fonts.ready.then(remeasure);
}

function watchInput(slide: SlideAway, head: HTMLElement, folio: HTMLElement, glass: Element | null): void {
  const onChart = (t: EventTarget | null): boolean =>
    t instanceof Node && (mapViewport.contains(t) || (glass !== null && glass.contains(t)));
  window.addEventListener("keydown", () => slide.arm(), true);
  window.addEventListener(
    "wheel",
    (e) => {
      if (arms({ type: "wheel", onChart: onChart(e.target) })) slide.arm();
    },
    { capture: true, passive: true },
  );
  window.addEventListener(
    "pointerdown",
    (e) => {
      if (arms({ type: "pointerdown", onChart: onChart(e.target) })) slide.arm();
    },
    true,
  );
  document.addEventListener(
    "pointermove",
    (e) => {
      if (!steers(e.pointerType) || e.buttons !== 0) return;
      const x = pageX(e.clientX, window.scrollX);
      const y = pageY(e.clientY, window.scrollY);
      slide.point(
        spotOf(head, "top", x, y),
        chartDrawer.classList.contains("open") ? OFF : spotOf(folio, "bottom", x, y),
      );
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", (e) => {
    if (steers(e.pointerType)) slide.point(OFF, OFF);
  });
}

export function pageSlideAway(deps: PageSlideDeps): SlideAway {
  const head = document.querySelector<HTMLElement>("header.chrome");
  const folio = document.querySelector<HTMLElement>(".corner.bl");
  if (head === null || folio === null) return { follow: () => {}, measured: () => {}, arm: () => {}, point: () => {} };
  const slip = document.querySelector<HTMLElement>(".slip");
  const slide = bindSlideAway({
    head,
    folio,
    atelier: head.querySelector<HTMLDetailsElement>("details.atelier-fold"),
    reduce: deps.reduce,
    focusVisible: (t) => t instanceof Element && t.matches(":focus-visible"),
    easeMs: () => deps.tokenMs("--paper-settle", 340),
    after: (run, ms) => window.setTimeout(run, ms),
    cancel: (timer) => window.clearTimeout(timer),
  });
  let measuredOnce = false;
  const remeasure = (): void => {
    const m = measure(head, folio, slip, deps.firstPress);
    if (m === null) return;
    measuredOnce = true;
    slide.measured(m);
  };
  watchLayout(head, folio, remeasure);
  watchInput(slide, head, folio, document.querySelector(".corner.br"));
  return {
    ...slide,
    follow: (k) => {
      if (!measuredOnce) remeasure();
      slide.follow(k);
    },
  };
}
