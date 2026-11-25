// Issue #1256 round: where the round's code reads and writes. It runs from the design tree, so its relative imports read that tree's `src/` at `SHA`, and `SITE` is a folder of links to that tree's built `dist/` plus `round`, a link to the main checkout's delivery; everything Alex looks at goes to `OUT`, named once here.
import { resolve } from "node:path";

export const OUT = process.env["OUT_1256"] ?? "/Users/ahl/CodeProjects/Vellum/out/1256";
export const MAIN = resolve(OUT, "..", "..");
export const TREE = resolve(import.meta.dirname, "..", "..", "..");
export const SITE = resolve(TREE, "out", "1256", "site");
export const SHOOT = resolve(TREE, "scripts", "design", "shoot.ts");
export const SHA = "94ad43927a1318549c9a40a1c9e143fd1eecd20d";
