import { isFormId, type PlaceId } from "../../world/outline-ids.ts";
import { admitPlace, type PlaceText } from "./place-source.ts";
import type { RenderJob } from "./worker-client.ts";

export const PLACE_FOLDER = "outlines";
export const placeFile = (id: PlaceId): string => `${PLACE_FOLDER}/${id}.txt`;
export const placeUrl = (id: PlaceId): string => `/${placeFile(id)}`;
export const NAMES_FILE = "";
export const namesUrl = "";

export interface Fetched {
  readonly ok: boolean;
  readonly status: number;
  text(): Promise<string>;
}
export type Fetcher = (url: string) => Promise<Fetched>;

export function createPlaceLoader(
  fetcher: Fetcher,
  admit: (place: PlaceText) => void = admitPlace,
): (id: PlaceId) => Promise<PlaceText> {
  const loads = new Map<PlaceId, Promise<PlaceText>>();
  const fetchOne = async (id: PlaceId): Promise<PlaceText> => {
    const response = await fetcher(placeUrl(id)).catch(() => {
      throw new Error(`the outline of ${id} could not be fetched`);
    });
    if (!response.ok) throw new Error(`the outline of ${id} could not be fetched (${response.status})`);
    const place = { id, text: await response.text() };
    admit(place);
    return place;
  };
  return (id) => {
    const held = loads.get(id);
    if (held !== undefined) return held;
    const load = fetchOne(id);
    loads.set(id, load);
    load.catch(() => loads.delete(id));
    return load;
  };
}

export function placeOfJob(job: RenderJob): PlaceId | null {
  if (job.kind === "tour") return null;
  const outline = job.overrides?.outline;
  return outline === undefined || isFormId(outline) ? null : outline;
}
