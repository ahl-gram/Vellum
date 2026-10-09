import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const here = (p: string): string => readFileSync(new URL(p, import.meta.url), { encoding: "utf8" });
const page = here("../../src/pages/explorer/index.astro");

test("the one checkbox wears the ratified survey label (#317 decision 1)", () => {
  assert.match(page, /survey <input id="ages"/, "the checkbox label is not the ratified `survey`");
});
