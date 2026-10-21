// The loupe's geometry (Issue #751): the sheet point under the pointer sits at the lens centre, the copy magnified by the camera's depth times the power.
export interface LoupeInput {
  readonly at: { readonly x: number; readonly y: number };
  readonly box: { readonly width: number; readonly height: number };
  readonly zoom: { readonly x: number; readonly y: number; readonly k: number };
  readonly diameter: number;
  readonly power: number;
}

export interface LoupeView {
  readonly lens: { readonly x: number; readonly y: number };
  readonly sheet: { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
}

export function loupeView(i: LoupeInput): LoupeView {
  return { lens: { x: i.at.x, y: i.at.y }, sheet: { x: 0, y: 0, w: 0, h: 0 } };
}
