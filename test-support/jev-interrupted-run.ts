import { processDeps, runCommand } from "../scripts/jev/cli.ts";
import { answeringFetch, ONE_QUESTION } from "./jev-fakes.ts";

// 2026-11-11: a cap on a hang, never a budget; it stays under jev-cli.test.ts's WAIT_MS so a handler that fails to exit ends the child by itself with code 0 and reds on the code assertion.
const HOLD_MS = 30_000;

const home = process.argv[2]!;

process.exitCode = await runCommand(
  "interrupted",
  async (_argv, sendFor) => {
    await sendFor(false)(ONE_QUESTION);
    console.log("asked");
    await new Promise((resolve) => setTimeout(resolve, HOLD_MS));
    return 0;
  },
  ["probe"],
  {
    ...processDeps(),
    env: { TYPESAFE_API_KEY: "k-interrupted-test" },
    home,
    fetcher: answeringFetch([250]),
    now: () => new Date("2026-11-11T20:00:00.000Z"),
  },
);
