import test from "node:test";
import assert from "node:assert/strict";
import { seatCaption, type SeatLine } from "../../src/itinerary/dress/seats.ts";
import { textBox, WIDTH_FACTOR, type Box } from "../../src/render/geometry.ts";

// The float slack of a box slid onto the room's edge.
const EPS = 1e-6;

const inBox = (bs: ReadonlyArray<Box>, right: number): boolean =>
  bs.every((b) => b.x >= -EPS && b.x + b.w <= right + EPS && b.y >= -EPS && b.y + b.h <= 200 + EPS);

function crowd(bs: ReadonlyArray<Box>, keep: ReadonlyArray<Box>): number {
  const cut = (a: number, b: number, c: number, d: number): number =>
    Math.max(0, Math.min(a + b, c + d) - Math.max(a, c));
  return bs.reduce(
    (sum, b) => sum + keep.reduce((a, k) => a + cut(b.x, b.w, k.x, k.w) * cut(b.y, b.h, k.y, k.h), 0),
    0,
  );
}

test("a caption with no clear seat takes the least-crowded one inside its strip, on a backing", () => {
  const lines: SeatLine[] = [
    { text: "aaaaaaaaaa", caps: false, size: 8.2 },
    { text: "bbbbb", caps: false, size: 8.2 },
  ];
  const room = { left: () => 0, right: () => 100, top: 0, bottom: 200 };
  const want = {
    x: 60,
    top: 20,
    side: 1 as const,
    lines,
    roadX: () => 0,
    acrossTop: 26,
    sticky: false,
    rewrap: () => lines,
  };
  const keepBoxes = [
    { x: 0, y: 0, w: 100, h: 70 },
    { x: 0, y: 90, w: 100, h: 110 },
  ];
  const keep = { boxes: keepBoxes, discs: [{ x: 50, y: 150, r: 10 }], lines: [] };
  const w = 10 * 8.2 * WIDTH_FACTOR.mixed;
  const places = [0, -4, 4, -8, 8, -12, 12, -16, 16, -20, 20, -24, 24, -28, 28, -32, 32].flatMap((dy) =>
    [
      { x: Math.min(60, 100 - w), anchor: "start" as const },
      { x: Math.max(-10, w), anchor: "end" as const },
    ].map((c) => [
      textBox(c.x, 20 + dy + 8.2, "aaaaaaaaaa", 8.2, c.anchor, WIDTH_FACTOR.mixed),
      textBox(c.x, 20 + dy + 9.4 + 8.2, "bbbbb", 8.2, c.anchor, WIDTH_FACTOR.mixed),
    ]),
  );
  const open = places.filter((bs) => inBox(bs, 100));
  assert.ok(
    open.length > 0 && open.length < places.length,
    "premise: some beside places lie in the room and some do not",
  );
  const seat = seatCaption(want, room, keep);
  assert.ok(seat.backed && inBox(seat.boxes, 100), "a seat with no clear place lies in the room, backed");
  assert.ok(
    Math.abs(crowd(seat.boxes, keepBoxes) - Math.min(...open.map((bs) => crowd(bs, keepBoxes)))) < EPS,
    "and is the least crowded of the places it could take",
  );
  const whole = seatCaption(want, room, { ...keep, boxes: [{ x: 0, y: 0, w: 100, h: 200 }], discs: [] });
  assert.ok(whole.backed && inBox(whole.boxes, 100), "and with the whole room kept it still lies in the room");
  const narrow = seatCaption(want, { ...room, right: () => 20 }, { boxes: [], discs: [], lines: [] });
  assert.ok(
    narrow.backed && narrow.scale < 1 && inBox(narrow.boxes, 20),
    "and a room narrower than the words takes them smaller",
  );
});
