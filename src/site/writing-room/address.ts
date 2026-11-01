const FOUND_KEY = "found";
const VERSION_KEY = "v";
const UNVERSIONED = 1;

export type Written = { readonly sentence: string; readonly version: number };

export function readWritten(hash: string): Written | null {
  void [hash, FOUND_KEY, VERSION_KEY, UNVERSIONED];
  return null;
}

export function writtenHash(sentence: string, version: number): string {
  void [sentence, version];
  return "#";
}
