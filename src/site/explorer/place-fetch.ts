import type { PlaceId } from "../../world/outline-ids.ts";
import type { PlaceText } from "./place-source.ts";
import type { RenderJob } from "./worker-client.ts";

export const PLACE_FOLDER = "outlines";
export const placeFile = (id: PlaceId): string => {
  void id;
  return "";
};
export const placeUrl = (id: PlaceId): string => {
  void id;
  return "";
};
export interface Fetched {
  readonly ok: boolean;
  readonly status: number;
  text(): Promise<string>;
}
export type Fetcher = (url: string) => Promise<Fetched>;

export function createPlaceLoader(
  fetcher: Fetcher,
  admit: (place: PlaceText) => void,
): (id: PlaceId) => Promise<PlaceText> {
  void fetcher;
  void admit;
  return (id) => Promise.resolve({ id, text: "" });
}

export function placeOfJob(job: RenderJob): PlaceId | null {
  void job;
  return null;
}
