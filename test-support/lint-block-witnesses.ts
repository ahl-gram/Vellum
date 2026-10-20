import { spawnSync } from "node:child_process";
import { matchesGlob, resolve } from "node:path";
import { blocks, shortName } from "./lint-wiring-scope.ts";

const ROOT = resolve(import.meta.dirname, "..");
const TS_FILE = /\.ts$/;
const PRESETS = /^(@eslint\/js|typescript-eslint)\//;

const trackedTs = (): string[] => {
  const listed = spawnSync("git", ["ls-files", "-z", "--", "*.ts"], { cwd: ROOT, encoding: "utf8", timeout: 30_000 });
  if (listed.status !== 0) throw new Error(`git ls-files failed (${listed.status}, ${listed.error ?? listed.stderr})`);
  return listed.stdout.split("\0").filter(Boolean).sort();
};

export const blockWitnesses = (): Array<{ block: string; file: string }> => {
  const tracked = trackedTs();
  const witnesses = new Map<string, string>();
  for (const block of blocks.filter((b) => !PRESETS.test(shortName(b)))) {
    for (const entry of block.files ?? []) {
      const conjuncts = typeof entry === "string" ? [entry] : entry;
      if (!conjuncts.some((glob) => TS_FILE.test(glob))) continue;
      const file = tracked.find((path) => conjuncts.every((glob) => matchesGlob(path, glob)));
      if (file === undefined)
        throw new Error(`${block.name ?? "(unnamed)"}: ${JSON.stringify(entry)} reaches no tracked TypeScript file`);
      if (!witnesses.has(file)) witnesses.set(file, block.name ?? "(unnamed)");
    }
  }
  return [...witnesses].map(([file, block]) => ({ block, file }));
};
