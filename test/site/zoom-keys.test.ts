import { test } from "node:test";
import assert from "node:assert/strict";
import { El } from "../../test-support/element-shim.ts";
import { bindZoomKeys } from "../../src/site/shared/zoom-keys.ts";

class Viewport extends El {
  clientWidth = 1000;
  clientHeight = 800;
  constructor() {
    super("div");
  }
}

interface KeyEvent {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  prevented: boolean;
  preventDefault(): void;
}

function rig() {
  const calls: string[] = [];
  const zoom = {
    glideBy: (f: number) => calls.push(`glideBy ${f}`),
    panBy: (x: number, y: number) => calls.push(`panBy ${x} ${y}`),
    glideHome: () => calls.push("glideHome"),
  };
  const home = () => calls.push("home");
  const viewport = new Viewport();
  bindZoomKeys(viewport as unknown as HTMLElement, zoom, home);
  const press = (key: string, mods: Partial<Pick<KeyEvent, "altKey" | "ctrlKey" | "metaKey">> = {}): KeyEvent => {
    const e: KeyEvent = {
      key,
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      ...mods,
      prevented: false,
      preventDefault() {
        this.prevented = true;
      },
    };
    viewport.fire("keydown", e);
    return e;
  };
  return { calls, press };
}

test("ZK1 the 0 key homes through the home the page hands in, never the controller's own glide home, and is consumed (Issue #1011)", () => {
  const { calls, press } = rig();
  const e = press("0");
  assert.deepEqual(calls, ["home"]);
  assert.equal(e.prevented, true, "0 is consumed");
});

test("ZK2 each Glass key drives the controller by the press step or a pan of 0.15 of the box, in the direction it names, and is consumed (Issue #1011)", () => {
  const cases: [string, string][] = [
    ["+", "glideBy 1.4"],
    ["=", "glideBy 1.4"],
    ["-", `glideBy ${1 / 1.4}`],
    ["_", `glideBy ${1 / 1.4}`],
    ["ArrowLeft", "panBy 150 0"],
    ["ArrowRight", "panBy -150 0"],
    ["ArrowUp", "panBy 0 120"],
    ["ArrowDown", "panBy 0 -120"],
  ];
  for (const [key, expected] of cases) {
    const { calls, press } = rig();
    const e = press(key);
    assert.deepEqual(calls, [expected], `key ${key}`);
    assert.equal(e.prevented, true, `key ${key} is consumed`);
  }
});

test("ZK3 a key held with Alt, Ctrl or Meta, and a key the Glass does not take, reach the page untouched, so Escape still reaches the card dismiss (Issue #1011)", () => {
  const cases: [string, Partial<Pick<KeyEvent, "altKey" | "ctrlKey" | "metaKey">>][] = [
    ["+", { altKey: true }],
    ["+", { ctrlKey: true }],
    ["0", { metaKey: true }],
    ["Escape", {}],
    ["a", {}],
  ];
  for (const [key, mods] of cases) {
    const { calls, press } = rig();
    const e = press(key, mods);
    assert.deepEqual(calls, [], `key ${key} ${JSON.stringify(mods)}`);
    assert.equal(e.prevented, false, `key ${key} ${JSON.stringify(mods)} is not consumed`);
  }
});
