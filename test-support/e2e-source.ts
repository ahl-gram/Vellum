import { existsSync, readdirSync, readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { join, resolve } from "node:path";

const REPO = resolve(import.meta.dirname, "..");

export const e2eSourcePaths = (root: string): string[] => {
  const dir = join(root, "scripts", "e2e");
  return [
    ...readdirSync(dir, { recursive: true, encoding: "utf8" }).filter((f) => f.endsWith(".ts")).map((f) => join(dir, f)),
    ...readdirSync(join(root, "scripts")).filter((f) => /^e2e-[\w-]+\.ts$/.test(f)).map((f) => join(root, "scripts", f)),
  ];
};

export const readE2eSource = (path: string): string => {
  const text = readFileSync(path, "utf8");
  return path.endsWith(".ts") ? stripTypeScriptTypes(text, { mode: "strip" }) : text;
};

export const e2eSuitePath = (name: string): string => {
  const ported = `scripts/e2e/suite-${name}.ts`;
  return existsSync(join(REPO, ported)) ? ported : `scripts/e2e/suite-${name}.mjs`;
};
