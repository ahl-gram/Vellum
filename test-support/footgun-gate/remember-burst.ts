import { existsSync, writeFileSync } from "node:fs";
import { rememberGate } from "../../scripts/agent-infra/hooks/gate-state.ts";

export const REMEMBER_BURST = import.meta.filename;

if (import.meta.main) {
  const [session = "", prefix = "", count = "0", ready = "", go = ""] = process.argv.slice(2);
  const pause = new Int32Array(new SharedArrayBuffer(4));
  writeFileSync(ready, "");
  while (!existsSync(go)) Atomics.wait(pause, 0, 0, 1);
  for (let k = 0; k < Number(count); k++) rememberGate(session, `${prefix}${k}`);
}
