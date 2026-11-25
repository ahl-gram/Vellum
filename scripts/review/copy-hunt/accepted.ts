import type { AcceptedCopy, AcceptedSide } from "./accepted-copies.ts";
import type { Fn } from "./functions.ts";

export const sameSide = (a: AcceptedSide, b: AcceptedSide): boolean =>
  a.file === b.file && a.name === b.name && a.hash === b.hash;

export const sideMatches = (side: AcceptedSide, fn: Fn): boolean => sameSide(side, fn);

export const acceptedFor = (copies: readonly AcceptedCopy[], x: Fn, y: Fn): AcceptedCopy | null =>
  copies.find(
    (copy) => (sideMatches(copy.a, x) && sideMatches(copy.b, y)) || (sideMatches(copy.a, y) && sideMatches(copy.b, x)),
  ) ?? null;

export const staleCopies = (copies: readonly AcceptedCopy[], fns: readonly Fn[]): AcceptedCopy[] =>
  copies.filter((copy) => !fns.some((fn) => sideMatches(copy.a, fn)) || !fns.some((fn) => sideMatches(copy.b, fn)));
