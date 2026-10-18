import { rm } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Issue #204 decision D, clean-before-regen, over the whole build-output folder (Issue #768): the generators write by overwrite only and never delete orphans, so without this a renamed module leaves an importable orphan that masks a 404 locally (CI always fresh-checkouts); runs first in npm run astro:generate. */

export const GENERATED = "generated";

export async function cleanGenerated(root: string): Promise<void> {
  if (basename(root) !== GENERATED) throw new Error(`refusing to delete ${root}: the folder is not named ${GENERATED}`);
  await rm(root, { recursive: true, force: true });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(process.argv[2] ?? GENERATED);
  cleanGenerated(root).catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  });
}
