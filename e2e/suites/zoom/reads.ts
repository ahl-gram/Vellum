export type Cam = { k: number; x: number; y: number };
export type Ring = { hover: false; t?: undefined; o?: undefined } | { hover: true; t: string; o: string };
export const ringScale = (r: Ring) => parseFloat(((r.t || "").match(/matrix\(([-\d.]+)/) || [])[1] ?? "NaN");
export const ringAtRest = (r: Ring) => r.hover && parseFloat(r.o) === 1 && Math.abs(ringScale(r) - 1) <= 0.02;
