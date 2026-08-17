import { test } from "node:test";
import assert from "node:assert/strict";
import { realWorld, recordingLogPanel, recordingSink, recordingStatus, stackedMount } from "../../test-support/living-chart-hosts.ts";

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
  // The builder does not own its caller's teardown: an arm that bails wipes on its own bail path (#371), so this one stays a pure no-op.
  assert.deepEqual(mount.ledger, [], "the mount was neither asked nor touched");
});

async function engineOverStack() {
  const { createVoyage } = await import("../../src/site/living-chart/voyage.ts");
  const { manifest, survey } = await realWorld();
  const mount = stackedMount();
  const { sink, calls } = recordingSink();
  const { panel, calls: journal } = await recordingLogPanel();
  const { el: statusEl, writes: status } = recordingStatus();
  const voyage = createVoyage({ mapEl: mount.el, statusEl, logPanel: panel, restingTrackSink: sink });
  return { voyage, mount, manifest, survey, calls, journal, status };
}

const BAILED = ["ask:.voyage-overlay", "remove:first", "remove:second"];

test("#371 a re-arm whose build bails strips every surface, and posts nothing", async () => {
  const { voyage, mount, manifest, calls, journal, status } = await engineOverStack();

  voyage.rearmVoyage(manifest, null, 42, SUBTITLE);

  assert.deepEqual(mount.ledger, BAILED, "a bailing re-arm drops every overlay the mount holds and appends nothing");
  assert.deepEqual(calls, ["clear"], "the ink stays on the back of the sheet after the front was scraped");
  assert.deepEqual(journal, ["hide"], "the journal is the surface this issue is named for, and it outlives the mount wipe");
  assert.deepEqual(status, [], "the bail wrote to the status line, and the host's whole settle signal is that line staying empty");
});

test("#371 a QUIET bail wipes the recto and leaves the verso frozen", async () => {
  const { voyage, mount, manifest, calls, journal, status } = await engineOverStack();

  voyage.rearmVoyage(manifest, null, 42, SUBTITLE, { quiet: true });

  assert.deepEqual(mount.ledger, BAILED, "the quiet path wipes the mount the same way");
  assert.deepEqual(calls, [], "the quiet bail never touches the verso sink");
  assert.deepEqual(journal, ["hide"], "the journal is not part of that bargain: it hides on both bails");
  assert.deepEqual(status, [], "the quiet bail posted to the status line");
});

test("#371 the class: applyVoyage's bail leaves the mount bare too, by its leading exit", async () => {
  const { voyage, mount, manifest, calls, journal, status } = await engineOverStack();

  voyage.applyVoyage(manifest, null, 42, SUBTITLE);

  assert.deepEqual(mount.ledger, BAILED, "a bailing toggle-ON leaves the previous overlay resting");
  assert.deepEqual(calls, ["clear"], "and leaves its track on the verso");
  assert.deepEqual(journal, ["hide"], "and leaves its journal in the margin");
  assert.deepEqual(status, [], "and posts to the status line on a path that surveyed nothing");
});

// The three bails above run on a VIRGIN engine, where the cleared verso could equally be an engine that never painted. This one bails a world that really is resting on both faces.
test("#371 a bail after a real arm scrapes the world that was resting there", async () => {
  const { voyage, manifest, survey, calls, journal } = await engineOverStack();

  voyage.rearmVoyage(manifest, survey, 42, SUBTITLE);
  const armed = calls.length;
  voyage.rearmVoyage(manifest, null, 42, SUBTITLE);

  assert.match(calls[armed - 1] as string, /^paint:/, "the fixture never armed, so the bail has nothing to scrape");
  assert.deepEqual(calls.slice(armed), ["clear"], "the previous world's track is still on the back of the sheet");
  assert.deepEqual(journal.filter((c) => c === "hide"), ["hide"], "its journal hides exactly once, at the bail");
});

test("#371 control: a re-arm that BUILDS still appends, and the wipe is the builder's", async () => {
  const { voyage, mount, manifest, survey, calls, journal } = await engineOverStack();

  voyage.rearmVoyage(manifest, survey, 42, SUBTITLE);

  assert.deepEqual(
    mount.ledger,
    [...BAILED, "append:voyage-overlay"],
    "one wipe, the builder's, then the session's own overlay",
  );
  assert.equal(calls.length, 1, "a loud re-arm mirrors the resting track to the verso");
  assert.match(calls[0] as string, /^paint:/, "and mirrors it by PAINTING, not by clearing");
  assert.ok(!journal.includes("hide"), "a successful arm hid the journal it just filled");
});

// Both applyVoyage tests stay green with exitVoyage() moved INTO the bail; only this control's DOUBLE wipe can see that its teardown is unconditional.
test("#371 control: a toggle-ON that BUILDS wipes twice, appends, and inks the verso", async () => {
  const { voyage, mount, manifest, survey, calls } = await engineOverStack();

  voyage.applyVoyage(manifest, survey, 42, SUBTITLE, { skipSweep: true });

  assert.deepEqual(
    mount.ledger,
    [...BAILED, ...BAILED, "append:voyage-overlay"],
    "the exit's wipe, then the builder's, and the append survives both",
  );
  assert.equal(calls.length, 2, "the exit clears the verso and the rest paints it");
  assert.equal(calls[0], "clear", "the exit goes first");
  assert.match(calls[1] as string, /^paint:/, "the verso ends carrying the new world, not a clear");
});
