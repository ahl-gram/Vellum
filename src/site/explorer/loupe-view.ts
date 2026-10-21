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
  const r = i.diameter / 2;
  const s = i.zoom.k * i.power;
  return {
    lens: { x: i.at.x - r, y: i.at.y - r },
    sheet: {
      x: r - (i.at.x - i.zoom.x) * i.power,
      y: r - (i.at.y - i.zoom.y) * i.power,
      w: i.box.width * s,
      h: i.box.height * s,
    },
  };
}
