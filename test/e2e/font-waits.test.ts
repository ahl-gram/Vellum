import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { cardsKit } from "../../e2e/suites/cards/kit.ts";
import { holdKit, MARKS } from "../../e2e/suites/cards/hold.ts";
import { SWEEP } from "../../e2e/suites/cards/reads.ts";
import { restAt } from "../../e2e/suites/corners.ts";
import { pr40RunnerLayout, STAGED } from "../../e2e/suites/print-room/runner-layout.ts";
import { ROOMS } from "../../e2e/suites/slide-away/kit.ts";
import { LINES_OF, slipInk } from "../../e2e/suites/specimen/slip-ink.ts";
import { withFonts } from "../../e2e/support/fonts.ts";
import { RUNNER_NUMERO_FAMILY, RUNNER_SELECTS } from "../../e2e/support/runner-layout.ts";
import { makeSettle } from "../../e2e/support/settle.ts";
import { recording, type Said } from "../../test-support/recording-ctx.ts";

const asksOf = (said: readonly Said[], expression: string): number => said.filter((s) => s.what === expression).length;
const apart = (said: readonly Said[], measuring: string): string[] =>
  said
    .filter((s) => s.kind === "evaluate" && s.what.includes("document.fonts.status") && s.what !== measuring)
    .map((s) => s.what);

test("withFonts reads the fonts' status after the read it wraps, runs the read once and hands it back whole (Issue #1447)", () => {
  let laid = 0;
  const page = vm.createContext({
    layout: () => ++laid && { h: 7 },
    document: {
      fonts: {
        get status() {
          return laid > 0 ? "after the read" : "before the read";
        },
      },
    },
  });
  assert.deepEqual(JSON.parse(JSON.stringify(vm.runInContext(withFonts("layout()"), page))), {
    read: { h: 7 },
    fonts: "after the read",
  });
  assert.equal(laid, 1);
});

const swept = (h: number) => ({
  boxW: 1440,
  boxH: 272,
  rows: [{ want: "Salzin", got: "Salzin", shown: true, h, over: h - 272 }],
});

test("P19's sweep is judged on the sweep whose own layout found every face loaded, never after the status alone (Issue #1447)", async () => {
  let n = 0;
  const r = recording((expression) => {
    if (expression === withFonts(SWEEP))
      return { read: swept(n === 0 ? 260.53 : 260.52), fonts: ++n === 1 ? "loading" : "loaded" };
    if (expression === SWEEP) return swept(260.53);
    return "loaded";
  });
  const k = cardsKit({
    ...r.ctx,
    setNarrowViewport: () => Promise.resolve(),
    waitReady: () => Promise.resolve(true),
    settle: makeSettle(r.ctx),
  });
  const got = await k.sweepAt();
  assert.deepEqual(got, swept(260.52), "P19 measured the cards before the face they asked for had loaded");
  assert.equal(asksOf(r.said, withFonts(SWEEP)), 2);
  assert.deepEqual(apart(r.said, withFonts(SWEEP)), []);
});

test("the hold kit boots on the marks read whose own layout found every face loaded, never after the status alone (Issue #1447)", async () => {
  const mark = (x: number) => [{ idx: 0, name: "Kralgov", x, y: 100 }];
  let n = 0;
  const r = recording((expression) => {
    if (expression === withFonts(MARKS)) return { read: mark(n + 1), fonts: ++n === 1 ? "loading" : "loaded" };
    if (expression === MARKS) return mark(1);
    return "loaded";
  });
  const marks = await holdKit({
    ...r.ctx,
    setTouch: () => Promise.resolve(),
    waitReady: () => Promise.resolve(true),
    settle: makeSettle(r.ctx),
  }).boot(false);
  assert.deepEqual(marks, mark(2), "the hold kit read its marks before the face the page asked for had loaded");
  assert.equal(asksOf(r.said, withFonts(MARKS)), 2);
  assert.deepEqual(apart(r.said, withFonts(MARKS)), []);
});

test("SB20 reads each slip line in the read whose own layout found every face loaded (Issue #1447)", async () => {
  const bare = LINES_OF("note", ".slip .note", 0);
  const measuring = withFonts(bare);
  let n = 0;
  const r = recording((expression) => {
    if (expression === measuring) return { read: [], fonts: ++n === 1 ? "loading" : "loaded" };
    if (expression === bare) return [];
    if (expression.startsWith("document.querySelectorAll(")) return 1;
    if (expression.includes("getAnimations({ subtree: true })")) return { op: 1, running: 0 };
    return true;
  });
  const reads = await slipInk(r.ctx, [["note", ".slip .note"]], "t1447");
  assert.equal(asksOf(r.said, measuring), 2, "SB20 read the slip's lines before the face they asked for had loaded");
  assert.deepEqual(reads, []);
  assert.deepEqual(apart(r.said, measuring), []);
});

const stagedRoom = (i: number) => ({
  path: ROOMS[i]!.path.split("#")[0],
  ready: "complete",
  selects: RUNNER_SELECTS.map((s) => ({ selector: s.selector, heights: [50] })),
  first: RUNNER_NUMERO_FAMILY,
  face: true,
});

test("PR40 judges each room on the read whose own layout found every face loaded (Issue #1447)", async () => {
  const asks = ROOMS.map(() => 0);
  let room = 0;
  const r = recording((expression) => {
    if (expression === withFonts(STAGED)) {
      const read = stagedRoom(room);
      if (++asks[room]! === 1) return { read, fonts: "loading" };
      room++;
      return { read, fonts: "loaded" };
    }
    if (expression === STAGED) return { ...stagedRoom(room++), fonts: "loaded" };
    return {};
  });
  await pr40RunnerLayout(r.ctx);
  assert.deepEqual(
    asks,
    ROOMS.map(() => 2),
    "PR40 judged a room on a read taken before its faces had loaded",
  );
  assert.deepEqual(r.checked, [{ code: "PR40", ok: true }]);
  assert.deepEqual(apart(r.said, withFonts(STAGED)), []);
});

type Rested = {
  restedAt: number | null;
  read: { vw: number } | null;
  error: { message: string } | null;
  unlaid: number;
};

const cornersRest = async (status: (nth: number) => string): Promise<Rested> => {
  const queued: (() => void)[] = [];
  let reads = 0;
  let laid = 0;
  let unlaid = 0;
  const box = {
    getBoundingClientRect: () => {
      laid++;
      return { left: 0, top: 0, right: 10, bottom: 10, width: 1280, height: 10 };
    },
    querySelectorAll: () => [],
  };
  const page = vm.createContext({
    innerWidth: 1280,
    NodeFilter: { SHOW_TEXT: 4 },
    matchMedia: () => ({ matches: true }),
    getComputedStyle: () => ({
      visibility: "visible",
      display: "block",
      opacity: "1",
      fontSize: "16px",
      getPropertyValue: () => "",
    }),
    requestAnimationFrame: (f: () => void) => void queued.push(f),
    document: {
      documentElement: { clientWidth: 1280, scrollWidth: 1280 },
      getElementById: (id: string) => (id === "co-vw" ? box : null),
      querySelector: (selector: string) =>
        selector === "header.chrome" || selector === ".corner.tr.folio-room" ? box : null,
      createTreeWalker: () => ({ nextNode: () => null }),
      fonts: {
        get status() {
          if (laid === 0) unlaid++;
          laid = 0;
          return status(++reads);
        },
      },
    },
  });
  const out: Rested = { restedAt: null, read: null, error: null, unlaid: 0 };
  let frame = 0;
  const rest = vm.runInContext(restAt(1280), page) as Promise<{ vw: number }>;
  rest.then(
    (r) => {
      out.read = r;
      out.restedAt = frame;
    },
    (e: unknown) => {
      out.error = e as { message: string };
    },
  );
  while (frame < 45 && out.restedAt === null && out.error === null) {
    frame++;
    queued.splice(0).forEach((f) => f());
    await new Promise((resolve) => setImmediate(resolve));
  }
  out.unlaid = unlaid;
  return out;
};

test("the corners rest only on frames whose own layout found the faces loaded (Issue #1447)", async () => {
  const got = await cornersRest((n) => (n <= 3 ? "loading" : "loaded"));
  assert.equal(got.restedAt, 5, "the corners rested on a frame read while a face was still loading");
  assert.equal(got.read!.vw, 1280);
  assert.equal("fonts" in got.read!, false);
  assert.equal(got.unlaid, 0, "the corners read the fonts' status before the layout that asks for them");
});

test("the corners name the faces when they never load, and do not rest (Issue #1447)", async () => {
  const got = await cornersRest(() => "loading");
  assert.equal(got.restedAt, null);
  assert.ok(got.error!.message.startsWith("no rest at 1280: "), got.error!.message);
  assert.ok(got.error!.message.includes('"fonts":"loading"'), got.error!.message);
});
