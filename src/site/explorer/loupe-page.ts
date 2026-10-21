// The loupe's page wiring (Issue #751): the Explorer's gesture box, its world in motion and its Glass, handed to the lens and to its hands.
import { createLoupe } from "./loupe.ts";
import { bindLoupe, type Box, type LoupeBinding } from "./loupe-bind.ts";
import { offRecto } from "./verso.ts";
import type { Glass } from "./glass.ts";
import type { Motion } from "./world-motion.ts";
import { pageTouchEnv } from "../shared/chart-touch.ts";
import { mapDiv, mapViewport, sheetEl } from "./elements.ts";

const SVG_URLS = {
  create: (svg: string): string => URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })),
  revoke: (url: string): void => URL.revokeObjectURL(url),
};

const cardRect = (): Box | null => {
  const card = document.getElementById("place-card");
  return card && !card.hidden ? card.getBoundingClientRect() : null;
};

export interface PageLoupeDeps {
  readonly press: HTMLElement;
  readonly motion: Motion;
  readonly worldSvg: () => string;
  readonly glass: () => Glass;
}

export function pageLoupe(deps: PageLoupeDeps): LoupeBinding {
  const touchable = pageTouchEnv().device;
  const loupe = createLoupe({
    host: mapViewport,
    mapDiv,
    zoom: () => deps.glass().zoomState(),
    sheets: () => {
      const world = deps.worldSvg();
      return world ? { world, inset: deps.glass().committedInset() } : null;
    },
    urls: SVG_URLS,
    touchable,
  });
  const binding = bindLoupe({
    press: deps.press,
    viewport: mapViewport,
    loupe,
    cardRect,
    standing: () => !deps.motion.busy() && !offRecto(sheetEl),
    busy: deps.motion.busy,
    touchable,
  });
  deps.motion.watch(binding.follow);
  new MutationObserver(binding.follow).observe(mapDiv, { childList: true });
  return binding;
}
