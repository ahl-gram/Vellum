import assert from "node:assert/strict";
import { test } from "node:test";
import type { AcceptedCopy } from "../../scripts/copy-hunt/accepted-copies.ts";
import { acceptedFaults, acceptedFor, staleCopies } from "../../scripts/copy-hunt/accepted.ts";
import type { Fn } from "../../scripts/copy-hunt/functions.ts";

const fnOf = (file: string, line: number, name: string, tokens: string[], extra: Partial<Fn> = {}): Fn => ({
  file,
  line,
  end: line,
  name,
  body: `${name}()`,
  norm: `${name}()`,
  tokens: [...tokens].sort(),
  hash: "0123456789abcdef",
  ...extra,
});

const A = fnOf("src/a.ts", 3, "alpha", [], { hash: "a070d6cdc7bcc32e" });
const B = fnOf("test/a.test.ts", 9, "alphaCopy", [], { hash: "0c6f87685ec89b96" });
const RULED = "https://github.com/ahl-gram/Vellum/issues/1318#issuecomment-1";
const ok: AcceptedCopy = {
  a: { file: A.file, name: A.name, hash: A.hash },
  b: { file: B.file, name: B.name, hash: B.hash },
  reason: "a mirror pinned equal in its own test",
  ruling: RULED,
};

test("an entry with a fault is refused by its number and the fault", () => {
  assert.deepEqual(acceptedFaults([ok]), []);
  assert.deepEqual(
    acceptedFaults([
      ok,
      {
        ...ok,
        a: { ...ok.a, file: "design/a.ts" },
        reason: " ",
        ruling: "https://github.com/ahl-gram/Vellum/issues/1318",
      },
    ]),
    [
      "accepted copy 2: a.file is not a .ts file under the lint's roots",
      "accepted copy 2: reason is empty",
      "accepted copy 2: ruling is not a link to an issue or pull request comment",
    ],
  );
  assert.deepEqual(acceptedFaults([{ ...ok, b: { ...ok.b, name: "", hash: "XYZ" } }]), [
    "accepted copy 1: b.name is empty",
    "accepted copy 1: b.hash is not 16 hex digits",
  ]);
  assert.deepEqual(acceptedFaults([{ ...ok, b: ok.a }]), ["accepted copy 1: a and b are the same function"]);
});

test("a listed pair matches in either order, and not once either side's text has changed", () => {
  assert.equal(acceptedFor([ok], A, B), ok);
  assert.equal(acceptedFor([ok], B, A), ok);
  assert.equal(acceptedFor([ok], A, { ...B, hash: "ffffffffffffffff" }), null);
  assert.equal(acceptedFor([ok], A, { ...B, file: "test/b.test.ts" }), null);
});

test("an entry is stale when no function matches one of its sides", () => {
  assert.deepEqual(staleCopies([ok], [A, B]), []);
  assert.deepEqual(staleCopies([ok], [A]), [ok]);
  assert.deepEqual(staleCopies([ok], [B, { ...A, hash: "ffffffffffffffff" }]), [ok]);
});
