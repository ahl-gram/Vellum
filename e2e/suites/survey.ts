// Survey Ink e2e (SV1-SV11, #321): the static Explorer's survey surface; self-contained like its sibling suites (navigates itself, carries scoped no-4xx and console-error deltas).
import { makeRoom } from "../support/room.ts";
import { makeStep } from "../support/step.ts";
import type { SuiteContext } from "../types.ts";
import { surveyKit } from "./survey/kit.ts";
import { sv1Boots, sv2FirstArm, sv2bAtRest, sv2cReArm, sv2dInsideBeat, sv2eInFlight, sv2fBare } from "./survey/arm.ts";
import { sv2gSecondArm, sv2hPluralExit, sv2iBuildsOnce, sv2jTurnLanding } from "./survey/mount.ts";
import { sv2pDrawBeat, sv2pSwapThenInk, sv2mStyleInBeat, sv2oVersoDraw } from "./survey/beat.ts";
import { sv3Untick, sv4DeepLink, sv5Forwards, sv5bVerbatim, sv5cBadYear, sv5dBothKeys, sv6VersoMirrors, sv7Journal } from "./survey/links.ts";
import { sv9NoSeams, sv10TurnKeepsTrack, sv2nReducedSwap } from "./survey/turn.ts";
import { sv8NoYear, sv11Clean } from "./survey/closing.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  const { evaluate, sleep, consoleErrors, http4xx } = ctx;
  const k = surveyKit(ctx);
  const errBase = consoleErrors.length;
  const httpBase = http4xx.length;
  const room = makeRoom(ctx);
  // SV2f, SV5, SV5b, SV7, SV8 and the closing seams are deliberately not stepped: nothing in them waits.
  const step = makeStep(ctx);
  await step("SV1", () => sv1Boots(k));
  await step("SV2 to SV2c", async () => { const firstInkMs = await sv2FirstArm(k); await sv2bAtRest(ctx); await sv2cReArm(k, firstInkMs); });
  await step("SV2d", () => sv2dInsideBeat(k));
  await step("SV2e", () => sv2eInFlight(k));
  await sv2fBare(ctx);
  await step("SV2g", () => sv2gSecondArm(k));
  await step("SV2h", () => sv2hPluralExit(k));
  await step("SV2i", () => sv2iBuildsOnce(k));
  await step("SV2j", () => sv2jTurnLanding(k));
  await step("SV2p", async () => { await sv2pDrawBeat(k); await sv2pSwapThenInk(ctx); });
  await step("SV2m", () => sv2mStyleInBeat(k));
  await step("SV2o", () => sv2oVersoDraw(k));
  await step("SV3", () => sv3Untick(k));
  await step("SV4", () => sv4DeepLink(k));
  await sv5Forwards(k, room);
  await sv5bVerbatim(k);
  await step("SV5c", () => sv5cBadYear(k));
  await step("SV5d", () => sv5dBothKeys(k));
  await step("SV6", () => sv6VersoMirrors(k));
  await evaluate(`document.getElementById("verso-turn").click()`);
  await sleep(1500);
  await sv7Journal(ctx, room);
  await step("SV9", () => sv9NoSeams(k));
  await step("SV10", () => sv10TurnKeepsTrack(k));
  await step("SV2n", () => sv2nReducedSwap(k));
  await sv8NoYear(ctx);
  sv11Clean(ctx, errBase, httpBase);
}
