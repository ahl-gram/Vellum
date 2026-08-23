import { gsap } from "gsap";
import {
  SHEET,
  type Box,
  type Cam,
  camForCenter,
  centerFraction,
  clampCam,
  closeIn,
  fitScale,
} from "./camera.ts";
import { bearingLine, type Capital } from "./coords.ts";
import { bindStageInput } from "./input.ts";

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const stage = document.getElementById("lf-stage");
const sheetEl = document.getElementById("lf-sheet");
const coordsEl = document.getElementById("lf-coords");
const controlsEl = document.getElementById("lf-controls");

if (stage instanceof HTMLElement && sheetEl instanceof HTMLElement) {
  const capital: Capital = {
    name: stage.dataset.capitalName ?? "",
    nx: Number(stage.dataset.capitalNx),
    ny: Number(stage.dataset.capitalNy),
  };
  const aspect = SHEET.h / SHEET.w;

  const view = (): Box => {
    const r = stage.getBoundingClientRect();
    return { w: r.width, h: r.height };
  };
  let fit = fitScale(view(), SHEET);

  // The one mutable holder: it is gsap's tween target. All camera MATH stays in
  // the pure module; this object only ever receives its results.
  const cam = { x: 0, y: 0, s: 1 };
  const assign = (c: Cam) => {
    cam.x = c.x;
    cam.y = c.y;
    cam.s = c.s;
  };

  const apply = () => {
    sheetEl.style.transform = `translate(${cam.x}px, ${cam.y}px) scale(${cam.s})`;
    sheetEl.style.setProperty("--inv", String(1 / cam.s));
    stage.classList.toggle("close-in", closeIn(cam.s, fit));
    if (coordsEl !== null) {
      const c = centerFraction(cam, view(), SHEET);
      coordsEl.textContent = bearingLine(c.fx, c.fy, capital, aspect);
    }
  };

  const settle = () => {
    assign(clampCam(cam, view(), SHEET, fit));
    apply();
  };

  const flyTo = (target: Cam, duration: number) => {
    gsap.killTweensOf(cam);
    if (REDUCED || duration === 0) {
      assign(clampCam(target, view(), SHEET, fit));
      apply();
      return;
    }
    gsap.to(cam, { x: target.x, y: target.y, s: target.s, duration, ease: "power3.inOut", onUpdate: settle });
  };

  const zoomBy = (factor: number, px?: number, py?: number, duration = 0.6) => {
    const v = view();
    const at = { x: px ?? v.w / 2, y: py ?? v.h / 2 };
    const fx = (at.x - cam.x) / (SHEET.w * cam.s);
    const fy = (at.y - cam.y) / (SHEET.h * cam.s);
    flyTo(camForCenter(fx, fy, cam.s * factor, v, SHEET, at), duration);
  };

  bindStageInput(stage, {
    press: () => {
      gsap.killTweensOf(cam);
      stage.classList.add("dragging");
    },
    release: () => stage.classList.remove("dragging"),
    pan: (dx, dy) => {
      assign({ x: cam.x + dx, y: cam.y + dy, s: cam.s });
      settle();
    },
    wheelZoom: (px, py, deltaY) => zoomBy(Math.exp(-deltaY * 0.0016), px, py, 0),
    pinch: (px, py, ratio) => zoomBy(ratio, px, py, 0),
    dive: (px, py) => zoomBy(1.6, px, py),
    key: (key) => {
      if (key === "+" || key === "=") return (zoomBy(1.5), true);
      if (key === "-") return (zoomBy(1 / 1.5), true);
      if (key === "0") return (flyTo(camForCenter(0.5, 0.5, fit, view(), SHEET), REDUCED ? 0 : 1.2), true);
      return false;
    },
  });

  document.getElementById("lf-in")?.addEventListener("click", () => zoomBy(1.5));
  document.getElementById("lf-out")?.addEventListener("click", () => zoomBy(1 / 1.5));
  document
    .getElementById("lf-home")
    ?.addEventListener("click", () => flyTo(camForCenter(0.5, 0.5, fit, view(), SHEET), REDUCED ? 0 : 1.2));

  new ResizeObserver(() => {
    fit = fitScale(view(), SHEET);
    settle();
  }).observe(stage);

  stage.classList.add("cam");
  controlsEl?.classList.add("on");
  coordsEl?.classList.add("on");
  assign(camForCenter(0.5, 0.5, fit, view(), SHEET));
  settle();
}
