import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { GENERATED } from "./clean-generated.ts";

export async function writePrimerSteps(root: string): Promise<void> {
  await mkdir(join(root, "primer"), { recursive: true });
  await writeFile(join(root, "primer", "steps.json"), "[]");
}

if (import.meta.main) await writePrimerSteps(resolve(process.argv[2] ?? GENERATED));
