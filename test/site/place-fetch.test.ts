import test from "node:test";
import assert from "node:assert/strict";
import {
  createPlaceLoader,
  placeFile,
  placeOfJob,
  placeUrl,
  type Fetched,
} from "../../src/site/explorer/place-fetch.ts";
import type { PlaceText } from "../../src/site/explorer/place-source.ts";
import type { RenderJob } from "../../src/site/explorer/worker-client.ts";
import { placeId } from "../../src/world/outline-ids.ts";

const TEXAS = placeId("ne-1159315211");
const render = { style: "antique" } as const;
const seed = 42;

test("a place is served at the site's root under outlines/ (Issue #854)", () => {
  assert.equal(placeFile(TEXAS), "outlines/ne-1159315211.txt");
  assert.equal(placeUrl(TEXAS), "/outlines/ne-1159315211.txt");
});

test("placeOfJob names a real place and nothing else (Issue #854)", () => {
  const withOutline = (outline: "round" | typeof TEXAS | undefined) =>
    outline === undefined ? undefined : { outline };
  const jobs = (outline: "round" | typeof TEXAS | undefined): RenderJob[] => {
    const overrides = withOutline(outline);
    return [
      { kind: "draw", seed, overrides, render },
      { kind: "region", seed, overrides, window: { u0: 0, v0: 0, u1: 1, v1: 1 }, gridW: 8, gridH: 8, band: 1, render },
      { kind: "atlas", seed, overrides },
      { kind: "prospect", seed, overrides, index: 1, dress: "antique" as never, year: 800 },
      { kind: "ribbon", seed, overrides, from: 1, to: 2, dress: "antique" as never },
    ];
  };
  for (const job of jobs(TEXAS)) assert.equal(placeOfJob(job), TEXAS, job.kind);
  for (const job of jobs("round")) assert.equal(placeOfJob(job), null, `${job.kind} with a form`);
  for (const job of jobs(undefined)) assert.equal(placeOfJob(job), null, `${job.kind} with no outline`);
  const tour: RenderJob = { kind: "tour", seed, sites: [], survey: {} as never, ports: [] };
  assert.equal(placeOfJob(tour), null);
});

function fakeFetcher(answers: ReadonlyArray<Fetched | "offline">) {
  const urls: string[] = [];
  const fetcher = (url: string): Promise<Fetched> => {
    const answer = answers[Math.min(urls.length, answers.length - 1)];
    urls.push(url);
    return answer === undefined || answer === "offline"
      ? Promise.reject(new Error("offline"))
      : Promise.resolve(answer);
  };
  return { fetcher, urls };
}
const body = (text: string): Fetched => ({ ok: true, status: 200, text: () => Promise.resolve(text) });

test("the loader fetches a place once, admits it into this realm, and hands its text on (Issue #854)", async () => {
  const { fetcher, urls } = fakeFetcher([body("m0 0z")]);
  const admitted: PlaceText[] = [];
  const load = createPlaceLoader(fetcher, (p) => admitted.push(p));
  const [a, b] = await Promise.all([load(TEXAS), load(TEXAS)]);
  assert.deepEqual(a, { id: TEXAS, text: "m0 0z" });
  assert.deepEqual(b, a);
  assert.deepEqual(urls, ["/outlines/ne-1159315211.txt"]);
  assert.equal(admitted.length, 1);
});

test("a failed fetch rejects with the place in the reason, and the next load tries again (Issue #854)", async () => {
  const { fetcher, urls } = fakeFetcher([{ ok: false, status: 404, text: () => Promise.resolve("") }, body("m0 0z")]);
  const load = createPlaceLoader(fetcher, () => {});
  await assert.rejects(load(TEXAS), /^Error: the outline of ne-1159315211 could not be fetched \(404\)/);
  assert.deepEqual(await load(TEXAS), { id: TEXAS, text: "m0 0z" });
  assert.equal(urls.length, 2);
});

test("a fetcher that throws rejects the same way (Issue #854)", async () => {
  const { fetcher } = fakeFetcher(["offline"]);
  const load = createPlaceLoader(fetcher, () => {});
  await assert.rejects(load(TEXAS), /^Error: the outline of ne-1159315211 could not be fetched/);
});
