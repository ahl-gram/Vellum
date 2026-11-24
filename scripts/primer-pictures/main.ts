import { resolve } from "node:path";
import { findBrowser } from "../../src/cli/raster.ts";
import { LADDERS } from "../../src/site/shared/primer/ladders.ts";
import type { Ladder } from "../../src/site/shared/primer/shape.ts";
import type { BrowserPolicyEnv } from "../../e2e/support/browser-policy.ts";
import { GENERATED } from "../clean-generated.ts";
import { pressPictures, type Pressed, type Pressing, type PressOptions } from "./press.ts";

// 2026-11-23, Issue #1255, N8 ("about 13 KB"): twice the 13.5rem frame at a 16 px root, so sharp on a 2x screen; the 24 pictures at q70 averaged 12,656 bytes (7,726 to 15,310) on this Mac.
export const PICTURE_PIXEL_WIDTH = 432;
export const PICTURE_QUALITY = 70;

export type Press = (browser: string, pressings: readonly Pressing[], options: PressOptions) => Promise<Pressed>;
export interface PictureDeps {
  readonly env: BrowserPolicyEnv;
  readonly find: () => string | null;
  readonly press: Press;
  readonly log: (line: string) => void;
}

export async function writePictures(
  _root: string,
  _deps: PictureDeps,
  _ladders: readonly Ladder[] = LADDERS,
): Promise<number> {
  return 0;
}

if (import.meta.main) {
  writePictures(resolve(process.argv[2] ?? GENERATED), {
    env: process.env,
    find: findBrowser,
    press: pressPictures,
    log: (line) => console.log(line),
  }).catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  });
}
