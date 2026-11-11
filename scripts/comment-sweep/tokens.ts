export type Token = { readonly text: string; readonly line: number };

export const scriptTokens: (path: string, text: string) => Token[] = () => [];

export const sheetTokens: (css: string, lineOf: (offset: number) => number) => Token[] = () => [];
