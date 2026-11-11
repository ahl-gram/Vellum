import type { Token } from "./tokens.ts";

export const pageTokens = (text: string): Token[] => [{ text, line: 1 }];
