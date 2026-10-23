// The arithmetic of a chart room's slide-away (Issue #996, lifted for every zoom room in Issue #1034): how deep the chart fills the screen beside the room's slip, where the follow starts, how far the head cluster and the chart folio have followed the zoom, and where a pointer holds them.
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
export function fillDepth(sheet: Edges, room: Edges): number {
  const cx = (sheet.left + sheet.right) / 2;
  const cy = (sheet.top + sheet.bottom) / 2;
  return Math.max(
    1,
    (cx - room.left) / (cx - sheet.left),
    (cy - room.top) / (cy - sheet.top),
    (room.right - cx) / (sheet.right - cx),
    (room.bottom - cy) / (sheet.bottom - cy),
  );
}
export function fillPress(_fill: number, step: number): number {
  return step;
}
export function followStart(fill: number, step: number): number {
  return Math.min(step, fill);
}
export function slideProgress(k: number, from: number, fill: number, reduce: boolean): number {
  if (k >= fill) return 1;
  if (reduce || k <= from) return 0;
  return Math.log(k / from) / Math.log(fill / from);
}
export function headTravel(navBottom: number): number {
  return -Math.ceil(navBottom + HEAD_CLEAR);
}
export function folioTravel(pageHeight: number, titleBottom: number): number {
  return Math.ceil(pageHeight - FOOT_CLEAR - titleBottom);
}
export type ArmingEvent = { readonly type: "keydown" | "wheel" | "pointerdown"; readonly onChart: boolean };
export function arms(e: ArmingEvent, _keyAnywhere: boolean): boolean {
  return e.type === "keydown" || e.onChart;
}
export function fillAboutCentre(sheet: Edges, room: Edges, _gesture: Edges): number {
  return fillDepth(sheet, room);
}
export function restingBox(
  onScreen: Edges,
  _origin: { readonly x: number; readonly y: number },
  _cam: { readonly x: number; readonly y: number; readonly k: number },
): Edges {
  return onScreen;
}
export function steers(pointerType: string): boolean {
  return pointerType === "mouse" || pointerType === "pen";
}
const reachSide = (value: string): number => Math.max(0, -(parseFloat(value) || 0));

export function reachOf(inset: Insets): Edges {
  return {
    left: reachSide(inset.left),
    top: reachSide(inset.top),
    right: reachSide(inset.right),
    bottom: reachSide(inset.bottom),
  };
}
export function grown(box: Edges, reach: Edges): Edges {
  return {
    left: box.left - reach.left,
    top: box.top - reach.top,
    right: box.right + reach.right,
    bottom: box.bottom + reach.bottom,
  };
}
export function holdZone(home: Edges, reach: Edges, toward: "top" | "bottom", pageHeight: number): Edges {
  const box = grown(home, reach);
  return toward === "top" ? { ...box, top: 0 } : { ...box, bottom: pageHeight };
}
export function within(x: number, y: number, zone: Edges): boolean {
  return x >= zone.left && x <= zone.right && y >= zone.top && y <= zone.bottom;
}
