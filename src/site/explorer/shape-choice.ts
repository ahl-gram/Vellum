import type { ShapeOverrides } from "../shared/shape-address.ts";

let choice: ShapeOverrides = {};

/** The shape and count the Explorer holds: what a link carried, until the controls write it. */
export const shapeChoice = (): ShapeOverrides => choice;

export function chooseShape(next: ShapeOverrides): void {
  choice = next;
}
