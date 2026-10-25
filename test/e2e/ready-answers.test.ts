import { test } from "node:test";
import assert from "node:assert/strict";
import type { Cam } from "../../e2e/support/home.ts";
import type { makeRoom } from "../../e2e/support/room.ts";
import type { makeStep } from "../../e2e/support/step.ts";
import { cl1Wash } from "../../e2e/suites/cluster.ts";
import { h0Frame } from "../../e2e/suites/home/frame.ts";
import { homeKit } from "../../e2e/suites/home/kit.ts";
import { h14aCardFits } from "../../e2e/suites/home/stations.ts";
import { l13Home, l9Touch } from "../../e2e/suites/landfall.ts";
import type { LandfallKit } from "../../e2e/suites/landfall/kit.ts";
import { l5HowOpens } from "../../e2e/suites/landfall/panel.ts";
import { ra2Clamps, ra3Survey, ra4Ignored, ra6Reduced, ra7Counter } from "../../e2e/suites/room-address.ts";
import { rs18Silent } from "../../e2e/suites/room-ink.ts";
import { rv11Seed39, rv12Landmasses } from "../../e2e/suites/room-voyage-route.ts";
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

const LOADED = `document.readyState === "complete" && !!document.getElementById("seed-form")`;
const VEIL = `!!document.getElementById("lf-veil")`;
const FRAME = {
  pos: "absolute",
  right: 30,
  top: 30,
  inside: true,
  gold: "rgb(240, 227, 189)",
  doorsHidden: true,
};
const HERO = { hook: "Give Vellum a number.\nIt gives you back a world.", seed: "42", lineStyle: "italic" };
const homePage = (veilUp: boolean) =>
  page((expression) =>
    expression === LOADED
      ? true
      : expression === VEIL
        ? veilUp
        : expression.includes(`getElementById("seed-form")`)
          ? FRAME
          : expression.includes(".seed-hook")
            ? HERO
            : null,
  );

test("H1 and H2 read the corner chrome only once home's first veil is down, so a veil that never lifts reds them though their own reads pass", async () => {
  const lifted = homePage(false);
  await h0Frame(homeKit(lifted.ctx));
  assert.deepEqual(
    lifted.checked,
    [
      { code: "H0", ok: true },
      { code: "H1", ok: true },
      { code: "H2", ok: true },
    ],
    "the frame's own reads do not pass, so this test proves nothing",
  );
  const stuck = homePage(true);
  await h0Frame(homeKit(stuck.ctx));
  assert.deepEqual(
    stuck.checked,
    [
      { code: "H0", ok: true },
      { code: "H1", ok: false },
      { code: "H2", ok: false },
    ],
    "H1 or H2 passed on a page whose veil never lifted",
  );
});

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

const WASH = {
  filter: "blur(8px)",
  bg: "rgba(18, 14, 10, 0.85)",
  image: "none",
  box: { left: -40, top: -40, right: 532, bottom: 152 },
  nav: { right: 500, bottom: 100 },
  foot: { bottom: 120 },
  cluster: { right: 520, bottom: 140, left: 0, top: 0 },
};

test("CL1 fails when settleHome's answer never reached its landfall, though the wash it reads passes", async () => {
  const at = page(() => WASH);
  await cl1Wash(at.ctx, () => Promise.resolve(LANDED));
  const never = page(() => WASH);
  await cl1Wash(never.ctx, () => Promise.resolve(VEILED));
  assert.deepEqual(at.checked, [{ code: "CL1", ok: true }], "the wash read does not pass, so this test proves nothing");
  assert.deepEqual(never.checked, [{ code: "CL1", ok: false }], "CL1 passed on a home that never settled");
});

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
const FACTS = { present: 1200 } as unknown as Parameters<typeof rs18Silent>[2];

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
    code: "RA4",
    passing: () => ({ chamber: "ages", year: 1200, hash: "seed=42&style=antique&year=1200" }),
    run: (ctx, settled) => ra4Ignored(ctx, roomAnswering(settled), SM, MID),
  },
  {
    code: "RA6",
    passing: () => ({ val: MID, playing: false, play: "Play", status: "" }),
    run: (ctx, settled) => ra6Reduced(ctx, roomAnswering(settled), MID),
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
  {
    code: "RS18",
    passing: () => 0,
    run: (ctx, settled) => rs18Silent(ctx, () => Promise.resolve(1200), FACTS, settled),
  },
  {
    code: "RV11",
    passing: () => ({
      handoffs: 2,
      embFrom: 0.5,
      landTo: 0.5,
      ridesToShore: "rider",
      sails: "ship",
      ridesFromLandfall: "rider",
      narrated: true,
    }),
    run: (ctx, settled) => rv11Seed39(ctx, roomAnswering(settled)),
  },
  {
    code: "RV12",
    passing: () => ({ legs: 12, road: 10, sea: 2, straight: 0 }),
    run: (ctx, settled) => rv12Landmasses(ctx, roomAnswering(settled)),
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
