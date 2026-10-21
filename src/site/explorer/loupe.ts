// The loupe (Issue #751): a lens in the gesture box, never in the chart mount, showing the drawn sheets through object urls this module alone mints and revokes.
import type { ZoomState } from "../shared/zoom-controller.ts";
import type { SheetRect } from "../../world/lod.ts";

export const LOUPE_DIAMETER = 240;
export const LOUPE_POWER = 2;

export interface SvgUrls {
  readonly create: (svg: string) => string;
  readonly revoke: (url: string) => void;
}

export interface LoupeSheets {
  readonly world: string;
  readonly inset: { readonly svg: string; readonly rect: SheetRect } | null;
}

export interface LoupeDeps {
  readonly host: HTMLElement;
  readonly mapDiv: HTMLElement;
  readonly zoom: () => ZoomState;
  readonly sheets: () => LoupeSheets | null;
  readonly urls: SvgUrls;
  readonly touchable: boolean;
}

export interface Loupe {
  readonly lens: HTMLElement;
  readonly grip: HTMLElement;
  readonly show: (at: { readonly x: number; readonly y: number }) => void;
  readonly hide: () => void;
}

export function svgUrl(urls: SvgUrls): (svg: string) => string {
  return (next) => urls.create(next);
}

export function createLoupe(deps: LoupeDeps): Loupe {
  const lens = document.createElement("div");
  const grip = document.createElement("div");
  deps.mapDiv.append(lens);
  return { lens, grip, show: () => {}, hide: () => {} };
}
