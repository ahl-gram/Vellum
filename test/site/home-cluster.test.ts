import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Home's head cluster (Issue #480; SPEC: the four screenshots on Issue #480 and their captions, the measured baseline on PR #482). What stays here is what clears home's own furniture.

const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");
const liveCss = (p: string): string => read(p).replace(/\/\*[\s\S]*?\*\//g, "");

const css = liveCss("public/index.css");

const rule = (sheet: string, selector: string): string => {
  const m = sheet.match(
    new RegExp(`(?:^|[}\\n])\\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]*)\\}`),
  );
  assert.ok(m, `a rule for ${selector} exists`);
  return m[1]!;
};

const topLevel = css.replace(/@media[^{]*\{[\s\S]*?\n\}/g, "");

test("the stage never yields its lettering to a drag: user-select none on the whole stage, so a pip drag selects nothing (#480, screenshot 4)", () => {
  const stage = rule(topLevel, ".landfall .stage");
  assert.match(stage, /user-select:\s*none/, "the stage opts its lettering out of selection");
  assert.match(stage, /-webkit-user-select:\s*none/, "iOS Safari reads the prefixed form");
});
