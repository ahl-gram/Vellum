const FOUND_KEY = "found";
const VERSION_KEY = "v";
const UNVERSIONED = 1;

export type Written = { readonly sentence: string; readonly version: number };

export function readWritten(hash: string): Written | null {
  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const sentence = params.get(FOUND_KEY);
  if (sentence === null) return null;
  const raw = params.get(VERSION_KEY);
  if (raw === null) return { sentence, version: UNVERSIONED };
  return { sentence, version: /^[1-9][0-9]{0,8}$/.test(raw) ? Number(raw) : 0 };
}

export function writtenHash(sentence: string, version: number): string {
  return (
    "#" +
    new URLSearchParams([
      [FOUND_KEY, sentence],
      [VERSION_KEY, String(version)],
    ]).toString()
  );
}
