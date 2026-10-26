// The wait a CSS transition is owed (Issue #529): a blind sleep samples the animation mid-flight when the runner stalls before the transition starts (a 600ms sleep read the retired phone drawer's 0.32s slide 0.76px from home on CI), and what a rest costs varies by direction (the slip's tab shows at once and hides 0.45s behind its fade, atelier.css), so the predicate belongs to the caller. The second argument is the PREVIOUS read, so a rest with no fixed end value can ask for stillness instead: the specimen's legend starts its 0.32s slide only when the slip it was docked in finishes hiding (measured 2026-09-07: 320ms to 650ms), after every state flag on the page is already final.
import type { Payload } from "../types.ts";
import { errorText } from "./suites.ts";

export function makeSettle({
  evaluate,
  sleep,
  tolerant = false,
}: {
  evaluate: (expression: string, awaitPromise?: boolean) => Promise<unknown>;
  sleep: (ms: number) => Promise<unknown>;
  tolerant?: boolean;
}) {
  // THROWS rather than returning the last read: a poll that falls through to the read reintroduces the same flake silently, which one mutation run proved, an unsatisfiable predicate burned the whole budget and the check still passed. The last read rides in the message so the failure keeps the payload a red check would have printed.
  return async <T>(
    read: Payload<T>,
    settled: (d: NoInfer<NonNullable<T>>, last: NoInfer<T> | null) => boolean | null,
    label: string,
    tries = 120,
  ): Promise<NoInfer<NonNullable<T>>> => {
    let last: T | null = null;
    let threw: string | null = null;
    for (let i = 0; i < tries; i++) {
      let d: T | null = null;
      try {
        d = (await evaluate(read)) as T;
        threw = null;
      } catch (err) {
        if (!tolerant) throw err;
        threw = errorText(err);
      }
      if (d && settled(d, last)) return d;
      last = d;
      await sleep(50);
    }
    throw new Error(
      `settle timeout ${label}: ${JSON.stringify(last)}${threw === null ? "" : ` (the last read threw: ${threw})`}`,
    );
  };
}

export type Settle = ReturnType<typeof makeSettle>;

export const STILL_ONLY = {
  carry: "none: the moves land before their dispatch returns, and mid itself is the claim",
  deskNotice:
    "none: the page has loaded or switched its media before the read, and every field read is a check's own claim",
} as const satisfies Record<string, `none: ${string}`>;
type Departure<T> = ((d: T) => boolean) | (typeof STILL_ONLY)[keyof typeof STILL_ONLY];
export type StableOptions<T> = { readonly same?: (d: T, last: T) => boolean; readonly tries?: number } & (
  | { readonly departed: Departure<T>; readonly animated?: string }
  | { readonly departed?: Departure<T>; readonly animated: string }
);

type Witnessed<T> = { read: T | null; anims: string[] | null };

const finished = (anims: readonly string[] | null): boolean =>
  anims !== null && anims.length > 0 && anims.every((s) => s === "finished");

const witnessed = <T>(read: Payload<T>, carrier: string): Payload<Witnessed<NonNullable<T>>> =>
  `(() => { const read = (${read}); const e = document.querySelector(${JSON.stringify(carrier)}); return { read: read || null, anims: e ? e.getAnimations().map((a) => a.playState) : null }; })()`;

const sameJson = (d: unknown, last: unknown): boolean => JSON.stringify(d) === JSON.stringify(last);

const PROMISED = /^\s*\(\s*async\b/;

export function makeStable(settle: Settle) {
  return async <T>(
    read: Payload<T>,
    label: string,
    options: StableOptions<NoInfer<NonNullable<T>>>,
  ): Promise<NoInfer<NonNullable<T>>> => {
    const { same = sameJson, animated, tries } = options;
    if (options.departed === undefined && animated === undefined)
      throw new Error(`makeStable owes a departure, an animation or the reason it has none: ${label}`);
    if (PROMISED.test(read)) throw new Error(`makeStable reads a value, and a promise arrives as {}: ${label}`);
    const departed = typeof options.departed === "function" ? options.departed : () => true;
    if (animated === undefined)
      return settle(read, (d, last) => last !== null && same(d, last as NonNullable<T>) && departed(d), label, tries);
    const seen = await settle(
      witnessed(read, animated),
      (w, last) =>
        w.read !== null &&
        last !== null &&
        last.read !== null &&
        finished(w.anims) &&
        same(w.read, last.read) &&
        departed(w.read),
      label,
      tries,
    );
    return seen.read as NonNullable<T>;
  };
}
