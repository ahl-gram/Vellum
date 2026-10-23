// The slide-away on a chart room's page (Issue #996, lifted for every zoom room in Issue #1034): the head cluster's and the chart folio's measurements on every layout, the reader's first zoom, pan or key, and a moving mouse or pen read against each piece; the room hands in its elements and, where its camera differs, its own fill and resting box.
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
import { rectOf, slipWidth, translateOf } from "./room-seats.ts";
import { pageBottom, pageBox, pageX, pageY } from "./page-box.ts";

export type FillRule = (sheet: Edges, room: Edges, gesture: Edges) => number;

export interface RoomSlideParts {
  readonly frame: HTMLElement;
  readonly sheet: HTMLElement;
  readonly gesture: HTMLElement;
  readonly step: number;
  readonly keyAnywhere?: boolean;
  readonly folioCovered?: () => boolean;
  readonly fill?: FillRule;
  readonly resting?: (onScreen: Edges, gesture: Edges) => Edges;
  readonly camera?: { readonly target: HTMLElement; readonly depth: () => number };
}

export interface RoomSlide extends SlideAway {
  readonly fill: () => number;
}

interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

const RESERVES = ["--reserve-top", "--reserve-right", "--reserve-bottom"] as const;

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
const prefersReduce = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function settleMs(): number {
  const ms = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--paper-settle"));
  return Number.isFinite(ms) ? ms : 340;
}

const reservesOf = (frame: HTMLElement): string => RESERVES.map((r) => frame.style.getPropertyValue(r)).join(",");

function roomRight(frame: HTMLElement, slip: HTMLElement | null): number {
  if (slip === null || !(parseFloat(frame.style.getPropertyValue("--reserve-right")) > 0)) return pageBox().w;
  return pageBox().w - parseFloat(getComputedStyle(slip).right) - slipWidth(rectOf(slip));
}

function measure(
  parts: RoomSlideParts,
  head: HTMLElement,
  folio: HTMLElement,
  slip: HTMLElement | null,
): Measured | null {
  const box = rectOf(parts.sheet);
  if (box === null) return null;
  const gesture = pageEdges(parts.gesture.getBoundingClientRect());
  const sheet = (parts.resting ?? ((b: Edges) => b))(pageEdges(box), gesture);
  const room = { left: 0, top: 0, right: roomRight(parts.frame, slip), bottom: pageBox().h };
  const fill = (parts.fill ?? fillDepth)(sheet, room, gesture);
  const nav = lineFoot(head.querySelector("nav.rooms"), shiftOf(head));
  const title = lineFoot(folio.querySelector("#folio-title"), shiftOf(folio));
  return {
    fill,
    from: followStart(fill, parts.step),
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

function watchLayout(parts: RoomSlideParts, head: HTMLElement, folio: HTMLElement, remeasure: () => void): void {
  new MutationObserver(remeasure).observe(parts.sheet, { attributes: true, attributeFilter: ["style"] });
  let seen = reservesOf(parts.frame);
  new MutationObserver(() => {
    const now = reservesOf(parts.frame);
    if (now === seen) return;
    seen = now;
    remeasure();
  }).observe(parts.frame, { attributes: true, attributeFilter: ["style"] });
  const size = new ResizeObserver(remeasure);
  size.observe(head);
  size.observe(folio);
  window.addEventListener("resize", remeasure);
  void document.fonts.ready.then(remeasure);
}

function watchInput(
  slide: SlideAway,
  parts: RoomSlideParts,
  head: HTMLElement,
  folio: HTMLElement,
  glass: Element | null,
): void {
  const keyAnywhere = parts.keyAnywhere ?? false;
  const covered = parts.folioCovered ?? (() => false);
  const onChart = (t: EventTarget | null): boolean =>
    t instanceof Node && (parts.gesture.contains(t) || (glass !== null && glass.contains(t)));
  window.addEventListener(
    "keydown",
    (e) => {
      if (arms({ type: "keydown", onChart: onChart(e.target) }, keyAnywhere)) slide.arm();
    },
    true,
  );
  window.addEventListener(
    "wheel",
    (e) => {
      if (arms({ type: "wheel", onChart: onChart(e.target) }, keyAnywhere)) slide.arm();
    },
    { capture: true, passive: true },
  );
  window.addEventListener(
    "pointerdown",
    (e) => {
      if (arms({ type: "pointerdown", onChart: onChart(e.target) }, keyAnywhere)) slide.arm();
    },
    true,
  );
  document.addEventListener(
    "pointermove",
    (e) => {
      if (!steers(e.pointerType) || e.buttons !== 0) return;
      const x = pageX(e.clientX, window.scrollX);
      const y = pageY(e.clientY, window.scrollY);
      slide.point(spotOf(head, "top", x, y), covered() ? OFF : spotOf(folio, "bottom", x, y));
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", (e) => {
    if (steers(e.pointerType)) slide.point(OFF, OFF);
  });
}

const NONE: RoomSlide = { follow: () => {}, measured: () => {}, arm: () => {}, point: () => {}, fill: () => Infinity };

export function pageSlideAway(parts: RoomSlideParts): RoomSlide {
  const head = document.querySelector<HTMLElement>("header.chrome");
  const folio = document.querySelector<HTMLElement>(".corner.bl");
  if (head === null || folio === null) return NONE;
  const slip = document.querySelector<HTMLElement>(".slip");
  const slide = bindSlideAway({
    head,
    folio,
    atelier: head.querySelector<HTMLDetailsElement>("details.atelier-fold"),
    reduce: prefersReduce,
    focusVisible: (t) => t instanceof Element && t.matches(":focus-visible"),
    easeMs: settleMs,
    after: (run, ms) => window.setTimeout(run, ms),
    cancel: (timer) => window.clearTimeout(timer),
  });
  let last = Infinity;
  let from = 0;
  let measuredOnce = false;
  let armedOnce = false;
  const remeasure = (): void => {
    const m = measure(parts, head, folio, slip);
    if (m === null) return;
    measuredOnce = true;
    last = m.fill;
    from = m.from;
    slide.measured(m);
  };
  watchLayout(parts, head, folio, remeasure);
  const arm = (): void => {
    if (!armedOnce) remeasure();
    armedOnce = true;
    slide.arm();
  };
  watchInput({ ...slide, arm }, parts, head, folio, document.querySelector(".corner.br"));
  const follow = (k: number): void => {
    if (!measuredOnce || k <= from) remeasure();
    slide.follow(k);
  };
  const { camera } = parts;
  if (camera)
    new MutationObserver(() => follow(camera.depth())).observe(camera.target, {
      attributes: true,
      attributeFilter: ["style"],
    });
  return {
    ...slide,
    follow,
    arm,
    fill: () => {
      remeasure();
      return last;
    },
  };
}
