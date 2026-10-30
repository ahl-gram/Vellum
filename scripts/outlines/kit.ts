import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Kind, KitPlace } from "./build.ts";
import { SOURCES } from "./extract.ts";

export const KIT = fileURLToPath(new URL("../../design/kit/outlines", import.meta.url));
export const PLACE_TABLE = fileURLToPath(new URL("../../src/terrain/outline-places.json", import.meta.url));
export const PLACE_IDS = fileURLToPath(new URL("../../src/world/outline-place-ids.ts", import.meta.url));
export const PLACE_NAMES = fileURLToPath(new URL("../../src/world/outline-place-names.json", import.meta.url));
export const MIRROR = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson";
export const PAGE = "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/";
export const LAKES_PAGE = "https://www.naturalearthdata.com/downloads/10m-physical-vectors/";
export const TERMS = "https://www.naturalearthdata.com/about/terms-of-use/";
export const TERMS_READ = "2026-10-19";
export const LICENCE =
  "All versions of Natural Earth raster + vector map data found on this website are in the public domain.";

export const kitPath = (kind: Kind): string => join(KIT, `${kind}.json`);

export function readKit(): Array<readonly [Kind, KitPlace[]]> {
  return SOURCES.map((s) => {
    const path = kitPath(s.kind);
    const places = existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as { places: KitPlace[] }).places : [];
    return [s.kind, places] as const;
  });
}

export function kitText(file: string, places: readonly KitPlace[]): string {
  return `{\n  "file": ${JSON.stringify(file)},\n  "places": [\n${places.map((p) => `    ${JSON.stringify(p)}`).join(",\n")}\n  ]\n}\n`;
}

export type SourceRecord = {
  readonly kind: Kind;
  readonly file: string;
  readonly bytes: number;
  readonly sha256: string;
  readonly places: number;
};

export function readmeText(records: readonly SourceRecord[], date: string): string {
  const rows = records.map(
    (r) =>
      `| \`${r.kind}.json\` | \`${r.file}\` | 1:10m | ${r.kind === "lake" ? LAKES_PAGE : PAGE} | ${r.bytes} | \`${r.sha256}\` | ${date} | ${r.places} |`,
  );
  return [
    "# The outline roster's extracts",
    "",
    "The real places a world can take the shape of, as `npm run outlines` reads them. Each file here holds one Natural Earth file's places, already projected and thinned, one place to a line: its ID (`ne-` and Natural Earth's own serial number for the feature: world identity, never renamed), its English name, its country where it has one, and its parts as integer points. `npm run outlines -- build` turns them into `src/terrain/outline-places.json`, `src/world/outline-place-ids.ts` and `src/world/outline-place-names.json`, and `test/terrain/outline-places.test.ts` rebuilds those from these files and refuses any drift.",
    "",
    `Licence: Natural Earth's terms (${TERMS}, read ${TERMS_READ} for the design round of Issue #849) say "${LICENCE}", "No permission is needed to use Natural Earth." and "Crediting the authors is unnecessary."`,
    "",
    "| extract | full file | scale | download page | bytes | sha256 | extracted | places |",
    "|---|---|---|---|---|---|---|---|",
    ...rows,
    "",
    `Each full file was downloaded from \`${MIRROR}/<file>\` (the public mirror, tag v5.1.2) and is not committed. The download step is unguarded: a file that differs from the one recorded here is noticed only when someone extracts again and compares the size and checksum this table records. To add places: download the four files into one folder, then \`npm run outlines -- extract <folder> <yyyy-mm-dd>\`, which appends only the places not already here, never rewrites one that is, and rewrites this table with the files it read, and then \`npm run outlines -- build\`.`,
    "",
  ].join("\n");
}
