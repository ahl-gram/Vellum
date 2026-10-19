import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import {
  aeOf,
  compareRows,
  failed,
  measureIn,
  parseCompareArgs,
  sizedAe,
  verdictOf,
  type Row,
} from "../../scripts/design/compare.ts";

const row = (over: Partial<Row>): Row => ({
  name: "a.png",
  present: [true, true, true],
  control: 0,
  branch: 0,
  errors: [],
  ...over,
});

test("a row is trusted only where the unchanged build matched itself, and a difference under one pixel still counts", () => {
  assert.equal(aeOf("0.075817 (4.20085e-08)"), 0.075817);
  assert.equal(aeOf("0 (0)"), 0);
  assert.throws(() => aeOf("compare: unable to open image"), /no AE/);
  assert.equal(verdictOf(row({})), "same");
  assert.equal(verdictOf(row({ branch: 0.075817 })), "differs");
  assert.equal(verdictOf(row({ control: 46, branch: null })), "untrusted");
  assert.equal(verdictOf(row({ errors: ["404 http://127.0.0.1/fonts/x.woff2"] })), "errors");
  assert.equal(
    verdictOf(row({ control: 46, branch: null, errors: ["console.error: x"] })),
    "errors",
    "an error fails a row whether or not its control was stable",
  );
  assert.equal(verdictOf(row({ present: [false, false, true], control: null, branch: null })), "new");
  assert.equal(verdictOf(row({ present: [true, true, false], branch: null })), "gone");
  assert.equal(verdictOf(row({ present: [true, false, true], control: null, branch: null })), "missing");
});

test("a page counts as shot only where that run's manifest lists it, controls are measured against each other and the branch against the second control", () => {
  const listed = (...names: string[]) => names.map((name) => ({ name }));
  const calls: string[] = [];
  const measure = (from: 0 | 1, to: 1 | 2, name: string): number => {
    calls.push(`${from}${to} ${name}`);
    return name === "flip.png" && from === 0 ? 46 : name === "moved.png" && to === 2 ? 12 : 0;
  };
  const rows = compareRows(
    [
      listed("a.png", "flip.png", "gone.png", "half.png", "moved.png"),
      listed("a.png", "flip.png", "gone.png", "moved.png"),
      listed("a.png", "flip.png", "half.png", "moved.png", "new.png"),
    ],
    measure,
  );
  assert.deepEqual(Object.fromEntries(rows.map((r) => [r.name, verdictOf(r)])), {
    "a.png": "same",
    "flip.png": "untrusted",
    "gone.png": "gone",
    "half.png": "missing",
    "moved.png": "differs",
    "new.png": "new",
  });
  assert.deepEqual(
    calls.sort(),
    ["01 a.png", "01 flip.png", "01 moved.png", "12 a.png", "12 moved.png"],
    "an untrusted, lost, half-shot or new page is never measured",
  );
  assert.deepEqual(
    rows.map((r) => r.name),
    ["a.png", "flip.png", "gone.png", "half.png", "moved.png", "new.png"],
    "the report reads in name order",
  );
  assert.equal(
    sizedAe("1280 800", "1280 840", () => 0),
    Number.POSITIVE_INFINITY,
    "a page that only grew at the bottom scores 0 against its own edge",
  );
  assert.equal(
    sizedAe("1280 800", "1264 800", () => 0),
    Number.POSITIVE_INFINITY,
    "a width change too",
  );
  assert.equal(
    sizedAe("1280 800", "1280 800", () => 7),
    7,
  );
  assert.equal(verdictOf(row({ branch: Number.POSITIVE_INFINITY })), "differs");
  assert.equal(verdictOf(row({ control: Number.POSITIVE_INFINITY, branch: null })), "untrusted");
});

test("a row carries the branch shot's own missing resources and console errors, and nothing from the controls", () => {
  const manifests = [
    [{ name: "a.png", consoleErrors: ["console.error: control only"] }, { name: "b.png" }],
    [{ name: "a.png" }, { name: "b.png" }],
    [
      { name: "a.png" },
      { name: "b.png", http4xx: ["404 http://127.0.0.1/fonts/x.woff2"], consoleErrors: ["console.error: y"] },
    ],
  ] as const;
  const rows = compareRows(manifests, () => 0);
  assert.deepEqual(
    rows.map((r) => [r.name, r.errors, verdictOf(r)]),
    [
      ["a.png", [], "same"],
      ["b.png", ["404 http://127.0.0.1/fonts/x.woff2", "console.error: y"], "errors"],
    ],
  );
});

test("a page laid out differently is a difference however its pixels compare, past the 16000px cap included, and a new page with errors fails", () => {
  const at = (name: string, sh: number) => ({ name, probe: JSON.stringify({ cw: 390, sw: 390, sh }) });
  const measured: string[] = [];
  const rows = compareRows(
    [
      [at("glossary-390.png", 22073), at("flip.png", 900)],
      [at("glossary-390.png", 22073), at("flip.png", 920)],
      [at("glossary-390.png", 22100), at("flip.png", 900)],
    ],
    (from, to, name) => (measured.push(`${from}${to} ${name}`), 0),
  );
  assert.deepEqual(
    rows.map((r) => [r.name, r.control, r.branch, verdictOf(r)]),
    [
      ["flip.png", Number.POSITIVE_INFINITY, null, "untrusted"],
      ["glossary-390.png", 0, Number.POSITIVE_INFINITY, "differs"],
    ],
  );
  assert.deepEqual(measured, ["01 glossary-390.png"], "a pair whose layouts differ is never measured");
  const newWithError = {
    name: "a.png",
    present: [false, false, true] as const,
    control: null,
    branch: null,
    errors: ["404 http://127.0.0.1:8123/fonts/x.woff2"],
  };
  assert.equal(
    verdictOf(newWithError),
    "errors",
    "a page with nothing to compare against can still carry a missing face",
  );
  assert.equal(failed([row({}), newWithError]), true);
});

test("the compare takes three sweeps, two of them distinct controls, and refuses anything else", () => {
  assert.deepEqual(parseCompareArgs(["out/a", "out/b", "out/br"]), ["out/a", "out/b", "out/br"]);
  assert.throws(() => parseCompareArgs(["out/a", "out/b", "out/br", "out/c"]), /usage/);
  assert.throws(() => parseCompareArgs(["out/a", "out/b", "out/br", "--fuzz"]), /usage/);
  assert.throws(() => parseCompareArgs(["out/a", "--fuzz", "out/br"]), /usage/, "a flag is never a sweep");
  assert.throws(() => parseCompareArgs(["out/a", "out/b"]), /usage/);
  assert.throws(() => parseCompareArgs(["out/a", "out/a/", "out/br"]), /both controls/);
  assert.throws(() => parseCompareArgs(["out/a", "out/b", "./out/b/"]), /the branch and a control/);
  assert.throws(() => parseCompareArgs(["out/a", "out/b", "out/a"]), /the branch and a control/);
});

test("the controls and the branch are measured as the files in their own directories", () => {
  const seen: string[] = [];
  const measure = measureIn(["out/c-a", "out/c-b", "out/br"], (a, b) => (seen.push(`${a} ${b}`), 0));
  measure(0, 1, "home-1280.png");
  measure(1, 2, "home-1280.png");
  assert.deepEqual(seen, [
    `${join("out/c-a", "home-1280.png")} ${join("out/c-b", "home-1280.png")}`,
    `${join("out/c-b", "home-1280.png")} ${join("out/br", "home-1280.png")}`,
  ]);
});

test("a comparison fails on a trusted difference, an error, a lost or half-shot page, or when it trusted no row at all", () => {
  assert.equal(
    failed([row({}), row({ control: 46, branch: null })]),
    false,
    "an untrusted row is reported, not failed",
  );
  assert.equal(
    failed([row({}), row({ present: [false, false, true], control: null, branch: null })]),
    false,
    "a new page is reported, not failed",
  );
  assert.equal(failed([row({}), row({ branch: 0.075817 })]), true);
  assert.equal(failed([row({}), row({ errors: ["console.error: x"] })]), true);
  assert.equal(failed([row({}), row({ present: [true, true, false], branch: null })]), true);
  assert.equal(failed([row({}), row({ present: [true, false, true], control: null, branch: null })]), true);
  assert.equal(
    failed([row({ control: 46, branch: null }), row({ control: 3, branch: null })]),
    true,
    "a run that trusted nothing compared nothing",
  );
});
