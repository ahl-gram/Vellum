// The pace measurement (#526): the sweep's clock is wall-anchored (living-chart/pace.ts), so the years the story covers per page millisecond is a RATE no runner speed can move, only WHEN frames land; each sample pairs a year with the rAF timestamp of the frame that painted it, the slope of year on that timestamp is the rate, and a constant pairing lag is an offset in that fit, not a tilt.
import { SWEEP_MS } from "../render/chronicle-scrubber.ts";

/** One painted frame: the frame's own timestamp, the year it painted, the pace it painted at. */
export interface PaceSample {
  readonly t: number;
  readonly year: number;
  readonly pace: number;
}

export interface PaceLegReading {
  readonly pace: number;
  readonly n: number;
  readonly rate: number;
  readonly expected: number;
  /** Signed fraction the measured rate misses its expected one by. */
  readonly dev: number;
  readonly ok: boolean;
}

export interface PaceSweepReading {
  readonly ok: boolean;
  readonly legs: readonly PaceLegReading[];
  readonly ratio: number;
  readonly backward: number;
  readonly jump: number;
  readonly jumpAllowed: number;
  readonly parked: boolean;
  readonly detail: string;
}

/** Measured 2026-09-07: worst deviation 0.8 percent over CDP CPU throttling 1x, 2x, 4x, 8x and 20x (frame gaps 33 to 117 ms), three runs each; 12 percent is fifteen times that worst case and still bites a pace off by an eighth. */
export const PACE_RATE_TOLERANCE = 0.12;

/** Below this the fit reads noise rather than a rate (measured 2026-09-07: four samples per leg still fit to 0.3 percent at 50x throttling, but at 80x, gaps past 450 ms, three of them read 34 percent low), so a starved runner fails as frames instead of as a wrong ratio; a healthy runner lands about 48 per leg. */
export const PACE_LEG_MIN_SAMPLES = 8;

/** Each leg's wall window: long enough for about 48 frames, short enough that the whole measure spends about 4200 of SWEEP_MS's 7000 story ms, so the sweep cannot park mid-reading (`parked` catches it if it ever does). */
export const PACE_LEG_MS = 800;

/** Slack on a single step, which is the year's rounding at each end and nothing else: measured 2026-09-07 through a real browser at CPU throttling 1x to 50x (frame gaps 33 to 250 ms), every step ran at most 0.8 years past what its own gap allowed, whatever the gap. */
const JUMP_SLACK_YEARS = 2;

/** Least squares slope of year on frame time. NaN when the samples do not span any time. */
export function fitRate(samples: readonly PaceSample[]): number {
  const n = samples.length;
  if (n < 2) return NaN;
  const mt = samples.reduce((a, s) => a + s.t, 0) / n;
  const my = samples.reduce((a, s) => a + s.year, 0) / n;
  let num = 0;
  let den = 0;
  for (const s of samples) {
    num += (s.t - mt) * (s.year - my);
    den += (s.t - mt) * (s.t - mt);
  }
  return den > 0 ? num / den : NaN;
}

export const expectedRate = (span: number, pace: number): number => (pace * span) / SWEEP_MS;

export interface PaceSweepOpts {
  readonly range: { readonly min: number; readonly max: number };
  /** The paces the sweep was driven through, slowest first. */
  readonly paces: readonly number[];
}

/** Read a pace sweep: one leg per pace, each fitted against the rate SWEEP_MS says it should run at, plus the whole series' continuity (#493's re-anchor keeps the story where it stands, and storyAt's floor keeps a frame stamped before the anchor from stepping the year back). */
export function readPaceSweep(samples: readonly PaceSample[], opts: PaceSweepOpts): PaceSweepReading {
  const span = opts.range.max - opts.range.min;
  const legs = opts.paces.map((pace, i) => {
    // The frame at a pace change can carry the new pace with the year the frame before it painted, so a leg opens at its second sample; the first leg has no such boundary behind it.
    const all = samples.filter((s) => s.pace === pace);
    const leg = i === 0 ? all : all.slice(1);
    const rate = fitRate(leg);
    const expected = expectedRate(span, pace);
    const dev = rate / expected - 1;
    return { pace, n: leg.length, rate, expected, dev, ok: leg.length >= PACE_LEG_MIN_SAMPLES && Math.abs(dev) <= PACE_RATE_TOLERANCE };
  });

  let backward = 0;
  let jump = 0;
  let jumpAllowed = 0;
  let worst = -Infinity;
  const fastest = Math.max(...opts.paces);
  for (let i = 1; i < samples.length; i++) {
    const step = samples[i]!.year - samples[i - 1]!.year;
    backward = Math.min(backward, step);
    // No frame may cover more story than the fastest pace could have covered in its own gap, taking the WIDER of this gap and the one before it: a sample can pair the frame's timestamp with the year the frame before it painted, and a step measured against the wrong one of a 200 ms gap and a 16 ms gap reads as a leap. (The rate fit cancels that lag as an offset; a single step cannot.) The first step has no gap behind it to widen against, so the scan opens at the second.
    if (i < 2) continue;
    const gap = Math.max(samples[i]!.t - samples[i - 1]!.t, samples[i - 1]!.t - samples[i - 2]!.t);
    const allowed = expectedRate(span, fastest) * gap + JUMP_SLACK_YEARS;
    if (step - allowed > worst) {
      worst = step - allowed;
      jump = step;
      jumpAllowed = allowed;
    }
  }

  const last = samples[samples.length - 1];
  const parked = !last || last.year >= opts.range.max;
  const first = legs[0];
  const lastLeg = legs[legs.length - 1];
  const ratio = first && lastLeg ? lastLeg.rate / first.rate : NaN;
  const ok = legs.every((l) => l.ok) && backward === 0 && jump <= jumpAllowed && !parked;
  const detail = JSON.stringify({
    legs: legs.map((l) => ({ pace: l.pace, n: l.n, rate: Number(l.rate.toFixed(4)), expected: Number(l.expected.toFixed(4)), devPct: Number((l.dev * 100).toFixed(1)) })),
    ratio: Number(ratio.toFixed(2)),
    backward,
    jump: Number(jump.toFixed(1)),
    jumpAllowed: Number(jumpAllowed.toFixed(1)),
    parked,
    range: opts.range,
    tolerancePct: PACE_RATE_TOLERANCE * 100,
    minSamples: PACE_LEG_MIN_SAMPLES,
  });
  return { ok, legs, ratio, backward, jump, jumpAllowed, parked, detail };
}
