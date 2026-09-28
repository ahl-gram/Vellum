// The Specimen Book (#487 item 4, cut at #465 ruling 6): every kit piece at its seat, in every state, on one page; MEASURED at 1280x800 and a true 390x844, and shot at both as the closing review's pair (specimen-1280.png, specimen-390.png, specimen-390-open.png, specimen-390-open-leaned.png in the e2e out dir). Every state is reached through the kit's own binders (the fold, the tab, the handle, the Glass), never by planting a class.
import { scopedHealth } from "../support/room.ts";
import { makeSettle } from "../support/settle.ts";
import { makeStep } from "../support/step.ts";
import type { SuiteContext } from "../types.ts";
import { specimenKit } from "./specimen/kit.ts";
import { sb1Boots, sb4Folded, sb5Leaned, sb5bEdgesDark, sb5dGlassBare, sb5eFolioPanel, sb5cFooting, sb6RestAgain } from "./specimen/desktop.ts";
import { sb7Phone, sb8Opens, sb8bNoFooting, sb8eInsets, sb8cRing, sb8dSolid } from "./specimen/phone.ts";
import { sb9bPrinted, sb9PrintIsPaper, sb9dNoScript } from "./specimen/print.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  const { send, sleep } = ctx;
  const settle = makeSettle(ctx);
  // SB4 is the one group here that waits on a transition, so it is the one that is stepped (#534).
  const step = makeStep(ctx);
  const gate = scopedHealth(ctx);
  const k = specimenKit({ ...ctx, settle });
  const { setState, read, goto, brightest } = k;

  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  const rest = await goto();
  await sb1Boots(k, rest);
  await step("SB4", () => sb4Folded(k, rest));
  await setState("leaned");
  await sleep(900);
  const leaned = await read();
  sb5Leaned(k, leaned);
  const interior = await brightest(200, 24);
  await sb5bEdgesDark(k, interior);
  await sb5dGlassBare(k, leaned, interior);
  await sb5eFolioPanel(k, rest, leaned);
  await sb5cFooting(k, rest, leaned);
  await sb6RestAgain(k);
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  const phone = await goto();
  await sb7Phone(k, phone);
  await sb8Opens(k, phone);
  // #525: a docked row goes position:static, so under a live footing rule its ::before resolves against the fixed slip and pools over the sheet's own parchment; the ground reading is the half that proves a reader can still read it.
  await setState("leaned");
  await sleep(900);
  const leanedOpen = await read();
  await sb8bNoFooting(k, leanedOpen);
  sb8eInsets(k, leanedOpen, leaned);
  await sb8cRing(k);
  await sb8dSolid(k);
  await sb9bPrinted(k);
  await sb9PrintIsPaper(k);
  await send("Emulation.clearDeviceMetricsOverride");
  await sb9dNoScript(k);
  await goto();
  gate.check("SB health: the Specimen Book raised no console error and no 4xx across every state at both widths");
}
