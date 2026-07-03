/**
 * Colour-vision-deficiency helpers for the realm-tint assignment (#78).
 *
 * Two realm washes must not read as one nation even for a colour-blind viewer,
 * so the assignment treats palette colours that collapse under deuteranopia or
 * protanopia (or are already near-twins in normal vision) as a single class that
 * may never land on two close realms. Simulation uses the Machado et al. 2009
 * severity-1.0 matrices applied in linear RGB; distance is CIE76 dE in Lab,
 * measured on the wash composited over the style's paper, since that is how the
 * tint actually reads on the plate rather than at full strength.
 */

type Rgb = readonly [number, number, number];
type Vec3 = [number, number, number];
type Mat3 = readonly [Vec3, Vec3, Vec3];

function hexToRgb(hex: string): Rgb {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h[0]! + h[0]! + h[1]! + h[1]! + h[2]! + h[2]!;
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

// Machado et al. 2009, dichromat severity 1.0.
const DEUTERANOPIA: Mat3 = [
  [0.367322, 0.860646, -0.227968],
  [0.280085, 0.672501, 0.047413],
  [-0.01182, 0.04294, 0.968881],
];
const PROTANOPIA: Mat3 = [
  [0.152286, 1.052583, -0.204868],
  [0.114503, 0.786281, 0.099216],
  [-0.003882, -0.048116, 1.051998],
];

const srgbToLinear = (c: number): number => {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
};

/** sRGB `over` composite of a tint on paper, then linearised for the matrices. */
function compositeLinear(fg: Rgb, bg: Rgb, alpha: number): Vec3 {
  return [0, 1, 2].map((i) =>
    srgbToLinear(alpha * fg[i]! + (1 - alpha) * bg[i]!),
  ) as Vec3;
}

function applyMatrix(m: Mat3, [r, g, b]: Vec3): Vec3 {
  return [
    m[0][0] * r + m[0][1] * g + m[0][2] * b,
    m[1][0] * r + m[1][1] * g + m[1][2] * b,
    m[2][0] * r + m[2][1] * g + m[2][2] * b,
  ];
}

function linearToLab([R, G, B]: Vec3): Vec3 {
  let x = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047;
  let y = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  let z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883;
  const f = (t: number): number =>
    t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  x = f(x);
  y = f(y);
  z = f(z);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

const deltaE = (a: Vec3, b: Vec3): number =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/**
 * True if two tints, painted as washes over `paper` at `opacity`, are hard to
 * tell apart in normal vision OR under deuteranopia OR protanopia.
 */
export function washesConfusable(
  a: string,
  b: string,
  paper: string,
  opacity: number,
  threshold = 2.5,
): boolean {
  const la = compositeLinear(hexToRgb(a), hexToRgb(paper), opacity);
  const lb = compositeLinear(hexToRgb(b), hexToRgb(paper), opacity);
  for (const m of [null, DEUTERANOPIA, PROTANOPIA] as const) {
    const va = m ? applyMatrix(m, la) : la;
    const vb = m ? applyMatrix(m, lb) : lb;
    if (deltaE(linearToLab(va), linearToLab(vb)) < threshold) return true;
  }
  return false;
}

/**
 * Symmetric conflict matrix over a palette: `[i][j]` is true iff tints i and j
 * are confusable as washes (normal / deuteranopia / protanopia). Diagonal false.
 */
export function washConflictMatrix(
  palette: readonly string[],
  paper: string,
  opacity: number,
  threshold = 2.5,
): boolean[][] {
  const n = palette.length;
  const m: boolean[][] = Array.from({ length: n }, () =>
    new Array<boolean>(n).fill(false),
  );
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const c = washesConfusable(palette[i]!, palette[j]!, paper, opacity, threshold);
      m[i]![j] = c;
      m[j]![i] = c;
    }
  }
  return m;
}
