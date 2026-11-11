import { renderMap } from "../src/render/map-renderer.ts";
import { createProjection, marginFor, type Projection } from "../src/render/transform.ts";
import type { World } from "../src/world/types.ts";

export const SHEET_WIDTH = 1500;

export const sheetOf = (world: World): string =>
  renderMap(world, { style: "antique", widthPx: SHEET_WIDTH, legend: true });

export const projOf = (world: World): Projection =>
  createProjection(world.elev.w, world.elev.h, SHEET_WIDTH, marginFor(SHEET_WIDTH));
