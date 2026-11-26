import { applies, type Device } from "../shared/primer/hand-steps.ts";
import { roomOnArrival, type ArrivalRoom } from "./arrival.ts";
import { nextStepIn } from "./chart-ink.ts";

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

export function landing(
  rooms: readonly ArrivalRoom[],
  aim: Aim,
  sealed: ReadonlySet<string>,
  device: Device,
): Landing | null {
  const first = rooms[0];
  if (first === undefined) return null;
  const named = aim.kind === "none" ? undefined : rooms.find((r) => r.id === aim.room);
  if (named === undefined) {
    if (!rooms.some((r) => nextStepIn(r, sealed, device) !== null)) {
      return { room: first.id, step: null, done: null, end: true };
    }
    const id = roomOnArrival(rooms, null, sealed, device) ?? first.id;
    const room = rooms.find((r) => r.id === id) ?? first;
    return { room: room.id, step: nextStepIn(room, sealed, device), done: null, end: false };
  }
  if (aim.kind === "lesson") return { room: named.id, step: aim.first, done: null, end: false };
  if (aim.kind === "step" && sealed.has(aim.step)) {
    const at = named.steps.findIndex((s) => s.id === aim.step);
    const after = named.steps.slice(at + 1).find((s) => !sealed.has(s.id) && applies(s.only, device));
    return { room: named.id, step: after?.id ?? null, done: aim.step, end: false };
  }
  if (aim.kind === "step") return { room: named.id, step: aim.step, done: null, end: false };
  return {
    room: named.id,
    step: nextStepIn(named, sealed, device) ?? named.steps[0]?.id ?? null,
    done: null,
    end: false,
  };
}

const neighbour = (room: ArrivalRoom, id: string, by: 1 | -1): string | null => {
  const at = room.steps.findIndex((s) => s.id === id);
  return at < 0 ? null : (room.steps[at + by]?.id ?? null);
};

export const stepAfter = (room: ArrivalRoom, id: string): string | null => neighbour(room, id, 1);

export const stepBefore = (room: ArrivalRoom, id: string): string | null => neighbour(room, id, -1);
