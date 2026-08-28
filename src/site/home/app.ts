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
  zoomTarget,
} from "./camera.ts";
import { firstArrival, landfallView, markArrival, wideView } from "./ceremony.ts";
import { bearingLine, type Capital } from "./coords.ts";
import { bindStations } from "./cards.ts";
import { DRIFT_SECONDS, IDLE_DELAY_MS, driftTarget } from "./drift.ts";
import { bindStageInput } from "./input.ts";
import { STATION_FLIGHT_SECONDS, stationFlightView } from "./station-flight.ts";
import { createValve } from "./valve.ts";
import { playCeremony } from "./veil.ts";

const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const reduced = () => reducedQuery.matches;

const stage = document.getElementById("lf-stage");
const sheetEl = document.getElementById("lf-sheet");
const coordsEl = document.getElementById("lf-coords");
const controlsEl = document.getElementById("lf-controls");

if (stage instanceof HTMLElement && sheetEl instanceof HTMLElement) {
  const nx = Number(stage.dataset.capitalNx);
  const ny = Number(stage.dataset.capitalNy);
  const capital: Capital | null =
    Number.isFinite(nx) && Number.isFinite(ny) && stage.dataset.capitalName !== undefined
      ? { name: stage.dataset.capitalName, nx, ny }
      : null;
  const aspect = SHEET.h / SHEET.w;

  const view = (): Box => {
    const r = stage.getBoundingClientRect();
    return { w: r.width, h: r.height };
  };
  let fit = fitScale(view(), SHEET);

  // gsap's tween target; the pure module owns all camera math, this only receives results.
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
    if (coordsEl !== null && capital !== null) {
      const c = centerFraction(cam, view(), SHEET);
      coordsEl.textContent = bearingLine(c.fx, c.fy, capital, aspect);
    }
  };

  const settle = () => {
    assign(clampCam(cam, view(), SHEET, fit));
    apply();
  };

  // The idle drift (#458): the mockup's armDrift/stopDrift pair.
  let driftTween: gsap.core.Tween | null = null;
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  const armDrift = () => {
    if (reduced()) return;
    idleTimer = setTimeout(() => {
      const t = driftTarget(cam, fit);
      driftTween = gsap.to(cam, {
        x: t.x,
        y: t.y,
        s: t.s,
        duration: DRIFT_SECONDS,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        onUpdate: settle,
      });
    }, IDLE_DELAY_MS);
  };
  const stopDrift = () => {
    driftTween?.kill();
    driftTween = null;
    clearTimeout(idleTimer);
    armDrift();
  };

  const flyTo = (target: Cam, duration: number) => {
    stopDrift();
    gsap.killTweensOf(cam);
    if (reduced() || duration === 0) {
      assign(clampCam(target, view(), SHEET, fit));
      apply();
      return;
    }
    gsap.to(cam, { x: target.x, y: target.y, s: target.s, duration, ease: "power3.inOut", onUpdate: settle });
  };

  const zoomBy = (factor: number, px?: number, py?: number, duration = 0.6): boolean => {
    stopDrift();
    const v = view();
    const at = { x: px ?? v.w / 2, y: py ?? v.h / 2 };
    const target = zoomTarget(cam, factor, at, v, SHEET, fit);
    const consumed = Math.abs(target.s - cam.s) > 1e-12;
    if (consumed) flyTo(target, duration);
    return consumed;
  };

  let gestureScale = 1;
  const valve = createValve();
  bindStageInput(stage, {
    press: () => {
      gestureScale = cam.s;
      stopDrift();
      gsap.killTweensOf(cam);
      stage.classList.add("dragging");
    },
    release: () => stage.classList.remove("dragging"),
    pan: (dx, dy) => {
      assign({ x: cam.x + dx, y: cam.y + dy, s: cam.s });
      settle();
    },
    wheelZoom: (px, py, deltaY) =>
      valve(performance.now(), deltaY, window.scrollY, () => zoomBy(Math.exp(-deltaY * 0.0016), px, py, 0)),
    pinch: (px, py, ratio) => zoomBy((gestureScale * ratio) / cam.s, px, py, 0),
    dive: (px, py) => zoomBy(1.6, px, py),
    key: (key) => {
      if (key === "+" || key === "=") return (zoomBy(1.5), true);
      if (key === "-") return (zoomBy(1 / 1.5), true);
      if (key === "0") return (flyTo(camForCenter(0.5, 0.5, fit, view(), SHEET), reduced() ? 0 : 1.2), true);
      return false;
    },
  });

  document.getElementById("lf-in")?.addEventListener("click", () => zoomBy(1.5));
  document.getElementById("lf-out")?.addEventListener("click", () => zoomBy(1 / 1.5));
  document
    .getElementById("lf-home")
    ?.addEventListener("click", () => flyTo(camForCenter(0.5, 0.5, fit, view(), SHEET), reduced() ? 0 : 1.2));

  bindStations({
    doc: document,
    reduced,
    fly: (visit) =>
      flyTo(stationFlightView(cam, fit, visit, view(), SHEET, window.innerWidth), reduced() ? 0 : STATION_FLIGHT_SECONDS),
  });

  new ResizeObserver(() => {
    fit = fitScale(view(), SHEET);
    settle();
  }).observe(stage);

  stage.classList.add("cam");
  controlsEl?.classList.add("on");
  coordsEl?.classList.add("on");

  const storage = () => window.sessionStorage;
  const chart = sheetEl.querySelector("img.lf-chart");
  const arriving = !reduced() && firstArrival(storage);
  markArrival(storage);
  if (arriving) {
    assign(wideView(view(), SHEET, fit));
    settle();
    playCeremony({
      doc: document,
      chart: chart instanceof HTMLImageElement ? chart : null,
      land: (seconds) => flyTo(landfallView(view(), SHEET, fit, window.innerWidth), seconds),
    });
  } else {
    document.getElementById("lf-veil")?.remove();
    assign(landfallView(view(), SHEET, fit, window.innerWidth));
    settle();
  }
  armDrift();
}
