import assert from "node:assert/strict";
import { compareFamilies } from "../e2e/split-proof.ts";
import type { FamilyFile } from "../e2e/split-proof.ts";

export const files = (...texts: string[]): FamilyFile[] =>
  texts.map((text, i) => ({ path: i === 0 ? "e2e/suites/map.ts" : `e2e/suites/map/part${i}.ts`, text }));

export const BASE = [
  'import { makeStep } from "./step-support.ts";',
  "const TICK = 120;",
  'const READ = `({ok:!!document.getElementById("map")})`;',
  "export async function run(ctx) {",
  "  const { evaluate, send, check, sleep, waitSettled } = ctx;",
  "  const settle = makeSettle(ctx);",
  "  const step = makeStep(ctx);",
  "  const DRAWN = 400;",
  "  const go = async (hash) => {",
  '    await send("Page.navigate", { url: `http://127.0.0.1/#${hash}` });',
  "    await sleep(TICK);",
  "  };",
  '  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800 });',
  '  await step("M1", async () => {',
  '    await go("seed=42");',
  '    const g = await settle(READ, (d) => d.ok && d.n === 1, "m1", DRAWN);',
  '    check("M1 the map draws", g.n === 1, JSON.stringify(g));',
  "  });",
  "  let laid = null;",
  '  await step("M2", async () => {',
  "    laid = await evaluate(READ);",
  '    if (!laid) throw new Error("never laid");',
  '    await waitSettled("m2");',
  "  });",
  '  await step("M3", async () => {',
  '    check("M3 it stays laid", !!laid);',
  "  });",
  '  await go("");',
  "}",
].join("\n");

export const SPLIT_RUN = [
  'import { makeStep } from "./step-support.ts";',
  'import { mapKit, m1Draws, m2Lays, m3Stays, desktop } from "./map/part1.ts";',
  "export async function run(ctx) {",
  "  const settle = makeSettle(ctx);",
  "  const step = makeStep(ctx);",
  "  const k = mapKit({ ...ctx, settle });",
  "  const { go } = k;",
  "  await desktop(k);",
  '  await step("M1", () => m1Draws(k));',
  "  let laid = null;",
  '  await step("M2", async () => { laid = await m2Lays(k); });',
  '  await step("M3", () => m3Stays(k, laid));',
  '  await go("");',
  "}",
].join("\n");

export const SPLIT_GROUPS = [
  "export const TICK = 120;",
  'export const READ = `({ok:!!document.getElementById("map")})`;',
  "const DRAWN = 400;",
  "export function mapKit(base) {",
  "  const { send, sleep } = base;",
  "  const go = async (hash) => {",
  '    await send("Page.navigate", { url: `http://127.0.0.1/#${hash}` });',
  "    await sleep(TICK);",
  "  };",
  "  return { ...base, go };",
  "}",
  "export async function desktop({ send }) {",
  '  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800 });',
  "}",
  "export async function m1Draws({ check, settle, go }) {",
  '  await go("seed=42");',
  '  const g = await settle(READ, (d) => d.ok && d.n === 1, "m1", DRAWN);',
  '  check("M1 the map draws", g.n === 1, JSON.stringify(g));',
  "}",
  "export async function m2Lays({ evaluate, waitSettled }) {",
  "  const laid = await evaluate(READ);",
  '  if (!laid) throw new Error("never laid");',
  '  await waitSettled("m2");',
  "  return laid;",
  "}",
  "export async function m3Stays({ check }, laid) {",
  '  check("M3 it stays laid", !!laid);',
  "}",
].join("\n");

export const verdict = (after: readonly string[]) => compareFamilies(files(BASE), files(...after));
export const split = (runText: string, groupsText: string) => verdict([runText, groupsText]);
export const swapped = (text: string, from: string, to: string): string => {
  assert.ok(
    text.includes(from),
    `the fixture no longer carries ${from}, so this case would compare the unchanged text`,
  );
  return text.replace(from, to);
};
export const inGroups = (from: string, to: string) => split(SPLIT_RUN, swapped(SPLIT_GROUPS, from, to));
