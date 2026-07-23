import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { cleanPublicGenerated, GENERATED_SUBTREES } from "../../scripts/clean-public-generated.ts";

process.env.ASTRO_TELEMETRY_DISABLED = "1";

/**
 * Scriptorium Sub 3 (#204): the app surfaces served verbatim from public/. The
 * spec is the ratified Sub 1 decision doc (the 2026-07-21 comment on #202),
 * sections 1 and 3 plus constraints 2, 3, 4, and 10: the committed sources under
 * public/{explorer,print-room,seed-of-the-day,lib,shared} ship verbatim (since
 * Sub 5 retired docs/, public/ is their single committed home), and the
 * gitignored runtime trees (the tsc engine emit + the Vite bundle twins and
 * their shared chunks, #208) are regenerated into public/ by
 * `npm run astro:generate` before every astro dev/build, with decision D's
 * clean-before-regen so a renamed engine module cannot leave an importable
 * orphan that masks a 404 locally.
 */

const root = (p = "") => fileURLToPath(new URL(`../../${p}`, import.meta.url));

// The literal Sub 3 floor. Deliberately NOT derived from GENERATED_SUBTREES:
// the review of this sub caught that a constant serving as both subject and
// oracle lets a botched Sub 4 list edit (drop explorer/engine while adding
// atlas/gallery) pass every guard. Sub 4 may only GROW the cleaned set.
const SUB3_GENERATED = [
  "explorer/engine",
  "explorer/app.bundle.js",
  "explorer/worker.bundle.js",
  "seed-of-the-day/app.bundle.js",
] as const;

test("the cleaned set keeps its Sub 3 floor (later subs may only grow it)", () => {
  for (const sub of SUB3_GENERATED) {
    assert.ok(GENERATED_SUBTREES.includes(sub), `GENERATED_SUBTREES must keep ${sub}`);
  }
});

test("the generated runtime trees are gitignored in public/", () => {
  const lines = readFileSync(root(".gitignore"), "utf8").split("\n");
  for (const sub of SUB3_GENERATED) {
    const line = sub.endsWith(".bundle.js") ? `public/${sub}` : `public/${sub}/`;
    assert.ok(lines.includes(line), `.gitignore should carry the exact line ${line}`);
  }
});

test("astro:generate regenerates the runtime trees into public/, and dev/build run it first", async () => {
  const pkg = JSON.parse(readFileSync(root("package.json"), "utf8"));
  assert.equal(
    pkg.scripts["astro:generate"],
    "node scripts/clean-public-generated.ts && tsc -p tsconfig.browser.json --outDir public/explorer/engine && node scripts/build-app-bundles.ts && node scripts/generate-showcases.ts",
    "astro:generate must clean, emit the engine, bundle (Vite since Sub 7), then generate the showcases",
  );
  assert.equal(pkg.scripts["astro:dev"], "npm run astro:generate && astro dev", "dev parity needs the runtime trees");
  assert.equal(pkg.scripts["build"], "npm run astro:generate && astro build", "the build serves what dev serves");
  assert.equal(pkg.scripts["astro:preview"], "astro preview", "preview reuses the last build untouched");
});

test("clean-before-regen removes exactly its own generated subtrees, tolerating absence", async () => {
  const tmp = root("out/test-clean-public");
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(join(tmp, "explorer", "engine", "world"), { recursive: true });
  writeFileSync(join(tmp, "explorer", "engine", "world", "orphan.js"), "// renamed-away module");
  writeFileSync(join(tmp, "explorer", "app.bundle.js"), "// stale twin");
  writeFileSync(join(tmp, "explorer", "worker.bundle.js"), "// stale twin");
  mkdirSync(join(tmp, "seed-of-the-day"), { recursive: true });
  writeFileSync(join(tmp, "seed-of-the-day", "app.bundle.js"), "// stale twin");
  writeFileSync(join(tmp, "explorer", "app.js"), "// committed source, must survive");

  await cleanPublicGenerated(tmp);
  // Assert the LITERAL paths, not GENERATED_SUBTREES: the subject iterates that
  // constant, so an assertion derived from it would be circular.
  assert.ok(!existsSync(join(tmp, "explorer", "engine")), "the engine subtree should be cleaned before regen");
  for (const twin of SUB3_GENERATED.filter((s) => s.endsWith(".bundle.js"))) {
    assert.ok(!existsSync(join(tmp, twin)), `${twin} should be cleaned before regen`);
  }
  assert.ok(existsSync(join(tmp, "explorer", "app.js")), "committed source must survive the clean");

  await cleanPublicGenerated(tmp); // second run on an already-clean tree must not throw
  rmSync(tmp, { recursive: true, force: true });
});

test("the no-arg CLI cleans ./public relative to CWD (the exact astro:generate invocation)", () => {
  const scratch = root("out/test-clean-cli");
  rmSync(scratch, { recursive: true, force: true });
  mkdirSync(join(scratch, "public", "explorer", "engine", "world"), { recursive: true });
  writeFileSync(join(scratch, "public", "explorer", "engine", "world", "orphan.js"), "// stale");
  writeFileSync(join(scratch, "public", "explorer", "app.bundle.js"), "// stale twin");
  writeFileSync(join(scratch, "public", "explorer", "index.html"), "<!-- committed, must survive -->");

  execFileSync(process.execPath, [root("scripts/clean-public-generated.ts")], { cwd: scratch });

  assert.ok(!existsSync(join(scratch, "public", "explorer", "engine")), "the CLI should clean <cwd>/public");
  assert.ok(!existsSync(join(scratch, "public", "explorer", "app.bundle.js")), "twins go too");
  assert.ok(existsSync(join(scratch, "public", "explorer", "index.html")), "committed files survive");
  rmSync(scratch, { recursive: true, force: true });
});

test("astro dev serves the app surfaces at their canonical directory URLs (dev parity)", async () => {
  const { dev } = await import("astro");
  const server = await dev({ root: root(""), logLevel: "error", server: { port: 4877 } });
  try {
    const at = (path: string) => `http://localhost:${server.address.port}${path}`;
    for (const [path, marker] of [
      ["/explorer/", "app.bundle.js"],
      ["/print-room/", "app.bundle.js"],
      ["/seed-of-the-day/", "app.bundle.js"],
    ] as const) {
      const res = await fetch(at(path));
      assert.equal(res.status, 200, `${path} should serve the public/ shell in dev, not Astro's 404`);
      assert.ok((await res.text()).includes(marker), `${path} should be the app shell (loads ${marker})`);
    }
    const route = await fetch(at("/faq/"));
    assert.equal(route.status, 200, "Astro routes keep winning their own URLs");
    const sub = await fetch(at("/explorer/app.js"));
    assert.equal(sub.status, 200, "exact-path subresources stay served from public/");
    const missing = await fetch(at("/no-such-surface/"));
    assert.equal(missing.status, 404, "directories with no public/ shell still 404");
  } finally {
    await server.stop();
  }
});
