import { runJob } from "./worker-client.ts";
import { updateLandReadout, syncAutoSlider } from "./sea-level.ts";
import { updateCoastReadout, parkCoastDefault } from "./coast-warp.ts";
import { landKeysNow } from "./hash-sync.ts";
import { overridesOfLand, type LandOverrides } from "../shared/address-grammar.ts";
import { makeDogEar, surveyItemFrom } from "./chart-drawer.ts";
import type { bindChartDrawer } from "./chart-drawer-bind.ts";
import { bindTableDrag, bandOf, lengthPx } from "./table-drag.ts";
import { createGlass, type Glass } from "./glass.ts";
import { ZOOM_STEP } from "../shared/zoom-keys.ts";
import { pageLoupe } from "./loupe-page.ts";
import { pageSlideAway } from "../shared/slide-away-page.ts";
import type { Motion } from "./world-motion.ts";
import { wireControls, type TouchedGates } from "./controls.ts";
import { refreshLand, wireShapeControls } from "./shape-controls.ts";
import { wirePlacePicker } from "./place-picker.ts";
import { writtenFor } from "./written-hold.ts";
import type { LivingChart } from "../shared/living-chart/index.ts";
import { pageBox } from "../shared/page-box.ts";
import { $ } from "../shared/by-id.ts";
import type { TableItem } from "../shared/table-address.ts";
import type { MapType } from "../../terrain/heightfield.ts";
import type { ClimateBand } from "../../climate/climate.ts";
import type { StyleName } from "../../render/style.ts";
import type { ThemeName } from "../../render/layers/field.ts";
import {
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
  hashControls,
  status,
  mapDiv,
  mapViewport,
  caption,
  chartDrawer,
  sheetEl,
  stageEl,
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
  readonly motion: Motion;
  readonly worldSvg: () => string;
  readonly earLabel: (item: TableItem) => string;
  readonly prefersReduce: () => boolean;
  readonly token: (name: string) => string;
  readonly tokenMs: (name: string, fallback: number) => number;
  readonly buttons: Parameters<typeof createGlass>[0]["buttons"] & { readonly loupe: HTMLElement };
}

export function pageGlass({
  lc,
  chartTable,
  regionEligible,
  syncHash,
  motion,
  worldSvg,
  earLabel,
  prefersReduce,
  token,
  tokenMs,
  buttons,
}: PageGlassDeps): Glass {
  const loupe = pageLoupe({ press: buttons.loupe, motion, worldSvg, glass: () => glass });
  const slide = pageSlideAway({
    frame: stageEl,
    sheet: sheetEl,
    gesture: mapViewport,
    step: ZOOM_STEP,
    keyAnywhere: true,
    folioCovered: () => chartDrawer.classList.contains("open"),
  });
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
    busy: motion.busy,
    onView: (k) => {
      loupe.follow();
      slide.follow(k);
    },
    decorateInset: (el: HTMLElement) => {
      insetDogEar(el, glass, chartTable, earLabel, prefersReduce, token, tokenMs);
    },
    buttons,
  });
  return glass;
}

export type DrawOverrides = { mapType?: MapType; band?: ClimateBand } & LandOverrides;

export function draftOverrides(seed: number, touched: TouchedGates): DrawOverrides {
  const written = writtenFor(seed);
  const chosen: { mapType?: MapType; band?: ClimateBand } = {};
  if (typeSel.value) chosen.mapType = typeSel.value as MapType;
  if (bandSel.value) chosen.band = bandSel.value as ClimateBand;
  if (!touched.land) syncAutoSlider(seed, chosen);
  updateLandReadout();
  if (!touched.coast) parkCoastDefault(seed, chosen);
  updateCoastReadout();
  refreshLand();
  if (written !== null) return written.overrides;
  return { ...chosen, ...overridesOfLand(landKeysNow(hashControls, touched.land, touched.coast)) };
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
  wireShapeControls(draw);
  wirePlacePicker(draw);
}
