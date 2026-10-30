import { fileURLToPath } from "node:url";

export const PLACE_TABLE = fileURLToPath(new URL("../src/terrain/outline-places.json", import.meta.url));

export async function writePlaceFiles(root: string, table: string = PLACE_TABLE): Promise<number> {
  void root;
  void table;
  return 0;
}
