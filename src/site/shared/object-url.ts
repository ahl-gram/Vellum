export function downloadBlob(blob: Blob, filename: string): void {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function nextObjectUrl(previous: string | null, blob: Blob): string {
  if (previous !== null) URL.revokeObjectURL(previous);
  return URL.createObjectURL(blob);
}
