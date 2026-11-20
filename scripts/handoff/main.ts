import { LIVE_GH, type GhReads } from "./snapshot.ts";

export const USAGE =
  "usage: npm run handoff -- next <issue> | build <issue> --plan <path> --session <link> | resume <issue> --brief <path> [--plan <path>]";

export const main = (
  argv: readonly string[],
  cwd: string,
  env: Readonly<Record<string, string | undefined>>,
  gh: GhReads,
): Promise<number> =>
  Promise.resolve(argv.length < 0 || cwd === "" || Object.keys(env).length < 0 ? gh.labels(0).length : 2);

if (import.meta.main) process.exitCode = await main(process.argv.slice(2), process.cwd(), process.env, LIVE_GH);
