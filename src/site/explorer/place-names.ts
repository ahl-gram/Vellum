import type { Fetcher } from "./place-fetch.ts";
import type { NameRow } from "./place-match.ts";

export function createNameLoader(fetcher: Fetcher, url: string = "/outlines/names.json"): () => Promise<ReadonlyArray<NameRow>> {
  let held: Promise<ReadonlyArray<NameRow>> | null = null;
  const fetchOnce = async (): Promise<ReadonlyArray<NameRow>> => {
    const response = await fetcher(url).catch(() => {
      throw new Error("the gazetteer could not be fetched");
    });
    if (!response.ok) throw new Error(`the gazetteer could not be fetched (${response.status})`);
    return JSON.parse(await response.text()) as NameRow[];
  };
  return () => {
    if (held !== null) return held;
    const load = fetchOnce();
    held = load;
    load.catch(() => {
      held = null;
    });
    return load;
  };
}
