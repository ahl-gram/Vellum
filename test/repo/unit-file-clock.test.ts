import { test } from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { Readable } from "node:stream";
import unitFileClock, { fileClockLines } from "../../scripts/unit-file-clock.ts";

type Events = Parameters<typeof unitFileClock>[0];
type Event = Events extends AsyncIterable<infer E> ? E : never;

const stream = (...events: Event[]): Events => Readable.from(events);

const collect = async (events: Events): Promise<string> => {
  const out: string[] = [];
  for await (const line of unitFileClock(events)) out.push(line);
  return out.join("");
};

const complete = (name: string, path: string, nesting: number, ms: number) => ({
  type: "test:complete",
  data: { name, file: resolve(path), nesting, details: { duration_ms: ms } },
});

test("the clock lists each file the run reports once, slowest first, with its seconds and its share, under one head line", async () => {
  const out = await collect(
    stream(
      complete("a one", "test/a.test.ts", 0, 900),
      complete("test/a.test.ts", "test/a.test.ts", 0, 1000),
      complete("inner", "test/b.test.ts", 1, 5),
      complete("test/b.test.ts", "test/b.test.ts", 0, 2500),
      {
        type: "test:pass",
        data: { name: "test/c.test.ts", file: resolve("test/c.test.ts"), nesting: 0, details: { duration_ms: 7 } },
      },
    ),
  );
  assert.deepEqual(
    out.split("\n"),
    [
      "per-file wall clock (2 files, 3.5s total):",
      "  test/b.test.ts    2.5s   71.4%",
      "  test/a.test.ts    1.0s   28.6%",
      "",
    ],
    "the clock counts a test inside a file, a nested event or a non-final event as a file, or drops a file",
  );
});

test("a run that reports no file prints no clock", async () => {
  assert.equal(await collect(stream()), "", "a run with no file printed a clock");
  assert.deepEqual(fileClockLines([]), [], "no timing still yields a head line");
});
