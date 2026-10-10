import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  bindNotice,
  DESK_NOTICE_KEY,
  dismiss,
  dismissed,
  noticeDue,
  type NoticeHost,
  type NoticeView,
} from "../../src/site/shell/desk-notice.ts";

// The desk notice (Issue #761): a phone that had to shrink the 1024 page to fit sees a note, once per browser; the scale and height fixtures are the ones measured under emulation on 2026-10-04 (plan, measurement 4), the boundary ones exact binary fractions so float error cannot decide them.

test("a phone held either way had to shrink the page and is under 1024 tall: the notice is due", () => {
  assert.equal(noticeDue(0.380859375, 2217), true, "390x844 upright: 2217 x 0.381 = 844");
  assert.equal(noticeDue(0.82421875, 474), true, "844x390 sideways: 474 x 0.824 = 390");
});

test("the screen's height is read against 1024 exactly, after rounding to the pixel the browser reported", () => {
  assert.equal(noticeDue(0.5, 2048), false, "exactly 1024 tall is the floor itself: no notice");
  assert.equal(noticeDue(0.5, 2046), true, "1023 tall is under it");
  assert.equal(
    noticeDue(0.75, 1365),
    false,
    "a 768x1024 tablet upright, emulated with no browser toolbar, reads 1023.75 from a rounded innerHeight, which is 1024",
  );
  assert.equal(noticeDue(0.25, 4093), true, "1023.25 is 1023 to the pixel, under the floor");
});

test("a page the browser did not shrink never takes the notice, however short the window", () => {
  assert.equal(
    noticeDue(1, 844),
    false,
    "a desktop window narrowed to 390 (zoom, or the harness's narrow viewport) is at scale 1",
  );
  assert.equal(noticeDue(1, 768), false, "a 1024x768 tablet lays the page out at scale 1");
  assert.equal(noticeDue(1.15234375, 712), false, "an 1180x820 tablet enlarges the page");
});

test("a tablet held upright shrinks the page but stands 1024 or more tall: no notice", () => {
  assert.equal(noticeDue(0.80078125, 1474), false, "820x1180 upright: 1474 x 0.801 = 1180");
});

const store = (initial: Record<string, string> = {}) => {
  const items = new Map(Object.entries(initial));
  const storage = {
    getItem: (k: string) => items.get(k) ?? null,
    setItem: (k: string, v: string) => void items.set(k, v),
  } as unknown as Storage;
  return { items, get: () => storage };
};
const refusing = (): Storage =>
  ({
    getItem: () => {
      throw new Error("SecurityError");
    },
    setItem: () => {
      throw new Error("QuotaExceededError");
    },
  }) as unknown as Storage;
const unreachable = (): Storage => {
  throw new Error("SecurityError: localStorage is not available");
};

test("the dismissal is remembered under its own key, and only that key counts", () => {
  assert.equal(dismissed(store().get), false, "a fresh browser has not dismissed it");
  assert.equal(dismissed(store({ [DESK_NOTICE_KEY]: "1" }).get), true, "the key present means dismissed");
  assert.equal(
    dismissed(store({ "vellum.table.v1": "1", "vellum-landfall-arrived": "1" }).get),
    false,
    "another key is not this one",
  );
  const s = store();
  dismiss(s.get);
  assert.equal(s.items.get(DESK_NOTICE_KEY), "1", "dismissing writes the key");
  assert.equal(DESK_NOTICE_KEY, "vellum.desk-notice.v1");
});

test("storage that refuses reads as not dismissed and a refused write is swallowed, so the page renders the same without it", () => {
  assert.equal(dismissed(refusing), false, "an unreadable store shows the notice");
  assert.equal(dismissed(unreachable), false, "a store that cannot even be reached shows the notice");
  assert.doesNotThrow(() => dismiss(refusing), "an unwritable store is shown again next time, never an error");
  assert.doesNotThrow(() => dismiss(unreachable));
});

const host = () => {
  const classes = new Set<string>();
  const props = new Map<string, string>();
  let press: (() => void) | null = null;
  const notice: NoticeHost = {
    classList: { add: (n) => void classes.add(n), remove: (n) => void classes.delete(n) },
    style: { setProperty: (n, v) => void props.set(n, v) },
    button: {
      addEventListener: (type, fn) => {
        if (type === "click") press = fn;
      },
    },
  };
  return {
    notice,
    classes,
    props,
    press: () => {
      assert.ok(press, "the button listens for a press");
      press();
    },
  };
};
const viewOf = (scale: number) => {
  let resize: (() => void) | null = null;
  const view = {
    scale,
    addEventListener: (type: string, fn: () => void) => {
      if (type === "resize") resize = fn;
    },
  } as NoticeView & { scale: number };
  return {
    view,
    turn: (next: number) => {
      view.scale = next;
      assert.ok(resize, "the notice listens for the viewport resizing");
      resize();
    },
  };
};

test("on a phone the notice shows, sized for the screen it is shown on, and re-sized when the phone turns", () => {
  const h = host();
  const v = viewOf(0.5);
  bindNotice(h.notice, v.view, 1600, store().get);
  assert.ok(h.classes.has("on"), "shown");
  assert.equal(h.props.get("--fit"), "2", "1 / 0.5: its 16px reads as 16 on-screen pixels");
  v.turn(0.25);
  assert.equal(h.props.get("--fit"), "4", "a turn re-fits it to the new scale");
});

test("Continue anyway hides it and remembers, and a remembered dismissal never shows it again", () => {
  const h = host();
  const s = store();
  bindNotice(h.notice, viewOf(0.5).view, 1600, s.get);
  h.press();
  assert.ok(!h.classes.has("on"), "hidden on the press");
  assert.equal(s.items.get(DESK_NOTICE_KEY), "1", "remembered");
  const again = host();
  bindNotice(again.notice, viewOf(0.5).view, 1600, s.get);
  assert.ok(!again.classes.has("on"), "the next page does not show it");
});

test("where the notice is not due, nothing is shown or sized", () => {
  const h = host();
  bindNotice(h.notice, viewOf(1).view, 768, store().get);
  assert.ok(!h.classes.has("on"));
  assert.equal(h.props.size, 0);
});

const withoutMedia = (css: string): string => {
  let out = "",
    at = 0;
  for (let m = css.indexOf("@media", at); m !== -1; m = css.indexOf("@media", at)) {
    let depth = 0,
      i = css.indexOf("{", m);
    for (; i < css.length; i++) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}" && --depth === 0) break;
    }
    out += css.slice(at, m);
    at = i + 1;
  }
  return out + css.slice(at);
};

// Chromium reads the two spellings as one property, so no browser here sees each declared; iOS Safari reads the prefixed one (measured, Issue #779 part 2f).
test("the layout declares both spellings of the text-size hold, outside every media block (Issue #761)", () => {
  const shell = readFileSync(resolve(import.meta.dirname, "..", "..", "public/shell.css"), "utf8");
  const screenRules = withoutMedia(shell.replace(/\/\*[\s\S]*?\*\//g, ""));
  assert.match(
    screenRules,
    /^html\s*\{[^}]*-webkit-text-size-adjust:\s*100%;[^}]*\btext-size-adjust:\s*100%;/m,
    "declared on html, outside every comment and every media block",
  );
});
