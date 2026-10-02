import type { Shot } from "./shoot.ts";

export type Mode = "full" | "head" | "view";
export const BAND = 0;
export const PIN = "true";
export const pinText = (t: string): string => t;
export const routesOf = (_dist: string): string[] => [];
export const modeOf = (_route: string): Mode => "full";
export type PlannedShot = Shot & { readonly route: string; readonly mode: Mode; readonly name: string };
export const planSweep = (_routes: readonly string[], _out: string): PlannedShot[] => [];
export type SweepArgs = { readonly dist: string; readonly out: string; readonly label: string | undefined; readonly reducedMotion: boolean };
export const parseSweepArgs = (args: readonly string[]): SweepArgs => ({ dist: args[0] ?? "", out: args[1] ?? "", label: args[2], reducedMotion: false });
