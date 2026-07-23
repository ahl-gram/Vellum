import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { heroChartSvgs } from "./hero-charts.ts";

/**
 * Scriptorium Sub 4 (#205), decision D requirement 2, per #40's sketch: the
 * thin successor to build-site.ts's hero-chart step, and the ONLY writer of the
 * committed charts/ goldens. Run it on a ratified re-roll or hero refresh, then
 * `npm run og`, and land the regen ALONE (CLAUDE.md regen discipline; verify by
 * diffing the committed charts old-vs-new, since the #40 drift guard is
 * circular right after a regen).
 *
 * During the Sub 3-5 dual-copy window the committed charts live in BOTH
 * docs/charts and public/charts (byte-guarded twins), so both are written; when
 * Sub 5 retires docs/, drop the docs/ entry here.
 *
 *   npm run charts:regen
 */

export const HERO_CHART_DIRS: ReadonlyArray<string> = ["docs/charts", "public/charts"];

export async function regenHeroCharts(dirs: ReadonlyArray<string>): Promise<void> {
  const svgs = heroChartSvgs();
  for (const dir of dirs) {
    await mkdir(resolve(dir), { recursive: true });
    for (const [name, svg] of svgs) {
      await writeFile(resolve(dir, name), svg, "utf8");
      console.log(`${dir}/${name}`);
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  regenHeroCharts(HERO_CHART_DIRS).catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  });
}
