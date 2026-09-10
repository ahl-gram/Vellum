// Containment at CHECK granularity, the twin of runSelected's at suite granularity (#534): a settle THROWS on timeout (settle-support.mjs, and that is deliberate: handing the last read back lets the check pass on a stale snapshot), so without this the gestures, waits and checks that make up ONE numbered check take the whole suite down and the reader gets `settle timeout open` where a named red belongs.
export function makeStep({ check, alive }) {
  return async (name, body) => {
    try {
      await body();
    } catch (err) {
      if (alive && !(await alive())) throw err;
      // The WHOLE error to stderr beside the one-line detail, for the same reason the runner's suite handler does it: a settle timeout carries its label and last read in the message, but a null deref inside a group carries its file and line in the stack, and dropping that is worse reading than the crash this replaces.
      console.error(`  ${name} never reached its assertion:`, err);
      check(`${name} never reached its assertion`, false, err && err.message ? err.message : String(err));
    }
  };
}
