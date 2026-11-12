export const PRIMER_STORE_KEY = "vellum.primer.v1";

const STEP_ID = /^[a-z0-9-]+$/;

export function parseSeals(raw: string | null): ReadonlySet<string> {
  if (raw === null) return new Set();
  return new Set(raw.split(",").filter((id) => STEP_ID.test(id)));
}

export const emitSeals = (ids: Iterable<string>): string => [...ids].join(",");

export function readSeals(getStorage: () => Storage): ReadonlySet<string> {
  try {
    return parseSeals(getStorage().getItem(PRIMER_STORE_KEY));
  } catch {
    return new Set();
  }
}

export function writeSeal(getStorage: () => Storage, stepId: string): void {
  if (!STEP_ID.test(stepId)) return;
  try {
    const store = getStorage();
    const sealed = parseSeals(store.getItem(PRIMER_STORE_KEY));
    if (!sealed.has(stepId)) store.setItem(PRIMER_STORE_KEY, emitSeals([...sealed, stepId]));
  } catch {}
}

export function clearSeals(getStorage: () => Storage): void {
  try {
    getStorage().removeItem(PRIMER_STORE_KEY);
  } catch {}
}
