export function borderLandCells(land: Uint8Array, w: number, h: number): number {
  let border = 0;
  for (let x = 0; x < w; x++) border += (land[x] as number) + (land[x + (h - 1) * w] as number);
  for (let y = 1; y < h - 1; y++) border += (land[y * w] as number) + (land[w - 1 + y * w] as number);
  return border;
}
