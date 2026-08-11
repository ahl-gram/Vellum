// The room's instrument: the live-animation coverage re-hosted (#320, Survey and Story
// Sub 3). RS* labels, so the Explorer-hosted S* originals stay green beside these for
// the whole of this sub (the double coverage IS the point; Sub 4 retires the originals
// with a named list, the a/b/c inventory on this PR).
//
// The room mounts the SAME engine through createLivingChart, so these are the S-suite's
// assertions against .rf-* selectors and the room's own hooks. What did NOT port is
// named in the inventory: the #ages checkbox arming, the verso flip, and the Explorer's
// keep-the-chamber redraw (the room's ratified counter draw parks at the present, #221).
import { makeRoom } from "./room-support.mjs";

export async function run(ctx) {
  const { evaluate, check, sleep } = ctx;
  const room = makeRoom(ctx);

  // RS0: the widened instrument state. The room published {chamber, year} only; every
  // check below reads the sweep through t / u / held / min / max / playing, which the
  // Explorer's __vellumAgesState has always carried and the room narrowed away.
  const booted = await room.goto("#seed=42&style=antique&legend=1");
  check("RS0 the room boots and settles on the deep-linked world", booted);

  // The chamber owns which of t / year is live and which is null (agesState's own
  // contract), so the shape is asserted per chamber rather than "both are numbers":
  // at this present park t is null BY DESIGN, and a check that demanded a number
  // there would be pinning a bug.
  const state = await evaluate(`window.__vellumReadingRoomAges()`);
  check(
    "RS1 the room publishes the whole instrument state (u, held, min, max, playing, seamU), not just chamber+year",
    !!state &&
      state.chamber === "ages" &&
      typeof state.year === "number" &&
      state.t === null &&
      typeof state.u === "number" &&
      typeof state.seamU === "number" &&
      typeof state.held === "boolean" &&
      typeof state.min === "number" &&
      typeof state.max === "number" &&
      typeof state.playing === "boolean",
    JSON.stringify(state),
  );
}
