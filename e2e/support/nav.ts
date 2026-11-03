// The hop to a fresh address: a navigate that differs only in the hash is same-document and never re-boots a page, so every fresh address arrives through about:blank (settle-doctrine clause 9).
import type { SuiteContext } from "../types.ts";

export const bounce = async (send: SuiteContext["send"], url: string): Promise<void> => {
  await send("Page.navigate", { url });
};
