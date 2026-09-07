// The wait a CSS transition is owed (#529). A blind sleep samples the animation mid-flight however generous it is, because when the runner stalls BEFORE the transition starts no fixed multiple helps: a 600ms sleep read the 0.32s drawer slide 0.76px from home on CI, and every instance this replaced was a multiple of its own transition already. What each rest costs varies by direction, so the predicate belongs to the caller: the drawer's transform runs 0.32s both ways while its visibility flips instantly on open and 0.32s behind the slide on close (BaseLayout.astro), and the slip's tab hides 0.45s behind its fade (atelier.css).
// The second argument is the PREVIOUS read, so a caller whose rest has no fixed end value can ask for stillness instead. Some do: the specimen's legend does not begin its 0.32s slide until the slip it was docked in finishes hiding, measured 2026-09-07 as starting at 320ms and resting at 650ms, so every state flag on the page is already final while the geometry is still moving.
export function makeSettle({ evaluate, sleep }) {
  // THROWS rather than returning the last read: a poll that falls through to the read reintroduces the same flake silently, which one mutation run proved, an unsatisfiable predicate burned the whole budget and the check still passed. The last read rides in the message so the failure keeps the payload a red check would have printed.
  return async (read, settled, label, tries = 120) => {
    let last = null;
    for (let i = 0; i < tries; i++) {
      const d = await evaluate(read);
      if (d && settled(d, last)) return d;
      last = d;
      await sleep(50);
    }
    throw new Error(`settle timeout ${label}: ${JSON.stringify(last)}`);
  };
}
