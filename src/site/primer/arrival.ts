import { applies, type Device, type Only } from "../shared/primer/hand-steps.ts";

export interface ArrivalRoom {
  readonly id: string;
  readonly steps: readonly { readonly id: string; readonly only?: Only }[];
}

export function roomOnArrival(
  rooms: readonly ArrivalRoom[],
  targetRoom: string | null,
  sealed: ReadonlySet<string>,
  device: Device,
): string | null {
  const first = rooms[0];
  if (first === undefined) return null;
  if (targetRoom !== null && rooms.some((r) => r.id === targetRoom)) return targetRoom;
  if (sealed.size === 0) return first.id;
  const unsealed = rooms.find((r) => r.steps.some((s) => !sealed.has(s.id) && applies(s.only, device)));
  return (unsealed ?? first).id;
}
