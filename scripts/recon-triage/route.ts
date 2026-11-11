import type { ClaimRow } from "./claims.ts";

export type Route = "command" | "no code" | "stylesheet" | "asked";
export const STYLESHEET = /\.css$/;

export const routeOf = (_row: ClaimRow, _missingPaths: readonly string[]): Route => "asked";
