import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { cleanGenerated, GENERATED } from "../../scripts/clean-generated.ts";

process.env.ASTRO_TELEMETRY_DISABLED = "1";

// Scriptorium Sub 3 (Issue #204): the app surfaces' bundles served verbatim from the build-output folder (generated/ since Issue #768). SPEC: the ratified 2026-07-21 comment on Issue #202 (sections 1 and 3, constraints 2, 3, 4, 10), with decision D's clean-before-regen so a renamed engine module cannot leave an importable orphan that masks a 404 locally.

const root = (p = "") => fileURLToPath(new URL(`../../${p}`, import.meta.url));

test("astro:generate regenerates the runtime trees into generated/, and dev/build run it first", () => {
  const pkg = JSON.parse(readFileSync(root("package.json"), "utf8")) as { scripts: Record<string, string> };
  assert.equal(
    pkg.scripts["astro:generate"],
    "node scripts/clean-generated.ts && node scripts/kit-fonts.ts && node scripts/place-files.ts && node scripts/build-app-bundles.ts && node scripts/generate-showcases.ts && node scripts/generate-discovery.ts",
    "astro:generate must clean, copy the kit fonts (Issue #706), bundle (Vite compiles the TS graph since Sub 9, #260), then generate the showcases and the discovery files",
  );
  assert.equal(pkg.scripts["astro:dev"], "npm run astro:generate && astro dev", "dev parity needs the runtime trees");
  assert.equal(pkg.scripts["build"], "npm run astro:generate && astro build", "the build serves what dev serves");
  assert.equal(pkg.scripts["astro:preview"], "astro preview", "preview reuses the last build untouched");
});

test("clean-before-regen deletes the build-output folder whole, tolerates its absence, and refuses a folder of any other name (Issue #204 decision D, Issue #768)", async () => {
  const base = root("out/test-clean");
  const tmp = join(base, GENERATED);
  rmSync(base, { recursive: true, force: true });
  mkdirSync(join(tmp, "explorer", "engine", "world"), { recursive: true });
  writeFileSync(join(tmp, "explorer", "engine", "world", "orphan.js"), "// renamed-away module");
  writeFileSync(join(tmp, "explorer", "app.bundle.js"), "// stale twin");
  writeFileSync(join(base, "beside.txt"), "beside the folder, must survive");

  await cleanGenerated(tmp);
  assert.ok(!existsSync(tmp), "the build-output folder should be deleted whole before regen");
  assert.ok(existsSync(join(base, "beside.txt")), "a file beside the folder must survive the clean");

  await cleanGenerated(tmp); // second run on an already-clean tree must not throw

  await assert.rejects(cleanGenerated(base), /refusing/, "a folder not named generated is refused");
  assert.ok(existsSync(join(base, "beside.txt")), "the refused folder is left alone");
  rmSync(base, { recursive: true, force: true });
});

test("the no-arg CLI deletes ./generated relative to CWD (the exact astro:generate invocation)", () => {
  const scratch = root("out/test-clean-cli");
  rmSync(scratch, { recursive: true, force: true });
  mkdirSync(join(scratch, GENERATED, "explorer", "engine", "world"), { recursive: true });
  writeFileSync(join(scratch, GENERATED, "explorer", "engine", "world", "orphan.js"), "// stale");
  mkdirSync(join(scratch, "src"), { recursive: true });
  writeFileSync(join(scratch, "src", "app.ts"), "// committed source, must survive");

  execFileSync(process.execPath, [root("scripts/clean-generated.ts")], { cwd: scratch });

  assert.ok(!existsSync(join(scratch, GENERATED)), "the CLI should delete <cwd>/generated");
  assert.ok(existsSync(join(scratch, "src", "app.ts")), "committed files survive");
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
      ["/reading-room/", "app.bundle.js"],
      ["/seed-of-the-day/", "app.bundle.js"],
      ["/prospect/", "app.bundle.js"],
      ["/ribbon/", "app.bundle.js"],
      ["/writing-room/", "app.bundle.js"],
      ["/", "app.bundle.js"],
    ] as const) {
      const res = await fetch(at(path));
      assert.equal(res.status, 200, `${path} should serve the app page in dev, not Astro's 404`);
      assert.ok((await res.text()).includes(marker), `${path} should be the app page (loads ${marker})`);
    }
    const route = await fetch(at("/faq/"));
    assert.equal(route.status, 200, "Astro routes keep winning their own URLs");
    assert.ok(existsSync(root("src/styles/explorer/index.css")), "the sheet is written under src/styles/");
    assert.equal(
      existsSync(root("generated/explorer/index.css")),
      false,
      "no copy of a sheet sits in the build-output folder, so the dev server's answer is the source's",
    );
    const sub = await fetch(at("/explorer/index.css"));
    assert.equal(sub.status, 200, "a sheet is served in dev from src/styles/");
    assert.ok(sub.headers.get("content-type")?.startsWith("text/css"), "the sheet is answered as text/css");
    assert.equal(
      await sub.text(),
      readFileSync(root("src/styles/explorer/index.css"), "utf8"),
      "the dev server answers with the source's current bytes",
    );
    assert.ok(existsSync(root("src/static/og.png")), "the card is written under src/static/");
    const card = await fetch(at("/og.png"));
    assert.equal(card.status, 200, "a committed file is served in dev from src/static/");
    assert.equal(card.headers.get("content-type"), "image/png", "the card is answered as image/png");
    assert.ok(
      Buffer.from(await card.arrayBuffer()).equals(readFileSync(root("src/static/og.png"))),
      "the dev server answers with the card's bytes",
    );
    const missing = await fetch(at("/no-such-surface/"));
    assert.equal(missing.status, 404, "directories with no generated/ shell still 404");
  } finally {
    await server.stop();
  }
});
