import { test } from "node:test";
import assert from "node:assert/strict";
import { cd2bRealPointer } from "../../e2e/suites/chart-drawer/desk.ts";
import type { DrawerKit } from "../../e2e/suites/chart-drawer/kit.ts";
import type { ZoomKit } from "../../e2e/suites/zoom/kit.ts";
import { offMainThread, z20cThrottle } from "../../e2e/suites/zoom/region.ts";
import { z13dRefitHolds } from "../../e2e/suites/zoom/resets.ts";
import { makeSettle } from "../../e2e/support/settle.ts";
import type { SuiteContext } from "../../e2e/types.ts";
import { count, lastOf, recording, type Said } from "../../test-support/recording-ctx.ts";

const AT_REST = { sheet: 792.6, fx: 0.5, fy: 0.5, sk: 4, cx: "0.5000", cy: "0.5000", k: "4.0000", folded: false };
const overridden = (said: readonly Said[]) =>
  count(said, "setDeviceMetricsOverride") > count(said, "clearDeviceMetricsOverride");
const REFITS = [
  {
    stuck: "the resize never reaches the page",
    label: "Z13b the resize's refit",
    answer: (said: readonly Said[], reserve: string) =>
      overridden(said) ? { ...AT_REST, reserve, resizes: 0, ih: 600 } : null,
  },
  {
    stuck: "a stray resize lands before the override's",
    label: "Z13b the resize's refit",
    answer: (said: readonly Said[], reserve: string) =>
      overridden(said) ? { ...AT_REST, reserve, resizes: 1, ih: 2263 } : null,
  },
  {
    stuck: "the way back's resize never reaches the page",
    label: "Z13b the refit back",
    answer: (said: readonly Said[], reserve: string) =>
      count(said, "clearDeviceMetricsOverride") > 0 ? { ...AT_REST, reserve, resizes: 1, ih: 2263 } : null,
  },
  {
    stuck: "the window still reads the override's height after its clear",
    label: "Z13b the refit back",
    answer: (said: readonly Said[], reserve: string) =>
      count(said, "clearDeviceMetricsOverride") > 0 ? { ...AT_REST, reserve, resizes: 2, ih: 600, sheet: 443.9 } : null,
  },
  {
    stuck: "the fold's refit never lands",
    label: "Z13c the fold's refit",
    answer: (said: readonly Said[], reserve: string) =>
      count(said, ".slip-fold") > 0 ? { ...AT_REST, reserve, resizes: 2, ih: 2263, folded: true } : null,
  },
  {
    stuck: "the fold's refit never comes to rest",
    label: "Z13c the fold's refit",
    answer: (said: readonly Said[]) =>
      count(said, ".slip-fold") > 0
        ? { ...AT_REST, reserve: `${count(said, "--reserve-right")}px`, resizes: 2, ih: 2263, folded: true }
        : null,
  },
  {
    stuck: "the resize's refit never comes to rest",
    label: "Z13b the resize's refit",
    answer: (said: readonly Said[], reserve: string) =>
      overridden(said)
        ? { ...AT_REST, reserve, resizes: 1, ih: 600, sheet: 443.9 + count(said, "--reserve-right") }
        : null,
  },
  {
    stuck: "the refit back never comes to rest",
    label: "Z13b the refit back",
    answer: (said: readonly Said[], reserve: string) =>
      count(said, "clearDeviceMetricsOverride") > 0
        ? { ...AT_REST, reserve, resizes: 2, ih: 2263, sheet: 792.6 + count(said, "--reserve-right") }
        : null,
  },
  {
    stuck: "the slip never folds",
    label: "Z13c the fold's refit",
    answer: (said: readonly Said[]) =>
      count(said, ".slip-fold") > 0 ? { ...AT_REST, reserve: "0px", resizes: 2, ih: 2263 } : null,
  },
  {
    stuck: "the slip never unfolds",
    label: "Z13c the unfold's refit",
    answer: (said: readonly Said[]) =>
      count(said, '.slip-tab").click()') > 0
        ? { ...AT_REST, reserve: "487.4px", resizes: 2, ih: 2263, folded: true }
        : count(said, ".slip-fold") > 0
          ? { ...AT_REST, reserve: "0px", resizes: 2, ih: 2263, folded: true }
          : null,
  },
  {
    stuck: "the unfold's refit never lands",
    label: "Z13c the unfold's refit",
    answer: (said: readonly Said[]) =>
      count(said, '.slip-tab").click()') > 0
        ? { ...AT_REST, reserve: "0px", resizes: 2, ih: 2263 }
        : count(said, ".slip-fold") > 0
          ? { ...AT_REST, reserve: "0px", resizes: 2, ih: 2263, folded: true }
          : null,
  },
  {
    stuck: "the unfold's refit never comes to rest",
    label: "Z13c the unfold's refit",
    answer: (said: readonly Said[]) =>
      count(said, '.slip-tab").click()') > 0
        ? { ...AT_REST, reserve: `${count(said, "--reserve-right")}px`, resizes: 2, ih: 2263 }
        : count(said, ".slip-fold") > 0
          ? { ...AT_REST, reserve: "0px", resizes: 2, ih: 2263, folded: true }
          : null,
  },
] as const;

for (const { stuck, label, answer } of REFITS) {
  test(`Z13b and Z13c wait for the refit when ${stuck}, time out naming the wait, and give the window and the slip back`, async () => {
    const { ctx, said } = recording((expression, so) => {
      if (!expression.includes("--reserve-right")) return {};
      const resizes = count(so, "setDeviceMetricsOverride") + count(so, "clearDeviceMetricsOverride");
      return answer(so, "487.4px") ?? { ...AT_REST, reserve: "487.4px", resizes, ih: overridden(so) ? 600 : 2263 };
    });
    await assert.rejects(z13dRefitHolds(ctx), (err: Error) => err.message.startsWith(`settle timeout ${label}: `));
    assert.equal(
      lastOf(said, "send"),
      "Emulation.clearDeviceMetricsOverride",
      "the override was not cleared after the wait gave up",
    );
    assert.match(
      lastOf(said, "evaluate"),
      /classList\.contains\("folded"\)\)document\.querySelector\("\.slip-tab"\)\.click\(\)/,
    );
  });
}

const refitFlow = (
  walksAt: "resize" | "back" | "fold" | "unfold" | null,
  moved: { fx: number } | { fy: number } | { sk: number } = { fx: 0.5005 },
) =>
  recording((expression, so) => {
    if (!expression.includes("--reserve-right")) return {};
    const walk = (at: "resize" | "back" | "fold" | "unfold") => (walksAt === at ? moved : {});
    if (count(so, '.slip-tab").click()') > 0)
      return { ...AT_REST, reserve: "487.4px", resizes: 2, ih: 2263, ...walk("unfold") };
    if (count(so, ".slip-fold") > 0)
      return { ...AT_REST, reserve: "0px", resizes: 2, ih: 2263, sheet: 1280, folded: true, ...walk("fold") };
    if (overridden(so)) return { ...AT_REST, reserve: "487.4px", resizes: 1, ih: 600, sheet: 443.9, ...walk("resize") };
    const cleared = count(so, "clearDeviceMetricsOverride") > 0;
    return { ...AT_REST, reserve: "487.4px", resizes: cleared ? 2 : 0, ih: 2263, ...(cleared ? walk("back") : {}) };
  });
for (const [walksAt, z13b, z13c] of [
  [null, true, true],
  ["resize", false, true],
  ["fold", true, false],
] as const) {
  test(`Z13b reads ${z13b} and Z13c ${z13c} when the camera's framing ${walksAt === null ? "holds" : `walks at the ${walksAt} while the hash still reads 0.5000`}`, async () => {
    const { ctx, checked } = refitFlow(walksAt);
    await z13dRefitHolds(ctx);
    assert.deepEqual(
      checked.filter((c) => c.code === "Z13b" || c.code === "Z13c"),
      [
        { code: "Z13c", ok: z13c },
        { code: "Z13b", ok: z13b },
      ],
    );
  });
}

test("Z13b reads false and Z13c true when the camera's framing walks down at the resize while the hash still reads 0.5000", async () => {
  const { ctx, checked } = refitFlow("resize", { fy: 0.5005 });
  await z13dRefitHolds(ctx);
  assert.deepEqual(
    checked.filter((c) => c.code === "Z13b" || c.code === "Z13c"),
    [
      { code: "Z13c", ok: true },
      { code: "Z13b", ok: false },
    ],
  );
});

for (const [walksAt, z13b, z13c] of [
  ["resize", false, true],
  ["back", false, true],
  ["fold", true, false],
  ["unfold", true, false],
] as const) {
  test(`Z13b reads ${z13b} and Z13c ${z13c} when the camera's depth walks at the ${walksAt} while the hash still reads 4.0000`, async () => {
    const { ctx, checked } = refitFlow(walksAt, { sk: 3 });
    await z13dRefitHolds(ctx);
    assert.deepEqual(
      checked.filter((c) => c.code === "Z13b" || c.code === "Z13c"),
      [
        { code: "Z13c", ok: z13c },
        { code: "Z13b", ok: z13b },
      ],
    );
  });
}

test("Z13b and Z13c take the sheet before the resize at rest, not while the page still lays out after the shot before it", async () => {
  const { ctx, checked } = refitFlow(null);
  let reads = 0;
  const settling = {
    ...ctx,
    evaluate: async (expression: string): Promise<unknown> => {
      const read = await ctx.evaluate<object>(expression);
      return expression.includes("--reserve-right") && reads++ === 0 ? { ...read, sheet: 780 } : read;
    },
  } as unknown as SuiteContext;
  await z13dRefitHolds(settling);
  assert.deepEqual(
    checked.filter((c) => c.code === "Z13b" || c.code === "Z13c"),
    [
      { code: "Z13c", ok: true },
      { code: "Z13b", ok: true },
    ],
  );
});

for (const [freeMs, perfMs, offMain] of [
  [366, 364, true],
  [614, 414, true],
  [1086, 1308, true],
  [374, 1543, false],
  [621, 1643, false],
  [-1, 400, false],
  [400, -1, false],
  [400, 990, true],
  [400, 1010, false],
] as const) {
  test(`Z20c reads ${perfMs}ms throttled against ${freeMs}ms unthrottled as ${offMain ? "off" : "on"} the main thread`, () => {
    assert.equal(offMainThread(freeMs, perfMs), offMain);
  });
}

const zoomKitAnswering = (captions: readonly (number | Error)[]) => {
  const { ctx, said, checked } = recording(() => ({}));
  let redrafts = 0;
  let caption = 0;
  const k = {
    ...ctx,
    rgn: () => Promise.resolve({ redrafts }),
    goHome: () => Promise.resolve(),
    enterAt: () => Promise.resolve(undefined),
    waitRedraft: () => Promise.resolve({ redrafts: ++redrafts }),
    captionMs: () => {
      const c = captions[caption++];
      return c instanceof Error ? Promise.reject(c) : Promise.resolve(c);
    },
  } as unknown as ZoomKit;
  return { k, said, checked };
};

test("Z20c holds the throttled redraft against an unthrottled one in the same run, not against a wall-clock cap", async () => {
  const onMain = zoomKitAnswering([400, 1700]);
  await z20cThrottle(onMain.k);
  assert.deepEqual(onMain.checked, [{ code: "Z20c", ok: false }]);
  const offMain = zoomKitAnswering([400, 420]);
  await z20cThrottle(offMain.k);
  assert.deepEqual(offMain.checked, [{ code: "Z20c", ok: true }]);
});

test("Z20c puts the CPU throttle back when a read under it throws", async () => {
  const gone = new Error("caption gone");
  const { k, said } = zoomKitAnswering([400, gone]);
  await assert.rejects(z20cThrottle(k), (err: unknown) => err === gone);
  assert.equal(
    lastOf(said, "send"),
    "Emulation.setCPUThrottlingRate 1",
    "the throttle was left on for the checks after Z20c",
  );
});

test("Z20c draws its first redraft before the 4x CPU throttle and its second under it, so a redraft on the main thread fails", async () => {
  const { k, said, checked } = zoomKitAnswering([]);
  const rate = () =>
    Number(
      said
        .filter((s) => s.what.startsWith("Emulation.setCPUThrottlingRate "))
        .at(-1)
        ?.what.split(" ")[1] ?? 1,
    );
  const drawnAt: number[] = [];
  const onMain = {
    ...k,
    waitRedraft: (prev: number) => {
      drawnAt.push(rate());
      return k.waitRedraft(prev);
    },
    captionMs: () => Promise.resolve(400 * (drawnAt.at(-1) ?? 1)),
  };
  await z20cThrottle(onMain);
  assert.deepEqual(drawnAt, [1, 4], "the CPU rate in force while each redraft was drawn");
  assert.deepEqual(checked, [{ code: "Z20c", ok: false }]);
});

test("Z20c fails when the unthrottled redraft never lands, whatever the throttled one reads", async () => {
  const { k, checked } = zoomKitAnswering([400, 420]);
  let waits = 0;
  const stalled = {
    ...k,
    waitRedraft: (prev: number) => (waits++ === 0 ? k.rgn() : k.waitRedraft(prev)),
  };
  await z20cThrottle(stalled);
  assert.deepEqual(checked, [{ code: "Z20c", ok: false }]);
});

const drawerKitAnswering = (rest: (reads: number) => unknown) => {
  const { ctx, said } = recording((expression, so) =>
    expression.includes("__cd2bFrame") && expression.includes("dog-ear") ? rest(count(so, "dog-ear")) : {},
  );
  return { k: { ...ctx, settle: makeSettle(ctx) } as unknown as DrawerKit, said };
};
const EAR = { iw: 1280, ih: 800, cam: { x: -2812, y: -1629, k: 8 } };

for (const [stuck, rest] of [
  [
    "the ear keeps moving",
    (reads: number) => ({ ...EAR, frame: reads, ear: { x: 905 + reads, y: 115.7, w: 54.4, h: 54.4 } }),
  ],
  ["no frame is painted", () => ({ ...EAR, frame: 0, ear: { x: 905, y: 115.7, w: 54.4, h: 54.4 } })],
  [
    "the window keeps the shot's height",
    (reads: number) => ({ ...EAR, ih: 2263, frame: reads, ear: { x: 905, y: 115.7, w: 54.4, h: 54.4 } }),
  ],
  [
    "the window is not back at its width",
    (reads: number) => ({ ...EAR, iw: 1440, frame: reads, ear: { x: 905, y: 115.7, w: 54.4, h: 54.4 } }),
  ],
  ["the ear is not there", (reads: number) => ({ ...EAR, frame: reads, ear: null })],
  [
    "the camera keeps moving",
    (reads: number) => ({
      ...EAR,
      cam: { ...EAR.cam, x: EAR.cam.x - reads },
      frame: reads,
      ear: { x: 905, y: 115.7, w: 54.4, h: 54.4 },
    }),
  ],
] as const) {
  test(`CD2b waits for the ear to rest across a painted frame after the shot when ${stuck}, and hit-tests nothing before it`, async () => {
    const { k, said } = drawerKitAnswering(rest);
    await assert.rejects(cd2bRealPointer(k, { x: 920, y: 130 }), (err: Error) =>
      err.message.startsWith("settle timeout CD2b the ear at rest after the shot: "),
    );
    assert.equal(count(said, "elementFromPoint"), 0, "the hit test ran before the ear was at rest");
    assert.equal(lastOf(said, "evaluate"), "window.__cd2bFrame = -1", "the frame count was left running");
  });
}
