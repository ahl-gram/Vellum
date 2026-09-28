import type { Linter } from "eslint";
import lintConfig from "../eslint.config.ts";

const TS_ROOT_GLOB = /^([\w-]+)\/\*\*\/\*\.ts$/;
const blocks: readonly Linter.Config[] = lintConfig;

export const lintTsRoots = (): string[] =>
  [...new Set(blocks.flatMap((b) => (b.files ?? []).flat()).flatMap((glob) => {
    const m = typeof glob === "string" ? glob.match(TS_ROOT_GLOB) : null;
    return m ? [m[1]!] : [];
  }))].sort();
