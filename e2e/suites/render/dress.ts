// The Explorer's sheet and chart as dressed (Issue #779 part 2h): the stage depth by its token, the chart filling it unshadowed.
import { PAGE_RGBA, SHADE } from "../../support/pixel.ts";
import type { Payload, SuiteContext } from "../../types.ts";

type Chart = { shadow: string; w: number; h: number } | null;
type Dress = {
  stage: string;
  sheetToken: string;
  sheetShadow: string;
  shade: { colour: number[]; geometry: string } | null;
  w: number;
  h: number;
  chart: Chart;
} | null;
const DRESS: Payload<Dress> = `(() => { const rgba = ${PAGE_RGBA}, shade = ${SHADE}, cs = (e) => getComputedStyle(e);
  const probes = {};
  for (const [name, token] of [["stage", "--stage-shadow"], ["sheet", "--sheet-shadow"]]) {
    const d = document.createElement("div"); d.style.boxShadow = "var(" + token + ")"; document.body.appendChild(d);
    probes[name] = cs(d).boxShadow; d.remove(); }
  const s = document.getElementById("sheet"); if (!s) return null;
  const chart = document.querySelector("#map > svg[data-vellum-style]");
  return { stage: probes.stage, sheetToken: probes.sheet, sheetShadow: cs(s).boxShadow, shade: shade(cs(s).boxShadow),
    w: parseFloat(cs(s).width), h: parseFloat(cs(s).height),
    chart: chart ? { shadow: cs(chart).boxShadow, w: parseFloat(cs(chart).width), h: parseFloat(cs(chart).height) } : null }; })()`;

export async function r17SheetDepth({ evaluate, check }: SuiteContext): Promise<void> {
  const d = await evaluate(DRESS);
  check(
    "R17 the Explorer's sheet rests at the stage depth by its token and the chart fills it unshadowed",
    !!d &&
      !!d.shade &&
      d.sheetShadow === d.stage &&
      d.sheetShadow !== d.sheetToken &&
      !!d.chart &&
      Math.abs(d.chart.w - d.w) <= 1 &&
      Math.abs(d.chart.h - d.h) <= 1 &&
      d.chart.shadow === "none",
    JSON.stringify(d),
  );
}
