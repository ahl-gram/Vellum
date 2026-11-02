import { test } from "node:test";
import assert from "node:assert/strict";
import { plantMessages } from "../../test-support/source-shape-reports.ts";

test("a plant that does not parse is refused before any rule reads it, naming where it was planted", async () => {
  await assert.rejects(plantMessages(["export const = ;"], "src/cli/main.ts"), {
    message: /^the plant at src\/cli\/main\.ts does not parse, so no rule read it/,
  });
});
