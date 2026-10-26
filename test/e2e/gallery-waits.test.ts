import { test } from "node:test";
import assert from "node:assert/strict";
import { rh10GalleryScrolled, SCROLLED } from "../../e2e/suites/runninghead/gallery.ts";
import type { RunningHeadKit } from "../../e2e/suites/runninghead/kit.ts";
import { recordingSuite } from "../../test-support/recording-suite.ts";

const galleryRun = (lands: boolean, up = true) => {
  let witnessed = 0;
  let landed = false;
  let sampledLanded: boolean | null = null;
  const run = recordingSuite((expression) => {
    if (expression.includes(".grid img"))
      return JSON.stringify({ sh: 3000, y: 1200, plate: { x: 400, y: 300 }, loaded: true });
    if (expression.includes(SCROLLED) && expression.includes("getAnimations")) {
      witnessed++;
      landed = lands && witnessed > 3;
      return { read: { y: 1200 }, anims: [landed ? "finished" : "running"] };
    }
    return expression === SCROLLED ? { y: 1200 } : null;
  });
  const send = (method: string, params?: Record<string, unknown>): Promise<unknown> => {
    run.sent.push({ method, params });
    if (method !== "Runtime.evaluate") return Promise.resolve({});
    sampledLanded = landed;
    return Promise.resolve({ exceptionDetails: { text: "stub stop" } });
  };
  const k = { ...run.ctx, send, visit: () => Promise.resolve(up) } as unknown as RunningHeadKit;
  return { ...run, rh10: () => rh10GalleryScrolled(k), sampled: () => sampledLanded };
};

test("RH10 samples the plate only once the Gallery's landing has finished", async () => {
  const { rh10, sampled } = galleryRun(true);
  await assert.rejects(
    rh10(),
    (err: Error) => err.message === "sampleRect could not read the page's scroll: stub stop",
  );
  assert.equal(sampled(), true, "RH10 sampled the plate while the Gallery was still landing");
});

test("RH10 times out naming the landing when the Gallery never finishes landing, and samples nothing", async () => {
  const { rh10, sampled } = galleryRun(false);
  await assert.rejects(rh10(), (err: Error) =>
    err.message.startsWith("settle timeout RH10 the Gallery's plates landed: "),
  );
  assert.equal(sampled(), null, "RH10 sampled the plate though the Gallery never landed");
});

test("RH10 waits for no landing, and reds its own check, when the Gallery never comes up", async () => {
  const { rh10, said, checked } = galleryRun(true, false);
  await rh10();
  assert.deepEqual(checked, [{ code: "RH10", ok: false }]);
  assert.ok(!said.some((e) => e.includes("getAnimations")), "RH10 waited for a landing on a page that never came up");
});
