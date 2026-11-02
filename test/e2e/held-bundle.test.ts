import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { serverState, startServer, withHeldBundle } from "../../e2e/site-server.ts";

test("the e2e harness's server holds home's bundle while a check holds it, serves every other file meanwhile, and serves the bundle once the check lets it go (Issue #1172)", async () => {
  const site = mkdtempSync(join(tmpdir(), "vellum-held-bundle-"));
  writeFileSync(join(site, "app.bundle.js"), "export {};");
  writeFileSync(join(site, "index.css"), "body {}");
  const server = await startServer(site, 0);
  try {
    const address = server.address();
    assert.ok(address !== null && typeof address === "object", "the server listens on a port");
    const at = `http://127.0.0.1:${address.port}`;
    await withHeldBundle(async (release) => {
      const bundle = fetch(`${at}/app.bundle.js`).then((r) => r.text());
      assert.equal(
        await fetch(`${at}/index.css`).then((r) => r.text()),
        "body {}",
        "a file beside the bundle waited on the hold",
      );
      assert.equal(
        await Promise.race([bundle.then(() => "served"), delay(200, "held")]),
        "held",
        "the bundle was served while held",
      );
      release();
      assert.equal(await bundle, "export {};");
    });
  } finally {
    await new Promise((done) => server.close(done));
    rmSync(site, { recursive: true, force: true });
  }
});

test("withHeldBundle holds home's bundle for its body alone, letting it go after a body that passed and after one that threw, and hands back the body's own value or error (Issue #1172)", async () => {
  const during: (Promise<void> | null)[] = [];
  assert.equal(
    await withHeldBundle(() => {
      during.push(serverState.heldBundle);
      return Promise.resolve("read");
    }),
    "read",
  );
  assert.equal(serverState.heldBundle, null, "the hold outlived a body that passed");
  await assert.rejects(
    withHeldBundle(() => {
      during.push(serverState.heldBundle);
      return Promise.reject(new Error("the body's own error"));
    }),
    /the body's own error/,
  );
  assert.equal(serverState.heldBundle, null, "the hold outlived a body that threw");
  for (const hold of during) {
    assert.notEqual(hold, null, "a body ran with nothing held");
    assert.equal(
      await Promise.race([hold!.then(() => "let go"), delay(100, "still held")]),
      "let go",
      "a request waiting on the hold was never let go",
    );
  }
});
