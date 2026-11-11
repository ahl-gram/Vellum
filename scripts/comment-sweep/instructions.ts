export type Instruction = { readonly name: string; readonly reads: RegExp };

export const INSTRUCTION_COMMENTS: readonly Instruction[] = [
  { name: "@ts-", reads: /^\/\/\/?\s*@ts-|^\/\*(?:[\s\S]*\n)?(?=[^\n]*$)\s*[/*]*\s*@ts-(?:expect-error|ignore)/ },
  {
    name: "eslint-disable",
    reads: /^\/\*\s*eslint-disable(?:-next-line|-line)?(?=\s|\*\/)|^\/\/\s*eslint-disable(?:-next)?-line(?=\s|$)/,
  },
  { name: "eslint-enable", reads: /^\/\*\s*eslint-enable(?=\s|\*\/)/ },
  { name: "eslint-env", reads: /^\/\*\s*eslint-env(?=\s|\*\/)/ },
  { name: "eslint", reads: /^\/\*\s*eslint(?=\s|\*\/)/ },
  { name: "exported", reads: /^\/\*\s*exported(?=\s|\*\/)/ },
  { name: "global", reads: /^\/\*\s*global(?=\s|\*\/)/ },
  { name: "globals", reads: /^\/\*\s*globals(?=\s|\*\/)/ },
  {
    name: "prettier-ignore",
    reads: /^(?:\/\/\s*prettier-ignore\s*|\/\*\s*prettier-ignore\s*\*\/|<!--\s*prettier-ignore\s*-->)$/,
  },
  { name: "@__PURE__", reads: /^\/[/*]\s*@__PURE__/ },
  { name: "#__PURE__", reads: /^\/[/*]\s*#__PURE__/ },
  { name: "@vite-ignore", reads: /^\/\*\s*@vite-ignore\s*\*\/$/ },
  { name: "/// <reference", reads: /^\/\/\/\s*<reference\s.*\/>/i },
  { name: "#!", reads: /^#!/ },
  { name: "/*!", reads: /^\/(?:\/|\*\*?)!/ },
  { name: "@jsx", reads: /^\/\*[\s\S]*@jsx(?=\s)/i },
  { name: "@jsxImportSource", reads: /^\/\*[\s\S]*@jsxImportSource(?=\s)/i },
  { name: "@jsxFrag", reads: /^\/\*[\s\S]*@jsxFrag(?=\s)/i },
  { name: "@type", reads: /^\/\*\*[\s\S]*?(?<=[\s*])@type(?![\w$])/ },
];

export const isInstruction = (comment: string): boolean =>
  INSTRUCTION_COMMENTS.some((instruction) => instruction.name === comment);
