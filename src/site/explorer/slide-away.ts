// The arithmetic of the Explorer's slide-away (Issue #996): how deep the chart fills the screen beside the Broadside, how far the head cluster and the chart folio have followed the zoom there, and where a pointer holds them.
export interface Edges {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}
export interface Insets {
  readonly top: string;
  readonly right: string;
  readonly bottom: string;
  readonly left: string;
}
export const HEAD_CLEAR = 3;
export const FOOT_CLEAR = 2;
export function fillDepth(_sheet: Edges, _room: Edges): number {
  return 1;
}
export function followStart(_fill: number, firstPress: number): number {
  return firstPress;
}
export function slideProgress(_k: number, _from: number, _fill: number, _reduce: boolean): number {
  return 0;
}
export function headTravel(_navBottom: number): number {
  return 0;
}
export function folioTravel(_pageHeight: number, _titleBottom: number): number {
  return 0;
}
export type ArmingEvent = { readonly type: "keydown" | "wheel" | "pointerdown"; readonly onChart: boolean };
export function arms(_e: ArmingEvent): boolean {
  return true;
}
export function steers(_pointerType: string): boolean {
  return true;
}
export function reachOf(_inset: Insets): Edges {
  return { left: 0, top: 0, right: 0, bottom: 0 };
}
export function grown(box: Edges, _reach: Edges): Edges {
  return box;
}
export function holdZone(home: Edges, _reach: Edges, _toward: "top" | "bottom", _pageHeight: number): Edges {
  return home;
}
export function within(_x: number, _y: number, _zone: Edges): boolean {
  return false;
}
