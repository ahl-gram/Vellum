import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { handSteps } from "../src/site/shared/primer/hand-steps.ts";
import { LADDERS } from "../src/site/shared/primer/ladders.ts";
import { GENERATED } from "./clean-generated.ts";

/** Issue #1253: the one data file a room fetches when its address carries a Primer step, written by astro:generate beside the discovery files so it cannot drift from the ladders. */
export async function writePrimerSteps(root: string): Promise<void> {
  await mkdir(join(root, "primer"), { recursive: true });
  await writeFile(join(root, "primer", "steps.json"), JSON.stringify(handSteps(LADDERS)));
}

if (import.meta.main) await writePrimerSteps(resolve(process.argv[2] ?? GENERATED));
