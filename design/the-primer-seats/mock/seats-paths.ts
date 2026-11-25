// Issue #1248 round: where the round's code reads and writes. It runs from the design tree at `SHA`, so `SITE` serves that tree's built site through a folder of links (one per entry of `dist/`, plus `round`, a link to the Issue #1155 round's delivery for its step pictures); everything Alex looks at goes to the main checkout's folder named once here.
import { join, resolve } from "node:path";

export const OUT = process.env["OUT_1248"] ?? "/Users/ahl/CodeProjects/Vellum/out/1248";
export const OUT_1155 = "/Users/ahl/CodeProjects/Vellum/out/1155";
export const TREE = resolve(import.meta.dirname, "..", "..", "..");
export const SITE = resolve(TREE, "out", "1248", "site");
export const SHA = "b6a7745953be06285b61dcbd25d672882bca14d7";
export const shotDir = (item: string): string => join(OUT, "shots", item);
export const measureFile = (name: string): string => join(OUT, "measure", name);
export const pictureUrl = (route: string, id: string): string => `/round/shots/pictures/${route.replace(/^\/|\/$/g, "").replace(/\//g, "-") || "home"}--${id}.png`;
