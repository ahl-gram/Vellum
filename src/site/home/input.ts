export type StageInputHandlers = {
  readonly pan: (dx: number, dy: number) => void;
  readonly press: () => void;
  readonly release: () => void;
  /** Returns whether the zoom moved; an unconsumed wheel is left to the page scroll. */
  readonly wheelZoom: (px: number, py: number, deltaY: number) => boolean;
  readonly pinch: (px: number, py: number, ratio: number) => void;
  readonly dive: (px: number, py: number) => void;
  readonly key: (key: string) => boolean;
};

// Touch policy (#455): one finger scrolls the page (touch-action: pan-y), two fingers drive the map, any mouse button pans.
export function bindStageInput(stage: HTMLElement, on: StageInputHandlers): void {
  const pointers = new Map<number, { x: number; y: number }>();
  let last: { x: number; y: number } | null = null;
  let pinchDist = 0;

  const local = (e: { clientX: number; clientY: number }) => {
    const r = stage.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // Capturing the pointer at the stage retargets the CLICK to the stage, so a gesture must never begin on a control or the buttons go dead under a real mouse (synthetic .click() bypasses capture, which is why probes missed it).
  const onControl = (e: Event) =>
    e.target instanceof Element && e.target.closest("button, a, input, select") !== null;
  const onCard = (e: Event) => e.target instanceof Element && e.target.closest(".lf-card") !== null;

  stage.addEventListener("pointerdown", (e) => {
    if (onCard(e)) return;
    if (onControl(e)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (e.pointerType === "mouse") {
      stage.setPointerCapture(e.pointerId);
      last = { x: e.clientX, y: e.clientY };
      on.press();
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      on.press();
    }
  });

  stage.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = local({ clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 });
      if (pinchDist > 0 && d > 0) on.pinch(mid.x, mid.y, d / pinchDist);
      pinchDist = d;
    } else if (last !== null && e.pointerType === "mouse") {
      on.pan(e.clientX - last.x, e.clientY - last.y);
      last = { x: e.clientX, y: e.clientY };
    }
  });

  const end = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchDist = 0;
    if (pointers.size === 0) {
      last = null;
      on.release();
    }
  };
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", end);

  stage.addEventListener(
    "wheel",
    (e) => {
      if (onCard(e)) {
        const scroller = e.target instanceof Element ? e.target.closest(".lf-card-scroll") : null;
        if (scroller !== null && scroller.scrollHeight > scroller.clientHeight) return;
        e.preventDefault();
        return;
      }
      const p = local(e);
      if (on.wheelZoom(p.x, p.y, e.deltaY)) e.preventDefault();
    },
    { passive: false },
  );

  stage.addEventListener("dblclick", (e) => {
    if (onCard(e)) return;
    if (onControl(e)) return;
    const p = local(e);
    on.dive(p.x, p.y);
  });

  stage.addEventListener("keydown", (e) => {
    if (on.key(e.key)) e.preventDefault();
  });
}
