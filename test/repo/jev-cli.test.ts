import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { commandOf, runCommand, type Main, type RunDeps, type Signal } from "../../scripts/jev/cli.ts";
import { MODEL, type Env, type Fetch } from "../../scripts/jev/system-one.ts";
import { usageFileOf } from "../../scripts/jev/usage.ts";
import { answeringFetch, ONE_QUESTION, usageLinesIn, withHome } from "../../test-support/jev-fakes.ts";
import { noExit } from "../../test-support/process-fakes.ts";

// Type-only and erased at run time: it puts the child in the type-check and lint program without running it here.
import type {} from "../../test-support/jev-interrupted-run.ts";

const AT = "2026-11-11T20:00:00.000Z";
const EST = Math.ceil(JSON.stringify(ONE_QUESTION).length / 2);
const CHILD = resolve(import.meta.dirname, "..", "..", "test-support", "jev-interrupted-run.ts");
const WITH_KEY: Env = { TYPESAFE_API_KEY: "k-test" };

const noFile = (): string => {
  throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
};
const neverCalled: Fetch = () => {
  throw new Error("a request was sent where none should be");
};
const line = (over: Record<string, unknown>): Record<string, unknown> => ({
  at: AT,
  input_tokens: 0,
  requests: 0,
  model: MODEL,
  command: "copy-hunt diff",
  estimated: false,
  ...over,
});

const sendTwice: Main = async (_argv, sendFor) => {
  const send = sendFor(false);
  await send(ONE_QUESTION);
  await send(ONE_QUESTION);
  return 0;
};

type Harness = {
  readonly deps: RunDeps;
  readonly warnings: string[];
  readonly registered: Signal[];
  readonly handlers: Map<Signal, () => void>;
  readonly exits: number[];
};
const harness = (home: string, fetcher: Fetch, env: Env = WITH_KEY, readText = noFile): Harness => {
  const warnings: string[] = [];
  const registered: Signal[] = [];
  const handlers = new Map<Signal, () => void>();
  const exits: number[] = [];
  const deps: RunDeps = {
    env,
    home,
    readText,
    fetcher,
    now: () => new Date(AT),
    warn: (message) => warnings.push(message),
    onSignal: (signal, handler) => {
      registered.push(signal);
      handlers.set(signal, handler);
    },
    exit: (code) => exits.push(code),
  };
  return { deps, warnings, registered, handlers, exits };
};

test("a run that sends appends one line of its totals when it ends, and returns its main's exit code", async (t) => {
  noExit(t);
  await withHome(async (home) => {
    const { deps } = harness(home, answeringFetch([300, 200, 400]));
    const main: Main = async (_argv, sendFor) => {
      const first = sendFor(false);
      await first(ONE_QUESTION);
      await first(ONE_QUESTION);
      await sendFor(false)(ONE_QUESTION);
      return 3;
    };
    assert.equal(await runCommand("copy-hunt", main, ["diff", "a", "b"], deps), 3);
    assert.deepEqual(usageLinesIn(home), [line({ input_tokens: 900, requests: 3 })]);
  });
});

test("a request that failed after it was sent counts as sent, adds no tokens, and marks the line estimated", async (t) => {
  noExit(t);
  await withHome(async (home) => {
    const first = answeringFetch([300]);
    let calls = 0;
    const fetcher: Fetch = (url, init) =>
      (calls += 1) === 1 ? first(url, init) : Promise.resolve(new Response("slow down", { status: 429 }));
    const { deps } = harness(home, fetcher);
    assert.equal(await runCommand("keeper-scan", sendTwice, ["diff", "a", "b"], deps), 0);
    assert.deepEqual(usageLinesIn(home), [
      line({ input_tokens: 300, requests: 2, command: "keeper-scan diff", estimated: true }),
    ]);
  });
});

test("a run that throws still logs what it spent, and returns 1 with the error on stderr", async (t) => {
  noExit(t);
  await withHome(async (home) => {
    const { deps, warnings } = harness(home, answeringFetch([300, null]));
    const main: Main = async (_argv, sendFor) => {
      const send = sendFor(false);
      await send(ONE_QUESTION);
      await send(ONE_QUESTION);
      throw new Error("the run broke");
    };
    assert.equal(await runCommand("copy-hunt", main, ["diff", "a", "b"], deps), 1);
    assert.deepEqual(warnings, ["the run broke"]);
    assert.deepEqual(usageLinesIn(home), [line({ input_tokens: 300 + EST, requests: 2, estimated: true })]);
  });
});

test("an interrupt logs what the run spent, a request still in flight included, once, and exits 130 for SIGINT, 143 for SIGTERM and 129 for SIGHUP", async (t) => {
  noExit(t);
  for (const [signal, code] of [
    ["SIGINT", 130],
    ["SIGTERM", 143],
    ["SIGHUP", 129],
  ] as const)
    await withHome(async (home) => {
      const first = answeringFetch([300]);
      let calls = 0;
      let reached!: () => void;
      const secondSent = new Promise<void>((done) => (reached = done));
      let release!: (response: Response) => void;
      const held = new Promise<Response>((done) => (release = done));
      const fetcher: Fetch = (url, init) => {
        if ((calls += 1) === 1) return first(url, init);
        reached();
        return held;
      };
      const { deps, registered, handlers, exits } = harness(home, fetcher);
      const run = runCommand("copy-hunt", sendTwice, ["full"], deps);
      assert.deepEqual(registered, ["SIGINT", "SIGTERM", "SIGHUP"]);

      await secondSent;
      handlers.get(signal)!();
      assert.deepEqual(exits, [code]);
      const expected = [line({ input_tokens: 300, requests: 2, command: "copy-hunt full", estimated: true })];
      assert.deepEqual(usageLinesIn(home), expected);

      release(
        new Response(
          JSON.stringify({ model: MODEL, answers: { q: { type: "noul", noul: 0.5 } }, usage: { input_tokens: 200 } }),
        ),
      );
      assert.equal(await run, 0);
      assert.deepEqual(usageLinesIn(home), expected);
    });
});

test("a run that sent nothing writes nothing: a dry run, no key, a key a header cannot carry, and nothing to ask", async (t) => {
  noExit(t);
  const cases: [string, Env, Main][] = [
    [
      "a dry run",
      WITH_KEY,
      async (_argv, sendFor) => {
        await sendFor(true)(ONE_QUESTION);
        await sendFor(true)(ONE_QUESTION);
        return 0;
      },
    ],
    [
      "no key",
      {},
      async (_argv, sendFor) => {
        await sendFor(false)(ONE_QUESTION);
        return 0;
      },
    ],
    [
      "a key a header cannot carry",
      { TYPESAFE_API_KEY: "k test" },
      async (_argv, sendFor) => {
        await sendFor(false)(ONE_QUESTION);
        return 0;
      },
    ],
    ["nothing to ask", WITH_KEY, () => Promise.resolve(0)],
  ];
  for (const [name, env, main] of cases) {
    await withHome(async (home) => {
      const { deps, handlers } = harness(home, neverCalled, env);
      assert.equal(await runCommand("copy-hunt", main, ["diff", "a", "b"], deps), 0, name);
      assert.equal(existsSync(join(home, ".config")), false, name);
      handlers.get("SIGINT")?.();
      assert.equal(existsSync(join(home, ".config")), false, `${name}, after an interrupt`);
    });
  }
});

test("a log that cannot be written is reported once on stderr with the line to add by hand, and the run's exit code stands", async (t) => {
  noExit(t);
  await withHome(async (home) => {
    mkdirSync(usageFileOf(home), { recursive: true });
    const { deps, warnings, handlers, exits } = harness(home, answeringFetch([300]));
    const main: Main = async (_argv, sendFor) => {
      await sendFor(false)(ONE_QUESTION);
      return 0;
    };
    assert.equal(await runCommand("copy-hunt", main, ["diff", "a", "b"], deps), 0);
    assert.equal(warnings.length, 1);
    const opening = "the run's Jev usage could not be logged to ~/.config/typesafe/usage.jsonl (";
    const closing = "add its line by hand: ";
    assert.ok(warnings[0]!.startsWith(opening), warnings[0]);
    const handed = warnings[0]!.slice(warnings[0]!.lastIndexOf(closing) + closing.length);
    assert.deepEqual(JSON.parse(handed), line({ input_tokens: 300, requests: 1 }));

    handlers.get("SIGINT")!();
    assert.equal(warnings.length, 1);
    assert.deepEqual(exits, [130]);
  });
});

test("the line names the command by its script and the subcommand its arguments open with, and by the script alone where they open with a flag", () => {
  assert.equal(commandOf("still-judge", ["trial", "--seeds", "1-5", "--out", "x"]), "still-judge trial");
  assert.equal(commandOf("recon-triage", ["rank", "claims.jsonl"]), "recon-triage rank");
  assert.equal(commandOf("copy-hunt", ["--out", "x", "trial"]), "copy-hunt");
  assert.equal(commandOf("keeper-scan", []), "keeper-scan");
});

// 2026-11-11: WAIT_MS sits above the child's HOLD_MS of 30 s so a handler that never exits ends the child by itself with code 0; the child reached "asked" in 80 ms and exited in 83 ms on an idle Mac (this file, 1 run), so 60 s is a cap on a hang and no budget.
const WAIT_MS = 60_000;

test("a real SIGINT, SIGTERM or SIGHUP reaches the run: it logs what was spent and the process exits 130, 143 or 129", async () => {
  for (const [name, expectedCode] of [
    ["SIGINT", 130],
    ["SIGTERM", 143],
    ["SIGHUP", 129],
  ] as const)
    await withHome(async (home) => {
      const child = spawn(process.execPath, [CHILD, home], { stdio: ["ignore", "pipe", "pipe"] });
      let out = "";
      let err = "";
      child.stderr.on("data", (chunk: Buffer) => (err += String(chunk)));
      const exited = new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((done) =>
        child.once("exit", (code, signal) => done({ code, signal })),
      );
      const asked = new Promise<void>((done) =>
        child.stdout.on("data", (chunk: Buffer) => {
          out += String(chunk);
          if (out.includes("asked")) done();
        }),
      );
      const cap = setTimeout(() => child.kill("SIGKILL"), WAIT_MS);
      try {
        await Promise.race([asked, exited]);
        child.kill(name);
        const { code, signal } = await exited;
        assert.equal(
          signal,
          null,
          `the child ended by signal ${signal} and not by exiting (the test caps it at ${WAIT_MS} ms): ${err}`,
        );
        assert.equal(code, expectedCode, `${name}: ${err}`);
        assert.deepEqual(usageLinesIn(home), [line({ input_tokens: 250, requests: 1, command: "interrupted probe" })]);
      } finally {
        clearTimeout(cap);
        child.kill("SIGKILL");
      }
    });
});
