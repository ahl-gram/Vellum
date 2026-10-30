import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPlace } from "../../scripts/outlines/build.ts";
import { refuseRepeats, serialId } from "../../scripts/outlines/ids.ts";
import { boxOf, gap2 } from "../../scripts/outlines/plane.ts";
import { projectPlace } from "../../scripts/outlines/project.ts";

function aspectOf(rings: Parameters<typeof boxOf>[0]): number {
  const b = boxOf(rings);
  return (b.x1 - b.x0) / (b.y1 - b.y0);
}

test("a square of degrees at sixty degrees north projects about half as wide as it is tall, north up and east right (Issue #853)", () => {
  const { rings } = projectPlace([
    [
      [0, 59.5],
      [1, 59.5],
      [1, 60.5],
      [0, 60.5],
    ],
  ]);
  assert.ok(Math.abs(aspectOf(rings) - 0.5) < 0.01, `width over height ${aspectOf(rings)}`);
  const [southWest, southEast, , northWest] = rings[0]!;
  assert.ok(northWest![1] > southWest![1], "north is up");
  assert.ok(southEast![0] > southWest![0], "east is right");
});

test("a place split at the antimeridian projects as one piece (Issue #853)", () => {
  const { rings } = projectPlace([
    [
      [179, 0],
      [180, 0],
      [180, 1],
      [179, 1],
    ],
    [
      [-180, 0],
      [-179, 0],
      [-179, 1],
      [-180, 1],
    ],
  ]);
  assert.ok(gap2(boxOf([rings[0]!]), boxOf([rings[1]!])) < 1e-20, "the two halves touch");
  assert.ok(Math.abs(aspectOf(rings) - 2) < 0.01, `width over height ${aspectOf(rings)}`);
});

test("a ring around the south pole projects round (Issue #853)", () => {
  const ring: Array<readonly [number, number]> = [];
  for (let lon = -180; lon < 180; lon += 10) ring.push([lon, -80]);
  const radii = projectPlace([ring]).rings[0]!.map(([x, y]) => Math.sqrt(x * x + y * y));
  const largest = Math.max(...radii);
  for (const r of radii) assert.ok(Math.abs(r - largest) < 1e-9 * largest, `radius ${r} against ${largest}`);
});

test("a place keeps its main land and every part within three of its own widths of land already kept, and drops a part too small for a world cell (Issue #853)", () => {
  const sq = (x0: number, y0: number, s: number): number[] => [x0, y0, x0 + s, y0, x0 + s, y0 + s, x0, y0 + s];
  assert.equal(
    buildPlace([sq(0, 0, 10000), sq(11500, 0, 1000), sq(30000, 0, 1000), sq(16000, 0, 1000), sq(10100, 0, 40)]).length,
    3,
  );
  assert.deepEqual(buildPlace([sq(0, 0, 10000)]), [[170, 940, 830, 940, 830, 60, 170, 60]]);
});

test("a place's ID is ne- and Natural Earth's serial number, and two places sharing one are refused, never numbered apart (Issue #853, ruling 3)", () => {
  assert.equal(serialId(1159315211), "ne-1159315211");
  for (const bad of ["1159315211", 0, -3, 1.5, null, 2 ** 60])
    assert.throws(() => serialId(bad), { name: "RangeError" });
  refuseRepeats(["ne-1", "ne-2"], new Set(["round"]));
  assert.throws(() => refuseRepeats(["ne-1", "ne-1"], new Set()), {
    name: "RangeError",
    message: "two places share the ID ne-1",
  });
  assert.throws(() => refuseRepeats(["round"], new Set(["round"])), {
    name: "RangeError",
    message: "two places share the ID round",
  });
});
