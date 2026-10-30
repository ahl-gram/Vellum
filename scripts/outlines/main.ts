import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { OUTLINE_RINGS } from "../../src/terrain/outlines.ts";
import { buildRoster, type Kind, type KitPlace } from "./build.ts";
import { candidates, extractText, SOURCES, type Feature } from "./extract.ts";
import { refuseRepeats } from "./ids.ts";
import {
  appended,
  KIT,
  KIT_README,
  kitPath,
  kitText,
  PLACE_IDS,
  PLACE_NAMES,
  PLACE_TABLE,
  readKitFiles,
  readmeText,
} from "./kit.ts";

function extract(dir: string, date: string, source: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new RangeError(`the extract date must read yyyy-mm-dd, got ${date}`);
  if (!/^https:\/\/\S+[^/]$/.test(source))
    throw new RangeError(`the source must be the https address the files came from, got ${source}`);
  const kits = readKitFiles();
  const bytes = new Map(SOURCES.map((s) => [s.kind, readFileSync(join(dir, s.file))]));
  const features = Object.fromEntries(
    SOURCES.map((s) => [s.kind, (JSON.parse(bytes.get(s.kind)!.toString("utf8")) as { features: Feature[] }).features]),
  ) as Record<Kind, Feature[]>;
  const known = new Set<string>(kits.flatMap(([kind, kit]) => kit.places.map((p) => `${kind}:${p.id}`)));
  const fresh = candidates(features).filter((c) => !known.has(`${c.kind}:${c.id}`));
  if (fresh.length === 0) {
    console.log("every place in these files is already in the kit; nothing written");
    return;
  }
  refuseRepeats(
    fresh.map((c) => c.id),
    new Set<string>([...Object.keys(OUTLINE_RINGS), ...kits.flatMap(([, kit]) => kit.places.map((p) => p.id))]),
  );
  mkdirSync(KIT, { recursive: true });
  for (const [kind, kit] of kits) {
    const added: KitPlace[] = fresh
      .filter((c) => c.kind === kind)
      .map((c) => ({ id: c.id, name: c.name, country: c.country, parts: extractText(c.feature) }));
    if (added.length === 0) continue;
    const raw = bytes.get(kind)!;
    const run = {
      source,
      sha256: createHash("sha256").update(raw).digest("hex"),
      bytes: raw.length,
      extracted: date,
    };
    writeFileSync(kitPath(kind), kitText(appended(kit, run, added)));
  }
  console.log(`added ${fresh.length} places`);
}

function build(): void {
  const kits = readKitFiles();
  const roster = buildRoster(kits.map(([kind, kit]) => [kind, kit.places] as const));
  writeFileSync(PLACE_TABLE, roster.table);
  writeFileSync(PLACE_IDS, roster.idsModule);
  writeFileSync(PLACE_NAMES, roster.names);
  writeFileSync(KIT_README, readmeText(kits));
}

const [verb, dir, date, source] = process.argv.slice(2);
if (verb === "extract" && dir !== undefined && date !== undefined && source !== undefined) extract(dir, date, source);
else if (verb === "build") build();
else
  throw new RangeError(
    "usage: npm run outlines -- extract <folder of Natural Earth files> <yyyy-mm-dd> <the https address they came from> | build",
  );
