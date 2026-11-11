export const isTsUnderRoots = (roots: readonly string[], path: string): boolean =>
  path.endsWith(".ts") && !path.endsWith(".d.ts") && roots.includes(path.split("/")[0]!);
