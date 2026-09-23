import { existsSync, readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { join, resolve } from "node:path";

const REPO = resolve(import.meta.dirname, "..");

export const readE2eSource = (path: string): string => {
  const text = readFileSync(path, "utf8");
  return path.endsWith(".ts") ? stripTypeScriptTypes(text, { mode: "strip" }) : text;
};

export const e2eSuitePath = (name: string): string => {
  const ported = `scripts/e2e/suite-${name}.ts`;
  return existsSync(join(REPO, ported)) ? ported : `scripts/e2e/suite-${name}.mjs`;
};
