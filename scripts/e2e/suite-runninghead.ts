// Running Head e2e (RH0-RH8, #295; reshaped for the #461 head cluster): the shell's masthead asserted by RESOLVED computed styles, because a rule that is present but LOSES the cascade passes every source-text test (#288); self-contained, restores the Explorer base.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { dropExpectedCancellations } from "./console-support.ts";
import type { SuiteContext } from "./types.ts";
import { runningHeadKit } from "./runninghead/kit.ts";
import type { RunningHeadKit } from "./runninghead/kit.ts";
import { DISPLAY_FACE, near, SHELLED } from "./runninghead/reads.ts";
import type { Head } from "./runninghead/reads.ts";
import { rh0OneH1, rh1NamesPage, rh2Members, rh3Fixed, rh4OneDress, rh5Leading, rh6Differ, rh9aTagline, rh9bWash, rhSweep } from "./runninghead/heads.ts";
import { rh10bNarrowFolio, rh10cPrinted, rh10GalleryScrolled } from "./runninghead/gallery.ts";

// Reading the producer's own template couples the injected twin to it: rename the class or demote the heading in renderBoundAtlas and RH7 reds instead of drifting.
const REPO = resolve(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const boundAtlasEmitsAtlasHead = () => {
  const src = readFileSync(resolve(REPO, "src/site/print-room/bound-atlas.ts"), "utf8");
  const header = src.match(/<header class="atlas-head[^]*?<\/header>/);
  return !!header && /<h1>/.test(header[0]);
};

export async function run(ctx: SuiteContext): Promise<void> {
  const { send, consoleErrors, http4xx } = ctx;
  const errBase = consoleErrors.length;
  const httpBase = http4xx.length;
  const k = runningHeadKit(ctx);
  const { visit } = k;

  const { heads, unreachable } = await rhSweep(k);
  const bad = (pred: (h: Head, r: string) => boolean) => SHELLED.filter((r) => !heads[r] || !pred(heads[r], r));
  rh0OneH1(ctx, heads, unreachable, bad);
  rh1NamesPage(ctx, heads, bad);
  rh2Members(ctx, heads);
  rh3Fixed(ctx, heads, bad);
  const prose = rh4OneDress(ctx, heads);
  rh5Leading(ctx, heads);
  rh6Differ(ctx, heads, prose);
  await rh7AtlasTitle(k);
  rh9aTagline(ctx, heads, bad);
  rh9bWash(ctx, heads, bad);
  await rh10GalleryScrolled(k);
  // #531: the OTHER painting arm, body.chart-room:not(:has(.stage)), which SB8e's page never matches.
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  // The Z13 bounce: /gallery/ is already loaded, and visit()'s probe (readyState complete plus a .wordmark) is satisfied by the STALE document, so a same-URL navigate can return before the new one commits.
  await send("Page.navigate", { url: "about:blank" });
  const galleryNarrow = await visit("/gallery/");
  await rh10bNarrowFolio(k, galleryNarrow);
  await rh10cPrinted(k, galleryNarrow);
  await send("Emulation.clearDeviceMetricsOverride");

  await rh8Clean(ctx, errBase, httpBase);
}

async function rh7AtlasTitle({ evaluate, check, visit }: RunningHeadKit): Promise<void> {
  // .print-only is display:none on screen so no screenshot can reach this, but computed style resolves through display:none; a probe showed a bare h1 in the same container resolves to the BODY face, so the assertion discriminates.
  const producerShape = boundAtlasEmitsAtlasHead();
  type AtlasRead = { family: string; size: number; hidden: boolean } | null;
  let atlas: AtlasRead = null;
  if (await visit("/print-room/")) {
    atlas = JSON.parse(await evaluate<string>(`(() => {
      const d = document.getElementById("pr-atlas");
      if (!d) return JSON.stringify(null);
      d.innerHTML = '<header class="atlas-head print-only">' +
        '<h1>The Isle of Rahai</h1><p class="subtitle">An atlas</p><p class="chartno">VELLUM \\u00b7 CHART \\u2116 42</p></header>';
      const h1 = d.querySelector(".atlas-head h1");
      const cs = getComputedStyle(h1);
      return JSON.stringify({ family: cs.fontFamily, size: parseFloat(cs.fontSize),
        hidden: getComputedStyle(h1.parentElement).display === "none" });
    })()`)) as AtlasRead;
  }
  check(
    "RH7 the Print Room's bound-atlas title resolves to the display face (unreachable by any screenshot), and the producer still emits that markup",
    producerShape && !!atlas && DISPLAY_FACE.test(atlas.family) && near(atlas.size, 35.2) && atlas.hidden,
    `producer emits header.atlas-head > h1: ${producerShape}; injected twin: ${JSON.stringify(atlas)}`,
  );
}

async function rh8Clean(ctx: SuiteContext, errBase: number, httpBase: number): Promise<void> {
  const { send, check, waitReady, consoleErrors, http4xx, PORT } = ctx;
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/` });
  const restored = await waitReady();

  // This suite is the sole visitor to /gallery/, /glossary/, /faq/ and /ribbon/, so a console error it drops is dropped nowhere else.
  const errDelta = dropExpectedCancellations(consoleErrors.slice(errBase));
  const httpDelta = http4xx.slice(httpBase).filter((u) => !/favicon/i.test(u));
  check(
    "RH8 the running-head sweep is clean (no console errors, no new 4xx) and the Explorer base is restored",
    errDelta.length === 0 && httpDelta.length === 0 && restored,
    [...errDelta, ...httpDelta].join(" | ") || (restored ? "clean, Explorer restored" : "clean, but the Explorer did not settle"),
  );
}
