import { gradientNoise2 } from "./gradient.ts";

export type FbmOptions = {
  octaves?: number;
  lacunarity?: number;
  gain?: number;
};

export type WarpOptions = FbmOptions & {
  warpStrength?: number;
};

/** Per-octave offsets so lattice zeros never align across octaves and imprint a visible grid. */
const OCTAVE_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [127.1, 311.7],
  [269.5, 183.3],
  [419.2, 371.9],
  [547.3, 159.4],
  [673.7, 443.1],
  [809.2, 277.5],
  [931.1, 521.7],
];

const OCTAVE_SEED_STEP = 1013904223;

export function fbm2(
  x: number,
  y: number,
  seed: number,
  opts: FbmOptions = {},
): number {
  const { octaves = 5, lacunarity = 2, gain = 0.5 } = opts;
  let amp = 1;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    const [ox, oy] = OCTAVE_OFFSETS[o % OCTAVE_OFFSETS.length] as readonly [
      number,
      number,
    ];
    sum +=
      amp *
      gradientNoise2(x * freq + ox, y * freq + oy, seed + o * OCTAVE_SEED_STEP);
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return sum / norm;
}

export function ridged2(
  x: number,
  y: number,
  seed: number,
  opts: FbmOptions = {},
): number {
  const { octaves = 4, lacunarity = 2, gain = 0.5 } = opts;
  let amp = 1;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    const [ox, oy] = OCTAVE_OFFSETS[o % OCTAVE_OFFSETS.length] as readonly [
      number,
      number,
    ];
    const n = gradientNoise2(
      x * freq + ox,
      y * freq + oy,
      seed + o * OCTAVE_SEED_STEP,
    );
    const r = 1 - Math.min(1, Math.abs(n));
    sum += amp * r * r;
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return sum / norm;
}

export function warped2(
  x: number,
  y: number,
  seed: number,
  opts: WarpOptions = {},
): number {
  const { warpStrength = 0.35, ...fbmOpts } = opts;
  if (warpStrength === 0) return fbm2(x, y, seed, fbmOpts);
  const wx = fbm2(x + 5.2, y + 1.3, (seed ^ 0x5f356495) >>> 0, { octaves: 4 });
  const wy = fbm2(x + 9.7, y + 8.1, (seed ^ 0x2545f491) >>> 0, { octaves: 4 });
  return fbm2(x + warpStrength * wx, y + warpStrength * wy, seed, fbmOpts);
}
