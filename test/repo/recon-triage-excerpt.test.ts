import assert from "node:assert/strict";
import { test } from "node:test";
import { memoryTree } from "../../scripts/comment-judge/tree.ts";
import { excerptOf } from "../../scripts/recon-triage/excerpt.ts";

const numbered = (n: number, at: Readonly<Record<number, string>> = {}): string =>
  Array.from({ length: n }, (_, i) => at[i + 1] ?? `line ${i + 1}`).join("\n");
const linesOf = (text: string): string[] => text.split("\n");

test("a hit keeps twenty lines either side, headed by its file and first line number", () => {
  const a = numbered(100, { 50: "const target = 1;" });
  assert.deepEqual(excerptOf(memoryTree("t", { "src/a.ts": a }), ["src/a.ts"], ["target"]), {
    code: ["// src/a.ts:30", ...linesOf(a).slice(29, 69)].join("\n"),
    missingPaths: [],
    missingSymbols: [],
  });
});

test("a file keeps its first four hits, a file with no hit keeps its first 120 lines, and a symbol found nowhere is named", () => {
  const b = numbered(1000, { 10: "hit()", 200: "hit()", 400: "hit()", 600: "hit()", 800: "hit()" });
  const c = numbered(300);
  const B = linesOf(b);
  const C = linesOf(c);
  const expected =
    [
      "// src/b.ts:1",
      ...B.slice(0, 29),
      "// src/b.ts:180",
      ...B.slice(179, 219),
      "// src/b.ts:380",
      ...B.slice(379, 419),
      "// src/b.ts:580",
      ...B.slice(579, 619),
    ].join("\n") +
    "\n\n" +
    ["// src/c.ts:1", ...C.slice(0, 120)].join("\n");
  assert.deepEqual(
    excerptOf(memoryTree("t", { "src/b.ts": b, "src/c.ts": c }), ["src/b.ts", "src/c.ts"], ["hit", "nowhere"]),
    {
      code: expected,
      missingPaths: [],
      missingSymbols: ["nowhere"],
    },
  );
});

test("a file's part is cut at 6,000 characters and the whole at 14,000, and a cited file missing from the tree is named, not read", () => {
  const d = ["k", ...Array.from({ length: 39 }, () => "y".repeat(400))].join("\n");
  const tree = memoryTree("t", { "src/d1.ts": d, "src/d2.ts": d, "src/d3.ts": d });
  const { code, missingPaths } = excerptOf(tree, ["src/d1.ts", "src/gone.ts", "src/d2.ts", "src/d3.ts"], ["k"]);
  assert.equal(code.length, 14000);
  assert.equal(code.split("\n\n")[0]!.length, 6000);
  assert.deepEqual(missingPaths, ["src/gone.ts"]);
});

test("a symbol matches as a whole name, its dots and dollars taken literally, and a symbol that is no name is ignored", () => {
  const e = numbered(200, { 10: "const a$b = 1;", 60: "const a$bc = 2;", 100: "x.y = 3;", 150: "xay = 4;" });
  const E = linesOf(e);
  assert.deepEqual(excerptOf(memoryTree("t", { "src/e.ts": e }), ["src/e.ts"], ["a$b", "x.y", "#80"]), {
    code: ["// src/e.ts:1", ...E.slice(0, 29), "// src/e.ts:80", ...E.slice(79, 119)].join("\n"),
    missingPaths: [],
    missingSymbols: [],
  });
});
