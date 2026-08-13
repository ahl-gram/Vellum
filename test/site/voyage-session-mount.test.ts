import { test } from "node:test";
import assert from "node:assert/strict";
import { realWorld, stackedMount } from "../../test-support/living-chart-hosts.ts";

// #364: what the session builder does to the MOUNT, asserted against a mount that already holds overlays: the wipe of every .voyage-overlay immediately before the unconditional append.
// Not only e2e because three ways of getting that line wrong were measured to survive SV2g/SV2h (a singular querySelector, the wipe hoisted above the bails, the query widened to document); all three are visible from the mount's own side, via stackedMount's ordered ledger.

const SUBTITLE = "as surveyed by Taiki the Wayfarer";

async function builderOverStack() {
  const [{ createSessionBuilder }, { barlessLogPanel }] = await Promise.all([
    import("../../src/site/living-chart/voyage-session.ts"),
    import("../../src/site/living-chart/no-bar.ts"),
  ]);
  // realWorld installs the element shim the overlay svg's construction needs.
  const { manifest, survey } = await realWorld();
  const mount = stackedMount();
  const sessions = createSessionBuilder({ mapEl: mount.el, logPanel: barlessLogPanel() });
  return { sessions, mount, manifest, survey };
}

test("#364 the builder drops EVERY overlay the mount holds, not just the first", async () => {
  const { sessions, mount, manifest, survey } = await builderOverStack();

  const session = sessions.build(manifest, survey, 42, SUBTITLE);

  assert.ok(session, "the fixture world really does route a survey");
  assert.deepEqual(
    mount.ledger.filter((e) => e.startsWith("remove:")),
    ["remove:first", "remove:second"],
    "both stale overlays are taken off the mount",
  );
});

test("#364 the wipe runs BEFORE the append, and asks the MOUNT for the nodes", async () => {
  const { sessions, mount, manifest, survey } = await builderOverStack();

  sessions.build(manifest, survey, 42, SUBTITLE);

  // Order matters: a wipe placed after the append removes the overlay the builder just added, and the mount ends up with no track at all.
  // The ask: entry proves the query went to the MOUNT; the document-scoped mutation reds HERE as a THROW (installShim's document carries only factory methods), not as this assertion.
  assert.deepEqual(
    mount.ledger,
    ["ask:.voyage-overlay", "remove:first", "remove:second", "append:voyage-overlay"],
    "ask the mount, drop what it holds, then append this session's overlay",
  );
});

test("#364 a build that bails leaves the mount exactly as it found it", async () => {
  const { sessions, mount, manifest } = await builderOverStack();

  // No survey: the earliest of build's three bails, and the one a real host actually reaches.
  const session = sessions.build(manifest, null, 42, SUBTITLE);

  assert.equal(session, null, "the build bailed");
  // Why the wipe sits AFTER the bails: hoisted, a survey-less arm would strip a previous world's resting overlay and put nothing in its place, and nothing else in the suite or e2e can see that.
  assert.deepEqual(mount.ledger, [], "the mount was neither asked nor touched");
});
