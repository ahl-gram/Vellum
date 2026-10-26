import { test } from "node:test";
import assert from "node:assert/strict";
import { cd46ReducedCarry } from "../../e2e/suites/chart-drawer/drag.ts";
import { dragKit, drawerKit, tableKit } from "../../e2e/suites/chart-drawer/kit.ts";
import { CARRY, FOLDREST, type Card } from "../../e2e/suites/chart-drawer/reads.ts";
import { makeSettle } from "../../e2e/support/settle.ts";
import type { SuiteContext } from "../../e2e/types.ts";
import { fakePage, type FakeFrame, type FakePage } from "../../test-support/fake-page.ts";

const kitOn = (page: Pick<FakePage, "evaluate">, answer: (expression: string) => unknown = () => undefined) => {
  const evaluate = (expression: string): Promise<unknown> => {
    const answered = answer(expression);
    return answered === undefined ? page.evaluate(expression) : Promise.resolve(answered);
  };
  const sent: [string, unknown][] = [];
  const ctx = {
    evaluate,
    send: (method: string, params: unknown) => {
      sent.push([method, params]);
      return Promise.resolve({});
    },
    sleep: () => Promise.resolve(),
    check: () => {},
    PORT: 8765,
  } as unknown as SuiteContext;
  const k = drawerKit({ ...ctx, settle: makeSettle(ctx) });
  const released: [number, number][] = [];
  const kd = dragKit({
    ...k,
    press: () => Promise.resolve(),
    moveTo: () => Promise.resolve(),
    release: (x: number, y: number) => {
      released.push([x, y]);
      return Promise.resolve();
    },
  });
  return { k, kd, kt: tableKit(kd), released, sent };
};
const statesOf = (page: FakePage, selector: string): string[] =>
  page.asked.filter((a) => a.selector === selector).map((a) => a.anims.join());
const RAN = ["running", "running", "running", "finished", "finished"];

const booting = (clock: number, from: number): FakeFrame => ({
  nodes: {
    "#map svg": {},
    "#chart-drawer": {},
    ".stage": { rect: [0, 0, 1280, 800] },
    "#map > svg": {
      rect: [45, clock < from ? 160 - clock : 145, 703, 543],
      anims: [clock < from ? "running" : "finished"],
    },
    ".slip": { rect: [864, 147, 384, 564] },
  },
});

test("go hands the Explorer over only once the chart's arrival has finished and the sheet stands still", async () => {
  const page = fakePage((clock) => booting(clock, 6));
  await assert.doesNotReject(kitOn(page).k.go("seed=42"));
  assert.deepEqual(statesOf(page, "#map > svg"), RAN);
});

test("go times out naming the address when the chart's arrival never finishes", async () => {
  const page = fakePage((clock) => booting(clock, Infinity));
  await assert.rejects(kitOn(page).k.go("seed=42"), (err: Error) =>
    err.message.startsWith("settle timeout the Explorer booted at #seed=42: "),
  );
});

const HIT_1 = { '.place-overlay .place-hit[data-idx="1"]': { rect: [400, 300, 20, 20] } } as const;
const HIT_2 = { '.place-overlay .place-hit[data-idx="2"]': { rect: [700, 420, 20, 20] } } as const;
const unfurling = (clock: number, from: number): FakeFrame => ({
  nodes: {
    ...HIT_1,
    "#place-card": { classes: clock <= 2 ? [] : ["pinned"] },
    ...(clock <= 2
      ? {}
      : {
          "#place-card .pc-inner": {
            rect: [351, clock < from ? 300 - clock : 273, 256, 235],
            anims: [clock < from ? "running" : "finished"],
          },
        }),
  },
});
const LATE = ["finished", "finished", "running", "running", "running", "finished", "finished"];

test("pinCard hands back only once the pinned card's unfurl has finished", async () => {
  const page = fakePage((clock) => unfurling(clock, 6));
  await assert.doesNotReject(kitOn(page).k.pinCard(1));
  assert.deepEqual(statesOf(page, "#place-card .pc-inner"), RAN);
});

test("pinCard times out naming the place when the card never finishes unfurling", async () => {
  const page = fakePage((clock) => unfurling(clock, Infinity));
  await assert.rejects(kitOn(page).k.pinCard(1), (err: Error) =>
    err.message.startsWith("settle timeout the card pinned at place 1: "),
  );
});

test("pinCard onto a card already pinned at another place waits for the card to reach it, never settling on the finished roll the card already held", async () => {
  const page = fakePage((clock) => ({
    nodes: {
      ...HIT_2,
      "#place-card": { classes: ["pinned"] },
      "#place-card .pc-inner": {
        rect: clock <= 4 ? [351, 273, 256, 235] : [651, clock < 8 ? 420 - clock : 393, 256, 235],
        anims: [clock <= 4 || clock >= 8 ? "finished" : "running"],
      },
    },
  }));
  await assert.doesNotReject(kitOn(page).k.pinCard(2));
  assert.deepEqual(statesOf(page, "#place-card .pc-inner"), LATE);
});

test("pinCard on a card a hover already showed waits for the pin, never settling on the hover's finished roll", async () => {
  const page = fakePage((clock) => ({
    nodes: {
      ...HIT_1,
      "#place-card": { classes: clock <= 4 ? [] : ["pinned"] },
      "#place-card .pc-inner": {
        rect: [351, clock <= 4 || clock >= 8 ? 273 : 300 - clock, 256, 235],
        anims: [clock <= 4 || clock >= 8 ? "finished" : "running"],
      },
    },
  }));
  await assert.doesNotReject(kitOn(page).k.pinCard(1));
  assert.deepEqual(statesOf(page, "#place-card .pc-inner"), LATE);
});

const sliding = (clock: number, from: number, opensAt: number): FakeFrame => ({
  nodes: {
    "#chart-drawer-tab": {},
    "#chart-drawer":
      clock <= opensAt
        ? { rect: [0, 0, 0, 0] }
        : {
            classes: ["open"],
            rect: [0, clock < from ? 800 - clock * 40 : 552, 1280, 248],
            anims: [clock < from ? "running" : "finished"],
          },
  },
});
const PRESS = { press: { box: { x: 500, y: 400, w: 120, h: 30 } } } as unknown as Card;

test("pressCard hands back only once the drawer the press opened has finished sliding up", async () => {
  const page = fakePage((clock) => sliding(clock, 5, 1));
  await assert.doesNotReject(kitOn(page).k.pressCard(PRESS));
  assert.deepEqual(statesOf(page, "#chart-drawer"), RAN);
});

test("pressCard times out naming the drawer when it never finishes sliding up", async () => {
  const page = fakePage((clock) => sliding(clock, Infinity, 1));
  await assert.rejects(kitOn(page).k.pressCard(PRESS), (err: Error) =>
    err.message.startsWith("settle timeout the drawer after the card's press: "),
  );
});

test("pressCard on a drawer already open waits for nothing, since its press moves nothing of the drawer's", async () => {
  const page = fakePage(() => sliding(9, 0, 0));
  await assert.doesNotReject(kitOn(page).k.pressCard(PRESS));
  assert.deepEqual({ reads: page.said.length, drawer: statesOf(page, "#chart-drawer") }, { reads: 1, drawer: [] });
});

test("openDrawer hands back only once the drawer has finished sliding up", async () => {
  const page = fakePage((clock) => sliding(clock, 5, 0));
  await assert.doesNotReject(kitOn(page).kt.openDrawer());
  assert.deepEqual(statesOf(page, "#chart-drawer"), RAN);
});

test("openDrawer times out naming the drawer when it never finishes sliding up", async () => {
  const page = fakePage((clock) => sliding(clock, Infinity, 0));
  await assert.rejects(kitOn(page).kt.openDrawer(), (err: Error) =>
    err.message.startsWith("settle timeout the drawer opened by its tab: "),
  );
});

const EAR = fakePage(() => ({ nodes: { "#map .region-inset .dog-ear": { rect: [905, 116, 54, 54] } } }));
const ghost = (x: number) => ({ ghost: { tag: "IMG", translate: `${x}px 290px` }, drag: true, open: false });

test("carry reads the carry mid-flight only once two reads of it agree", async () => {
  const reads: unknown[] = [{ ghost: null, drag: false, open: false }, ghost(478), ghost(478), ghost(999)];
  const { kd } = kitOn(EAR, (expression) => (expression === CARRY ? reads.shift() : undefined));
  const carried = await kd.carry({ x: 640, y: 300 }).catch((err: unknown) => ({ mid: err }));
  assert.deepEqual(carried.mid, ghost(478));
  assert.equal(reads.length, 1);
});

test("carry times out naming itself when the carry never holds still, and lets the button go first", async () => {
  let x = 0;
  const { kd, released } = kitOn(EAR, (expression) => (expression === CARRY ? ghost(x++) : undefined));
  await assert.rejects(kd.carry({ x: 640, y: 300 }), (err: Error) =>
    err.message.startsWith("settle timeout the carry held over its target: "),
  );
  assert.deepEqual(released, [[640, 300]]);
});

test("CD46 clears reduced motion when its carry fails, so the checks after it run at full motion", async () => {
  let x = 0;
  const { kd, sent } = kitOn(EAR, (expression) =>
    expression === CARRY ? ghost(x++) : expression.includes("prefers-reduced-motion") ? true : undefined,
  );
  await assert.rejects(cd46ReducedCarry(kd), (err: Error) =>
    err.message.startsWith("settle timeout the carry held over its target: "),
  );
  assert.deepEqual(sent.at(-1), ["Emulation.setEmulatedMedia", { features: [] }]);
});

type Shut = "unfolds" | "stays folded" | "stays open";
const slipPage = (whenShut: Shut, foldRefitAfter = 3) => {
  let clock = 0;
  const s = { open: true, folded: true, reserve: "0px", next: null as { at: number; reserve: string } | null };
  const seen: { reserveAtFold?: string } = {};
  const page = fakePage(
    (c) => {
      clock = c;
      if (s.next && c >= s.next.at) [s.reserve, s.next] = [s.next.reserve, null];
      return {
        nodes: {
          ".slip": {
            rect: [s.folded ? 1289.6 : 864, 147, 384, 564],
            classes: s.folded ? ["folded"] : [],
            anims: ["finished"],
          },
          "#chart-drawer": { classes: s.open ? ["open"] : [] },
          "#chart-drawer-shut": {},
          ".slip-fold": {},
          ".stage": { vars: { "--reserve-right": s.reserve } },
        },
        zoom: { x: s.reserve === "0px" ? -2812 : -2492, y: -1629, k: 8 },
      };
    },
    (selector) => {
      if (selector === "#chart-drawer-shut" && whenShut !== "stays open") {
        s.open = false;
        if (whenShut === "unfolds") [s.folded, s.next] = [false, { at: clock + 3, reserve: "487.4px" }];
      }
      if (selector === ".slip-fold") {
        seen.reserveAtFold = s.reserve;
        [s.folded, s.next] = [true, { at: clock + foldRefitAfter, reserve: "0px" }];
      }
    },
  );
  return { s, seen, page, kd: kitOn(page).kd };
};

test("shutAndFold presses the fold only once the shut's unfold has refit the room, and hands back only once the fold's own refit has landed", async () => {
  const { s, seen, kd } = slipPage("unfolds");
  await assert.doesNotReject(kd.shutAndFold("snap"));
  assert.equal(seen.reserveAtFold, "487.4px", "the fold was pressed before the unfold's refit landed");
  assert.equal(s.reserve, "0px", "shutAndFold handed back before the fold's refit landed");
});

test("shutAndFold with the slip still folded after the shut presses no fold and waits for no refit", async () => {
  const { seen, page, kd } = slipPage("stays folded");
  await assert.doesNotReject(kd.shutAndFold("snap"));
  assert.equal(seen.reserveAtFold, undefined);
  assert.equal(page.said.at(-1), FOLDREST, "shutAndFold read on after a fold it never pressed");
});

test("shutAndFold times out naming the shut when the drawer never shuts", async () => {
  const { kd } = slipPage("stays open");
  await assert.rejects(kd.shutAndFold("snap"), (err: Error) =>
    err.message.startsWith("settle timeout snap: the shut: "),
  );
});

test("shutAndFold times out naming the fold's refit when the room never refits", async () => {
  const { kd } = slipPage("unfolds", Infinity);
  await assert.rejects(kd.shutAndFold("snap"), (err: Error) =>
    err.message.startsWith("settle timeout snap: the fold's refit: "),
  );
});
