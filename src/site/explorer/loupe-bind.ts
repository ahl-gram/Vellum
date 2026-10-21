// The loupe's hands (Issue #751): its press, its held key, the pointer it follows and, where touch is the main pointer, the finger that drags it by its grip while the chart is in hand.
import type { Loupe } from "./loupe.ts";

export const LOUPE_KEY = "l";

export interface KeyLike {
  readonly key: string;
  readonly repeat: boolean;
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
}

export interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

export interface LoupeBindDeps {
  readonly press: HTMLElement;
  readonly viewport: HTMLElement;
  readonly loupe: Loupe;
  readonly cardRect: () => Box | null;
  readonly standing: () => boolean;
  readonly busy: () => boolean;
  readonly touchable: boolean;
}

export interface LoupeBinding {
  readonly follow: () => void;
}

type Point = { readonly x: number; readonly y: number };
type Hands = { lit: boolean; held: boolean; inside: boolean; client: Point | null; at: Point | null };

const MOUSE = new Set(["mouse", "pen"]);
const STOPPED = ["mousedown", "dblclick", "wheel", "touchend", "touchcancel"] as const;

export const loupeKey = (e: KeyLike): boolean =>
  e.key.toLowerCase() === LOUPE_KEY && !e.altKey && !e.ctrlKey && !e.metaKey;

const centre = (b: Box): Point => ({ x: (b.right - b.left) / 2, y: (b.bottom - b.top) / 2 });
const clampTo = (b: Box, p: Point): Point => ({
  x: Math.min(Math.max(p.x, 0), b.right - b.left),
  y: Math.min(Math.max(p.y, 0), b.bottom - b.top),
});
const within = (b: Box, x: number, y: number): boolean => x >= b.left && x <= b.right && y >= b.top && y <= b.bottom;

function whereAt(touchable: boolean, h: Readonly<Hands>, r: Box): Point | null {
  if (touchable) return h.at;
  if (h.inside && h.client) return { x: h.client.x - r.left, y: h.client.y - r.top };
  return h.held ? centre(r) : null;
}

function placer(deps: LoupeBindDeps, h: Readonly<Hands>): () => void {
  return () => {
    const r = deps.viewport.getBoundingClientRect();
    const at = whereAt(deps.touchable, h, r);
    const card = at && !deps.touchable ? deps.cardRect() : null;
    if (!(h.lit || h.held) || !at || !deps.standing() || (card && within(card, r.left + at.x, r.top + at.y))) {
      deps.loupe.hide();
      return;
    }
    deps.loupe.show(at);
  };
}

function pointerHands(viewport: HTMLElement, moved: (client: Point | null, inside: boolean) => void): void {
  const over = (e: PointerEvent): void => {
    if (MOUSE.has(e.pointerType)) moved({ x: e.clientX, y: e.clientY }, true);
  };
  viewport.addEventListener("pointerenter", over);
  viewport.addEventListener("pointermove", over);
  viewport.addEventListener("pointerleave", (e: PointerEvent) => {
    if (MOUSE.has(e.pointerType)) moved(null, false);
  });
}

function keyHands(viewport: HTMLElement, hold: (held: boolean) => void): void {
  viewport.addEventListener("keydown", (e: KeyboardEvent) => {
    if (!loupeKey(e)) return;
    e.preventDefault();
    if (!e.repeat) hold(true);
  });
  viewport.addEventListener("keyup", (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === LOUPE_KEY) hold(false);
  });
  viewport.addEventListener("focusout", (e: FocusEvent) => {
    if (!viewport.contains(e.relatedTarget as Node | null)) hold(false);
  });
}

function dragHands(grip: HTMLElement, atNow: () => Point | null, moved: (at: Point) => void): void {
  let from: { readonly x: number; readonly y: number; readonly at: Point } | null = null;
  for (const type of STOPPED) grip.addEventListener(type, (e) => e.stopPropagation());
  const grab = (e: TouchEvent): void => {
    e.stopPropagation();
    e.preventDefault();
    const t = e.touches[0];
    const at = atNow();
    from = t && at ? { x: t.clientX, y: t.clientY, at } : null;
  };
  const drag = (e: TouchEvent): void => {
    e.stopPropagation();
    e.preventDefault();
    const t = e.touches[0];
    if (t && from) moved({ x: from.at.x + t.clientX - from.x, y: from.at.y + t.clientY - from.y });
  };
  grip.addEventListener("touchstart", grab, { passive: false });
  grip.addEventListener("touchmove", drag, { passive: false });
}

export function bindLoupe(deps: LoupeBindDeps): LoupeBinding {
  const h: Hands = { lit: false, held: false, inside: false, client: null, at: null };
  const place = placer(deps, h);
  const follow = (): void => {
    if (h.lit || h.held) place();
  };
  deps.press.setAttribute("aria-pressed", "false");
  deps.press.addEventListener("click", () => {
    if (deps.busy()) return;
    h.lit = !h.lit;
    deps.press.setAttribute("aria-pressed", String(h.lit));
    if (h.lit && deps.touchable) h.at = centre(deps.viewport.getBoundingClientRect());
    place();
  });
  pointerHands(deps.viewport, (client, inside) => {
    h.client = client ?? h.client;
    h.inside = inside;
    follow();
  });
  keyHands(deps.viewport, (held) => {
    h.held = held;
    place();
  });
  if (deps.touchable)
    dragHands(
      deps.loupe.grip,
      () => h.at,
      (at) => {
        h.at = clampTo(deps.viewport.getBoundingClientRect(), at);
        place();
      },
    );
  return { follow };
}
