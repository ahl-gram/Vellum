import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { ESLint } from "eslint";
import { WITNESSES } from "../../test-support/lint-witnesses.ts";
import { SHARED_BINDINGS, type SharedBinding } from "../../scripts/lint/shared-bindings.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
const RULE = "vellum/shared-binding-imported";
const SEATS = "src/site/prospect/seats.ts";

const ROOM = 'import { bindRoom } from "../shared/room.ts";';
const ZOOM = 'import { createZoomController } from "../shared/zoom-controller.ts";';
const GLASS = 'import { bindGlassKeys } from "../shared/glass-keys.ts";';
const USE_TWO = "export const two = [bindRoom, createZoomController];";
const GLASS_KEYS: SharedBinding = ["bindGlassKeys", "../shared/glass-keys.ts"];

const reported = async (lines: readonly string[], path: string): Promise<Array<[string, string]>> => {
  const [result] = await eslint.lintText(lines.join("\n"), { filePath: join(ROOT, path) });
  assert.deepEqual(
    result!.messages.filter((m) => m.fatal).map((m) => m.message),
    [],
    `the plant at ${path} does not parse, so no rule read it`,
  );
  return result!.messages
    .filter((m) => m.ruleId === RULE)
    .map((m) => {
      const [, name, from] = /takes (\S+) from (\S+) and uses it/.exec(m.message) ?? [];
      return [name!, from!];
    });
};

const BLIND_SPOT =
  "BLIND SPOTS, declared: a namespace import (import * as glass) and a re-export do not count as taking the binding, which errs toward a red; the use may stand anywhere in the file, which errs toward a pass";

const PLANTS: ReadonlyArray<readonly [string, readonly string[], Array<[string, string]>]> = [
  [
    "(a) all three taken by their imported names (one renamed) and used",
    [
      ROOM,
      'import { createZoomController as makeZoom } from "../shared/zoom-controller.ts";',
      GLASS,
      "export const a = [bindRoom, makeZoom, bindGlassKeys];",
    ],
    [],
  ],
  ["(b) the import and the use deleted", [ROOM, ZOOM, USE_TWO], [[...GLASS_KEYS]]],
  ["(c) imported, never used", [ROOM, ZOOM, GLASS, USE_TWO], [[...GLASS_KEYS]]],
  [
    "(d) imported as a type, used as a type",
    [
      ROOM,
      ZOOM,
      'import type { bindGlassKeys } from "../shared/glass-keys.ts";',
      USE_TWO,
      "export type B = typeof bindGlassKeys;",
    ],
    [[...GLASS_KEYS]],
  ],
  [
    "(e) the specifier a type, used as a type",
    [
      ROOM,
      ZOOM,
      'import { type bindGlassKeys } from "../shared/glass-keys.ts";',
      USE_TWO,
      "export type B = typeof bindGlassKeys;",
    ],
    [[...GLASS_KEYS]],
  ],
  [
    "(f) imported from another specifier and used",
    [ROOM, ZOOM, 'import { bindGlassKeys } from "./glass-keys.ts";', USE_TWO, "export const f = bindGlassKeys;"],
    [[...GLASS_KEYS]],
  ],
  [
    "(g) a local function of the same name, used",
    [ROOM, ZOOM, USE_TWO, "function bindGlassKeys(): void {}", "export const g = bindGlassKeys;"],
    [[...GLASS_KEYS]],
  ],
  [
    "(h) a namespace import, used through its member",
    [ROOM, ZOOM, 'import * as glass from "../shared/glass-keys.ts";', USE_TWO, "export const h = glass.bindGlassKeys;"],
    [[...GLASS_KEYS]],
  ],
];

test("a room module takes each shared binding its roster entry names, by its own name, as a value, and uses it (Issue #779)", async () => {
  assert.ok(
    PLANTS.some(([, , want]) => want.length === 0) && PLANTS.some(([, , want]) => want.length > 0),
    "the plants cannot tell the rule from its negation",
  );
  for (const [name, lines, want] of PLANTS)
    assert.deepEqual(await reported(lines, SEATS), want, `${name}. ${BLIND_SPOT}`);
});

test("a file the roster does not name is not read", async () => {
  assert.deepEqual(await reported([""], "src/site/shared/room.ts"), [], "an empty module is read");
  assert.deepEqual(
    await reported([ROOM, ZOOM, USE_TWO], "src/site/shared/room.ts"),
    [],
    "a file off the roster is read",
  );
});

const ROOM_BINDING: SharedBinding = ["bindRoom", "../shared/room.ts"];
const ZOOM_BINDING: SharedBinding = ["createZoomController", "../shared/zoom-controller.ts"];
const ANNOUNCE: SharedBinding = ["makeAnnouncer", "../shared/announce.ts"];
const STORE: SharedBinding = ["deviceStorage", "../shared/table-store.ts"];
const ITEM: SharedBinding = ["prospectItemFrom", "../shared/table-address.ts"];
const SEAT_BINDINGS = [ROOM_BINDING, ZOOM_BINDING, GLASS_KEYS];

const ROSTER: Record<string, readonly SharedBinding[]> = {
  "src/site/print-room/seats.ts": SEAT_BINDINGS,
  "src/site/prospect/seats.ts": SEAT_BINDINGS,
  "src/site/ribbon/seats.ts": SEAT_BINDINGS,
  "src/site/reading-room/seats.ts": SEAT_BINDINGS,
  "src/site/seed-of-the-day/app.ts": [ZOOM_BINDING],
  "src/site/explorer/app.ts": [ROOM_BINDING, ANNOUNCE, STORE, ["filingAt", "./chart-drawer.ts"]],
  "src/site/portfolio/app.ts": [ANNOUNCE, ["usesWorker", "../explorer/worker-client.ts"], STORE],
  "src/site/prospect/app.ts": [ITEM],
  "src/site/explorer/chart-drawer.ts": [ITEM],
};

test("the roster is exactly the import pins the close of Issue #779 moved here, and every file and module it names exists", () => {
  assert.deepEqual(SHARED_BINDINGS, ROSTER, "the roster is not the 22 imports the deleted pins held");
  for (const [file, bindings] of Object.entries(SHARED_BINDINGS)) {
    assert.ok(existsSync(join(ROOT, file)), `${file} does not exist`);
    for (const [name, from] of bindings)
      assert.ok(
        existsSync(join(ROOT, dirname(file), from)),
        `${file} names ${name} from ${from}, which does not exist`,
      );
  }
});

const resolvedRule = async (file: string): Promise<unknown> =>
  ((await eslint.calculateConfigForFile(file)) as { rules?: Record<string, unknown> }).rules?.[RULE];

test("the rule resolves at error, with the roster as its options, on every site script at any depth and on no other root or sheet", async () => {
  for (const file of [...Object.keys(SHARED_BINDINGS), "src/site/nested/deeper/part.ts"])
    assert.deepEqual(
      await resolvedRule(file),
      [2, { required: SHARED_BINDINGS }],
      `${RULE} resolves wrongly on ${file}`,
    );
  for (const [glob, file] of Object.entries(WITNESSES))
    assert.equal(await resolvedRule(file), undefined, `${RULE} reaches ${file}, the witness of ${glob}`);
});
