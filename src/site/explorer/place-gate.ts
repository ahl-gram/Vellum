import type { PlaceId } from "../../world/outline-ids.ts";
import type { PlaceText } from "./place-source.ts";

export type PlaceGate = <T>(place: PlaceId | null, send: (text: PlaceText | null) => Promise<T>) => Promise<T>;

export function createPlaceGate(load: (id: PlaceId) => Promise<PlaceText>): PlaceGate {
  let tail: Promise<unknown> | null = null;
  return (place, send) => {
    if (place === null && tail === null) return send(null);
    const fetched = (tail ?? Promise.resolve()).then(() => (place === null ? null : load(place)));
    const sent = fetched.then(send);
    const mine = fetched.then(
      () => undefined,
      () => undefined,
    );
    tail = mine;
    void mine.then(() => {
      if (tail === mine) tail = null;
    });
    return sent;
  };
}
