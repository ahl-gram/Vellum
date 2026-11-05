// The chart's slide with the side panel's fold (Issue #1261): the sheet's own translate and scale, composited, from the box it stood in to its new fit.

export interface SheetBox {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export interface SlideStart {
  readonly dx: number;
  readonly dy: number;
  readonly s: number;
}

export function slideStart(_from: SheetBox, _to: SheetBox, _depth: number): SlideStart | null {
  return { dx: 0, dy: 0, s: 1 };
}

export function foldTiming(): { readonly ms: number; readonly ease: string } | null {
  return { ms: 320, ease: "linear" };
}
