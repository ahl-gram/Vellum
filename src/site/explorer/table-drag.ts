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

export interface TableDragDeps {
  readonly handle: HTMLButtonElement;
  /** False where no drawer can show (the 900px stand-down), and then a press is only ever the click. */
  readonly canDrag: () => boolean;
  /** One url per carry; the drawer adopts it on a filing and this module revokes it on every other path. */
  readonly ghostUrl: () => string;
  readonly band: () => Band | null;
  readonly reveal: () => () => void;
  readonly receiving: (over: boolean) => void;
  readonly file: (url: string) => boolean;
  readonly prefersReduce: () => boolean;
  readonly settleMs: () => number;
}

const SNAP_EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

function makeGhost(url: string): HTMLImageElement {
  const ghost = document.createElement("img");
  ghost.className = "sheet-ghost";
  ghost.alt = "";
  ghost.draggable = false;
  ghost.src = url;
  return ghost;
}

// eslint-disable-next-line max-lines-per-function
export function bindTableDrag(deps: TableDragDeps): void {
  let start: Point | null = null;
  let ghost: HTMLImageElement | null = null;
  let url: string | null = null;
  let restore: (() => void) | null = null;
  let dragged = false;

  const seat = (at: Point): void => {
    if (!ghost) return;
    const s = ghostSeat(at, ghost.offsetWidth);
    ghost.style.translate = `${s.x}px ${s.y}px`;
  };

  const snapBack = (g: HTMLImageElement, u: string): void => {
    const done = (): void => { g.remove(); URL.revokeObjectURL(u); };
    const ms = deps.prefersReduce() ? 0 : deps.settleMs();
    if (ms === 0) { done(); return; }
    // A detached ear (a wheel mid-carry recommitted the inset) has an all-zero rect, and a flight there is the bug; the ghost then fades where it is.
    const rect = deps.handle.isConnected ? deps.handle.getBoundingClientRect() : null;
    const to = rect ? ghostSeat({ x: rect.right, y: rect.top }, g.offsetWidth) : null;
    const frames = to
      ? [{ translate: g.style.translate, scale: "1", opacity: 1 }, { translate: `${to.x}px ${to.y}px`, scale: "0.3", opacity: 0 }]
      : [{ opacity: 1 }, { opacity: 0 }];
    g.animate(frames, { duration: ms, easing: SNAP_EASE, fill: "forwards" }).finished.then(done, done);
  };

  const unlisten = (): void => {
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerup", onUp);
    document.removeEventListener("pointercancel", onCancel);
    document.removeEventListener("keydown", onKey);
    window.removeEventListener("blur", onCancel);
    document.body.classList.remove("sheet-drag");
    deps.receiving(false);
    start = null;
  };

  const finish = (at: Point | null): void => {
    const g = ghost; const u = url; const back = restore;
    ghost = null; url = null; restore = null;
    unlisten();
    if (!g || !u) return;
    dragged = true;
    if (at && dropOutcome(at, deps.band()) === "file") {
      if (deps.file(u)) { g.remove(); return; }
      snapBack(g, u);
      return;
    }
    snapBack(g, u);
    back?.();
  };

  const onMove = (e: PointerEvent): void => {
    if (!start) return;
    const at = { x: e.clientX, y: e.clientY };
    if (!ghost) {
      if (!beganDrag(start, at)) return;
      url = deps.ghostUrl();
      ghost = makeGhost(url);
      document.body.append(ghost);
      document.body.classList.add("sheet-drag");
    }
    seat(at);
    const over = dropOutcome(at, deps.band()) === "file";
    if (over && !restore) restore = deps.reveal();
    deps.receiving(over);
  };
  const onUp = (e: PointerEvent): void => { finish({ x: e.clientX, y: e.clientY }); };
  const onCancel = (): void => { finish(null); };
  const onKey = (e: KeyboardEvent): void => { if (e.key === "Escape") finish(null); };

  deps.handle.addEventListener("pointerdown", (e) => {
    dragged = false;
    if (start || !grabbable(e) || !deps.canDrag()) return;
    start = { x: e.clientX, y: e.clientY };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onCancel);
    document.addEventListener("keydown", onKey);
    window.addEventListener("blur", onCancel);
  });
  deps.handle.addEventListener("click", (e) => {
    if (!dragged) return;
    dragged = false;
    e.stopImmediatePropagation();
    e.preventDefault();
  }, { capture: true });
}
