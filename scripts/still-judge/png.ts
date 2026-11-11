// 2026-11-11, Issue #1309: TypeSafe's image limits (https://docs.typesafe.ai/go/images.md, Limits): each side 280 to 1568 pixels, which also holds the total inside its 78,400 to 2,458,624, and 16 MiB a file; an image outside them is refused, never resized.
export const MIN_SIDE = 280;
export const MAX_SIDE = 1568;
export const MAX_BYTES = 16 * 1024 * 1024;
export type PngSize = { readonly width: number; readonly height: number };

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export const pngSize = (bytes: Uint8Array): PngSize | null => {
  if (bytes.length < 24) return null;
  if (!SIGNATURE.every((b, i) => bytes[i] === b)) return null;
  if (Buffer.from(bytes.subarray(12, 16)).toString("latin1") !== "IHDR") return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
};

export const limitProblem = (bytes: Uint8Array): string | null => {
  const size = pngSize(bytes);
  if (size === null) return "not a PNG";
  const { width, height } = size;
  if (width < MIN_SIDE || height < MIN_SIDE || width > MAX_SIDE || height > MAX_SIDE)
    return `${width} by ${height} pixels: each side must be ${MIN_SIDE} to ${MAX_SIDE}`;
  if (bytes.length > MAX_BYTES) return `${bytes.length} bytes: a still may hold at most ${MAX_BYTES}`;
  return null;
};
