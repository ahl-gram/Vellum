import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { findBrowser, svgDimensions } from "../../src/cli/raster.ts";
import {
  chartFrame,
  pictureFile,
  PICTURE_FOLDER,
  PICTURE_MANIFEST,
  picturedSteps,
} from "../../src/site/primer/pictures.ts";
import { LADDERS } from "../../src/site/shared/primer/ladders.ts";
import type { Ladder } from "../../src/site/shared/primer/shape.ts";
import type { BrowserPolicyEnv } from "../../e2e/support/browser-policy.ts";
import { useCommittedPlaces } from "../../test-support/outline-places.ts";
import { GENERATED } from "../clean-generated.ts";
import { pictureBrowser, SKIP_PICTURES } from "./browser.ts";
import { committedFounder, drawJob, jobOf } from "./draw.ts";
import { pressPictures, type Pressed, type Pressing, type PressOptions } from "./press.ts";
import { chartSignature, type PictureEntry } from "./signature.ts";

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
  root: string,
  deps: PictureDeps,
  ladders: readonly Ladder[] = LADDERS,
): Promise<number> {
  const browser = pictureBrowser(deps.env, deps.find);
  if (browser === null) {
    deps.log(SKIP_PICTURES);
    return 0;
  }
  useCommittedPlaces();
  const founder = committedFounder();
  const frame = chartFrame();
  const temp = mkdtempSync(join(tmpdir(), "vellum-primer-svg-"));
  try {
    const drawn = new Map<string, string>();
    const pressings: Pressing[] = [];
    const manifest: Record<string, PictureEntry> = {};
    for (const p of picturedSteps(ladders)) {
      const job = await jobOf(p.picture, founder);
      const key = JSON.stringify(job);
      let svg = drawn.get(key);
      if (svg === undefined) {
        svg = drawJob(job);
        drawn.set(key, svg);
      }
      const { width, height } = svgDimensions(svg);
      if (width !== frame.width || height !== frame.height) {
        throw new Error(`${p.id}'s chart is ${width}x${height}, not the frame's ${frame.width}x${frame.height}`);
      }
      const file = join(temp, `${p.id}.svg`);
      writeFileSync(file, svg);
      pressings.push({ svg: file, out: join(root, "primer", pictureFile(p.id)) });
      manifest[p.id] = { file: pictureFile(p.id), signature: chartSignature(svg) };
    }
    mkdirSync(join(root, "primer", PICTURE_FOLDER), { recursive: true });
    const pressed = await deps.press(browser, pressings, { pixelWidth: PICTURE_PIXEL_WIDTH, quality: PICTURE_QUALITY });
    writeFileSync(join(root, "primer", PICTURE_MANIFEST), JSON.stringify(manifest));
    const n = pressings.length;
    deps.log(`pictures: ${n} pressed with ${browser} (${pressed.product}), ${pressed.bytes} bytes in all`);
    return n;
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
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
