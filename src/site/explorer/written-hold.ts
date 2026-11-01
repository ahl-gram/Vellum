import { heldFor, type WrittenWorld } from "../shared/written-world.ts";

let held: WrittenWorld | null = null;

export function holdWritten(world: WrittenWorld | null): void {
  held = world;
}

export function writtenNow(): WrittenWorld | null {
  return held;
}

export function writtenFor(seed: number): WrittenWorld | null {
  void seed;
  void heldFor;
  return held;
}
