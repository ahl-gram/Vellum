import { type Device } from "../shared/primer/hand-steps.ts";
import { type ArrivalRoom } from "./arrival.ts";

export function nextStepIn(_room: ArrivalRoom, _sealed: ReadonlySet<string>, _device: Device): string | null {
  return null;
}

export function inkChart(
  _chart: Element,
  _rooms: readonly ArrivalRoom[],
  _sealed: ReadonlySet<string>,
  _device: Device,
): void {}

export function lightChart(
  _chart: Element,
  _room: ArrivalRoom | undefined,
  _sealed: ReadonlySet<string>,
  _device: Device,
): void {}
