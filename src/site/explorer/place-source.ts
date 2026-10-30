import type { PlaceId } from "../../world/outline-ids.ts";

export interface PlaceText {
  readonly id: PlaceId;
  readonly text: string;
}

export function admitPlace(place: PlaceText): void {
  void place;
}
