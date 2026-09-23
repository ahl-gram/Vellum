// The wait a CSS transition is owed (#529): a blind sleep samples the animation mid-flight when the runner stalls before the transition starts (a 600ms sleep read the 0.32s drawer slide 0.76px from home on CI), and what a rest costs varies by direction (the drawer's visibility flips instantly on open and 0.32s behind the slide on close, BaseLayout.astro; the slip's tab hides 0.45s behind its fade, atelier.css), so the predicate belongs to the caller. The second argument is the PREVIOUS read, so a rest with no fixed end value can ask for stillness instead: the specimen's legend starts its 0.32s slide only when the slip it was docked in finishes hiding (measured 2026-09-07: 320ms to 650ms), after every state flag on the page is already final.
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
