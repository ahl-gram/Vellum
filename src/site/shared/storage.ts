export function readStored(getStorage: () => Storage, key: string): string | null {
  try {
    return getStorage().getItem(key);
  } catch {
    return null;
  }
}

export function writeStored(getStorage: () => Storage, key: string, value: string): void {
  try {
    getStorage().setItem(key, value);
  } catch {}
}

export function removeStored(getStorage: () => Storage, key: string): void {
  try {
    getStorage().removeItem(key);
  } catch {}
}
