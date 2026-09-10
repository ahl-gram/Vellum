// Containment at CHECK granularity, the twin of runSelected's at suite granularity (#534): a settle THROWS on timeout (settle-support.mjs, and that is deliberate: handing the last read back lets the check pass on a stale snapshot), so without this the gestures, waits and checks that make up ONE numbered check take the whole suite down and the reader gets `settle timeout open` where a named red belongs.
export function makeStep({ check, alive }) {
  return async (name, body) => {
    try {
      await body();
    } catch (err) {
      // A browser that no longer answers leaves by the door it always did: the suite's containment reads it as infrastructure and the run still exits 2, so HARNESS ERROR keeps meaning what a reader has learned it means.
      if (alive && !(await alive())) throw err;
      check(`${name} never reached its assertion`, false, err && err.message ? err.message : String(err));
    }
  };
}
