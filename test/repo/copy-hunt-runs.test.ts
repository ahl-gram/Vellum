import assert from "node:assert/strict";
import { test } from "node:test";
import { revParse } from "../../scripts/comment-judge/tree.ts";
import { RUN_INPUT_TOKEN_CAP, type Found, type HuntOptions } from "../../scripts/copy-hunt/hunt.ts";
import { diffRun, fullRun } from "../../scripts/copy-hunt/runs.ts";
import type { Send } from "../../scripts/jev/system-one.ts";
import { commitAll, withTempRepo, writeFiles } from "../../test-support/proof-runner-repo.ts";
import { ALPHA, ALPHA_COPY, ALPHA_NEAR, OTHER, sameAnswer, TINY } from "../../test-support/copy-hunt-fixtures.ts";

const send: Send = () => Promise.resolve(sameAnswer(0.9));
const options: HuntOptions = { send, cap: RUN_INPUT_TOKEN_CAP, accepted: [] };
const loc = (f: Found): string[] => [`${f.x.file}:${f.x.line} ${f.x.name}`, `${f.y.file}:${f.y.line} ${f.y.name}`];

const inRepo = (body: (dir: string, base: string, head: string) => void | Promise<void>): Promise<void> =>
  withTempRepo({ "src/a.ts": ALPHA, "src/d.ts": OTHER, "docs/n.md": "x\n" }, async (dir, base) => {
    writeFiles(dir, { "src/b.ts": ALPHA_COPY, "src/c.ts": ALPHA_NEAR, "src/d.ts": OTHER + TINY });
    await body(dir, base, commitAll(dir, "head"));
  });

test("a diff run hunts what the branch adds or changes against everything at its head", async () => {
  await inRepo(async (dir, base, head) => {
    const run = await diffRun(dir, base, head, options);
    assert.equal(run.sha, head);
    assert.equal(run.base, base);
    assert.equal(run.functions, 5);
    assert.equal(run.hunted, 3);
    assert.deepEqual(
      run.found.map((f) => [...loc(f), f.outcome.kind]),
      [
        ["src/b.ts:2 alpha", "src/a.ts:1 alpha", "exact"],
        ["src/c.ts:1 alphaOf", "src/a.ts:1 alpha", "asked"],
        ["src/b.ts:2 alpha", "src/c.ts:1 alphaOf", "asked"],
      ],
    );
  });
});

test("a full run hunts every function", async () => {
  await inRepo(async (dir, _base, head) => {
    const run = await fullRun(dir, head, options);
    assert.equal(run.hunted, 5);
    assert.equal(run.base, null);
    assert.deepEqual(
      run.found.map((f) => f.outcome.kind),
      ["exact", "asked", "asked"],
    );
  });
});

test("a run refuses an accepted list with a fault, naming it", async () => {
  await inRepo(async (dir, base, head) => {
    await assert.rejects(
      () =>
        diffRun(dir, base, head, {
          ...options,
          accepted: [
            {
              a: { file: "src/a.ts", name: "alpha", hash: "a070d6cdc7bcc32e" },
              b: { file: "src/c.ts", name: "alphaOf", hash: "a8f79f6fc7779bef" },
              reason: "",
              ruling: "x",
            },
          ],
        }),
      {
        message:
          "accepted copy 1: reason is empty\naccepted copy 1: ruling is not a link to an issue or pull request comment",
      },
    );
  });
});

test("revParse names the commit a ref points at, and refuses one that names none", async () => {
  await inRepo((dir, base, head) => {
    assert.equal(revParse(dir, "HEAD"), head);
    assert.equal(revParse(dir, "main"), head);
    assert.equal(revParse(dir, base), base);
    assert.throws(() => revParse(dir, "no-such-ref"), /git rev-parse --verify no-such-ref\^\{commit\} failed/);
  });
});
