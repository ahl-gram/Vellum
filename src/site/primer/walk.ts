import type { Device } from "../shared/primer/hand-steps.ts";
import type { ArrivalRoom } from "./arrival.ts";

export type Aim =
  | { readonly kind: "none" }
  | { readonly kind: "room"; readonly room: string }
  | { readonly kind: "lesson"; readonly room: string; readonly first: string }
  | { readonly kind: "step"; readonly room: string; readonly step: string };

export interface Landing {
  readonly room: string;
  readonly step: string | null;
  readonly done: string | null;
  readonly end: boolean;
}

export function landing(rooms: readonly ArrivalRoom[], _aim: Aim, _sealed: ReadonlySet<string>, _device: Device): Landing | null {
  const first = rooms[0];
  return first === undefined ? null : { room: first.id, step: null, done: null, end: false };
}

export const stepAfter = (_room: ArrivalRoom, _id: string): string | null => null;

export const stepBefore = (_room: ArrivalRoom, _id: string): string | null => null;
