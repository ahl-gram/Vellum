import type { ShapeOverrides } from "../shared/shape-address.ts";

let choice: ShapeOverrides = {};

export const shapeChoice = (): ShapeOverrides => choice;

export function chooseShape(next: ShapeOverrides): void {
  choice = next;
}
