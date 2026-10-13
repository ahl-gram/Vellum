// The Explorer's host contract (Issue #779 part 2h): the mount class and the engine's own sheet.
import type { Payload, SuiteContext } from "../../types.ts";

type Host = { classes: string[]; links: string[]; sheet: { found: boolean; overlay: boolean; unreadable: boolean } };
const HOST: Payload<Host> = `(() => { const map = document.getElementById("map");
  const links = [...document.querySelectorAll('head link[rel="stylesheet"]')].map((l) => new URL(l.getAttribute("href"), location.href).pathname);
  const sheet = { found: false, overlay: false, unreadable: false };
  for (const s of document.styleSheets) { const p = s.href ? new URL(s.href).pathname : ""; if (p !== "/living-chart.css") continue;
    sheet.found = true; try { sheet.overlay = [...s.cssRules].some((r) => r.selectorText === ".place-overlay"); } catch { sheet.unreadable = true; } }
  return { classes: map ? [...map.classList] : [], links, sheet }; })()`;

export async function r16HostContract({ evaluate, check }: SuiteContext): Promise<void> {
  const h = await evaluate(HOST);
  check(
    "R16 the Explorer wears the engine's host contract: the mount carries the class, the page links the sheet, and the sheet is loaded and is the engine's own",
    h.classes.includes("living-chart") &&
      h.links.includes("/living-chart.css") &&
      h.sheet.found &&
      h.sheet.overlay &&
      !h.sheet.unreadable,
    JSON.stringify(h),
  );
}
