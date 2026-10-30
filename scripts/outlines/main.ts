import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { OUTLINE_RINGS } from "../../src/terrain/outlines.ts";
import { buildRoster, type Kind, type KitPlace } from "./build.ts";
import { candidates, extractText, SOURCES, type Feature } from "./extract.ts";
import { refuseRepeats } from "./ids.ts";
import {
  KIT,
  kitPath,
  kitText,
  PLACE_IDS,
  PLACE_NAMES,
  PLACE_TABLE,
  readKit,
  readmeText,
  type SourceRecord,
} from "./kit.ts";

function extract(dir: string, date: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new RangeError(`the extract date must read yyyy-mm-dd, got ${date}`);
  const kit = new Map(readKit());
  const bytes = new Map(SOURCES.map((s) => [s.kind, readFileSync(join(dir, s.file))]));
  const features = Object.fromEntries(
    SOURCES.map((s) => [s.kind, (JSON.parse(bytes.get(s.kind)!.toString("utf8")) as { features: Feature[] }).features]),
  ) as Record<Kind, Feature[]>;
  const known = new Set<string>(SOURCES.flatMap((s) => kit.get(s.kind)!.map((p) => `${s.kind}:${p.id}`)));
  const fresh = candidates(features).filter((c) => !known.has(`${c.kind}:${c.id}`));
  if (fresh.length === 0) {
    console.log("every place in these files is already in the kit; nothing written");
    return;
  }
  refuseRepeats(
    fresh.map((c) => c.id),
    new Set<string>([...Object.keys(OUTLINE_RINGS), ...SOURCES.flatMap((s) => kit.get(s.kind)!.map((p) => p.id))]),
  );
  for (const c of fresh)
    kit.get(c.kind)!.push({ id: c.id, name: c.name, country: c.country, parts: extractText(c.feature) });
  mkdirSync(KIT, { recursive: true });
  const records: SourceRecord[] = SOURCES.map((s) => {
    const places: KitPlace[] = kit.get(s.kind)!;
    writeFileSync(kitPath(s.kind), kitText(s.file, places));
    const raw = bytes.get(s.kind)!;
    return {
      kind: s.kind,
      file: s.file,
      bytes: raw.length,
      sha256: createHash("sha256").update(raw).digest("hex"),
      places: places.length,
    };
  });
  writeFileSync(join(KIT, "README.md"), readmeText(records, date));
  console.log(`added ${fresh.length} places`);
}

function build(): void {
  const roster = buildRoster(readKit());
  writeFileSync(PLACE_TABLE, roster.table);
  writeFileSync(PLACE_IDS, roster.idsModule);
  writeFileSync(PLACE_NAMES, roster.names);
}

const [verb, dir, date] = process.argv.slice(2);
if (verb === "extract" && dir !== undefined && date !== undefined) extract(dir, date);
else if (verb === "build") build();
else throw new RangeError("usage: npm run outlines -- extract <folder of Natural Earth files> <yyyy-mm-dd> | build");
