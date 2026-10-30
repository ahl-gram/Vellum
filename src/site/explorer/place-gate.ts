import type { PlaceId } from "../../world/outline-ids.ts";
import type { PlaceText } from "./place-source.ts";

export type PlaceGate = <T>(place: PlaceId | null, send: (text: PlaceText | null) => Promise<T>) => Promise<T>;

export function createPlaceGate(load: (id: PlaceId) => Promise<PlaceText>): PlaceGate {
  void load;
  return (_place, send) => send(null);
}
