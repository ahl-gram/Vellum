// The Specimen Book (Issue #487 item 4, cut at Issue #465 ruling 6): every kit piece at its seat, in every state, on one page; MEASURED at 1280x800 and shot there (specimen-1280.png in the e2e out dir); the narrow layout it was also read in went with Issue #762's 1024 floor. Every state is reached through the kit's own binders (the fold, the tab, the Glass), never by planting a class.
import { scopedHealth } from "../support/room.ts";
import { makeSettle } from "../support/settle.ts";
import { makeStep } from "../support/step.ts";
import type { SuiteContext } from "../types.ts";
import { specimenKit } from "./specimen/kit.ts";
import {
  sb1Boots,
  sb4Folded,
  sb5Leaned,
  sb5fCornerPanels,
  sb8eInsets,
  sb5cFooting,
  sb6RestAgain,
  sb10Route,
  sb11Pieces,
  sb12StatusVoice,
  sb13GlassPress,
  sb14Verbs,
} from "./specimen/desktop.ts";
import type { Specimen } from "./specimen/reads.ts";
import { sb9bPrinted, sb9PrintIsPaper, sb9dNoScript } from "./specimen/print.ts";
import { sb15OutPress } from "./specimen/gestures.ts";
import { sb16LeanedOne, sb19SlidFromRest, slidStep } from "./specimen/slid.ts";
import { sb20SlipInk } from "./specimen/slip-ink.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  const { send } = ctx;
  const settle = makeSettle(ctx);
  const step = makeStep(ctx);
  const gate = scopedHealth(ctx);
  const k = specimenKit({ ...ctx, settle });
  const { goto, toState } = k;

  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  let rest: Specimen | null = null;
  await step("SB setup", async () => {
    rest = await goto();
  });
  await sb1Boots(k, rest);
  await step("SB4", () => sb4Folded(k, rest));
  await step("SB5", async () => {
    const leaned = await toState("leaned", "SB5 leaned");
    sb5Leaned(k, leaned);
    sb5fCornerPanels(k, leaned);
    sb8eInsets(k, leaned);
    await sb5cFooting(k, rest, leaned);
    await sb16LeanedOne(k);
  });
  await step("SB17, SB5g, SB5d, SB5e, SB18", () => slidStep(k, rest));
  await step("SB19", () => sb19SlidFromRest(k));
  await step("SB6 setup", async () => {
    await toState("rest", "SB6 at rest again");
  });
  await sb6RestAgain(k);
  await step("SB10", () => sb10Route(k));
  await step("SB11", () => sb11Pieces(k));
  await step("SB12", () => sb12StatusVoice(k));
  await step("SB13", () => sb13GlassPress(k));
  await step("SB15", () => sb15OutPress(k));
  await step("SB14", () => sb14Verbs(k));
  await step("SB20", () => sb20SlipInk(k));
  // SB9b prints a leaned Book; the phone block that used to lean it before here went with the narrow layout (Issue #762).
  await step("SB9b", async () => {
    await toState("leaned", "SB9b leaned");
    await sb9bPrinted(k);
  });
  await step("SB9, SB9c", () => sb9PrintIsPaper(k));
  await send("Emulation.clearDeviceMetricsOverride");
  await sb9dNoScript(k);
  await step("SB restore", async () => {
    await goto();
  });
  gate.check("SB health: the Specimen Book raised no console error and no 4xx across every state at both widths");
}
