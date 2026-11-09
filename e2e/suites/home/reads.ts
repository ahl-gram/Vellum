import type { Cam } from "../../support/home.ts";
import type { Payload } from "../../types.ts";

export const anchored = (s: Cam | null) => s !== null && s.veil && Math.abs(s.scale - s.fit * 0.78) < 1e-3;
export const doorShown: Payload<boolean> = `(() => { const c = document.getElementById("lf-card-explorer"); return c !== null && c.offsetParent !== null && getComputedStyle(c).visibility === "visible"; })()`;
