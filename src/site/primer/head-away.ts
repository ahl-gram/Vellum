import type { Measured } from "../shared/slide-away-bind.ts";

export const awayAt = (_navFoot: number): Measured => ({ fill: Infinity, from: Infinity, up: 0, down: 0 });

export const bandAway = (bandRem: number, _up: number, _remPx: number): number => bandRem;
