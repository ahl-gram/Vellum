// The desktop drag (Issue #523 Sub 5 of Issue #401): a mouse carries the committed survey from the dog-ear to the Chart Table's band. The click stays the door; this is the flourish, and touch never drags (Issue #401 ruling 6).
export const DRAG_SLOP_PX = 6;
export const GRIP_INSET_PX = 10;

export interface Point { readonly x: number; readonly y: number }
export interface Band { readonly top: number }

export function grabbable(p: { readonly pointerType: string; readonly button: number; readonly isPrimary: boolean }): boolean {
  return p.pointerType === "mouse" && p.button === 0 && p.isPrimary;
}

export function beganDrag(from: Point, to: Point): boolean {
  return Math.hypot(to.x - from.x, to.y - from.y) >= DRAG_SLOP_PX;
}

export function dropOutcome(at: Point, band: Band | null): "file" | "snap" {
  return band !== null && at.y >= band.top ? "file" : "snap";
}

export function ghostSeat(at: Point, width: number): Point {
  return { x: at.x + GRIP_INSET_PX - width, y: at.y - GRIP_INSET_PX };
}

export function bandOf(drawerHeight: number, viewportHeight: number): Band | null {
  if (!Number.isFinite(drawerHeight) || drawerHeight <= 0 || drawerHeight > viewportHeight) return null;
  return { top: viewportHeight - drawerHeight };
}


/** A CSS length token in px: rem scaled by the root font size, px as is, anything else NaN. */
export function lengthPx(token: string, remPx: number): number {
  const t = token.trim();
  if (/^-?\d*\.?\d+rem$/.test(t)) return parseFloat(t) * remPx;
  if (/^-?\d*\.?\d+px$/.test(t)) return parseFloat(t);
  return NaN;
}

export interface TableDragDeps {
  readonly handle: HTMLButtonElement;
  /** False where no drawer can show (the 900px stand-down), and then a press is only ever the click. */
  readonly canDrag: () => boolean;
  readonly ghostUrl: () => string;
  readonly band: () => Band | null;
  readonly reveal: () => () => void;
  readonly receiving: (over: boolean) => void;
  readonly file: (url: string) => boolean;
  readonly prefersReduce: () => boolean;
  readonly settleMs: () => number;
  readonly settleEase: () => string;
}

interface Carry { readonly start: Point; ghost: HTMLImageElement | null; url: string | null; restore: (() => void) | null }

function makeGhost(url: string): HTMLImageElement {
  const ghost = document.createElement("img");
  ghost.className = "sheet-ghost";
  ghost.alt = "";
  ghost.draggable = false;
  ghost.src = url;
  return ghost;
}

function seat(ghost: HTMLImageElement, at: Point): void {
  const s = ghostSeat(at, ghost.offsetWidth);
  ghost.style.translate = `${s.x}px ${s.y}px`;
}

function snapBack(deps: TableDragDeps, g: HTMLImageElement, u: string): void {
  const done = (): void => { g.remove(); URL.revokeObjectURL(u); };
  const ms = deps.prefersReduce() ? 0 : deps.settleMs();
  if (ms === 0) { done(); return; }
  // A detached ear (a wheel mid-carry recommitted the inset) has an all-zero rect, and a flight there is the bug; the ghost then fades where it is.
  const rect = deps.handle.isConnected ? deps.handle.getBoundingClientRect() : null;
  const to = rect ? ghostSeat({ x: rect.right, y: rect.top }, g.offsetWidth) : null;
  const frames = to
    ? [{ translate: g.style.translate, scale: "1", opacity: 1 }, { translate: `${to.x}px ${to.y}px`, scale: "0.3", opacity: 0 }]
    : [{ opacity: 1 }, { opacity: 0 }];
  g.animate(frames, { duration: ms, easing: deps.settleEase(), fill: "forwards" }).finished.then(done, done);
}

function moveCarry(deps: TableDragDeps, c: Carry, at: Point): void {
  if (!c.ghost) {
    if (!beganDrag(c.start, at)) return;
    c.url = deps.ghostUrl();
    c.ghost = makeGhost(c.url);
    document.body.append(c.ghost);
    document.body.classList.add("sheet-drag");
  }
  seat(c.ghost, at);
  const over = dropOutcome(at, deps.band()) === "file";
  if (over && !c.restore) c.restore = deps.reveal();
  deps.receiving(over);
}

export function bindTableDrag(deps: TableDragDeps): void {
  let carry: Carry | null = null;
  let dragged = false;
  const bound: Array<readonly [EventTarget, string, EventListener]> = [];
  const listen = (target: EventTarget, type: string, fn: EventListener): void => { target.addEventListener(type, fn); bound.push([target, type, fn]); };
  const unlisten = (): void => {
    for (const [target, type, fn] of bound.splice(0)) target.removeEventListener(type, fn);
    document.body.classList.remove("sheet-drag");
    deps.receiving(false);
  };
  const finish = (at: Point | null): void => {
    const c = carry;
    carry = null;
    unlisten();
    if (!c?.ghost || !c.url) return;
    // The click this release fires, if any, arrives before the task ends; a keyboard activation later is an honest click and is never swallowed.
    dragged = true;
    setTimeout(() => { dragged = false; }, 0);
    const filed = at !== null && dropOutcome(at, deps.band()) === "file";
    if (filed && deps.file(c.url)) { c.ghost.remove(); return; }
    snapBack(deps, c.ghost, c.url);
    if (!filed) c.restore?.();
  };
  const onMove = (e: PointerEvent): void => { if (carry) moveCarry(deps, carry, { x: e.clientX, y: e.clientY }); };
  deps.handle.addEventListener("pointerdown", (e) => {
    if (carry || !grabbable(e) || !deps.canDrag()) return;
    carry = { start: { x: e.clientX, y: e.clientY }, ghost: null, url: null, restore: null };
    listen(document, "pointermove", onMove as EventListener);
    listen(document, "pointerup", ((up: PointerEvent) => { finish({ x: up.clientX, y: up.clientY }); }) as EventListener);
    listen(document, "pointercancel", () => { finish(null); });
    listen(document, "keydown", ((k: KeyboardEvent) => { if (k.key === "Escape") finish(null); }) as EventListener);
    listen(window, "blur", () => { finish(null); });
  });
  deps.handle.addEventListener("click", (e) => {
    if (!dragged) return;
    dragged = false;
    e.stopImmediatePropagation();
    e.preventDefault();
  }, { capture: true });
}
