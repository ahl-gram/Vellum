// The loupe (Issue #751): a lens in the gesture box, never in the chart mount, showing the drawn sheets through object urls this module alone mints and revokes.
import { loupeView } from "./loupe-view.ts";
import type { ZoomState } from "../shared/zoom-controller.ts";
import type { SheetRect } from "../../world/lod.ts";

export const LOUPE_DIAMETER = 240;
export const LOUPE_POWER = 2;

export interface SvgUrls {
  readonly create: (svg: string) => string;
  readonly revoke: (url: string) => void;
}

export interface LoupeSheets {
  readonly world: string;
  readonly inset: { readonly svg: string; readonly rect: SheetRect } | null;
}

export interface LoupeDeps {
  readonly host: HTMLElement;
  readonly mapDiv: HTMLElement;
  readonly zoom: () => ZoomState;
  readonly sheets: () => LoupeSheets | null;
  readonly urls: SvgUrls;
  readonly touchable: boolean;
}

export interface Loupe {
  readonly lens: HTMLElement;
  readonly grip: HTMLElement;
  readonly show: (at: { readonly x: number; readonly y: number }) => void;
  readonly hide: () => void;
}

type Parts = {
  lens: HTMLElement;
  sheet: HTMLElement;
  room: HTMLElement;
  world: HTMLImageElement;
  inset: HTMLImageElement;
  grip: HTMLElement;
};

export function svgUrl(urls: SvgUrls): (svg: string) => string {
  let svg = "";
  let url = "";
  return (next) => {
    if (next === svg) return url;
    if (url) urls.revoke(url);
    svg = next;
    url = urls.create(next);
    return url;
  };
}

function part<T extends HTMLElement>(tag: string, cls: string): T {
  const el = document.createElement(tag) as T;
  el.className = cls;
  return el;
}

function buildLens(touchable: boolean): Parts {
  const lens = part("div", touchable ? "loupe touchable" : "loupe");
  lens.setAttribute("aria-hidden", "true");
  lens.hidden = true;
  const glass = part("div", "loupe-glass");
  glass.style.setProperty("width", `${LOUPE_DIAMETER}px`);
  glass.style.setProperty("height", `${LOUPE_DIAMETER}px`);
  const sheet = part("div", "loupe-sheet");
  const world = part<HTMLImageElement>("img", "loupe-world");
  const inset = part<HTMLImageElement>("img", "loupe-inset");
  world.alt = "";
  inset.alt = "";
  inset.hidden = true;
  const room = part("div", "loupe-room");
  const grip = part("div", "loupe-grip");
  sheet.append(world, inset);
  glass.append(sheet, room);
  lens.append(glass, grip);
  return { lens, sheet, room, world, inset, grip };
}

function insetAt(img: HTMLElement, rect: SheetRect): void {
  img.style.setProperty("--ix", String(rect.x));
  img.style.setProperty("--iy", String(rect.y));
  img.style.setProperty("--iw", String(rect.w));
  img.style.setProperty("--ih", String(rect.h));
}

function trackCopy(mapDiv: HTMLElement, layer: HTMLElement): { readonly sync: () => void; readonly drop: () => void } {
  let source: Element | null = null;
  let points: string | null = null;
  let copy: Element | null = null;
  const drop = (): void => {
    copy?.remove();
    copy = null;
    source = null;
    points = null;
  };
  const sync = (): void => {
    const node = mapDiv.querySelector(":scope > .voyage-overlay");
    const now = node?.querySelector(".voyage-track")?.getAttribute("points") ?? null;
    if (node === source && now === points) return;
    drop();
    if (!node) return;
    copy = node.cloneNode(true) as Element;
    layer.append(copy);
    source = node;
    points = now;
  };
  return { sync, drop };
}

export function createLoupe(deps: LoupeDeps): Loupe {
  const p = buildLens(deps.touchable);
  deps.host.append(p.lens);
  const worldUrl = svgUrl(deps.urls);
  const insetUrl = svgUrl(deps.urls);
  const track = trackCopy(deps.mapDiv, p.sheet);
  const hide = (): void => {
    p.lens.hidden = true;
    track.drop();
  };
  const show = (at: { readonly x: number; readonly y: number }): void => {
    const s = deps.sheets();
    if (!s) {
      hide();
      return;
    }
    const world = worldUrl(s.world);
    if (p.world.src !== world) p.world.src = world;
    p.inset.hidden = !s.inset;
    if (s.inset) {
      const inset = insetUrl(s.inset.svg);
      if (p.inset.src !== inset) p.inset.src = inset;
      insetAt(p.inset, s.inset.rect);
    }
    const box = deps.host.getBoundingClientRect();
    const v = loupeView({ at, box, zoom: deps.zoom(), diameter: LOUPE_DIAMETER, power: LOUPE_POWER });
    p.lens.style.setProperty("translate", `${v.lens.x}px ${v.lens.y}px`);
    p.sheet.style.setProperty("width", `${v.sheet.w}px`);
    p.sheet.style.setProperty("height", `${v.sheet.h}px`);
    p.sheet.style.setProperty("translate", `${v.sheet.x}px ${v.sheet.y}px`);
    track.sync();
    p.lens.hidden = false;
  };
  return { lens: p.lens, grip: p.grip, show, hide };
}
