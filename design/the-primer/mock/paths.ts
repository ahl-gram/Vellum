// Issue #1155 round: where the round's code reads from and writes to. It runs from the design tree, so `DIST` is that tree's built site at the sha the report names; everything Alex looks at goes to the main checkout's folder named once here.
import { resolve } from "node:path";

export const OUT_1155 = process.env["OUT_1155"] ?? "/Users/ahl/CodeProjects/Vellum/out/1155";
export const MAIN = resolve(OUT_1155, "..", "..");
export const TREE = resolve(import.meta.dirname, "..", "..", "..");
export const DIST = resolve(TREE, "dist");
export const SHOOT = resolve(TREE, "scripts", "design", "shoot.ts");
export const SHA = "089881ad92382dcdcffb1209b0901c50d5e540e5";
