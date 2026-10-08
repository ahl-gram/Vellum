import { test } from "node:test";
import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { ESLint } from "eslint";

const ROOT = resolve(import.meta.dirname, "..", "..");
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });

const reports = async (lines: readonly string[], path: string, rule: string): Promise<number[]> => {
  const [result] = await eslint.lintText(lines.join("\n"), { filePath: join(ROOT, path) });
  assert.deepEqual(
    result!.messages.filter((m) => m.fatal).map((m) => m.message),
    [],
    `the plant at ${path} does not parse, so no rule read it`,
  );
  return result!.messages.filter((m) => m.ruleId === rule).map((m) => m.line);
};

test("a prospect table item is built only by prospectItemFrom: no other site script writes the kind beside the item's own style, however the keys are spelled (Issue #522)", async () => {
  const plant = [
    'export const a = { kind: "prospect" as const, seed: 1, style: "antique" };',
    'export const b = { kind: "prospect", overrides: {}, style: "ink" };',
    'export const c = { kind: "prospect", dress: "antique" };',
    'export const d = { kind: "survey", style: "antique" };',
    'const style = "ink"; export const e = { kind: "prospect", style };',
    'export const f = { "kind": "prospect", "style": "ink" };',
  ];
  const rule = "vellum/prospect-item-through-builder";
  assert.deepEqual(await reports(plant, "src/site/prospect/app.ts", rule), [1, 2, 5, 6]);
  assert.deepEqual(await reports(plant, "src/site/explorer/app.ts", rule), [1, 2, 5, 6], "the other door");
  assert.deepEqual(await reports(plant, "src/site/shared/table-address.ts", rule), [], "the builder's own file");
});

const SCROLL_PLANT = [
  "export const a = (el: Element): void => el.scrollIntoView();",
  "export const b = (): void => window.scrollTo(0, 0);",
  "export const c = (): void => scrollBy(0, 10);",
  "export const d = (el: Element): void => { el.scrollTop = 0; };",
  "export const e = (el: Element): void => { el.scrollLeft += 4; };",
  "export const f = (el: Element): number => el.scrollTop;",
  "export const g = (el?: Element): void => el?.scrollIntoView();",
  'export const h = (el: Element): void => el["scrollIntoView"]();',
  "// scrollIntoView, named in a comment",
];

test("no chart room moves the reading position: no scroll call and no scroll write, a read admitted (Issue #442 decision 4)", async () => {
  const rule = "vellum/room-no-scroll";
  for (const room of [
    "src/site/reading-room/prospect-stage.ts",
    "src/site/reading-frame/index.ts",
    "src/site/print-room/app.ts",
    "src/site/prospect/app.ts",
    "src/site/ribbon/app.ts",
  ])
    assert.deepEqual(await reports(SCROLL_PLANT, room, rule), [1, 2, 3, 4, 5, 7, 8], room);
  assert.deepEqual(await reports(SCROLL_PLANT, "src/site/explorer/app.ts", rule), [], "the Explorer is no chart room");
});

test("the prospect stage writes nothing to the status line: no status element by name, selector or id lookup (Issue #311)", async () => {
  const plant = [
    'export const a = (statusEl: HTMLElement): void => { statusEl.textContent = ""; };',
    'export const b = (): Element | null => document.querySelector("#status");',
    'export const c = (): HTMLElement | null => document.getElementById("status");',
    'declare const $: (id: string) => HTMLElement; export const d = (): HTMLElement => $("status");',
    'export const e = (): HTMLElement | null => document.getElementById("stage");',
    "// the #status line, named in a comment",
  ];
  const rule = "vellum/stage-no-status";
  assert.deepEqual(await reports(plant, "src/site/reading-room/prospect-stage.ts", rule), [1, 1, 2, 3, 4]);
  assert.deepEqual(
    await reports(plant, "src/site/reading-room/told-plate.ts", rule),
    [],
    "the rule reaches the stage alone",
  );
});
