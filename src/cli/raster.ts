import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * SVG → PNG without adding a rasterizer dependency: drive whatever
 * Chromium-family browser is already installed, headless.
 */

const MAC_BROWSERS = [
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
];

const LINUX_BROWSERS = [
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/usr/bin/brave-browser",
];

export function findBrowser(): string | null {
  const fromEnv = process.env["VELLUM_BROWSER"];
  if (fromEnv && existsSync(fromEnv)) return fromEnv;
  for (const path of [...MAC_BROWSERS, ...LINUX_BROWSERS]) {
    if (existsSync(path)) return path;
  }
  return null;
}

export function svgDimensions(svg: string): { width: number; height: number } {
  const m = /<svg[^>]*\swidth="(\d+)"[^>]*\sheight="(\d+)"/.exec(svg);
  if (!m) throw new Error("could not read width/height from the SVG root");
  return { width: Number(m[1]), height: Number(m[2]) };
}

export async function rasterizeSvg(
  browser: string,
  svgPath: string,
  pngPath: string,
  scale = 2,
): Promise<void> {
  const svg = readFileSync(svgPath, "utf8");
  const { width, height } = svgDimensions(svg);
  await execFileAsync(browser, [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    `--screenshot=${pngPath}`,
    `--window-size=${width},${height}`,
    `--force-device-scale-factor=${scale}`,
    pathToFileURL(svgPath).href,
  ]);
  if (!existsSync(pngPath)) {
    throw new Error(`browser exited but produced no PNG at ${pngPath}`);
  }
}

export const NO_BROWSER_HINT =
  "no Chromium-family browser found for PNG export — install Brave/Chrome, " +
  "or point VELLUM_BROWSER at a browser binary; the SVG was still written";
