import type { Fetcher } from "./place-fetch.ts";
import type { NameRow } from "./place-match.ts";

export function createNameLoader(_fetcher: Fetcher): () => Promise<ReadonlyArray<NameRow>> {
  return () => Promise.resolve([]);
}
