import type { Linter } from "eslint";
import lintConfig from "../eslint.config.ts";

type FileEntry = string | string[];

const TS_ROOT_GLOB = /^([\w-]+)\/\*\*\/\*\.ts$/;
const TS_GLOB = /\.[cm]?tsx?\b|\bts\b/;
const blocks: readonly Linter.Config[] = lintConfig;

const rootOf = (entry: FileEntry): string | null => {
  const conjuncts = typeof entry === "string" ? [entry] : entry;
  const root = conjuncts.map((glob) => glob.match(TS_ROOT_GLOB)?.[1]).find((r) => r !== undefined);
  if (root !== undefined) return root;
  if (conjuncts.some((glob) => TS_GLOB.test(glob)))
    throw new Error(
      `cannot read a root from the TypeScript files entry ${JSON.stringify(entry)}: widen this reader before the lint takes it`,
    );
  return null;
};

export const tsRootsOf = (entries: readonly FileEntry[]): string[] =>
  [...new Set(entries.map(rootOf).filter((r): r is string => r !== null))].sort();

export const lintTsRoots = (): string[] =>
  tsRootsOf(
    blocks
      .flatMap((b) => b.files ?? [])
      .filter(
        (e): e is FileEntry => typeof e === "string" || (Array.isArray(e) && e.every((g) => typeof g === "string")),
      ),
  );
