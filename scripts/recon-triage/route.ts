import type { ClaimRow } from "./claims.ts";

export type Route = "command" | "no code" | "stylesheet" | "asked";
export const STYLESHEET = /\.css$/;

export const routeOf = (row: ClaimRow, missingPaths: readonly string[]): Route => {
  if (row.kind !== "behavior") return "command";
  if (row.paths.length === 0 || missingPaths.length > 0) return "no code";
  return row.paths.every((path) => STYLESHEET.test(path)) ? "stylesheet" : "asked";
};
