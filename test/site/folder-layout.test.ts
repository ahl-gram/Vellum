import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { BUNDLE_ENTRIES } from "../../scripts/build-app-bundles.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
// A cap on a hang, never a budget (2026-10-18: this listing ran in 7 ms on a Mac, so 30 s is three orders above it); a timed-out spawnSync returns status null rather than throwing, which the status check below turns into a throw, and no test drives that path.
const GIT_TIMEOUT_MS = 30_000;
const BUNDLE_SUFFIX = "app.bundle.js";
const HOME_SHEETS: readonly string[] = ["home-noscript.css", "index.css"];

const codeFolderOf = (twin: string): string =>
  twin === BUNDLE_SUFFIX ? "src/site/home/app.ts" : `src/site/${twin.slice(0, -BUNDLE_SUFFIX.length)}app.ts`;

const listed = (dir: string): string[] => {
  const listing = spawnSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--deduplicate", "--", dir],
    { cwd: ROOT, encoding: "utf8", timeout: GIT_TIMEOUT_MS },
  );
  if (listing.status !== 0)
    throw new Error(
      `git ls-files failed (${listing.status}, ${listing.error ?? listing.stderr}): the tree listing would be empty or partial`,
    );
  return listing.stdout
    .split("\0")
    .filter(Boolean)
    .map((path) => path.slice(`${dir}/`.length));
};
const foldersOf = (remainders: readonly string[]): Set<string> =>
  new Set(remainders.filter((r) => r.includes("/")).map((r) => r.slice(0, r.indexOf("/"))));
const isRoute = (name: string): boolean => existsSync(join(ROOT, "src/pages", name, "index.astro"));

test("every working page's code sits at its route path: each bundle entry's folder is its twin's, and home's is src/site/home/ (Issue #767)", () => {
  const strays = BUNDLE_ENTRIES.filter(({ entry, twin }) => entry !== codeFolderOf(twin));
  assert.deepEqual(strays, []);
  assert.ok(BUNDLE_ENTRIES.length > 1, "the roster was read");
});

test("every folder directly under src/site/ is a page's own, home's, or src/site/shared/ (Issue #767)", () => {
  const remainders = listed("src/site");
  const folders = foldersOf(remainders);
  const loose = remainders.filter((r) => !r.includes("/"));
  const strays = [
    ...loose,
    ...[...folders].filter((name) => name !== "shared" && name !== "home" && !isRoute(name)),
  ].sort();
  assert.deepEqual(strays, []);
  assert.ok(folders.has("explorer") && folders.has("shared"), "git listed the tree");
});

test("the only sheets at the top of src/styles/ are home's two, and every folder directly under it is a page's own or src/styles/shared/ (Issue #768)", () => {
  const remainders = listed("src/styles");
  const folders = foldersOf(remainders);
  const loose = remainders.filter((r) => !r.includes("/") && !HOME_SHEETS.includes(r));
  const strays = [...loose, ...[...folders].filter((name) => name !== "shared" && !isRoute(name))].sort();
  assert.deepEqual(strays, []);
  assert.ok(folders.has("explorer") && HOME_SHEETS.every((sheet) => remainders.includes(sheet)), "git listed the tree");
});
