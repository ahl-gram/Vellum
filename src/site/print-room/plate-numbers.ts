// The bound atlas's numbering (#465 ruling 7): every plate and every page of the back matter has its own row in the contents, and the folio's plate line reads the row's numeral; the thematic surveys are numbered one by one, so the rows after them hang on the atlas's own theme list.
import { THEMATIC } from "../../atlas/thematic.ts";
import type { PlateSection } from "../../atlas/document.ts";

export const NUMERALS = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii"] as const;

const FIRST_THEME = 2;
export const SECTION_ROW: Record<PlateSection, number> = {
  hero: 0,
  draughting: 1,
  theme: FIRST_THEME,
  region: FIRST_THEME + THEMATIC.length,
  prospect: FIRST_THEME + THEMATIC.length + 1,
};
export const MATTER_ROW = {
  banners: SECTION_ROW.prospect + 1,
  chronicle: SECTION_ROW.prospect + 2,
  gazetteer: SECTION_ROW.prospect + 3,
} as const;

/** A plate's row: its section's first row, plus its place within the section for the themes (the other sections hold one row each). */
export const plateRow = (section: PlateSection, ordinal = 0): number => SECTION_ROW[section] + (section === "theme" ? ordinal : 0);
export const numeralOf = (row: number): string => NUMERALS[row] ?? String(row + 1);
