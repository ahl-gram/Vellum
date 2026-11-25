import test from "node:test";
import assert from "node:assert/strict";
import { WRITING_ROOM } from "../../src/site/shared/primer/writing-room.ts";
import type { Act } from "../../src/site/shared/primer/shape.ts";

const LESSON = "/writing-room/#found=a+polar+archipelago+of+twenty+islands&v=1";
const steps = WRITING_ROOM.lessons.flatMap((lesson) => lesson.steps);
const typed = (acts: readonly Act[] | undefined): readonly string[] =>
  (acts ?? []).flatMap((a) => (a.kind === "set" && a.css === "#wr-line" ? [a.value] : []));

test("PN1 a Writing Room step that founds the lesson's sentence first opens the room on that sentence's world, pinned to version 1 (Issue #1384)", () => {
  assert.deepEqual(typed(steps.find((s) => s.id === "writing-room-write")?.do), [
    "a polar archipelago of twenty islands",
  ]);
  const opening = steps.filter((s) => typed(s.first).length > 0);
  assert.deepEqual(
    opening.map((s) => s.id),
    ["writing-room-your-word", "writing-room-plate", "writing-room-explore-it"],
  );
  for (const s of opening) assert.equal(s.at, LESSON, `${s.id} opens on the lesson's world`);
});
