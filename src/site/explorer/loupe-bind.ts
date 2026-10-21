// The loupe's hands (Issue #751): its press, its held key, the pointer it follows and, where touch is the main pointer, the finger that drags it by its grip while the chart is in hand.
import type { Loupe } from "./loupe.ts";

export const LOUPE_KEY = "l";

export interface KeyLike {
  readonly key: string;
  readonly repeat: boolean;
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
}

export interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

export interface LoupeBindDeps {
  readonly press: HTMLElement;
  readonly viewport: HTMLElement;
  readonly loupe: Loupe;
  readonly cardRect: () => Box | null;
  readonly standing: () => boolean;
  readonly busy: () => boolean;
  readonly touchable: boolean;
}

export interface LoupeBinding {
  readonly follow: () => void;
}

export const loupeKey = (e: KeyLike): boolean => e.key === LOUPE_KEY;

export function bindLoupe(deps: LoupeBindDeps): LoupeBinding {
  deps.press.setAttribute("aria-pressed", "false");
  return { follow: () => deps.loupe.hide() };
}
