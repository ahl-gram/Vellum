export const verify: (
  repo: string,
  base: string,
  head: string,
) => { readonly lines: readonly string[]; readonly code: 0 | 1 } = () => ({ lines: [], code: 0 });

export const main: (argv: readonly string[], repo?: string) => number = () => 0;
