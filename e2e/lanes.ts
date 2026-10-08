// e2e lane driver (npm run test:e2e:lanes): spawns one e2e/run.ts per SELECTED lane on its own port, streams the outputs line-prefixed, and fails if any selected lane does. No argument runs every lane, which is the local full run; `--lane A` runs exactly one, which is what each CI job does since Issue #623 put one lane on each runner. Every decision it makes lives in the unit-tested e2e/support/lanes.ts and e2e/support/lane-driver.ts.
import { runLanesFromProcess } from "./support/lane-driver.ts";

process.exit(await runLanesFromProcess());
