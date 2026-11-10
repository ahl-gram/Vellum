import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { WITNESSES } from "../../test-support/lint-witnesses.ts";
import { eslint, plantMessages } from "../../test-support/source-shape-reports.ts";
import { SHARED_BINDINGS, type SharedBinding } from "../../scripts/lint/shared-bindings.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const RULE = "vellum/shared-binding-imported";
const SEATS = "src/site/shared/zoom-room.ts";

const ROOM = 'import { bindRoom } from "./room.ts";';
const ZOOM = 'import { createZoomController } from "./zoom-controller.ts";';
const GLASS = 'import { bindGlassKeys } from "./glass-keys.ts";';
const FRAMING = 'import { framingCamera } from "./camera.ts";';
const USE_REST = "export const rest = [bindRoom, createZoomController, framingCamera];";
const GLASS_KEYS: SharedBinding = ["bindGlassKeys", "./glass-keys.ts"];

const reported = async (lines: readonly string[], path: string): Promise<Array<[string, string]>> => {
  return (await plantMessages(lines, path))
    .filter((m) => m.ruleId === RULE)
    .map((m) => {
      const [, name, from] = /takes (\S+) from (\S+) and uses it/.exec(m.message) ?? [];
      return [name!, from!];
    });
};

const BLIND_SPOT =
  "BLIND SPOTS, declared: a namespace import (import * as glass) and a re-export do not count as taking the binding, which errs toward a red; the use may stand anywhere in the file, and a use only in a type position (typeof), under void or in a local re-export still counts, which errs toward a pass";

const PLANTS: ReadonlyArray<readonly [string, readonly string[], Array<[string, string]>]> = [
  [
    "(a) all four taken by their imported names (one renamed) and used",
    [
      ROOM,
      'import { createZoomController as makeZoom } from "./zoom-controller.ts";',
      GLASS,
      FRAMING,
      "export const a = [bindRoom, makeZoom, bindGlassKeys, framingCamera];",
    ],
    [],
  ],
  ["(b) the import and the use deleted", [ROOM, ZOOM, FRAMING, USE_REST], [[...GLASS_KEYS]]],
  ["(c) imported, never used", [ROOM, ZOOM, GLASS, FRAMING, USE_REST], [[...GLASS_KEYS]]],
  [
    "(d) imported as a type, used as a type",
    [
      ROOM,
      ZOOM,
      FRAMING,
      'import type { bindGlassKeys } from "./glass-keys.ts";',
      USE_REST,
      "export type B = typeof bindGlassKeys;",
    ],
    [[...GLASS_KEYS]],
  ],
  [
    "(e) the specifier a type, used as a type",
    [
      ROOM,
      ZOOM,
      FRAMING,
      'import { type bindGlassKeys } from "./glass-keys.ts";',
      USE_REST,
      "export type B = typeof bindGlassKeys;",
    ],
    [[...GLASS_KEYS]],
  ],
  [
    "(f) imported from another specifier and used",
    [
      ROOM,
      ZOOM,
      FRAMING,
      'import { bindGlassKeys } from "../shared/glass-keys.ts";',
      USE_REST,
      "export const f = bindGlassKeys;",
    ],
    [[...GLASS_KEYS]],
  ],
  [
    "(g) a local function of the same name, used",
    [ROOM, ZOOM, FRAMING, USE_REST, "function bindGlassKeys(): void {}", "export const g = bindGlassKeys;"],
    [[...GLASS_KEYS]],
  ],
  [
    "(h) a namespace import, used through its member",
    [
      ROOM,
      ZOOM,
      FRAMING,
      'import * as glass from "./glass-keys.ts";',
      USE_REST,
      "export const h = glass.bindGlassKeys;",
    ],
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
    await reported([ROOM, ZOOM, USE_REST], "src/site/shared/room.ts"),
    [],
    "a file off the roster is read",
  );
});

const ROOM_BINDING: SharedBinding = ["bindRoom", "../shared/room.ts"];
const ZOOM_BINDING: SharedBinding = ["createZoomController", "../shared/zoom-controller.ts"];
const GLASS_BINDING: SharedBinding = ["bindGlassKeys", "../shared/glass-keys.ts"];
const FRAMING_BINDING: SharedBinding = ["framingCamera", "../shared/camera.ts"];
const TOUCH_BINDING: SharedBinding = ["bindChartTouch", "../shared/chart-touch.ts"];
const KIT_TOUCH: SharedBinding = ["bindChartTouch", "./chart-touch.ts"];
const ZOOM_ROOM: SharedBinding = ["bindZoomRoom", "../shared/zoom-room.ts"];
const ANNOUNCE: SharedBinding = ["makeAnnouncer", "../shared/announce.ts"];
const STORE: SharedBinding = ["deviceStorage", "../shared/table-store.ts"];
const ITEM: SharedBinding = ["prospectItemFrom", "../shared/table-address.ts"];

const ROSTER: Record<string, readonly SharedBinding[]> = {
  "src/site/shared/zoom-room.ts": [
    ["bindRoom", "./room.ts"],
    ["createZoomController", "./zoom-controller.ts"],
    GLASS_KEYS,
    ["framingCamera", "./camera.ts"],
  ],
  "src/site/shared/glass-keys.ts": [KIT_TOUCH],
  "src/site/print-room/seats.ts": [ZOOM_ROOM],
  "src/site/prospect/seats.ts": [ZOOM_ROOM],
  "src/site/ribbon/seats.ts": [ZOOM_ROOM],
  "src/site/reading-room/seats.ts": [ZOOM_ROOM],
  "src/site/specimen/app.ts": [ZOOM_ROOM],
  "src/site/writing-room/app.ts": [ZOOM_ROOM, ["MAP_WORDS", "../shared/map-words.ts"]],
  "src/site/seed-of-the-day/app.ts": [
    ROOM_BINDING,
    ZOOM_BINDING,
    GLASS_BINDING,
    FRAMING_BINDING,
    ["MAP_WORDS", "../shared/map-words.ts"],
  ],
  "src/site/home/app.ts": [TOUCH_BINDING],
  "src/site/explorer/app.ts": [
    ROOM_BINDING,
    ANNOUNCE,
    STORE,
    ["filingAt", "./chart-drawer.ts"],
    ["mapNoun", "../shared/map-words.ts"],
  ],
  "src/site/explorer/glass.ts": [TOUCH_BINDING],
  "src/site/explorer/portfolio/app.ts": [
    ["makeAnnouncer", "../../shared/announce.ts"],
    ["usesWorker", "../worker-client.ts"],
    ["deviceStorage", "../../shared/table-store.ts"],
    ["bindZoomRoom", "../../shared/zoom-room.ts"],
  ],
  "src/site/prospect/app.ts": [ITEM],
  "src/site/explorer/chart-drawer.ts": [ITEM],
};

test("the roster is exactly the import pins the close of Issue #779 moved here, the rooms' three folded into zoom-room.ts by Issue #1010, the Seed of the Day's room and keys added by Issue #1284, the touch press's three binders added by Issue #1288, the chart lines' map-type words added by Issue #1162, and every file and module it names exists", () => {
  assert.deepEqual(
    SHARED_BINDINGS,
    ROSTER,
    "the roster is not the import pins Issue #779 moved here as Issue #1010 folded them and Issue #1284, Issue #1288 and Issue #1162 added to them",
  );
  for (const [file, bindings] of Object.entries(SHARED_BINDINGS)) {
    assert.ok(existsSync(join(ROOT, file)), `${file} does not exist`);
    for (const [name, from] of bindings)
      assert.ok(
        existsSync(join(ROOT, dirname(file), from)),
        `${file} names ${name} from ${from}, which does not exist`,
      );
  }
});

const SEED = "src/site/seed-of-the-day/app.ts";
const SEED_ROOM = 'import { bindRoom } from "../shared/room.ts";';
const SEED_ZOOM = 'import { createZoomController } from "../shared/zoom-controller.ts";';
const SEED_GLASS = 'import { bindGlassKeys } from "../shared/glass-keys.ts";';
const SEED_FRAMING = 'import { framingCamera } from "../shared/camera.ts";';

const SEED_PLANTS: ReadonlyArray<readonly [string, readonly string[], Array<[string, string]>]> = [
  [
    "(s1) all four taken and used",
    [
      SEED_ROOM,
      SEED_ZOOM,
      SEED_GLASS,
      SEED_FRAMING,
      "export const s = [bindRoom, createZoomController, bindGlassKeys, framingCamera];",
    ],
    [],
  ],
  [
    "(s2) bindRoom's import and use deleted",
    [SEED_ZOOM, SEED_GLASS, SEED_FRAMING, "export const s = [createZoomController, bindGlassKeys, framingCamera];"],
    [[...ROOM_BINDING]],
  ],
  [
    "(s3) createZoomController's import and use deleted",
    [SEED_ROOM, SEED_GLASS, SEED_FRAMING, "export const s = [bindRoom, bindGlassKeys, framingCamera];"],
    [[...ZOOM_BINDING]],
  ],
  [
    "(s4) bindGlassKeys's import and use deleted",
    [SEED_ROOM, SEED_ZOOM, SEED_FRAMING, "export const s = [bindRoom, createZoomController, framingCamera];"],
    [[...GLASS_BINDING]],
  ],
  [
    "(s5) framingCamera's import and use deleted",
    [SEED_ROOM, SEED_ZOOM, SEED_GLASS, "export const s = [bindRoom, createZoomController, bindGlassKeys];"],
    [[...FRAMING_BINDING]],
  ],
];

test("the Seed of the Day, which binds its room, its zoom and the Glass's keys itself rather than through bindZoomRoom, is held to each binding its roster entry names (Issue #1284)", async () => {
  assert.ok(
    SEED_PLANTS.some(([, , want]) => want.length === 0) && SEED_PLANTS.some(([, , want]) => want.length > 0),
    "the plants cannot tell the rule from its negation",
  );
  for (const [name, lines, want] of SEED_PLANTS)
    assert.deepEqual(
      (await reported(lines, SEED)).filter(([n]) => n !== "MAP_WORDS"),
      want,
      name,
    );
});

const HOME = "src/site/home/app.ts";
const KIT_GLASS = "src/site/shared/glass-keys.ts";
const EXPLORER_GLASS = "src/site/explorer/glass.ts";
const TAKES_TOUCH = 'import { bindChartTouch, pageTouchEnv } from "../shared/chart-touch.ts";';
const ENV_ONLY = 'import { pageTouchEnv } from "../shared/chart-touch.ts";';
const USES_BOTH = "export const t = [bindChartTouch, pageTouchEnv];";
const USES_ENV = "export const t = [pageTouchEnv];";

const TOUCH_PLANTS: ReadonlyArray<readonly [string, string, readonly string[], Array<[string, string]>]> = [
  [
    "(t1) the kit's Glass keys take and use it",
    KIT_GLASS,
    ['import { bindChartTouch, pageTouchEnv } from "./chart-touch.ts";', USES_BOTH],
    [],
  ],
  [
    "(t2) the kit's Glass keys with its import and use deleted",
    KIT_GLASS,
    ['import { pageTouchEnv } from "./chart-touch.ts";', USES_ENV],
    [[...KIT_TOUCH]],
  ],
  ["(t3) home takes and uses it", HOME, [TAKES_TOUCH, USES_BOTH], []],
  ["(t4) home with its import and use deleted", HOME, [ENV_ONLY, USES_ENV], [[...TOUCH_BINDING]]],
  ["(t5) the Explorer's Glass takes and uses it", EXPLORER_GLASS, [TAKES_TOUCH, USES_BOTH], []],
  [
    "(t6) the Explorer's Glass with its import and use deleted",
    EXPLORER_GLASS,
    [ENV_ONLY, USES_ENV],
    [[...TOUCH_BINDING]],
  ],
];

test("home, the Explorer's Glass and the kit's Glass keys, each binding the chart's touch press itself, are each held to bindChartTouch from the shared module (Issue #1288)", async () => {
  assert.ok(
    TOUCH_PLANTS.some(([, , , want]) => want.length === 0) && TOUCH_PLANTS.some(([, , , want]) => want.length > 0),
    "the plants cannot tell the rule from its negation",
  );
  for (const [name, path, lines, want] of TOUCH_PLANTS) assert.deepEqual(await reported(lines, path), want, name);
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

const MAP_WORDS_BINDING: SharedBinding = ["MAP_WORDS", "../shared/map-words.ts"];
const MAP_NOUN_BINDING: SharedBinding = ["mapNoun", "../shared/map-words.ts"];
const WORDS_IMPORT = 'import { MAP_WORDS } from "../shared/map-words.ts";';
const NOUN_IMPORT = 'import { mapNoun } from "../shared/map-words.ts";';
const INLINE_ARTICLE = 'export const line = type === "archipelago" ? "an" : "a";';
const INLINE_RAW = "export const caption = type;";

const MAP_PAGES: ReadonlyArray<readonly [string, string, SharedBinding, string, string]> = [
  ["Today", "src/site/seed-of-the-day/app.ts", MAP_WORDS_BINDING, WORDS_IMPORT, "export const line = MAP_WORDS[type];"],
  [
    "the Writing Room",
    "src/site/writing-room/app.ts",
    MAP_WORDS_BINDING,
    WORDS_IMPORT,
    "export const line = MAP_WORDS[type];",
  ],
  ["the Explorer", "src/site/explorer/app.ts", MAP_NOUN_BINDING, NOUN_IMPORT, "export const caption = mapNoun(type);"],
];

test("Today, the Writing Room and the Explorer, each writing a chart line from the shared map-type words, are each held to that binding (Issue #1162)", async () => {
  const held = async (lines: readonly string[], path: string, name: string): Promise<Array<[string, string]>> =>
    (await reported(lines, path)).filter(([n]) => n === name);
  for (const [room, path, binding, taken, use] of MAP_PAGES) {
    const [name] = binding;
    assert.deepEqual(await held([taken, use], path, name), [], `${room} takes ${name} and uses it`);
    assert.deepEqual(
      await held([name === "mapNoun" ? INLINE_RAW : INLINE_ARTICLE], path, name),
      [[...binding]],
      `${room} reverted to its inline form, import gone. ${BLIND_SPOT}`,
    );
    assert.deepEqual(
      await held([taken, name === "mapNoun" ? INLINE_RAW : INLINE_ARTICLE], path, name),
      [[...binding]],
      `${room} reverted to its inline form, import left. ${BLIND_SPOT}`,
    );
  }
});
