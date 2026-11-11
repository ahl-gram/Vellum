import type { AcceptedCopy, AcceptedSide } from "./accepted-copies.ts";
import { isTsUnderLintRoots } from "../../test-support/lint-roots.ts";
import type { Fn } from "./functions.ts";

export const RULING = /^https:\/\/github\.com\/ahl-gram\/Vellum\/(?:issues|pull)\/\d+#issuecomment-\d+$/;
export const HASH = /^[0-9a-f]{16}$/;

const sameSide = (a: AcceptedSide, b: AcceptedSide): boolean =>
  a.file === b.file && a.name === b.name && a.hash === b.hash;

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

export const sideMatches = (side: AcceptedSide, fn: Fn): boolean => sameSide(side, fn);

export const acceptedFor = (copies: readonly AcceptedCopy[], x: Fn, y: Fn): AcceptedCopy | null =>
  copies.find(
    (copy) => (sideMatches(copy.a, x) && sideMatches(copy.b, y)) || (sideMatches(copy.a, y) && sideMatches(copy.b, x)),
  ) ?? null;

export const staleCopies = (copies: readonly AcceptedCopy[], fns: readonly Fn[]): AcceptedCopy[] =>
  copies.filter((copy) => !fns.some((fn) => sideMatches(copy.a, fn)) || !fns.some((fn) => sideMatches(copy.b, fn)));
