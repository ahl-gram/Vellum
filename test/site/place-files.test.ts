import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PLACE_TABLE, writePlaceFiles } from "../../scripts/place-files.ts";
import { placeFile } from "../../src/site/explorer/place-fetch.ts";
import { PLACE_ID_LIST } from "../../src/world/outline-place-ids.ts";
import { placeId } from "../../src/world/outline-ids.ts";

const inTemp = async (run: (dir: string) => Promise<void>): Promise<void> => {
  const dir = mkdtempSync(join(tmpdir(), "vellum-place-files-"));
  try {
    await run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

test("every place gets its own file, holding its rings as the table stores them (Issue #854)", async () => {
  const table = JSON.parse(readFileSync(PLACE_TABLE, "utf8")) as Record<string, string>;
  await inTemp(async (dir) => {
    const count = await writePlaceFiles(dir);
    assert.equal(count, PLACE_ID_LIST.split("\n").length);
    const texas = placeId("ne-1159315211");
    assert.equal(readFileSync(join(dir, placeFile(texas)), "utf8"), table[texas]);
  });
});

test("a table's places are written and nothing else (Issue #854)", async () => {
  await inTemp(async (dir) => {
    const small = join(dir, "small.json");
    writeFileSync(small, JSON.stringify({ "ne-1": "m0 0z", "ne-2": "m1 1z" }));
    const root = join(dir, "root");
    assert.equal(await writePlaceFiles(root, small), 2);
    assert.deepEqual(readdirSync(join(root, "outlines")).sort(), ["ne-1.txt", "ne-2.txt"]);
  });
});
