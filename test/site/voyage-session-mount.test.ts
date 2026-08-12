import { test } from "node:test";
import assert from "node:assert/strict";
import { realWorld, stackedMount } from "../../test-support/living-chart-hosts.ts";

// #364: what the session builder does to the MOUNT, asserted against a mount that already
// holds overlays. The behaviour is one line in voyage-session.ts build(), a wipe of every
// `.voyage-overlay` immediately before its unconditional append, and the whole point of
// that line is to hold "one mount, one overlay" for callers that have not wiped.
//
// Why these live here and not only in e2e. The e2e pair (SV2g / SV2h) drives the real
// Explorer, where the mount can hold exactly ONE stale overlay and where every query
// resolves against the one chart frame on the page. Three ways of getting this line wrong
// therefore survive it and were measured to survive it: a singular `querySelector`, the
// wipe hoisted above the early bails, and the query widened from the mount to `document`
// (harmless on a one-frame page, not on a host with two chart frames). All three are visible
// from the mount's own side, so that is where they are pinned. The double is
// `stackedMount()` in test-support/living-chart-hosts.ts: fixed stubs plus an ordered
// ledger, no selector matching anywhere, so element-shim.ts's deliberate blindness stands.

const SUBTITLE = "as surveyed by Taiki the Wayfarer";

/** The builder over a mount that holds two overlays, with the real world-42 fixture. */
async function builderOverStack() {
  const [{ createSessionBuilder }, { barlessLogPanel }] = await Promise.all([
    import("../../src/site/living-chart/voyage-session.ts"),
    import("../../src/site/living-chart/no-bar.ts"),
  ]);
  // realWorld installs the element shim, which the overlay svg's construction needs; the
  // bar-less log panel is the real stand-in a host with no journal strip already gets.
  const { manifest, survey } = await realWorld();
  const mount = stackedMount();
  const sessions = createSessionBuilder({ mapEl: mount.el, logPanel: barlessLogPanel() });
  return { sessions, mount, manifest, survey };
}

test("#364 the builder drops EVERY overlay the mount holds, not just the first", async () => {
  const { sessions, mount, manifest, survey } = await builderOverStack();

  const session = sessions.build(manifest, survey, 42, SUBTITLE);

  assert.ok(session, "the fixture world really does route a survey");
  // The count is the assertion. A singular `querySelector` take-the-first is the natural way
  // to write this line, it passes every e2e check (the real Explorer's mount never holds
  // two), and it leaves the second layer stranded on the sheet: exactly the defect #364
  // exists to close, one level down.
  assert.deepEqual(
    mount.ledger.filter((e) => e.startsWith("remove:")),
    ["remove:first", "remove:second"],
    "both stale overlays are taken off the mount",
  );
});

test("#364 the wipe runs BEFORE the append, and asks the MOUNT for the nodes", async () => {
  const { sessions, mount, manifest, survey } = await builderOverStack();

  sessions.build(manifest, survey, 42, SUBTITLE);

  // The whole ledger, in order, so both halves are pinned by one assertion. Order matters
  // for real: a wipe placed after the append removes the overlay the builder just added,
  // and the mount ends up with no track at all. (In a browser that failure aborts the e2e
  // run at an earlier check's ink timeout rather than reddening the invariant's own guard,
  // which is a diagnosis nobody should have to make twice.)
  //
  // The `ask:` entry is the other half: it proves the query was addressed to the mount, on
  // a page with two chart frames a `document`-scoped query would strip the OTHER frame's
  // overlay. That mutation reds HERE and only here, though it reds as a throw rather than
  // as this assertion: the shim's `document` stand-in answers no queries at all
  // (element-shim.ts installs three factory methods and nothing else), so a build that asks
  // it fails at the call. Teaching that stand-in to answer would buy a tidier message and
  // nothing else, so it stays as it is and this comment says which red to expect.
  assert.deepEqual(
    mount.ledger,
    ["ask:.voyage-overlay", "remove:first", "remove:second", "append:voyage-overlay"],
    "ask the mount, drop what it holds, then append this session's overlay",
  );
});

test("#364 a build that bails leaves the mount exactly as it found it", async () => {
  const { sessions, mount, manifest } = await builderOverStack();

  // No survey: the earliest of build's three bails. The others (no manifest, no ports) leave
  // through the same door, and this is the one a real host reaches, since a world with no
  // survey is what a host arms against when there is nothing to route.
  const session = sessions.build(manifest, null, 42, SUBTITLE);

  assert.equal(session, null, "the build bailed");
  // This is why the wipe sits AFTER the bails rather than at the top of build. Hoisted, a
  // survey-less arm would strip the overlay a previous world left resting and put nothing
  // in its place, turning a no-op into a silent erase. Nothing else in the suite or in e2e
  // can see that: the Explorer always arms against a world it just drew a survey for.
  assert.deepEqual(mount.ledger, [], "the mount was neither asked nor touched");
});
