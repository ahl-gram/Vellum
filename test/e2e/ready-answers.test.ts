import { test } from "node:test";
import assert from "node:assert/strict";
import type { Cam } from "../../e2e/support/home.ts";
import type { makeRoom } from "../../e2e/support/room.ts";
import type { makeStep } from "../../e2e/support/step.ts";
import { h14aCardFits } from "../../e2e/suites/home/stations.ts";
import { l13Home, l9Touch } from "../../e2e/suites/landfall.ts";
import type { LandfallKit } from "../../e2e/suites/landfall/kit.ts";
import { l5HowOpens } from "../../e2e/suites/landfall/panel.ts";
import { ra2Clamps, ra3Survey, ra7Counter } from "../../e2e/suites/room-address.ts";
import type { SpecimenKit } from "../../e2e/suites/specimen/kit.ts";
import { sb19SlidFromRest } from "../../e2e/suites/specimen/slid.ts";
import type { SuiteContext } from "../../e2e/types.ts";

type Checked = { code: string | undefined; ok: boolean };

const READ_THE_PAGE = "the step read the page";
const LANDED: Cam = { veil: false, lifting: false, status: null, scale: 1.72, x: 0, y: 0, fit: 1, expected: 1.72 };
const VEILED: Cam = { veil: true, lifting: false, status: "Landfall", scale: 1.1, x: 0, y: 0, fit: 1, expected: 1.72 };
const unsettled = (label: string) => `${label}: home never settled at its landfall: ${JSON.stringify(VEILED)}`;

function page(answer: (expression: string) => unknown) {
  const checked: Checked[] = [];
  const ctx = {
    evaluate: (expression: string): Promise<unknown> => {
      const a = answer(expression);
      return a instanceof Error ? Promise.reject(a) : Promise.resolve(a);
    },
    send: (): Promise<unknown> => Promise.resolve({}),
    sleep: (): Promise<void> => Promise.resolve(),
    check: (name: string, ok: unknown): void => void checked.push({ code: name.split(" ")[0], ok: !!ok }),
    shoot: (): Promise<void> => Promise.resolve(),
    setMobileViewport: (): Promise<void> => Promise.resolve(),
    clearMobile: (): Promise<void> => Promise.resolve(),
    clickAt: (): Promise<void> => Promise.resolve(),
    PORT: 8765,
  } as unknown as SuiteContext;
  return { checked, ctx };
}

const VISITED = {
  scale: 2.6,
  fit: 1,
  anchorX: 400,
  anchorY: 300,
  stageW: 1000,
  stageH: 600,
  open: true,
  contained: true,
  anchorClear: true,
  enterReach: true,
  closeReach: true,
  controlsReach: true,
  title: "The Atlas of Rahai",
  enter: "atlas/",
  arms: 3,
};

test("H14a fails when settleHome's answer never reached its landfall, though the flight it reads passes", async () => {
  const at = page(() => null);
  await h14aCardFits(at.ctx, LANDED, { x: 10, y: 10 }, VISITED);
  const never = page(() => null);
  await h14aCardFits(never.ctx, VEILED, { x: 10, y: 10 }, VISITED);
  assert.deepEqual(
    at.checked,
    [{ code: "H14a", ok: true }],
    "the flight read does not pass, so this test proves nothing",
  );
  assert.deepEqual(never.checked, [{ code: "H14a", ok: false }], "H14a passed on a home that never settled");
});

const HOW = { open: true, focused: true, scrollTop: 0, max: 50 };
const howPage = () =>
  page((expression) =>
    expression.includes("scrollIntoView")
      ? { x: 10, y: 10 }
      : expression.includes("lf-card-how")
        ? HOW
        : "matrix(1, 0, 0, 1, 0, 0)",
  );

test("L5 fails when settleHome's answer never reached its landfall, though the panel it reads opens", async () => {
  const at = howPage();
  await l5HowOpens(at.ctx as unknown as LandfallKit, LANDED);
  const never = howPage();
  await l5HowOpens(never.ctx as unknown as LandfallKit, VEILED);
  assert.deepEqual(at.checked, [{ code: "L5", ok: true }], "the panel read does not pass, so this test proves nothing");
  assert.deepEqual(never.checked, [{ code: "L5", ok: false }], "L5 passed on a home that never settled");
});

type Step = ReturnType<typeof makeStep>;
function stepper(run: readonly string[]) {
  const failed: Record<string, string> = {};
  const step: Step = async (name, body) => {
    if (!run.includes(name)) return;
    try {
      await body();
      failed[name] = "passed";
    } catch (err) {
      failed[name] = err instanceof Error ? err.message : String(err);
    }
  };
  return { failed, step };
}

const landfallKit = (cam: Cam | null): LandfallKit =>
  ({
    ...page(() => new Error(READ_THE_PAGE)).ctx,
    settleHome: (): Promise<Cam | null> => Promise.resolve(cam),
  }) as unknown as LandfallKit;

test("L13 fails by name, carrying the camera, when settleHome's answer never reached its landfall, and reads nothing", async () => {
  const at = stepper(["L13"]);
  await l13Home(landfallKit(LANDED), at.step);
  const never = stepper(["L13"]);
  await l13Home(landfallKit(VEILED), never.step);
  assert.equal(at.failed["L13"], READ_THE_PAGE, "a settled home did not reach L13's own read");
  assert.equal(
    never.failed["L13"],
    unsettled("L13"),
    "L13 ran on a home that never settled, or failed for another reason",
  );
});

test("L9i and L9 touch given each fail by name, carrying the camera, when settleHome's answer on the tablet never reached its landfall, and read nothing", async () => {
  const codes = ["L9i", "L9 touch given"];
  const at = stepper(codes);
  await l9Touch(landfallKit(LANDED), at.step).catch(() => undefined);
  const never = stepper(codes);
  await l9Touch(landfallKit(VEILED), never.step).catch(() => undefined);
  for (const code of codes) {
    assert.equal(at.failed[code], READ_THE_PAGE, `a settled home did not reach ${code}'s own read`);
    assert.equal(
      never.failed[code],
      unsettled(code),
      `${code} ran on a home that never settled, or failed for another reason`,
    );
  }
});

test("SB19 fails by name when the Book never comes up at rest, and reads nothing after", async () => {
  const kit = (book: unknown): SpecimenKit =>
    ({
      ...page(() => new Error(READ_THE_PAGE)).ctx,
      goto: (): Promise<unknown> => Promise.resolve(book),
      setState: (): Promise<never> => Promise.reject(new Error(READ_THE_PAGE)),
    }) as unknown as SpecimenKit;
  await assert.rejects(
    sb19SlidFromRest(kit({ st: { state: "rest" } })),
    (err: Error) => err.message === READ_THE_PAGE,
    "a Book at rest did not reach SB19's own read",
  );
  await assert.rejects(
    sb19SlidFromRest(kit(null)),
    (err: Error) => err.message === "SB19: the Book never came up at rest",
    "SB19 ran on a Book that never came up, or failed for another reason",
  );
});

type Room = ReturnType<typeof makeRoom>;
const roomAnswering = (settled: boolean): Room => ({
  goto: (): Promise<boolean> => Promise.resolve(settled),
  boot: (): Promise<boolean> => Promise.resolve(settled),
  settled: (): Promise<boolean> => Promise.resolve(settled),
});

const SM = { present: 1200, minFounded: 300, count: 40 };
const MID = 750;

type Dropper = {
  code: string;
  passing: (expression: string) => unknown;
  run: (ctx: SuiteContext, settled: boolean) => Promise<void>;
};

const DROPPERS: readonly Dropper[] = [
  {
    code: "RA2",
    passing: () => ({ year: 1200, readout: "year 1200", hashYear: "1200" }),
    run: (ctx, settled) => ra2Clamps(ctx, roomAnswering(settled), SM),
  },
  {
    code: "RA3",
    passing: () => ({
      chamber: "survey",
      t: 1,
      ports: 3,
      first: "1,1",
      last: "1,1",
      pts: 9,
      logged: 4,
      rows: 4,
      visible: true,
      status: "",
      hash: "seed=42&style=antique&survey",
    }),
    run: (ctx, settled) => ra3Survey(ctx, roomAnswering(settled)),
  },
  {
    code: "RA7",
    passing: (expression) =>
      expression.includes("__vellumReadingRoomState")
        ? { seed: 100, status: "", chamber: "ages", year: 1500, max: 1500, hash: "seed=100&style=antique&year=1500" }
        : expression.includes(".rr-colophon")
          ? true
          : String(MID),
    run: (ctx, settled) => ra7Counter(ctx, roomAnswering(settled), MID),
  },
];

for (const { code, passing, run } of DROPPERS) {
  test(`${code} fails when the shared room's goto answers that the room never settled, though its own read passes`, async () => {
    const at = page(passing);
    await run(at.ctx, true);
    const never = page(passing);
    await run(never.ctx, false);
    assert.deepEqual(at.checked, [{ code, ok: true }], `${code}'s own read does not pass, so this test proves nothing`);
    assert.deepEqual(
      never.checked,
      [{ code, ok: false }],
      `${code} passed on a room the shared goto said never settled`,
    );
  });
}
