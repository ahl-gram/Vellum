export type StageInputHandlers = {
  readonly pan: (dx: number, dy: number) => void;
  readonly press: () => void;
  readonly release: () => void;
  /** Returns whether the zoom moved; an unconsumed wheel is left to the page scroll. */
  readonly wheelZoom: (px: number, py: number, deltaY: number) => boolean;
  /** ratio is the spread against the GESTURE START (press), not the previous event, so a clamped half-step can never ratchet the scale. */
  readonly pinch: (px: number, py: number, ratio: number) => void;
  readonly dive: (px: number, py: number) => void;
  readonly key: (key: string) => boolean;
};

type Point = { x: number; y: number };
type Local = (e: { clientX: number; clientY: number }) => Point;

// Capturing the pointer retargets the CLICK to the stage, so a MOUSE gesture must never begin on a control or the buttons go dead (synthetic .click() bypasses capture, which is why probes missed it); touch pointers are never captured, so their gestures may begin on controls and a tap still delivers its click (#475 ruling 2).
const onControl = (e: Event) =>
  e.target instanceof Element && e.target.closest("button, a, input, select") !== null;

function stageLocal(stage: HTMLElement) {
  const local = (e: { clientX: number; clientY: number }) => {
    const r = stage.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  return { local };
}

function stagePinch(pointers: ReadonlyMap<number, Point>, on: StageInputHandlers, local: Local) {
  let pinchStart = 0;
  let mid: Point | null = null;

  const anchor = () => {
    const [a, b] = [...pointers.values()] as [Point, Point];
    pinchStart = Math.hypot(a.x - b.x, a.y - b.y);
    mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  };

  // The gesture applies once per frame from a COMPLETE pair: per-event processing reads one moved finger against one stale one, and that half-pair state dipped the clamped scale to 4.375 mid-gesture (guard-prover round 2, arm L9d).
  let frame = 0;
  const step = () => {
    frame = 0;
    if (pointers.size !== 2 || mid === null) return;
    const [a, b] = [...pointers.values()] as [Point, Point];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    on.pan(m.x - mid.x, m.y - mid.y);
    const p = local({ clientX: m.x, clientY: m.y });
    if (pinchStart > 0 && d > 0) on.pinch(p.x, p.y, d / pinchStart);
    mid = m;
  };
  const setPinchStart = (next: number): void => { pinchStart = next; };
  const setMid = (next: Point | null): void => { mid = next; };
  const setFrame = (next: number): void => { frame = next; };
  return { anchor, step, frame: (): number => frame, setFrame, setPinchStart, setMid };
}

function listenStage(stage: HTMLElement, on: StageInputHandlers, local: Local, onControl: (e: Event) => boolean): void {
  stage.addEventListener(
    "wheel",
    (e) => {
      const p = local(e);
      if (on.wheelZoom(p.x, p.y, e.deltaY)) e.preventDefault();
    },
    { passive: false },
  );

  stage.addEventListener("dblclick", (e) => {
    if (onControl(e)) return;
    const p = local(e);
    on.dive(p.x, p.y);
  });

  stage.addEventListener("keydown", (e) => {
    if (on.key(e.key)) e.preventDefault();
  });
}

// Touch policy (#455): one finger scrolls the page (touch-action: pan-y), two fingers drive the map, any mouse button pans.
export function bindStageInput(stage: HTMLElement, on: StageInputHandlers): void {
  const pointers = new Map<number, Point>();
  let last: Point | null = null;
  const { local } = stageLocal(stage);
  const { anchor, step, frame, setFrame, setPinchStart, setMid } = stagePinch(pointers, on, local);

  stage.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && onControl(e)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (e.pointerType === "mouse") {
      stage.setPointerCapture(e.pointerId);
      last = { x: e.clientX, y: e.clientY };
      on.press();
    } else if (pointers.size === 2) {
      anchor();
      on.press();
    }
  });

  stage.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      if (frame() === 0) setFrame(requestAnimationFrame(step));
    } else if (last !== null && e.pointerType === "mouse") {
      on.pan(e.clientX - last.x, e.clientY - last.y);
      last = { x: e.clientX, y: e.clientY };
    }
  });

  const end = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size === 2) {
      anchor();
      on.press();
    } else if (pointers.size < 2) {
      setPinchStart(0);
      setMid(null);
    }
    if (pointers.size === 0) {
      last = null;
      on.release();
    }
  };
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", end);

  listenStage(stage, on, local, onControl);
}
