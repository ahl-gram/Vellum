import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LAYOUT_UNITS_PER_PX,
  NO_SPREAD,
  closingOf,
  rowGapsOf,
  spreadOf,
  type BillRoom,
  type BillSpread,
} from "../../src/site/explorer/bill-spread.ts";
import { ZOOM_STEP } from "../../src/site/shared/zoom-keys.ts";
import { near } from "../../test-support/near.ts";

// 2026-11-05: the Broadside's measures in the probe's two seats at 416 px wide (Issue #1260, Tests section 1 of `handbook/plans/1200/1260/1260-plan.md`); room is the page less the 168.734 px placeSlip keeps above and below it.
const WIDTH = 416;
const ROOM_LESS = 168.734;
const DEFAULT_SEAT = { natural: 510.484375, rows: 6, groups: 3, width: WIDTH };
const HELD_SEAT = { natural: 587.59375, rows: 8, groups: 3, width: WIDTH };

function room(seat: typeof DEFAULT_SEAT, page: number, closed = 0): BillRoom {
  return { ...seat, page, room: page - ROOM_LESS, closed };
}

function within(actual: number, expected: number, message: string, units = 1): void {
  assert.ok(
    actual <= expected + 1e-9 && expected - actual < units / LAYOUT_UNITS_PER_PX,
    `${message}: ${actual} against ${expected}, at most ${units} layout unit(s) under it`,
  );
}

function unitsOf(seat: typeof DEFAULT_SEAT): number {
  return seat.rows + seat.groups + (seat.groups + 1) * 2 + 2;
}

function glide(was: number, path: readonly number[], to: number | null): number[] {
  const out: number[] = [];
  for (let i = 1; i < path.length; i++)
    out.push(closingOf({ was: out.at(-1) ?? was, from: path[i - 1]!, k: path[i]!, to }));
  return out;
}

function steps(from: number, to: number, n = 24): number[] {
  return Array.from({ length: n + 1 }, (_, i) => (i === n ? to : from + ((to - from) * i) / n));
}

function grown(seat: typeof DEFAULT_SEAT, s: BillSpread): number {
  return seat.natural + (seat.rows + seat.groups) * s.row + (seat.groups + 1) * s.group + 2 * s.head;
}

test("SP1 a page 768 tall opens no gap and lays no paper, in the default seat and with both boxes held", () => {
  assert.deepEqual(spreadOf(room(DEFAULT_SEAT, 768)), NO_SPREAD);
  assert.deepEqual(spreadOf(room(HELD_SEAT, 768)), NO_SPREAD);
});

test("SP2 above 768 the bill takes two pixels of room for every pixel of page, a gap between groups twice a row's and the masthead a row's", () => {
  const s = spreadOf(room(DEFAULT_SEAT, 800));
  assert.equal(unitsOf(DEFAULT_SEAT), 19, "the default seat holds 19 units");
  within(s.row, 64 / 19, "a row's share");
  assert.equal(s.group, 2 * s.row, "a group's share is two of a row's");
  assert.equal(s.head, s.row, "the masthead takes a row's share");
  assert.equal(s.paper, 0, "no paper before the stop");
  within(grown(DEFAULT_SEAT, s) - DEFAULT_SEAT.natural, 64, "the shares add to the pace times the page's excess", 19);
});

test("SP3 it takes no more than the room placeSlip leaves", () => {
  for (const seat of [DEFAULT_SEAT, HELD_SEAT]) {
    const r = room(seat, 882);
    const s = spreadOf(r);
    within(grown(seat, s), r.room, `natural plus everything opened, ${unitsOf(seat)} units`, unitsOf(seat));
    assert.equal(s.paper, 0);
  }
  within(spreadOf(room(DEFAULT_SEAT, 882)).row * 19, 202.781625, "the default seat opens what the room leaves", 19);
});

test("SP4 it stops opening at twice its own width and lays the rest as blank paper down to its floor", () => {
  for (const seat of [DEFAULT_SEAT, HELD_SEAT]) {
    const s = spreadOf(room(seat, 1200));
    within(grown(seat, s), 2 * WIDTH, "natural plus opened is twice the width", unitsOf(seat));
    within(s.paper, 1200 - ROOM_LESS - 2 * WIDTH, "the rest down to the floor is paper");
  }
  within(spreadOf(room(DEFAULT_SEAT, 1200)).paper, 199.266, "199.266 px of paper");
});

test("SP5 zoomed in it opens nothing and lays no paper; part way through the first press it opens that part", () => {
  const whole = spreadOf(room(DEFAULT_SEAT, 1200));
  assert.ok(
    whole.row > 0 && whole.group > 0 && whole.head > 0 && whole.paper > 0,
    "the witness: an open bill, so half of it is not half of nothing",
  );
  assert.deepEqual(spreadOf(room(DEFAULT_SEAT, 1200, 1)), NO_SPREAD);
  const half = spreadOf(room(DEFAULT_SEAT, 1200, 0.5));
  for (const key of ["row", "group", "head", "paper"] as const)
    within(half[key], whole[key] / 2, `${key} at half closed`, 2);
});

test("SP6 a bill taller than its room, or a slip not yet seated, opens nothing", () => {
  assert.deepEqual(spreadOf({ ...DEFAULT_SEAT, natural: 650, room: 599.266, page: 900, closed: 0 }), NO_SPREAD);
  assert.deepEqual(spreadOf({ ...DEFAULT_SEAT, room: NaN, page: 900, closed: 0 }), NO_SPREAD);
});

test("SP7 rowGapsOf counts each ledger's rows but one and each shown held box's rows but one", () => {
  assert.equal(
    rowGapsOf([
      { tracks: 3, held: [] },
      { tracks: 3, held: [1] },
      { tracks: 3, held: [] },
    ]),
    6,
  );
  assert.equal(
    rowGapsOf([
      { tracks: 4, held: [2] },
      { tracks: 2, held: [2] },
      { tracks: 3, held: [] },
    ]),
    8,
  );
});

test("SP8 the first press closes the bill in step with the camera's depth, finishing exactly as it lands, and The whole sheet opens it the same way, from that depth or deeper, finishing exactly at the whole sheet", () => {
  const press = steps(1, ZOOM_STEP);
  const closing = glide(0, press, ZOOM_STEP);
  press.slice(1).forEach((k, i) => near(closing[i]!, (k - 1) / (ZOOM_STEP - 1), `closing at k ${k}`));
  assert.equal(closing.at(-1), 1, "wholly closed as the press lands");
  for (const deep of [ZOOM_STEP, 3]) {
    const home = steps(deep, 1, 40);
    const opening = glide(1, home, 1);
    home
      .slice(1)
      .forEach((k, i) => near(opening[i]!, Math.min(1, (k - 1) / (ZOOM_STEP - 1)), `opening at k ${k} from ${deep}`));
    assert.equal(opening.at(-1), 0, `wholly open on the whole sheet, from ${deep}`);
  }
});

test("SP9 the blank paper is never a rounding below zero, which a stylesheet reads as no height at all and lays at the flower's", () => {
  const witness: BillRoom = { natural: 500.002, room: 614.002, page: 800, width: WIDTH, rows: 6, groups: 3, closed: 0 };
  assert.equal(
    spreadOf(witness).paper,
    0,
    "the pace leaves no paper here, and the subtraction that finds it rounds below zero",
  );
});

test("SP10 every length the bill writes is a whole number of the 64ths of a pixel a browser lays a box out in, so a grown gap lays out at exactly its share and the bill never passes its room by a rounding", () => {
  let opened = 0;
  let papered = 0;
  for (const seat of [DEFAULT_SEAT, HELD_SEAT])
    for (let page = 769; page <= 1250; page++)
      for (const closed of [0, 0.37, 0.5, 0.999]) {
        const r = room(seat, page, closed);
        const s = spreadOf(r);
        for (const key of ["row", "group", "head", "paper"] as const)
          assert.ok(
            Number.isInteger(s[key] * LAYOUT_UNITS_PER_PX),
            `${key} ${s[key]} at page ${page}, closed ${closed}, ${unitsOf(seat)} units`,
          );
        assert.ok(grown(seat, s) + s.paper <= r.room, `the bill passes its room at page ${page}, closed ${closed}`);
        if (s.row > 0) opened++;
        if (s.paper > 0) papered++;
      }
  assert.ok(opened > 0 && papered > 0, "the witness: the sweep opens the gaps and lays paper");
});

test("SP11 at any depth past the whole sheet that no press is gliding through, the bill is wholly closed whatever it was, and on the whole sheet wholly open", () => {
  const shallow = [1.0000000000000002, 2 ** 0.2, 1.2, 2 ** 0.4, ZOOM_STEP * (1 - 1e-15)];
  assert.ok(
    shallow.every((k) => k > 1 && k < ZOOM_STEP),
    "the witness: every depth lies short of the first press's",
  );
  for (const k of [...shallow, ZOOM_STEP, 2])
    for (const was of [0, 0.37, 1]) assert.equal(closingOf({ was, from: 1, k, to: null }), 1, `k ${k}, was ${was}`);
  for (const was of [0, 0.37, 1])
    assert.equal(closingOf({ was, from: 2 ** 0.2, k: 1, to: null }), 0, `home, was ${was}`);
});

test("SP12 a press that sets out from a zoomed rest, or lands on one short of the first press's depth, keeps the bill wholly closed, and The whole sheet from such a rest opens it in step from closed", () => {
  for (const [from, to] of [
    [1.741, 1.741 / ZOOM_STEP],
    [2 ** 0.2, 2 ** 0.2 * ZOOM_STEP],
    [ZOOM_STEP, ZOOM_STEP * ZOOM_STEP],
  ] as const)
    assert.ok(
      glide(1, steps(from, to), to).every((c) => c === 1),
      `a press from ${from} to ${to}: ${glide(1, steps(from, to), to).join(", ")}`,
    );
  const home = steps(2 ** 0.2, 1);
  const opening = glide(1, home, 1);
  home.slice(1).forEach((k, i) => near(opening[i]!, (k - 1) / (2 ** 0.2 - 1), `opening at k ${k}`));
  assert.equal(opening.at(-1), 0, "wholly open on the whole sheet");
  const twice = [
    ...glide(0, steps(1, 1.2, 8), ZOOM_STEP),
    ...glide(0.5, steps(1.2, ZOOM_STEP * ZOOM_STEP, 16), ZOOM_STEP * ZOOM_STEP),
  ];
  steps(1, 1.2, 8)
    .slice(1)
    .concat(steps(1.2, ZOOM_STEP * ZOOM_STEP, 16).slice(1))
    .forEach((k, i) => near(twice[i]!, Math.min(1, (k - 1) / (ZOOM_STEP - 1)), `a second press taken at 1.2, k ${k}`));
});
