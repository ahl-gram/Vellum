import { readCam, buttonPoint, makeStage } from "../../support/home.ts";
import type { Point, SuiteContext } from "../../types.ts";
import type { Headroom } from "./reads.ts";

export type StageKit = ReturnType<typeof stageKit>;
export type GestureKit = ReturnType<typeof gestureKit>;
export type LandfallKit = ReturnType<typeof entersKit>;

export function stageKit(ctx: SuiteContext) {
  const { evaluate, sleep, wheel } = ctx;
  const { pressKey, clickAt, settleHome } = makeStage(ctx);
  // e.defaultPrevented read at the window AFTER the stage's own listener ran, so the log records exactly what input.ts decided; passive, so the probe cannot itself consume.
  const armWheelLog = () =>
    evaluate<boolean>(
      `(window.__lfWheel = [], window.addEventListener("wheel", (e) => window.__lfWheel.push(e.defaultPrevented), { passive: true }), true)`,
    );
  const lastWheel = () => evaluate<boolean | null>(`window.__lfWheel[window.__lfWheel.length - 1] ?? null`);
  const camNow = () => evaluate(readCam);
  const camScale = async () => {
    const c = await camNow();
    return c === null ? null : c.scale;
  };
  const scrollY = () => evaluate<number>(`window.scrollY`);
  // Every element probe returns null instead of throwing, and every dispatch is gated on it: an unguarded deref here turns a product regression into a HARNESS ERROR that prints zero checks (skeptic round 1, proven against an empty site dir), which the lane driver reserves for the browser never coming up.
  const centerOf = (selector: string) =>
    evaluate<Point | null>(`(() => {
    const el = document.querySelector('${selector}');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
  })()`);
  const wheelAt = async (p: Point | null, dy: number) => {
    if (p !== null) await wheel(p.x, p.y, dy);
  };
  const scrollToTop = async () => {
    for (let i = 0; i < 30; i++) {
      await evaluate(`window.scrollTo(0, 0)`);
      await sleep(120);
      if ((await scrollY()) === 0) break;
    }
  };
  // 450ms outwaits GESTURE_BREAK_MS (300, src/site/home/valve.ts) so the next wheel opens a FRESH gesture.
  const freshGesture = async () => {
    await scrollToTop();
    await sleep(450);
  };
  const readHint = () =>
    evaluate<{ op: string; stood: boolean } | null>(`(() => {
    const m = document.querySelector(".lf-more");
    const s = document.getElementById("lf-stage");
    if (!m || !s) return null;
    return { op: getComputedStyle(m).opacity, stood: s.classList.contains("stood-off") };
  })()`);
  const scrollToFloor = async () => {
    for (let i = 0; i < 20; i++) {
      await evaluate(`window.scrollTo(0, document.body.scrollHeight)`);
      await sleep(100);
      if ((await scrollY()) > 0) break;
    }
  };
  return {
    ...ctx,
    pressKey,
    clickAt,
    settleHome,
    armWheelLog,
    lastWheel,
    camNow,
    camScale,
    scrollY,
    centerOf,
    wheelAt,
    scrollToTop,
    freshGesture,
    readHint,
    scrollToFloor,
  };
}

export function gestureKit(k0: StageKit) {
  const { evaluate, send, sleep, touch, pressKey } = k0;
  // text: " " is what makes CDP's keyDown char-producing; without it the browser never runs Space's native scroll default. The navigation keys carry only their codes.
  const pressNav = async (key: string, code: string, vk: number, text?: string) => {
    await send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key,
      code,
      windowsVirtualKeyCode: vk,
      ...(text === undefined ? {} : { text }),
    });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: vk });
  };
  const headroom = () =>
    evaluate<Headroom | null>(`(() => {
    const stage = document.getElementById("lf-stage");
    const sheet = document.getElementById("lf-sheet");
    if (!stage || !sheet) return null;
    const r = stage.getBoundingClientRect();
    const m = new DOMMatrixReadOnly(getComputedStyle(sheet).transform);
    return { cx: m.e + (1500 * m.a) / 2, cy: m.f + (1157.931 * m.a) / 2, w: r.width, h: r.height };
  })()`);
  const twoFingerDrag = async (p: Point, sx = 1, sy = 1) => {
    await touch("touchStart", [
      { x: p.x - 40, y: p.y, id: 0 },
      { x: p.x + 40, y: p.y, id: 1 },
    ]);
    await touch("touchMove", [
      { x: p.x - 40 + sx * 40, y: p.y + sy * 30, id: 0 },
      { x: p.x + 40 + sx * 40, y: p.y + sy * 30, id: 1 },
    ]);
    await touch("touchEnd", []);
    await sleep(300);
  };
  const recenter = async () => {
    await evaluate(`document.getElementById("lf-stage")?.focus()`);
    await pressKey("0", "Digit0", 48);
    await sleep(1600);
  };
  const seedShown = async () => {
    for (let i = 0; i < 200; i++) {
      let s = null;
      try {
        s = await evaluate<string | null>(`(() => {
          const svg = document.querySelector("#map svg");
          const status = document.getElementById("status");
          const seed = document.getElementById("seed");
          if (!svg || !status || status.textContent !== "" || !seed || seed.value === "") return null;
          return seed.value;
        })()`);
      } catch {}
      if (s !== null) return s;
      await sleep(75);
    }
    return null;
  };
  return { ...k0, pressNav, headroom, twoFingerDrag, recenter, seedShown };
}

export function entersKit(k1: GestureKit) {
  const { evaluate, sleep, pressKey, clickAt, scrollY, centerOf, camScale, wheelAt } = k1;
  const measureEnters = async () => {
    const boxes = [];
    let swallowed = null;
    for (const id of ["atlas", "explorer", "reading-room", "gallery"]) {
      let open = false;
      const chipPt = await evaluate(buttonPoint(`.lf-legend-btn[data-station="${id}"]`));
      if (chipPt !== null) await clickAt(Math.round(chipPt.x), Math.round(chipPt.y));
      for (let i = 0; i < 80; i++) {
        try {
          open = await evaluate<boolean>(
            `(() => { const c = document.getElementById("lf-card-${id}"); if (!c || c.hidden) return false; const cs = getComputedStyle(c); return cs.visibility !== "hidden" && Number(cs.opacity) > 0.95; })()`,
          );
        } catch {}
        if (open === true) break;
        await sleep(75);
      }
      await sleep(400);
      const box = await evaluate<{ id: string; open: boolean; w: number; h: number } | null>(
        `(() => { const a = document.querySelector("#lf-card-${id} .lf-card-enter"); if (!a) return null; const r = a.getBoundingClientRect(); return { id: "${id}", open: ${open}, w: r.width, h: r.height }; })()`,
      );
      boxes.push(box);
      if (id === "atlas") {
        const cardPt = await centerOf("#lf-card-atlas .lf-card-prose");
        const yA = await scrollY();
        const sA = await camScale();
        await wheelAt(cardPt, 120);
        await sleep(200);
        swallowed = { yA, sA, y: await scrollY(), scale: await camScale() };
      }
      await pressKey("Escape", "Escape", 27);
      await sleep(400);
    }
    return { boxes, swallowed };
  };
  return { ...k1, measureEnters };
}
