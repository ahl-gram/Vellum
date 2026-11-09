// The head cluster on home (Issue #480 Landfall Sub 6b; Issue #762), cut to its behaviours at Issue #1273: off its links the cluster passes the hand through to home's chart (CL5), and a tablet at the 1024 floor never sees the desk notice (DN5); hands the next suite a settled Explorer.
import { explorerUp } from "../support/explorer.ts";
import { landed, makeStage } from "../support/home.ts";
import { makeStep } from "../support/step.ts";
import type { Payload, SuiteContext } from "../types.ts";
import { deskKit, dnTablet } from "./cluster/desk-notice.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  const { send, clearMobile, PORT } = ctx;
  const step = makeStep(ctx);
  const { settleHome } = makeStage(ctx);

  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await step("CL5", async () => {
    landed(await settleHome(), "CL5");
    await cl5Hand(ctx);
  });
  await step("DN5", () => dnTablet(deskKit(ctx)));

  await clearMobile();
  await send("Emulation.clearDeviceMetricsOverride");
  // The next suite in the lane starts on whatever page is current: hand it a SETTLED Explorer, since a suite that reads the Explorer without navigating races its boot draw (two region-detail checks, since deleted, red on PR #482 CI).
  await step("CL restore", async () => {
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/` });
    await explorerUp(ctx, "CL restore");
  });
}

const HAND: Payload<{ through: boolean; point: number[] | null; link: boolean }> = `(() => {
  scrollTo({ top: 0, left: 0, behavior: "instant" });
  const c = document.querySelector("header.chrome"), b = c.getBoundingClientRect(), a = c.querySelector("nav.rooms a"), ar = a.getBoundingClientRect();
  let point = null, through = false;
  for (let y = b.top + 4; y < b.bottom - 2 && !point; y += 6) for (let x = b.left + 4; x < b.right - 4 && !point; x += 12) {
    const e = document.elementFromPoint(x, y);
    if (e && !e.closest("header.chrome a")) { point = [x, y]; through = !!e.closest("#lf-stage"); }
  }
  const at = document.elementFromPoint(ar.left + ar.width / 2, ar.top + ar.height / 2);
  return { through, point, link: !!at && (at === a || a.contains(at)) };
})()`;

async function cl5Hand({ evaluate, check }: SuiteContext): Promise<void> {
  const h = await evaluate(HAND);
  check(
    "CL5 the cluster passes the hand through: off its links a point inside its box reaches the chart beneath, while its links take the hand back (#461, skeptic finding 2)",
    !!h.point && h.through && h.link,
    JSON.stringify(h),
  );
}
