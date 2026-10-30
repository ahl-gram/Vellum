// A real place on the Explorer's page (Issue #854): the same job through the worker and inline, the place fetched once from the site's root and stamped on the chart.
import type { Payload, SuiteContext } from "../../types.ts";

const PLACE_JOB = `{kind:"draw",seed:42,overrides:{mapType:"island",outline:"ne-1159315211",looseness:0.5},render:{style:"antique",widthPx:1500,legend:true}}`;
export const PLACE_PATH = "/outlines/ne-1159315211.txt";

export const FETCHED_PLACES: Payload<string[]> =
  `performance.getEntriesByType("resource").map((e) => new URL(e.name).pathname).filter((p) => p.startsWith("/outlines/"))`;

export type Drawn = { ok: true; same: boolean; stamped: boolean; fetched: string[] } | { ok: false; error: string };

export const PLACE_DRAWN: Payload<Drawn> = `(async () => { performance.clearResourceTimings(); const m = ${PLACE_JOB};
  try { const j = await window.__vellumRunJob(m); const i = window.__vellumRunInline(m);
    const fetched = ${FETCHED_PLACES};
    return { ok: true, same: j.svg === i.svg, stamped: j.svg.includes('data-vellum-outline="ne-1159315211"') && j.svg.includes('data-vellum-looseness="0.5"'), fetched };
  } catch (err) { return { ok: false, error: String(err && err.message || err) }; } })()`;

export async function r18RealPlace({ evaluate, check }: SuiteContext): Promise<void> {
  const d = await evaluate(PLACE_DRAWN, true);
  check(
    "R18 a real place draws through the worker and inline alike, stamped with its outline, fetched once",
    d.ok && d.same && d.stamped && d.fetched.length === 1 && d.fetched[0] === PLACE_PATH,
    JSON.stringify(d),
  );
}
