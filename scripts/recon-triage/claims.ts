export const KINDS = ["behavior", "existence", "count", "process"] as const;
export type Kind = (typeof KINDS)[number];
export type ClaimRow = {
  readonly claim: string;
  readonly source: string;
  readonly paths: readonly string[];
  readonly symbols: readonly string[];
  readonly kind: Kind;
};

const isList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const parseRow = (line: string, n: number): ClaimRow => {
  let value: unknown;
  try {
    value = JSON.parse(line);
  } catch {
    throw new Error(`line ${n}: not a JSON object`);
  }
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error(`line ${n}: not a JSON object`);
  const row = value as Record<string, unknown>;
  const { claim, source, paths, symbols, kind } = row;
  if (typeof claim !== "string" || claim.trim() === "") throw new Error(`line ${n}: claim is missing or empty`);
  if (typeof source !== "string") throw new Error(`line ${n}: source is not a string`);
  if (!isList(paths)) throw new Error(`line ${n}: paths is not a list of strings`);
  if (!isList(symbols)) throw new Error(`line ${n}: symbols is not a list of strings`);
  if (!KINDS.some((k) => k === kind)) throw new Error(`line ${n}: kind is not one of ${KINDS.join(", ")}`);
  return { claim, source, paths, symbols, kind: kind as Kind };
};

export const parseClaims = (text: string): ClaimRow[] =>
  text.split("\n").flatMap((line, i) => (line.trim() === "" ? [] : [parseRow(line, i + 1)]));
