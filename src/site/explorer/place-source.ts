import { setPlaceSource } from "../../terrain/outline-store.ts";
import type { PlaceId } from "../../world/outline-ids.ts";

export interface PlaceText {
  readonly id: PlaceId;
  readonly text: string;
}

const held = new Map<PlaceId, string>();
let installed = false;

export function admitPlace(place: PlaceText): void {
  if (!installed) {
    setPlaceSource((id) => held.get(id));
    installed = true;
  }
  held.set(place.id, place.text);
}
