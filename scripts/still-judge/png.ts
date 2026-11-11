import { pngDims } from "../delivery/dims.ts";

// 2026-11-11, Issue #1309: TypeSafe's image limits (https://docs.typesafe.ai/go/images.md, Limits): each side 280 to 1568 pixels, which also holds the total inside its 78,400 to 2,458,624, and 16 MiB a file; an image outside them is refused, never resized.
export const MIN_SIDE = 280;
export const MAX_SIDE = 1568;
export const MAX_BYTES = 16 * 1024 * 1024;

export const limitProblem = (bytes: Uint8Array): string | null => {
  const size = pngDims(bytes);
  if (size === null) return "not a PNG";
  const { width, height } = size;
  if (width < MIN_SIDE || height < MIN_SIDE || width > MAX_SIDE || height > MAX_SIDE)
    return `${width} by ${height} pixels: each side must be ${MIN_SIDE} to ${MAX_SIDE}`;
  if (bytes.length > MAX_BYTES) return `${bytes.length} bytes: a still may hold at most ${MAX_BYTES}`;
  return null;
};
