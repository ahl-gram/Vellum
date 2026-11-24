import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Ladder, Step } from "../../src/site/shared/primer/shape.ts";
import { SKIP_PICTURES } from "../../scripts/primer-pictures/browser.ts";
import { writePictures, type Press, type PressOptions, type Pressing } from "../../scripts/primer-pictures/main.ts";
import { chartSignature } from "../../scripts/primer-pictures/signature.ts";
import { useCommittedGazetteer } from "../../test-support/founding-gazetteer.ts";

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

test("PIC10 with a browser, every pictured step's chart is drawn, handed to the press at the pictures' width and quality, named in the manifest with its file and its chart's signature, and logged with the browser and the bytes", async () => {
  useCommittedGazetteer();
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
    for (const p of pressings) drawn.set(p.out, readFileSync(p.svg, "utf8"));
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
    assert.equal(calls[0]?.browser, "/fake/browser");
    assert.deepEqual(calls[0]?.options, { pixelWidth: 432, quality: 70 });
    const outs = [join(tmp, "primer", "pictures/pic-plain.webp"), join(tmp, "primer", "pictures/pic-written.webp")];
    assert.deepEqual(
      calls[0]?.pressings.map((p) => p.out),
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
