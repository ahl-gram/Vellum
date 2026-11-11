import { functionsIn, type Fn } from "../scripts/copy-hunt/functions.ts";
import type { Found, Outcome } from "../scripts/copy-hunt/hunt.ts";
import { requestFor, verdictOf } from "../scripts/copy-hunt/questions.ts";
import type { Answered, Reply } from "../scripts/jev/system-one.ts";

export const ALPHA = [
  "export const alpha = (items: readonly Item[], limit: number): Item[] =>",
  "  items.filter((item) => item.weight <= limit).sort((left, right) => left.weight - right.weight);",
  "",
].join("\n");
export const ALPHA_COPY = [
  "// the same function, commented",
  "export const alpha = (items: readonly Item[], limit: number): Item[] =>",
  "  items.filter((item) => item.weight <= limit).sort((left, right) => left.weight - right.weight); // light first",
  "",
].join("\n");
export const ALPHA_NEAR = [
  "export const alphaOf = (items: readonly Item[], cap: number): Item[] =>",
  "  items.filter((item) => item.weight <= cap).sort((left, right) => left.weight - right.weight);",
  "",
].join("\n");
export const OTHER =
  "export const unrelated = (name: string, count: number): string => name.repeat(count).toUpperCase().trim();\n";
export const TINY = "export const tiny = (a: number): number => a + 1;\n";
export const KINDS = [
  "export function declared(first: number, second: number): number {",
  "  // the sum",
  "  return first + second; /* both */",
  "}",
  "const arrow = (value: number): number => value * 2;",
  "const expression = function (value: number): number {",
  "  return value - 1;",
  "};",
  "class Store {",
  "  get(key: string): string {",
  "    return key;",
  "  }",
  "}",
  "const table = {",
  "  read: (key: string): string => key,",
  "  write(key: string): void {},",
  "};",
  "export function outer(items: readonly Item[], limit: number): Item[] {",
  "  const inner = (items: readonly Item[], limit: number): Item[] => items.filter((item) => item.weight <= limit);",
  "  return inner(items, limit);",
  "}",
  "",
].join("\n");
const LONG_HEAD =
  "export const longOne = (alphaW: number, betaW: number, gammaW: number, deltaW: number, epsW: number): number =>\n  alphaW + betaW + gammaW + deltaW + epsW";
export const LONG = `${LONG_HEAD}${" + alphaW".repeat(700)};\n`;
export const LONG_NEAR = `${LONG_HEAD.replace("longOne", "longTwo")}${" + alphaW".repeat(700)};\n`;

export const alphaFns = (): Fn[] => [
  ...functionsIn("src/a.ts", ALPHA),
  ...functionsIn("src/b.ts", ALPHA_COPY),
  ...functionsIn("src/c.ts", ALPHA_NEAR),
  ...functionsIn("src/d.ts", OTHER),
];
export const fnOf = (file: string, line: number, name: string, tokens: string[], extra: Partial<Fn> = {}): Fn => ({
  file,
  line,
  end: line,
  name,
  body: `${name}()`,
  norm: `${name}()`,
  tokens: [...tokens].sort(),
  hash: "0123456789abcdef",
  ...extra,
});
export const sameAnswer = (same: number, inputTokens = 500): Answered => ({
  ok: true,
  model: "jev-1.14.0",
  nouls: { same },
  inputTokens,
  ms: 5,
});
export const pair = (x: Fn, y: Fn, similarity: number, outcome: Outcome, replies: Reply[] = []): Found => ({
  x,
  y,
  similarity,
  requests: replies.length === 0 ? [] : [requestFor(x, y), requestFor(y, x)],
  replies,
  outcome,
});
export const asked = (ab: number, ba: number): Outcome => ({
  kind: "asked",
  asked: { ab, ba, mean: (ab + ba) / 2, verdict: verdictOf((ab + ba) / 2) },
});
