import { test } from "node:test";
import assert from "node:assert/strict";
import { bareEl, realWorld, recordingSink, stackedMount } from "../../test-support/living-chart-hosts.ts";

// #364: what the session builder does to the MOUNT, asserted against a mount that already holds overlays: the wipe of every .voyage-overlay immediately before the unconditional append.
// Not only e2e because three ways of getting that line wrong were measured to survive SV2g/SV2h (a singular querySelector, the wipe hoisted above the bails, the query widened to document); all three are visible from the mount's own side, via stackedMount's ordered ledger.
// #371 adds the OTHER side of the same call: what the ENGINE does to the mount when that build bails. No arm path can reach a bailing arm through the UI, so an e2e cannot see this at all.

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

async function engineOverStack() {
  const [{ createVoyage }, { barlessLogPanel }] = await Promise.all([
    import("../../src/site/living-chart/voyage.ts"),
    import("../../src/site/living-chart/no-bar.ts"),
  ]);
  const { manifest, survey } = await realWorld();
  const mount = stackedMount();
  const { sink, calls } = recordingSink();
  const voyage = createVoyage({
    mapEl: mount.el,
    statusEl: bareEl(),
    logPanel: barlessLogPanel(),
    restingTrackSink: sink,
  });
  return { voyage, mount, manifest, survey, calls };
}

const BAILED = ["ask:.voyage-overlay", "remove:first", "remove:second"];

test("#371 a re-arm whose build bails strips BOTH faces, not just the mount", async () => {
  const { voyage, mount, manifest, calls } = await engineOverStack();

  voyage.rearmVoyage(manifest, null, 42, SUBTITLE);

  assert.deepEqual(mount.ledger, BAILED, "a bailing re-arm drops every overlay the mount holds and appends nothing");
  // #174 says the faces can never disagree, and a wiped recto over a verso still carrying the last world's track is exactly that.
  assert.deepEqual(calls, ["clear"], "the ink stays on the back of the sheet after the front was scraped");
});

test("#371 a QUIET bail wipes the recto and leaves the verso frozen", async () => {
  const { voyage, mount, manifest, calls } = await engineOverStack();

  voyage.rearmVoyage(manifest, null, 42, SUBTITLE, { quiet: true });

  assert.deepEqual(mount.ledger, BAILED, "the quiet path wipes the mount the same way");
  // The one asymmetry that is deliberate: re-blobbing the ghost per drag frame is the ~1 MB leak #116 exists to avoid, so a quiet arm freezes the whole back face, bail included.
  assert.deepEqual(calls, [], "the quiet bail never touches the verso sink");
});

test("#371 the class: applyVoyage's bail leaves the mount bare too, by its leading exit", async () => {
  const { voyage, mount, manifest, calls } = await engineOverStack();

  voyage.applyVoyage(manifest, null, 42, SUBTITLE);

  // rearmVoyage earns this with its own wipe; applyVoyage earns it only from the exitVoyage() at its head, so the invariant here rests on CALL ORDER and nothing else was watching it.
  assert.deepEqual(mount.ledger, BAILED, "a bailing toggle-ON leaves the previous overlay resting");
  assert.deepEqual(calls, ["clear"], "and leaves its track on the verso");
});

test("#371 control: a re-arm that BUILDS still appends, and the wipe is the builder's", async () => {
  const { voyage, mount, manifest, survey, calls } = await engineOverStack();

  voyage.rearmVoyage(manifest, survey, 42, SUBTITLE);

  assert.deepEqual(
    mount.ledger,
    [...BAILED, "append:voyage-overlay"],
    "one wipe, the builder's, then the session's own overlay",
  );
  assert.equal(calls.length, 1, "a loud re-arm mirrors the resting track to the verso");
  assert.match(calls[0] as string, /^paint:/, "and mirrors it by PAINTING, not by clearing");
});
