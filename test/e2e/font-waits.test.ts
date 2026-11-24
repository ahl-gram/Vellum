import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { withFonts } from "../../e2e/support/fonts.ts";

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
