import type { AcceptedCopy, AcceptedSide } from "./accepted-copies.ts";
import type { Fn } from "./functions.ts";

export const RULING = /^https:\/\/github\.com\/ahl-gram\/Vellum\/(?:issues|pull)\/\d+#issuecomment-\d+$/;
export const HASH = /^[0-9a-f]{16}$/;
export const acceptedFaults = (_copies: readonly AcceptedCopy[]): string[] => [];
export const sideMatches = (_side: AcceptedSide, _fn: Fn): boolean => false;
export const acceptedFor = (_copies: readonly AcceptedCopy[], _x: Fn, _y: Fn): AcceptedCopy | null => null;
export const staleCopies = (_copies: readonly AcceptedCopy[], _fns: readonly Fn[]): AcceptedCopy[] => [];
