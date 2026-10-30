import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GENERATED } from "./clean-generated.ts";
import { NAMES_FILE, PLACE_FOLDER, placeFile } from "../src/site/explorer/place-fetch.ts";
import type { PlaceId } from "../src/world/outline-ids.ts";

export const PLACE_TABLE = fileURLToPath(new URL("../src/terrain/outline-places.json", import.meta.url));

export const PLACE_NAMES = fileURLToPath(new URL("../src/world/outline-place-names.json", import.meta.url));

export async function writePlaceFiles(root: string, table: string = PLACE_TABLE): Promise<number> {
  const places = JSON.parse(await readFile(table, "utf8")) as Record<string, string>;
  const ids = Object.keys(places);
  await mkdir(join(root, PLACE_FOLDER), { recursive: true });
  for (const id of ids) await writeFile(join(root, placeFile(id as PlaceId)), places[id] as string);
  return ids.length;
}

/** Copies the name index, byte for byte, to <root>/outlines/names.json. */
export async function writePlaceNames(root: string, names: string = PLACE_NAMES): Promise<void> {
  await mkdir(join(root, PLACE_FOLDER), { recursive: true });
  await writeFile(join(root, NAMES_FILE), await readFile(names));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(process.argv[2] ?? GENERATED);
  writePlaceFiles(root)
    .then(() => writePlaceNames(root))
    .catch((err: unknown) => {
      console.error(err instanceof Error ? err.message : err);
      process.exitCode = 1;
    });
}
