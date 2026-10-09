import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const REPO = resolve(import.meta.dirname, "..");
// A cap on a hang, never a budget (2026-09-27: the listing ran in 6 to 7 ms on a Mac, so 30 s is three orders above it); a timed-out spawnSync returns status null rather than throwing, which the status check below turns into a throw, and no test drives that path.
const GIT_TIMEOUT_MS = 30_000;
const WITNESSES = ["public/house.css", "public/explorer/broadside.css"] as const;

function listSheets(): ReadonlyArray<string> {
  const listing = spawnSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--deduplicate", "--", "public/*.css"],
    { cwd: REPO, encoding: "utf8", timeout: GIT_TIMEOUT_MS },
  );
  if (listing.status !== 0)
    throw new Error(
      `git ls-files failed (${listing.status}, ${listing.error ?? listing.stderr}): the sheet roster would be empty or partial`,
    );
  const sheets = listing.stdout.split("\0").filter(Boolean).sort();
  const missing = WITNESSES.filter((witness) => !sheets.includes(witness));
  if (missing.length > 0)
    throw new Error(
      `the sheet roster lacks ${missing.join(" and ")}, so it read the wrong tree or stopped short of a depth`,
    );
  return sheets;
}

// A sweep that types out its own list of sheets instead of importing this reds nothing here (handbook/errata/guards.md), so Gate 1 item 16 is the only fence on that.
export const SITE_SHEETS: ReadonlyArray<string> = listSheets();

export { SRC_CSS_FILES } from "../scripts/lint/sheet-tokens.ts";
