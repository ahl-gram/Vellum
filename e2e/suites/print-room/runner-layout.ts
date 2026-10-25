// PR40 (Issue #1047): the runner's layout as VELLUM_E2E_RUNNER_LAYOUT stages it reaches every chart room's own selects and title, and wins the cascade there.
import { makeSettle } from "../../support/settle.ts";
import {
  RUNNER_NUMERO_FAMILY,
  RUNNER_SELECTS,
  runnerLayoutCss,
  runnerLayoutScript,
} from "../../support/runner-layout.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { ROOMS } from "../slide-away/kit.ts";

const SENTINEL_PX = 50;
const SENTINEL_SCRIPT = runnerLayoutScript(
  runnerLayoutCss(
    RUNNER_NUMERO_FAMILY,
    RUNNER_SELECTS.map((s) => ({ selector: s.selector, px: SENTINEL_PX })),
  ),
);

type Staged = {
  path: string;
  ready: string;
  fonts: string;
  selects: { selector: string; heights: number[] }[];
  first: string | null;
  face: boolean;
};

const STAGED: Payload<Staged> = `(() => {
  const title = document.getElementById("folio-title");
  return { path: location.pathname, ready: document.readyState, fonts: document.fonts.status,
    selects: ${JSON.stringify(RUNNER_SELECTS.map((s) => s.selector))}.map((selector) => ({ selector, heights: [...document.querySelectorAll(selector)].map((e) => e.getBoundingClientRect().height) })),
    first: title && getComputedStyle(title).fontFamily.split(",")[0].trim().replaceAll('"', ""),
    face: [...document.fonts].some((f) => f.family.replaceAll('"', "") === ${JSON.stringify(RUNNER_NUMERO_FAMILY)} && f.unicodeRange.toUpperCase() === "U+2116") };
})()`;

function roomFaults(room: string, r: Staged): string[] {
  const faults: string[] = [];
  if (!r.face) faults.push(`${room}: the staged numero face is not among the document's fonts`);
  if (r.first !== RUNNER_NUMERO_FAMILY) {
    faults.push(`${room}: the chart folio's title draws first from ${r.first}, not ${RUNNER_NUMERO_FAMILY}`);
  }
  for (const { selector, heights } of r.selects) {
    if (heights.some((h) => Math.abs(h - SENTINEL_PX) > 0.01)) {
      faults.push(`${room}: ${selector} lays out at ${heights.join(", ")}, not the staged ${SENTINEL_PX}`);
    }
  }
  return faults;
}

function reachFaults(reads: Staged[]): string[] {
  return RUNNER_SELECTS.filter((s) =>
    reads.every((r) => !r.selects.some((x) => x.selector === s.selector && x.heights.length > 0)),
  ).map((s) => `${s.selector} matches nothing in any chart room`);
}

export async function pr40RunnerLayout(ctx: SuiteContext): Promise<void> {
  const settle = makeSettle({
    evaluate: (e: string) => ctx.evaluate<Staged | null>(e).catch(() => null),
    sleep: ctx.sleep,
  });
  const { identifier } = await ctx.send<{ identifier: string }>("Page.addScriptToEvaluateOnNewDocument", {
    source: SENTINEL_SCRIPT,
  });
  const reads: Staged[] = [];
  const faults: string[] = [];
  try {
    for (const room of ROOMS) {
      await ctx.send("Page.navigate", { url: "about:blank" });
      await ctx.send("Page.navigate", { url: `http://127.0.0.1:${ctx.PORT}${room.path}` });
      const read = await settle(
        STAGED,
        (d) => d.path === room.path.split("#")[0] && d.ready === "complete" && d.fonts === "loaded",
        `PR40 ${room.id} staged`,
      );
      reads.push(read);
      faults.push(...roomFaults(room.id, read));
    }
  } finally {
    await ctx.send("Page.removeScriptToEvaluateOnNewDocument", { identifier });
  }
  const wrong = [...faults, ...reachFaults(reads)];
  ctx.check(
    "PR40 the runner's layout as VELLUM_E2E_RUNNER_LAYOUT=1 stages it reaches every chart room: each staged select rule matches a select in some room, every select it matches lays out at the staged height in every room, so no room's own rule outranks it, and every room's chart folio title draws first from the family the staged numero face extends, with that face adopted",
    wrong.length === 0,
    JSON.stringify({
      wrong,
      reads: reads.map((r, i) => ({ room: ROOMS[i]!.id, selects: r.selects, first: r.first, face: r.face })),
    }),
  );
}
