import type { Cam } from "../../support/home.ts";
import type { Payload } from "../../types.ts";

export type Seat = { pos: string; z: string; right: number; bottom: number; pe: string; anim: string; top: number; vw: number };

// Gold compared NUMERICALLY: Chromium serializes var() colors as rgb()/color(srgb ...), so the channels, not the spelling, are under test (#324).
export const controlGold = (bg: string | null) => {
  if (!bg) return false;
  let m = bg.match(/^rgb\((\d+), (\d+), (\d+)\)$/);
  if (m) return +m[1]! === 240 && +m[2]! === 227 && +m[3]! === 189;
  m = bg.match(/^color\(srgb ([0-9.]+) ([0-9.]+) ([0-9.]+)\)$/);
  return !!m && Math.round(+m[1]! * 255) === 240 && Math.round(+m[2]! * 255) === 227 && Math.round(+m[3]! * 255) === 189;
};
export const anchored = (s: Cam | null) => s !== null && s.veil && Math.abs(s.scale - s.fit * 0.78) < 1e-3;
export const seatOk = (s: Seat | null) => !!s && s.pos === "absolute" && s.z === "auto" && s.anim === "none" && s.pe === "auto" && Math.abs(s.right - 25.6) < 0.6 && Math.abs(s.bottom - 22.4) < 0.6;
export const doorShown: Payload<boolean> = `(() => { const c = document.getElementById("lf-card-explorer"); return c !== null && c.offsetParent !== null && getComputedStyle(c).visibility === "visible"; })()`;
