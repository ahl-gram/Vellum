import { resolve } from "node:path";
import { listWorkingTree } from "./working-tree.ts";

const REPO = resolve(import.meta.dirname, "..");
const WITNESSES = ["src/styles/shared/house.css", "src/styles/explorer/broadside.css"] as const;

function listSheets(): ReadonlyArray<string> {
  const sheets = listWorkingTree(REPO, ["src/styles/*.css"]);
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
