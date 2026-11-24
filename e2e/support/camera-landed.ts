import type { Payload } from "../types.ts";

export type Framed<T> = { read: T; frames: number; writes: number };

export const framed = <T>(read: Payload<T>, on: string): Payload<Framed<NonNullable<T>>> =>
  `(() => { const e = document.querySelector(${JSON.stringify(on)}); let w = window.__cameraWatch;
  if (!w || w.target !== e || !w.on) { if (w && w.on) w.stop(); w = window.__cameraWatch = { target: e, frames: 0, writes: 0, on: true };
    const obs = new MutationObserver((rs) => { w.writes += rs.length; }); if (e) obs.observe(e, { attributes: true, attributeFilter: ["style"] });
    const tick = () => { if (!w.on) return; w.frames++; requestAnimationFrame(tick); }; requestAnimationFrame(tick);
    w.stop = () => { w.on = false; obs.disconnect(); }; }
  return { read: (${read}) || null, frames: w.frames, writes: w.writes }; })()`;

export const STOP_CAMERA_WATCH: Payload<boolean> = `(() => { if (window.__cameraWatch && window.__cameraWatch.on) window.__cameraWatch.stop(); return true; })()`;

export const landedWith =
  <T>(same: (d: T, last: T) => boolean) =>
  (d: Framed<T>, last: Framed<T>): boolean =>
    d.read !== null &&
    last.read !== null &&
    same(d.read, last.read) &&
    d.writes === last.writes &&
    d.frames > last.frames;
