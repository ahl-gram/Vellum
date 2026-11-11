import { createHash } from "node:crypto";

/** A region sheet is ~300KB, and node:test renders a failed equal() of two of them character by character; the digest is the same byte comparison with a message a human can read. */
export const digest = (svg: string): string =>
  `${createHash("sha256").update(svg).digest("hex").slice(0, 16)}/${svg.length}`;
