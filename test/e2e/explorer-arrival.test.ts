import { test } from "node:test";
import assert from "node:assert/strict";
import { explorerUp, toExplorer, waitInked } from "../../e2e/support/explorer.ts";
import type { SuiteContext } from "../../e2e/types.ts";

const URL = "http://127.0.0.1:8765/explorer/#seed=7";

function arrival(ready: boolean) {
  const timeline: string[] = [];
  const ctx = {
    send: (method: string, params?: Record<string, unknown>): Promise<unknown> => {
      timeline.push(`${method} ${String(params?.["url"])}`);
      return Promise.resolve({});
    },
    waitReady: (): Promise<boolean> => {
      timeline.push("ready");
      return Promise.resolve(ready);
    },
    waitSettled: (label?: string): Promise<void> => {
      timeline.push(`settled ${String(label)}`);
      return Promise.resolve();
    },
  } as unknown as Pick<SuiteContext, "send" | "waitReady" | "waitSettled">;
  return { timeline, ctx };
}

function ink(answers: number[]) {
  const reads = { n: 0 };
  const ctx = {
    evaluate: (): Promise<number> => {
      const answer = answers[Math.min(reads.n, answers.length - 1)] as number;
      reads.n += 1;
      return Promise.resolve(answer);
    },
    sleep: (): Promise<void> => Promise.resolve(),
  } as unknown as Pick<SuiteContext, "evaluate" | "sleep">;
  return { reads, ctx };
}

test("toExplorer bounces through about:blank, takes the Explorer's ready answer, then waits for the settled draw under its label", async () => {
  const a = arrival(true);
  await toExplorer(a.ctx, URL, "L");
  assert.deepEqual(a.timeline, ["Page.navigate about:blank", `Page.navigate ${URL}`, "ready", "settled L"]);
});

test("toExplorer runs the caller's step between the ready answer and the settled draw", async () => {
  const a = arrival(true);
  await toExplorer(a.ctx, URL, "L", () => {
    a.timeline.push("hook");
    return Promise.resolve();
  });
  assert.deepEqual(a.timeline, ["Page.navigate about:blank", `Page.navigate ${URL}`, "ready", "hook", "settled L"]);
});

test("toExplorer throws naming its label when the Explorer never answers ready, and never waits for a settled draw", async () => {
  const a = arrival(false);
  await assert.rejects(
    toExplorer(a.ctx, URL, "L"),
    (err: Error) => err.message === "the Explorer never answered ready: L",
  );
  assert.deepEqual(a.timeline, ["Page.navigate about:blank", `Page.navigate ${URL}`, "ready"]);
});

test("explorerUp passes on a ready answer and throws naming its label on a false one", async () => {
  await assert.doesNotReject(explorerUp(arrival(true).ctx, "L"));
  await assert.rejects(
    explorerUp(arrival(false).ctx, "L"),
    (err: Error) => err.message === "the Explorer never answered ready: L",
  );
});

test("waitInked hands back the track's point count once it reaches the floor it is given", async () => {
  const p = ink([0, 5, 12]);
  assert.equal(await waitInked(p.ctx, "L", 11), 12);
  assert.equal(p.reads.n, 3);
});

test("waitInked with no floor hands back the first read that finds a track at all", async () => {
  const p = ink([0, 1]);
  assert.equal(await waitInked(p.ctx, "L"), 1);
  assert.equal(p.reads.n, 2);
});

test("waitInked throws naming its label once its 120 reads never reach the floor", async () => {
  const p = ink([3]);
  await assert.rejects(waitInked(p.ctx, "L", 11), (err: Error) => err.message === "waitInked timeout L");
  assert.equal(p.reads.n, 120);
});
