export type Hold = {
  readonly shown: number;
  readonly pinned: boolean;
  readonly onCard: boolean;
  readonly hovered: number;
  readonly waiting: boolean;
};

export type HoldInput =
  | { readonly kind: "enter"; readonly idx: number; readonly onCard: boolean }
  | { readonly kind: "leave"; readonly idx: number; readonly onCard: boolean }
  | { readonly kind: "move"; readonly onCard: boolean }
  | { readonly kind: "expire"; readonly onCard: boolean }
  | { readonly kind: "press"; readonly idx: number; readonly onCard: boolean; readonly detail: number }
  | { readonly kind: "pressOpen"; readonly onCard: boolean }
  | { readonly kind: "focus"; readonly idx: number; readonly fromPointer: boolean }
  | { readonly kind: "blur"; readonly idx: number; readonly intoCard: boolean }
  | { readonly kind: "focusOut"; readonly staysNear: boolean }
  | { readonly kind: "dismiss" };

export const CLOSED: Hold = { shown: -1, pinned: false, onCard: false, hovered: -1, waiting: false };

// Issue #750, measured 2026-10-04 over 138 straight paths on 3 seeds at 1024 and 1280: the widest stretch between a town's box and its card is 9.1px, 91ms at 0.1 px/ms, so 150 holds a slow hand with room to spare.
export const HOLD_GRACE_MS: number = 150;

const close = (h: Hold): Hold => ({ ...CLOSED, hovered: h.hovered });

function onEnter(h: Hold, idx: number, onCard: boolean): Hold {
  const at = { ...h, hovered: idx, onCard };
  if (idx === h.shown) return { ...at, waiting: false };
  if (h.pinned || (h.shown >= 0 && (onCard || h.waiting))) return at;
  return { ...at, shown: idx, waiting: false };
}

function onLeave(h: Hold, idx: number, onCard: boolean): Hold {
  const at = { ...h, hovered: h.hovered === idx ? -1 : h.hovered, onCard };
  if (h.pinned || h.shown < 0) return at;
  return { ...at, waiting: !onCard };
}

function onMove(h: Hold, onCard: boolean): Hold {
  if (h.shown < 0) return h;
  if (onCard) return { ...h, onCard: true, waiting: false };
  if (!h.onCard) return h;
  return { ...h, onCard: false, waiting: !h.pinned && h.hovered !== h.shown };
}

function onExpire(h: Hold, onCard: boolean): Hold {
  if (!h.waiting) return h;
  const at = { ...h, waiting: false, onCard };
  if (h.pinned || onCard || h.hovered === h.shown) return at;
  return h.hovered >= 0 ? { ...at, shown: h.hovered } : close(h);
}

function onPress(h: Hold, idx: number, onCard: boolean, detail: number): Hold {
  if (h.shown >= 0 && h.shown !== idx && onCard) return h;
  if (h.pinned && h.shown === idx) return detail >= 2 ? h : close(h);
  return { ...h, shown: idx, pinned: true, waiting: false };
}

export function nextHold(h: Hold, i: HoldInput): Hold {
  switch (i.kind) {
    case "enter": return onEnter(h, i.idx, i.onCard);
    case "leave": return onLeave(h, i.idx, i.onCard);
    case "move": return onMove(h, i.onCard);
    case "expire": return onExpire(h, i.onCard);
    case "press": return onPress(h, i.idx, i.onCard, i.detail);
    case "pressOpen": return h.shown < 0 || i.onCard ? h : close(h);
    case "focus": return i.fromPointer || h.shown === i.idx ? h : { ...h, shown: i.idx, pinned: false, waiting: false, onCard: false };
    case "blur": return i.intoCard || h.pinned || i.idx !== h.shown ? h : close(h);
    case "focusOut": return i.staysNear || h.pinned ? h : close(h);
    case "dismiss": return close(h);
  }
}

export type HitBox = { readonly idx: number; readonly left: number; readonly top: number; readonly right: number; readonly bottom: number };

export function nearestMark(p: { readonly x: number; readonly y: number }, boxes: ReadonlyArray<HitBox>): number {
  let best = -1, bestD = Infinity;
  for (const b of boxes) {
    if (p.x < b.left || p.x > b.right || p.y < b.top || p.y > b.bottom) continue;
    const d = Math.hypot(p.x - (b.left + b.right) / 2, p.y - (b.top + b.bottom) / 2);
    if (d < bestD) { bestD = d; best = b.idx; }
  }
  return best;
}

export type Point = { readonly x: number; readonly y: number };

// A press focuses the town it lands on synchronously inside its mousedown, so a mark set there and cleared on the next task tells that focus from a keyboard's.
export function pressMark(): { markPress: () => void; takePress: () => boolean } {
  let marked = false;
  return {
    markPress: () => {
      marked = true;
      setTimeout(() => { marked = false; }, 0);
    },
    takePress: () => {
      const was = marked;
      marked = false;
      return was;
    },
  };
}

export const isHit = (node: unknown): node is HTMLElement => (node as Partial<Element> | null)?.classList?.contains("place-hit") === true;

export interface PointerDeps {
  feed(input: HoldInput): void;
  point(e: Event): Point | null;
  resolve(p: Point, idx: number): number;
  inside(p: Point | null): boolean;
  raise(idx: number): void;
}

export function pointerTrack(w: PointerDeps) {
  let owner = -1;
  let downAt: Point | null = null;
  const enter = (p: Point | null, idx: number): void => {
    owner = p ? w.resolve(p, idx) : idx;
    w.raise(owner);
    w.feed({ kind: "enter", idx: owner, onCard: w.inside(p) });
  };
  return {
    enter: (e: Event, idx: number): void => { enter(w.point(e), idx); },
    leave: (e: MouseEvent): void => {
      const to = e.relatedTarget;
      if (isHit(to) && to.dataset["idx"] === String(owner)) return;
      if (!isHit(to)) w.raise(-1);
      w.feed({ kind: "leave", idx: owner, onCard: w.inside(w.point(e)) });
      if (!isHit(to)) owner = -1;
    },
    move: (e: MouseEvent): void => {
      const p = w.point(e);
      if (!p || owner < 0 || !isHit(e.target) || w.resolve(p, owner) === owner) return;
      w.feed({ kind: "leave", idx: owner, onCard: w.inside(p) });
      enter(p, owner);
    },
    down: (e: Event): void => { downAt = w.point(e); },
    press: (e: MouseEvent, idx: number): { idx: number; detail: number; onCard: boolean } => {
      const detail = e.detail || 0;
      const p = detail > 0 ? w.point(e) : null;
      const at = detail > 0 ? downAt ?? p : null;
      downAt = null;
      return { idx: p ? w.resolve(p, idx) : idx, detail, onCard: w.inside(at) };
    },
    reset: (): void => { owner = -1; downAt = null; },
  };
}

export interface HitWiring {
  feed(input: HoldInput): void;
  inCard(node: unknown): boolean;
  markPress(): void;
  takePress(): boolean;
  track: ReturnType<typeof pointerTrack>;
}

export function wireHit(hit: HTMLElement, idx: number, w: HitWiring): void {
  hit.addEventListener("mouseenter", (e) => { w.track.enter(e, idx); });
  hit.addEventListener("mouseleave", (e) => { w.track.leave(e); });
  hit.addEventListener("mousedown", () => { w.markPress(); });
  hit.addEventListener("focus", () => { w.feed({ kind: "focus", idx, fromPointer: w.takePress() }); });
  hit.addEventListener("blur", (e) => { w.feed({ kind: "blur", idx, intoCard: w.inCard(e.relatedTarget) }); });
  hit.addEventListener("click", (e) => { w.feed({ kind: "press", ...w.track.press(e, idx) }); });
}
