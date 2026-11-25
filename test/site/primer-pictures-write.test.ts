import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Ladder, Step } from "../../src/site/shared/primer/shape.ts";
import { NO_PICTURE_BROWSER, SKIP_PICTURES } from "../../scripts/build/primer-pictures/browser.ts";
import { runPictures, writePictures, type Press } from "../../scripts/build/primer-pictures/main.ts";
import { pressPictures, type PressOptions, type Pressing } from "../../scripts/build/primer-pictures/press.ts";
import { chartSignature } from "../../scripts/build/primer-pictures/signature.ts";
import { STAND_IN_COUNTER } from "../../test-support/stand-in-browser.ts";
import { standInBrowser } from "../../test-support/stand-in-launch.ts";
import { settleWithin } from "../../test-support/launch-settle.ts";

const DRESS = "style=ink&legend=1&arms=0&beasts=0";
const step = (id: string, picture?: string): Step => ({
  id,
  act: "",
  see: "",
  at: "/explorer/#seed=42",
  words: [],
  ...(picture === undefined ? {} : { picture }),
});
const ladderOf = (steps: readonly Step[]): readonly Ladder[] => [
  { route: "/explorer/", what: "", lessons: [{ id: "one", title: "One", gloss: "", steps }] },
];

const withTemp = async (run: (tmp: string) => Promise<void>): Promise<void> => {
  const tmp = mkdtempSync(join(tmpdir(), "vellum-pictures-test-"));
  try {
    await run(tmp);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
};

const unused: Press = () => Promise.reject(new Error("the press must not run"));

test("PIC8 with no browser where one is required, the pictures stop the build and say so (Issue #1155 M3)", async () => {
  await withTemp(async (tmp) => {
    await assert.rejects(
      writePictures(tmp, { env: { VELLUM_REQUIRE_BROWSER: "1" }, find: () => null, press: unused, log: () => {} }),
      /no Chromium-family browser found to press the Primer's pictures/,
    );
    assert.equal(existsSync(join(tmp, "primer", "pictures.json")), false);
  });
});

test("PIC9 with no browser where none is required, the pictures are skipped with a warning", async () => {
  for (const env of [{}, { VELLUM_REQUIRE_BROWSER: "" }]) {
    await withTemp(async (tmp) => {
      const lines: string[] = [];
      const n = await writePictures(tmp, { env, find: () => null, press: unused, log: (l) => lines.push(l) });
      assert.equal(n, 0);
      assert.deepEqual(lines, [SKIP_PICTURES]);
      assert.equal(existsSync(join(tmp, "primer", "pictures.json")), false);
    });
  }
});

// No unit test reaches the import.meta.main block's assignment of this code to process.exitCode: a spawned main.ts costs about 13 s and cannot reach the no-browser branch on a machine that has a browser (Issue #1440 plan).
test("PIC19 runPictures gives the build the code 1, saying why, when the pictures stop the build, and 0 when they are skipped (Issue #1440)", async () => {
  await withTemp(async (tmp) => {
    const errors: unknown[] = [];
    const lines: string[] = [];
    const code = await runPictures(tmp, {
      env: { VELLUM_REQUIRE_BROWSER: "1" },
      find: () => null,
      press: unused,
      log: (l) => lines.push(l),
      error: (e) => errors.push(e),
    });
    assert.equal(code, 1);
    assert.deepEqual(errors, [NO_PICTURE_BROWSER]);
    assert.deepEqual(lines, []);
  });
  await withTemp(async (tmp) => {
    const errors: unknown[] = [];
    const lines: string[] = [];
    const code = await runPictures(tmp, {
      env: {},
      find: () => null,
      press: unused,
      log: (l) => lines.push(l),
      error: (e) => errors.push(e),
    });
    assert.equal(code, 0);
    assert.deepEqual(errors, []);
    assert.deepEqual(lines, [SKIP_PICTURES]);
  });
});

test("PIC10 with a browser, every pictured step's chart is drawn, handed to the press at the pictures' width and quality, named in the manifest with its file and its chart's signature, and logged with the browser and the bytes", async () => {
  const ladders = ladderOf([
    step("pic-plain", `/explorer/#seed=42&${DRESS}`),
    step(
      "pic-written",
      "/writing-room/#found=a+polar+archipelago+of+twenty+islands&v=1&style=antique&legend=1&arms=0&beasts=0",
    ),
    step("plain"),
  ]);
  const calls: { browser: string; pressings: readonly Pressing[]; options: PressOptions }[] = [];
  const drawn = new Map<string, string>();
  const press: Press = (browser, pressings, options) => {
    calls.push({ browser, pressings, options });
    for (const p of pressings) {
      drawn.set(p.out, readFileSync(p.svg, "utf8"));
      writeFileSync(p.out, "");
    }
    return Promise.resolve({ product: "Fake/1.0", bytes: 14 });
  };
  await withTemp(async (tmp) => {
    const lines: string[] = [];
    const n = await writePictures(
      tmp,
      { env: {}, find: () => "/fake/browser", press, log: (l) => lines.push(l) },
      ladders,
    );
    assert.equal(n, 2);
    assert.equal(calls.length, 1);
    const call = calls[0];
    assert.ok(call, "the press ran once");
    assert.equal(call.browser, "/fake/browser");
    assert.deepEqual(call.options, { pixelWidth: 432, quality: 70, replyMs: 30_000 });
    const outs = [join(tmp, "primer", "pictures/pic-plain.webp"), join(tmp, "primer", "pictures/pic-written.webp")];
    assert.deepEqual(
      call.pressings.map((p) => p.out),
      outs,
    );
    const manifest = JSON.parse(readFileSync(join(tmp, "primer", "pictures.json"), "utf8")) as unknown;
    assert.deepEqual(manifest, {
      "pic-plain": { file: "pictures/pic-plain.webp", signature: chartSignature(drawn.get(outs[0] ?? "") ?? "") },
      "pic-written": { file: "pictures/pic-written.webp", signature: chartSignature(drawn.get(outs[1] ?? "") ?? "") },
    });
    assert.deepEqual(lines, ["pictures: 2 pressed with /fake/browser (Fake/1.0), 14 bytes in all"]);
  });
});

test(
  "PIC14 a browser that dies mid-press fails the pictures step, naming the closed connection, with no manifest, no pictures line and nothing left in the temporary folder (Issue #1155 M3)",
  { timeout: 60_000 },
  async () => {
    const root = mkdtempSync(join(tmpdir(), "vellum-pictures-test-"));
    const s = standInBrowser("vellum-primer-", { dies: true });
    try {
      const lines: string[] = [];
      const got = await settleWithin(
        20_000,
        writePictures(
          root,
          {
            env: { VELLUM_REQUIRE_BROWSER: "1" },
            find: () => s.browser,
            press: pressPictures,
            log: (l) => lines.push(l),
          },
          ladderOf([step("pic-plain", `/explorer/#seed=42&${DRESS}`)]),
        ),
      );
      assert.match(got.error?.message ?? "", /^Page\.enable: the browser's DevTools connection closed \(code \d+\)$/);
      assert.equal(existsSync(join(root, "primer", "pictures.json")), false);
      assert.deepEqual(lines, []);
      assert.deepEqual(readdirSync(s.dir).sort(), ["browser", STAND_IN_COUNTER]);
    } finally {
      s.restore();
      rmSync(root, { recursive: true, force: true });
    }
  },
);

test("PIC16 a press that resolves without writing a picture stops the build, naming the picture, and writes no manifest (Issue #1155 M3)", async () => {
  await withTemp(async (tmp) => {
    const press: Press = () => Promise.resolve({ product: "Fake/1.0", bytes: 0 });
    const picture = join(tmp, "primer", "pictures", "pic-plain.webp");
    await assert.rejects(
      writePictures(
        tmp,
        { env: {}, find: () => "/fake/browser", press, log: () => {} },
        ladderOf([step("pic-plain", `/explorer/#seed=42&${DRESS}`)]),
      ),
      (err: unknown) => err instanceof Error && err.message === `the press resolved without writing ${picture}`,
    );
    assert.equal(existsSync(join(tmp, "primer", "pictures.json")), false);
  });
});
