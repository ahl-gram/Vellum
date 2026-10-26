import { test } from "node:test";
import assert from "node:assert/strict";
import { cd21PortfolioGlass } from "../../e2e/suites/chart-drawer/portfolio.ts";
import { cd48Control } from "../../e2e/suites/chart-drawer/floor.ts";
import { layPressRested } from "../../e2e/suites/chart-drawer/homes.ts";
import { ix2InksRow, ix4FindBox, type DocRoomsKit } from "../../e2e/suites/document-rooms.ts";
import { restOnVerso } from "../../e2e/suites/survey/kit.ts";
import { makeSettle, makeStable } from "../../e2e/support/settle.ts";
import type { SuiteContext } from "../../e2e/types.ts";

// A state change an action causes lands LAG evaluates after it, so a pause that resolves at once reads the state before it lands.
const LAG = 2;
type World = {
  clock: number;
  acts: { kind: string; at: number }[];
  checked: Map<string, { ok: boolean; detail: string }>;
};
const when = (w: World, kind: string): number | null => w.acts.find((a) => a.kind === kind)?.at ?? null;
const landedCount = (w: World, kind: string): number =>
  w.acts.filter((a) => a.kind === kind && w.clock - a.at >= LAG).length;
const world = (answer: (expr: string, w: World) => unknown) => {
  const w: World = { clock: 0, acts: [], checked: new Map() };
  const act = (kind: string) => w.acts.push({ kind, at: w.clock });
  const ctx = {
    evaluate: (expr: string) => {
      w.clock++;
      return Promise.resolve(answer(expr, w));
    },
    send: (method: string) => {
      if (method === "Input.insertText") act("insert");
      return Promise.resolve({});
    },
    touch: () => Promise.resolve(),
    touchPan: () => {
      act("pan");
      return Promise.resolve();
    },
    clearMobile: () => Promise.resolve(),
    goto: () => Promise.resolve(),
    sleep: () => Promise.resolve(),
    check: (name: string, ok: unknown, detail = "") => void w.checked.set(name.split(" ")[0]!, { ok: !!ok, detail }),
    PORT: 8765,
  } as unknown as SuiteContext;
  const settle = makeSettle(ctx);
  return { w, act, ctx, settle, stable: makeStable(settle) };
};
const sequence = <T>(items: readonly T[]) => {
  let i = 0;
  return () => items[Math.min(i++, items.length - 1)];
};
const leaf = (m11: number) => ({ t: `matrix(${m11}, 0, 0, 1, 0, 0)`, m11 });
const LABEL = "SV2o the leaf rests on the verso";

test("the leaf is read on the verso only once its turn has landed", async () => {
  const next = sequence([1, 0.3, 0.3, -0.5, -1, -1].map(leaf));
  const { ctx } = world(() => next());
  assert.equal((await restOnVerso(ctx, LABEL)).m11, -1, "the leaf was taken for resting before its turn landed");
});

test("the leaf's wait times out naming the check when the turn never lands", async () => {
  const { ctx } = world(() => leaf(0.3));
  await assert.rejects(restOnVerso(ctx, LABEL), (err: Error) => err.message.startsWith(`settle timeout ${LABEL}: `));
});

test("IX2 reads the index only once the page has handled each scroll", async () => {
  const { w, act, ctx, settle } = world((e, w) => {
    const scrolled = landedCount(w, "scroll");
    if (e.includes("nextElementSibling")) return "q-first";
    if (e.includes("scrollIntoView()")) return void act("scroll");
    if (e.includes("__ixScrolls")) return { n: scrolled };
    if (e.includes("innerW: innerWidth"))
      return {
        scrollY: scrolled ? 500 : 0,
        inked: [scrolled ? "target" : "intro"],
        now: scrolled > 1 ? ["q-first"] : [],
      };
    return undefined;
  });
  await ix2InksRow({ ...ctx, settle } as unknown as DocRoomsKit, { h2s: ["intro", "other", "target"] } as never);
  assert.equal(w.checked.get("IX2")?.ok, true, `IX2 read the index before the ink: ${w.checked.get("IX2")?.detail}`);
});

test("IX4 reads the find box's narrowing only once the whole query has landed", async () => {
  const typed = (w: World): { n: number; value: string } => {
    const at = when(w, "insert");
    if (when(w, "clear") !== null) return { n: 3, value: "" };
    if (at === null || w.clock - at < LAG) return { n: 0, value: "" };
    return w.clock - at < 2 * LAG ? { n: 1, value: "gla" } : { n: 2, value: "glass" };
  };
  const { w, act, ctx, settle } = world((e, w) => {
    const { n, value } = typed(w);
    if (e.includes("innerW: innerWidth")) return { count: "3 terms in 1 sections", entries: 3, h2s: ["g"] };
    if (e.includes("__ixInputs")) return { n, value };
    if (e.includes("defsMatch")) {
      if (value === "glass")
        return { hits: ["Glass", "Looking glass"], shown: 2, total: 6, empty: 1, rows: 3, defsMatch: 4 };
      return { hits: ["Glaze", "Glass", "Glade"], shown: 3, total: 6, empty: 0, rows: 3, defsMatch: 4 };
    }
    if (e.includes('i.value = ""')) return void act("clear");
    if (e.includes("hits: links.filter")) return { shown: 6, total: 6, hits: 0, empty: 0 };
    return undefined;
  });
  await ix4FindBox({ ...ctx, settle } as unknown as DocRoomsKit);
  assert.equal(
    w.checked.get("IX4")?.ok,
    true,
    `IX4 read the narrowing before the query landed: ${w.checked.get("IX4")?.detail}`,
  );
});

const BARE = 'document.getElementById("map").style.transform';

test("CD21 reads the camera only once the zoom press's glide has come to rest", async () => {
  const next = sequence(["", "", "scale(1.2)", "scale(1.5)", "scale(1.5)"]);
  const { w, ctx, stable } = world((e) => {
    if (e.includes('data-zoom="in"')) return { zoomable: true, touch: "none", before: "" };
    if (e === BARE) return next();
    if (e.includes(BARE)) return { t: next() };
    return undefined;
  });
  await cd21PortfolioGlass({ ...ctx, stable } as unknown as Parameters<typeof cd21PortfolioGlass>[0]);
  assert.equal(w.checked.get("CD21")?.ok, true, "CD21 read the transform before the glide moved it");
  assert.match(w.checked.get("CD21")?.detail ?? "", /"after":"scale\(1\.5\)"/);
});

test("CD48's control is read only once the pan beside the ear has landed", async () => {
  const cam = (x: number, y: number) => ({ x, y, k: 1 });
  const next = sequence([cam(5, 5), cam(5, 5), cam(85, 65), cam(85, 65)]);
  const { w, ctx, stable } = world((e) => {
    if (e.includes(".region-inset")) return { x: 10, y: 20, on: "DIV" };
    if (e === "window.__vellumZoomState()") return next();
    if (e.includes("zoom-touch")) return "false";
    return undefined;
  });
  const seen = {
    earNow: { x: 1, y: 1 },
    camBefore: cam(5, 5),
    afterHandle: { cam: cam(5, 5), ghost: false, drag: false, cuttings: 0 },
    ghostSeen: false,
  };
  await cd48Control({ ...ctx, stable } as unknown as Parameters<typeof cd48Control>[0], seen);
  assert.equal(w.checked.get("CD48")?.ok, true, "CD48 read the camera before the pan landed");
});

const lay = (y: number, w = 200) => ({ w, box: [0, y, w, 40] });
const CD37 = "CD37 the lay press shown and still on the Prospect page";

test("the lay press is pressed only once it shows and holds still", async () => {
  const next = sequence([null, lay(0, 0), lay(0, 0), lay(300), lay(290), lay(290)]);
  const { ctx, stable } = world(() => next());
  const kit = { stable, evaluate: ctx.evaluate };
  assert.deepEqual(await layPressRested(kit, CD37), lay(290));
});

test("the lay press's wait times out naming the check when it never shows", async () => {
  const { ctx, stable } = world(() => lay(0, 0));
  const kit = { stable, evaluate: ctx.evaluate };
  await assert.rejects(layPressRested(kit, CD37), (err: Error) => err.message.startsWith(`settle timeout ${CD37}: `));
});
