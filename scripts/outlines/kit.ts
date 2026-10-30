import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Kind, KitPlace } from "./build.ts";
import { SOURCES } from "./extract.ts";

export const KIT = fileURLToPath(new URL("../../design/kit/outlines", import.meta.url));
export const KIT_README = join(KIT, "README.md");
export const PLACE_TABLE = fileURLToPath(new URL("../../src/terrain/outline-places.json", import.meta.url));
export const PLACE_IDS = fileURLToPath(new URL("../../src/world/outline-place-ids.ts", import.meta.url));
export const PLACE_NAMES = fileURLToPath(new URL("../../src/world/outline-place-names.json", import.meta.url));
export const PAGE = "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/";
export const LAKES_PAGE = "https://www.naturalearthdata.com/downloads/10m-physical-vectors/";
export const TERMS = "https://www.naturalearthdata.com/about/terms-of-use/";
export const TERMS_READ = "2026-10-19";
export const LICENCE =
  "All versions of Natural Earth raster + vector map data found on this website are in the public domain.";

export type Run = {
  readonly source: string;
  readonly sha256: string;
  readonly bytes: number;
  readonly extracted: string;
  readonly added: number;
};
export type KitFile = { readonly file: string; readonly runs: readonly Run[]; readonly places: readonly KitPlace[] };

export const kitPath = (kind: Kind): string => join(KIT, `${kind}.json`);

export function readKitFiles(): Array<readonly [Kind, KitFile]> {
  return SOURCES.map((s) => {
    const path = kitPath(s.kind);
    const empty: KitFile = { file: s.file, runs: [], places: [] };
    return [s.kind, existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as KitFile) : empty] as const;
  });
}

export function readKit(): Array<readonly [Kind, readonly KitPlace[]]> {
  return readKitFiles().map(([kind, kit]) => [kind, kit.places] as const);
}

export function appended(kit: KitFile, run: Omit<Run, "added">, fresh: readonly KitPlace[]): KitFile {
  if (fresh.length === 0) return kit;
  return { file: kit.file, runs: [{ ...run, added: fresh.length }], places: [...kit.places, ...fresh] };
}

export function kitText(kit: KitFile): string {
  const lines = (items: readonly object[]): string => items.map((item) => `    ${JSON.stringify(item)}`).join(",\n");
  return `{\n  "file": ${JSON.stringify(kit.file)},\n  "runs": [\n${lines(kit.runs)}\n  ],\n  "places": [\n${lines(kit.places)}\n  ]\n}\n`;
}

export function readmeText(kits: ReadonlyArray<readonly [Kind, KitFile]>): string {
  const rows = kits.flatMap(([kind, kit]) =>
    kit.runs.map(
      (r) =>
        `| \`${kind}.json\` | ${r.source}/${kit.file} | 1:10m | ${kind === "lake" ? LAKES_PAGE : PAGE} | ${r.bytes} | \`${r.sha256}\` | ${r.extracted} | ${r.added} |`,
    ),
  );
  return [
    "# The outline roster's extracts",
    "",
    "The real places a world can take the shape of, as `npm run outlines` reads them. Each file here holds one Natural Earth file's places, one place to a line: its ID (`ne-` and Natural Earth's own serial number for the feature: world identity, never renamed), its English name, its country where it has one, and its parts as integer points. Each part's outer ring is projected with a Lambert azimuthal equal-area projection centred on the place's largest part, north up, so no place is stretched by its latitude and a place Natural Earth splits at the antimeridian stays whole, and then thinned. `npm run outlines -- build` turns them into `src/terrain/outline-places.json`, `src/world/outline-place-ids.ts` and `src/world/outline-place-names.json`, and writes this page from the record each file keeps of the runs that filled it; `test/terrain/outline-places.test.ts` rebuilds all four from these files and refuses any drift.",
    "",
    `Licence: Natural Earth's terms (${TERMS}, read ${TERMS_READ} for the design round of Issue #849) say "${LICENCE}", "No permission is needed to use Natural Earth." and "Crediting the authors is unnecessary."`,
    "",
    "| extract | full file | scale | download page | bytes | sha256 | extracted | places added |",
    "|---|---|---|---|---|---|---|---|",
    ...rows,
    "",
    "Each row is one run of `npm run outlines -- extract`: the full file it read, that file's size and checksum, the day, and how many places it appended. A file's places stand in the order their runs added them, so the first row's count are the first places in it and the next row's follow. The full files are not committed. The download step is unguarded: a file that differs from the one a row records is noticed only when someone extracts again and compares the size and checksum. To add places: download the four files into one folder, then `npm run outlines -- extract <folder> <yyyy-mm-dd> <the https address they came from>`, which appends only the places not already here, never rewrites one that is, and records its run in each file it appended to, and then `npm run outlines -- build`.",
    "",
  ].join("\n");
}
