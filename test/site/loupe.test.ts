import test from "node:test";
import assert from "node:assert/strict";
import { El, installShim } from "../../test-support/element-shim.ts";
import {
  LOUPE_DIAMETER,
  createLoupe,
  svgUrl,
  type LoupeDeps,
  type LoupeSheets,
  type SvgUrls,
} from "../../src/site/explorer/loupe.ts";

installShim();

function fakeUrls(): SvgUrls & { created: string[]; revoked: string[] } {
  const created: string[] = [];
  const revoked: string[] = [];
  return {
    created,
    revoked,
    create: (svg) => {
      created.push(svg);
      return `u${created.length}`;
    },
    revoke: (url) => {
      revoked.push(url);
    },
  };
}

const asEl = (e: unknown): El => e as El;

function build(sheets: () => LoupeSheets | null, touchable = false) {
  const host = new El("div");
  host.rect = { left: 10, top: 20, right: 802.59375, bottom: 631.84375 };
  const mapDiv = new El("div");
  const urls = fakeUrls();
  const deps: LoupeDeps = {
    host: host as unknown as HTMLElement,
    mapDiv: mapDiv as unknown as HTMLElement,
    zoom: () => ({ x: -100, y: -50, k: 2 }),
    sheets,
    urls,
    touchable,
  };
  return { host, mapDiv, urls, loupe: createLoupe(deps) };
}

test("one owner: a sheet string mints one url, the same string mints none, the next revokes the last (Issue #751)", () => {
  const fake = fakeUrls();
  const url = svgUrl(fake);
  assert.deepEqual([url("a"), url("a"), url("b")], ["u1", "u1", "u2"]);
  assert.deepEqual(fake.created, ["a", "b"]);
  assert.deepEqual(fake.revoked, ["u1"]);
});

test("the lens is seated in the gesture box, never in the chart mount, hidden and out of the accessibility tree, its grip its second child (Issue #751)", () => {
  const { host, mapDiv, loupe } = build(() => null);
  const lens = asEl(loupe.lens);
  assert.deepEqual(host.children, [lens]);
  assert.equal(mapDiv.children.length, 0);
  assert.equal(lens.hidden, true);
  assert.equal(lens.getAttribute("aria-hidden"), "true");
  assert.equal(lens.className, "loupe");
  assert.equal(lens.children[0]!.style.width, `${LOUPE_DIAMETER}px`);
  assert.equal(lens.children[1], asEl(loupe.grip));
  assert.equal(lens.children[1].className, "loupe-grip");
  assert.equal(asEl(build(() => null, true).loupe.lens).className, "loupe touchable");
});

test("a show sizes the copy from the box's own fractional size, puts the pointer's point at the lens centre, and places the region sheet by its own fractions (Issue #751)", () => {
  const rect = { x: 0.25, y: 0.375, w: 0.125, h: 0.15 };
  let sheets: LoupeSheets | null = { world: "W", inset: { svg: "I", rect } };
  const { urls, loupe } = build(() => sheets);
  const lens = asEl(loupe.lens);
  loupe.show({ x: 300, y: 200 });
  assert.equal(lens.style["translate"], "180px 80px");
  assert.equal(lens.hidden, false);
  const layer = lens.children[0]!.children[0]!;
  const [world, inset] = layer.children as [El, El];
  assert.equal(layer.style.width, "3170.375px");
  assert.equal(layer.style.height, "2447.375px");
  assert.equal(layer.style["translate"], "-680px -380px");
  assert.equal((world as unknown as { src: string }).src, "u1");
  assert.equal((inset as unknown as { src: string }).src, "u2");
  assert.equal(inset.hidden, false);
  assert.deepEqual(
    [inset.style["--ix"], inset.style["--iy"], inset.style["--iw"], inset.style["--ih"]],
    ["0.25", "0.375", "0.125", "0.15"],
  );
  loupe.show({ x: 300, y: 200 });
  assert.equal(urls.created.length, 2, "the same two sheets mint nothing again");
  sheets = { world: "W", inset: null };
  loupe.show({ x: 300, y: 200 });
  assert.equal(inset.hidden, true, "no region sheet, no region image");
  sheets = null;
  loupe.show({ x: 300, y: 200 });
  assert.equal(lens.hidden, true, "no sheet drawn, no lens");
});

test("the inked survey track is copied into the lens while it shows, replaced when its points change, kept when they do not, and dropped with the lens (Issue #751)", () => {
  const { host, mapDiv, loupe } = build(() => ({ world: "W", inset: null }));
  assert.equal(host.children.length, 1);
  let points = "0,0 1,1";
  const track = new El("polyline");
  track.getAttribute = (name: string) => (name === "points" ? points : null);
  const overlay = new El("svg");
  overlay.querySelector = () => track;
  const clones: El[] = [];
  (overlay as unknown as { cloneNode: () => El }).cloneNode = () => {
    const copy = new El("svg");
    clones.push(copy);
    return copy;
  };
  mapDiv.querySelector = () => overlay;
  const layer = asEl(loupe.lens).children[0]!.children[0]!;
  loupe.show({ x: 300, y: 200 });
  assert.equal(clones.length, 1, "the track is copied");
  assert.equal(layer.children.at(-1), clones[0], "into the layer");
  loupe.show({ x: 310, y: 200 });
  assert.equal(clones.length, 1, "the same points copy nothing again");
  points = "5,5 6,6";
  loupe.show({ x: 310, y: 200 });
  assert.equal(clones.length, 2, "new points copy again");
  assert.equal(clones[0]!.parentNode, null, "and the old copy goes");
  assert.equal(layer.children.at(-1), clones[1]);
  loupe.hide();
  assert.equal(clones[1]!.parentNode, null, "the copy goes with the lens");
});
