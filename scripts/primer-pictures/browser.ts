import { findBrowser } from "../../src/cli/raster.ts";
import { isSet, type BrowserPolicyEnv } from "../../e2e/support/browser-policy.ts";

export const REQUIRE_BROWSER = "VELLUM_REQUIRE_BROWSER";
export const NO_PICTURE_BROWSER =
  "no Chromium-family browser found to press the Primer's pictures, and VELLUM_REQUIRE_BROWSER is set: the build stops here and the site stays as it was (Issue #1155, M3); install Brave or Chrome, or point VELLUM_BROWSER at a browser binary";
export const SKIP_PICTURES =
  "SKIP: no Chromium-family browser found, so the Primer's pictures were not pressed and its page shows empty frames (set VELLUM_BROWSER, or VELLUM_REQUIRE_BROWSER=1 to fail instead)";

export function pictureBrowser(env: BrowserPolicyEnv, find: () => string | null = findBrowser): string | null {
  const browser = find();
  if (browser === null && isSet(env[REQUIRE_BROWSER])) throw new Error(NO_PICTURE_BROWSER);
  return browser;
}
