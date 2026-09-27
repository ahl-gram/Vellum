import { existsSync, readdirSync, readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { join, sep } from "node:path";

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

export const e2eSuitePath = (name: string): string => `scripts/e2e/suite-${name}.ts`;

export const e2eSuiteFamily = (root: string, name: string): string[] => {
  const folder = join(root, "scripts", "e2e", name);
  const parts = existsSync(folder) ? readdirSync(folder, { recursive: true, encoding: "utf8" }).filter((f) => f.endsWith(".ts")).map((f) => `scripts/e2e/${name}/${f.split(sep).join("/")}`) : [];
  return [e2eSuitePath(name), ...parts.sort()];
};
