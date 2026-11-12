export type Only = "touch" | "motion";

export interface ArrivalRoom {
  readonly id: string;
  readonly steps: readonly { readonly id: string; readonly only?: Only }[];
}

export interface Device {
  readonly touch: boolean;
  readonly motion: boolean;
}

export const applies = (only: Only | undefined, device: Device): boolean =>
  only === undefined || (only === "touch" ? device.touch : device.motion);

export function roomOnArrival(
  rooms: readonly ArrivalRoom[],
  _targetRoom: string | null,
  _sealed: ReadonlySet<string>,
  _device: Device,
): string | null {
  return rooms[0]?.id ?? null;
}
