import { test } from "node:test";
import assert from "node:assert/strict";
import { placeLegendRow } from "../../src/site/shared/room-seats.ts";
import { El } from "../../test-support/element-shim.ts";
import { press } from "../../test-support/press-button.ts";

type Box = { left: number; top: number; right: number; bottom: number };
const boxed = (tag: string, rect: Box): El => Object.assign(new El(tag), { rect });

class StackedRow extends El {
  override querySelectorAll(): El[] {
    return [press(0), press(44)];
  }
}

const GLOBALS = ["document", "window", "getComputedStyle", "DOMRect"] as const;
const CLUSTER_FOOT = 128;

function leansAt(rowTop: number, poolTop = ""): boolean {
  const g = globalThis as Record<string, unknown>;
  const saved = GLOBALS.map((n) => [n, n in g, g[n]] as const);
  try {
    g.document = {
      documentElement: { classList: new El("html").classList, clientWidth: 1024, clientHeight: 768 },
      createRange: () => ({ selectNodeContents: () => {}, getBoundingClientRect: () => ({ width: 0 }) }),
    };
    g.window = { scrollX: 0, scrollY: 0 };
    g.getComputedStyle = (_el: unknown, pseudo?: string) => ({
      translate: "none",
      top: pseudo === "::before" ? poolTop : "",
      getPropertyValue: () => "",
    });
    g.DOMRect = class {
      readonly stub = true;
    };
    const row = Object.assign(new StackedRow("nav"), {
      rect: { left: 340, top: rowTop, right: 640, bottom: rowTop + 108 },
    });
    placeLegendRow(row as unknown as HTMLElement, {
      folio: boxed("div", { left: 32, top: 680, right: 300, bottom: 752 }) as unknown as Element,
      chrome: boxed("header", { left: 32, top: 16, right: 600, bottom: CLUSTER_FOOT }) as unknown as Element,
      glass: null,
      slip: null,
    });
    return row.classList.contains("lean");
  } finally {
    for (const [n, had, v] of saved) {
      if (had) g[n] = v;
      else delete g[n];
    }
  }
}

test("a risen Press whose top comes within the gap of the head cluster's foot sheds its note, and one clear of it keeps it (Issue #1273, from e2e NA4)", () => {
  assert.equal(leansAt(CLUSTER_FOOT + 2), true, "a row 2px under the cluster's foot, inside the 16px gap, leans");
  assert.equal(leansAt(CLUSTER_FOOT + 14), true, "14px under the foot, inside the 16px gap, with no pool, leans");
  assert.equal(leansAt(560), false, "a row far below the cluster keeps its note");
});

test("a risen Press clear of the gap whose soft pool would reach the head cluster's foot sheds its note (Issue #1273, from e2e NA4)", () => {
  assert.equal(
    leansAt(CLUSTER_FOOT + 18),
    false,
    "18px under the foot, past the 16px gap, with no pool, keeps its note",
  );
  assert.equal(
    leansAt(CLUSTER_FOOT + 18, "-20.8px"),
    true,
    "the same row whose 1.3rem pool reaches over the foot leans",
  );
});
