export type StageInputHandlers = {
  readonly pan: (dx: number, dy: number) => void;
  readonly press: () => void;
  readonly release: () => void;
  readonly wheelZoom: (px: number, py: number, deltaY: number) => void;
  readonly pinch: (px: number, py: number, ratio: number) => void;
  readonly dive: (px: number, py: number) => void;
  readonly key: (key: string) => boolean;
};

// Touch policy for the interim page (#455): one finger scrolls the document
// (touch-action: pan-y leaves it to the browser), two fingers drive the map,
// any mouse button pans. Wheel always zooms at the cursor, the map convention.
export function bindStageInput(stage: HTMLElement, on: StageInputHandlers): void {
  const pointers = new Map<number, { x: number; y: number }>();
  let last: { x: number; y: number } | null = null;
  let pinchDist = 0;

  const local = (e: { clientX: number; clientY: number }) => {
    const r = stage.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  stage.addEventListener("pointerdown", (e) => {
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
      e.preventDefault();
      const p = local(e);
      on.wheelZoom(p.x, p.y, e.deltaY);
    },
    { passive: false },
  );

  stage.addEventListener("dblclick", (e) => {
    const p = local(e);
    on.dive(p.x, p.y);
  });

  stage.addEventListener("keydown", (e) => {
    if (on.key(e.key)) e.preventDefault();
  });
}
