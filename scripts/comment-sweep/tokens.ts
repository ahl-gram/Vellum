import ts from "typescript";

export type Token = { readonly text: string; readonly line: number };

export const lineFinder = (text: string): ((offset: number) => number) => {
  const source = ts.createSourceMapSource("", text);
  return (offset) => source.getLineAndCharacterOfPosition(offset).line + 1;
};

export const scriptTokens: (path: string, text: string) => Token[] = () => [];

export const sheetTokens: (css: string, lineOf: (offset: number) => number) => Token[] = () => [];
