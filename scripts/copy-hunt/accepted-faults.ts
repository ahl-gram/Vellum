import type { AcceptedCopy } from "./accepted-copies.ts";
import { isTsUnderLintRoots } from "../../test-support/lint-roots.ts";
import { sameSide } from "./accepted.ts";

export const RULING = /^https:\/\/github\.com\/ahl-gram\/Vellum\/(?:issues|pull)\/\d+#issuecomment-\d+$/;
export const HASH = /^[0-9a-f]{16}$/;

export const acceptedFaults = (copies: readonly AcceptedCopy[]): string[] =>
  copies.flatMap((copy, index) => {
    const at = `accepted copy ${index + 1}`;
    const sides = [
      ["a", copy.a],
      ["b", copy.b],
    ] as const;
    return [
      ...sides.flatMap(([which, side]) =>
        isTsUnderLintRoots(side.file) ? [] : [`${at}: ${which}.file is not a .ts file under the lint's roots`],
      ),
      ...sides.flatMap(([which, side]) => (side.name === "" ? [`${at}: ${which}.name is empty`] : [])),
      ...sides.flatMap(([which, side]) => (HASH.test(side.hash) ? [] : [`${at}: ${which}.hash is not 16 hex digits`])),
      ...(copy.reason.trim() === "" ? [`${at}: reason is empty`] : []),
      ...(RULING.test(copy.ruling) ? [] : [`${at}: ruling is not a link to an issue or pull request comment`]),
      ...(sameSide(copy.a, copy.b) ? [`${at}: a and b are the same function`] : []),
    ];
  });
