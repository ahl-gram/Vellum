import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { pictureDims } from "../../scripts/delivery/dims.ts";
import { pngHeader } from "../../test-support/still-judge-fixtures.ts";

test("a delivered PNG is measured only when it carries the whole signature and an IHDR chunk, the two cases the delivery's own reader once let through", () => {
  const dir = mkdtempSync(join(tmpdir(), "delivery-dims-"));
  try {
    const at = (name: string, bytes: Buffer): string => {
      writeFileSync(join(dir, name), bytes);
      return join(dir, name);
    };
    assert.deepEqual(pictureDims(at("ok.png", pngHeader(1500, 1158))), { width: 1500, height: 1158 });
    const halfSignature = pngHeader(1500, 1158);
    halfSignature[5] = 0x0b;
    assert.equal(pictureDims(at("half-signature.png", halfSignature)), null);
    const notIhdr = pngHeader(1500, 1158);
    notIhdr.write("IEND", 12, "latin1");
    assert.equal(pictureDims(at("not-ihdr.png", notIhdr)), null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
