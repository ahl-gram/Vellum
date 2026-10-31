export function maskChecksum(mask: Uint8Array): number {
  let h = 0x811c9dc5;
  for (const v of mask) {
    h ^= v;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}
