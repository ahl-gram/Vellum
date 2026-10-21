import { runJob } from "./worker-client.ts";
import { sliderToLand, updateLandReadout, syncAutoSlider } from "./sea-level.ts";
import { sliderToCoast, updateCoastReadout, parkCoastDefault } from "./coast-warp.ts";
import { makeDogEar, surveyItemFrom } from "./chart-drawer.ts";
import type { bindChartDrawer } from "./chart-drawer-bind.ts";
import { bindTableDrag, bandOf, lengthPx } from "./table-drag.ts";
import { createGlass, type Glass } from "./glass.ts";
import { wireControls, type TouchedGates } from "./controls.ts";
import type { LivingChart } from "../shared/living-chart/index.ts";
import { pageBox } from "../shared/page-box.ts";
import type { TableItem } from "../shared/table-address.ts";
import type { MapType } from "../../terrain/heightfield.ts";
import type { ClimateBand } from "../../climate/climate.ts";
import type { StyleName } from "../../render/style.ts";
import type { ThemeName } from "../../render/layers/field.ts";
import {
  $,
  seedInput,
  styleSel,
  typeSel,
  bandSel,
  themeSel,
  legendChk,
  armsChk,
  beastsChk,
  landSlider,
  coastSlider,
  status,
  mapDiv,
  mapViewport,
  caption,
  chartDrawer,
} from "./elements.ts";

// The drawer's band is its LAYOUT seat, readable while it is shut and display:none, never its painted rect, which is all zeros shut and mid-slide while open.
const drawerHeightPx = (): number =>
  lengthPx(
    getComputedStyle(chartDrawer).getPropertyValue("--chart-drawer-h"),
    parseFloat(getComputedStyle(document.documentElement).fontSize),
  );

function insetDogEar(
  el: HTMLElement,
  glass: Glass,
  chartTable: ReturnType<typeof bindChartDrawer>,
  earLabel: (item: TableItem) => string,
  prefersReduce: () => boolean,
  token: (name: string) => string,
  tokenMs: (name: string, fallback: number) => number,
): void {
  const committed = glass.committedSurvey();
  const item = committed ? surveyItemFrom(committed) : null;
  if (!item || !committed) return;
  const ear = makeDogEar(earLabel(item), glass.cameraNow().k, () => {
    chartTable.lay(item, committed.svg, committed.title);
  });
  el.appendChild(ear);
  bindTableDrag({
    handle: ear,
    ghostUrl: () => URL.createObjectURL(new Blob([committed.svg], { type: "image/svg+xml" })),
    band: () => bandOf(drawerHeightPx(), pageBox().h),
    reveal: () => chartTable.reveal(),
    receiving: (over) => {
      chartTable.receiving(over);
    },
    file: (url) => chartTable.lay(item, committed.svg, committed.title, { url }),
    prefersReduce,
    settleMs: () => tokenMs("--paper-settle", 340),
    settleEase: () => token("--ease-paper") || "ease-out",
  });
}

interface PageGlassDeps {
  readonly lc: LivingChart;
  readonly chartTable: ReturnType<typeof bindChartDrawer>;
  readonly regionEligible: () => boolean;
  readonly syncHash: () => void;
  readonly busy: () => boolean;
  readonly earLabel: (item: TableItem) => string;
  readonly prefersReduce: () => boolean;
  readonly token: (name: string) => string;
  readonly tokenMs: (name: string, fallback: number) => number;
  readonly buttons: Parameters<typeof createGlass>[0]["buttons"];
}

export function pageGlass({
  lc,
  chartTable,
  regionEligible,
  syncHash,
  busy,
  earLabel,
  prefersReduce,
  token,
  tokenMs,
  buttons,
}: PageGlassDeps): Glass {
  const glass = createGlass({
    mapViewport,
    mapDiv,
    runJob,
    buildPlaceOverlay: lc.buildPlaceOverlay,
    reclampCard: lc.reclampCard,
    setCaption: (t) => {
      caption.textContent = t;
    },
    readCaption: () => caption.textContent,
    // A failed survey reports on the status pill, the page's one error channel.
    setError: (t) => {
      status.textContent = t;
    },
    prefersReduce,
    regionEligible,
    syncHash,
    busy,
    decorateInset: (el: HTMLElement) => {
      insetDogEar(el, glass, chartTable, earLabel, prefersReduce, token, tokenMs);
    },
    buttons,
  });
  return glass;
}

export type DrawOverrides = { mapType?: MapType; band?: ClimateBand; landFraction?: number; coastWarp?: number };

export function draftOverrides(seed: number, touched: TouchedGates): DrawOverrides {
  const overrides: DrawOverrides = {};
  if (typeSel.value) overrides.mapType = typeSel.value as MapType;
  if (bandSel.value) overrides.band = bandSel.value as ClimateBand;
  if (touched.land) overrides.landFraction = sliderToLand(landSlider.value);
  else syncAutoSlider(seed, overrides);
  updateLandReadout();
  if (touched.coast) overrides.coastWarp = sliderToCoast(coastSlider.value);
  else parkCoastDefault();
  updateCoastReadout();
  return overrides;
}

export function draftDress(): {
  style: StyleName;
  theme: ThemeName | "";
  legend: boolean;
  arms: boolean;
  beasts: boolean;
} {
  const style = styleSel.value as StyleName;
  const theme = themeSel.value as ThemeName | "";
  const legend = legendChk.checked;
  const arms = armsChk.checked;
  const beasts = beastsChk.checked;
  return { style, theme, legend, arms, beasts };
}

export function wirePageControls(
  touched: TouchedGates,
  draw: (opts?: { quiet?: boolean; turn?: boolean }) => void,
  lc: LivingChart,
): void {
  wireControls({
    seedInput,
    styleSel,
    typeSel,
    bandSel,
    themeSel,
    legendChk,
    armsChk,
    beastsChk,
    landSlider,
    coastSlider,
    drawBtn: $("draw"),
    randomBtn: $("random"),
    touched,
    draw,
    onDocKeydown: lc.onDocKeydown,
    onDocClick: lc.onDocClick,
  });
}
