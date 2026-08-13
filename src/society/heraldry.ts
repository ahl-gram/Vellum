import type { Rng } from "../core/rng.ts";
import type { Culture } from "./names.ts";

/** Pure data (the SVG lives in render/layers/heraldry.ts). Arms run on rng.fork("heraldry") and each realm forks its own sub-stream, so a realm's arms never depend on how many realms there are. */

export type Tincture =
  | "or" // gold (metal)
  | "argent" // silver / white (metal)
  | "gules" // red
  | "azure" // blue
  | "sable" // black
  | "vert" // green
  | "purpure"; // purple

export type Division =
  | "plain"
  | "perPale"
  | "perFess"
  | "perBend"
  | "perChevron"
  | "quarterly";

export type Ordinary = "cross" | "pale" | "fess" | "bend" | "chevron";

export type MobileCharge =
  | "ship" | "anchor" | "trident"
  | "axe" | "raven" | "mountain"
  | "sun" | "crescent" | "scimitar"
  | "oak" | "leaf" | "star"
  | "wave" | "fish" | "turtle"
  | "tower" | "sword" | "flame";

export type ChargeSpec =
  | { readonly kind: "ordinary"; readonly ordinary: Ordinary; readonly tincture: Tincture }
  | { readonly kind: "mobile"; readonly charge: MobileCharge; readonly tincture: Tincture };

export type Arms = {
  readonly division: Division;
  readonly field: ReadonlyArray<Tincture>;
  readonly charge: ChargeSpec | null;
};

const METALS: readonly Tincture[] = ["or", "argent"];
const COLOURS: readonly Tincture[] = ["gules", "azure", "sable", "vert", "purpure"];
const ORDINARIES: readonly Ordinary[] = ["cross", "pale", "fess", "bend", "chevron"];
const DIVIDED: readonly Division[] = ["perPale", "perFess", "perBend", "perChevron", "quarterly"];

export const CULTURE_CHARGES: Record<string, readonly MobileCharge[]> = {
  thalassic: ["ship", "anchor", "trident"],
  norden: ["axe", "raven", "mountain"],
  veshari: ["sun", "crescent", "scimitar"],
  sylvan: ["oak", "leaf", "star"],
  tsuren: ["sun", "wave", "mountain"],
  oromi: ["wave", "fish", "turtle"],
  draket: ["tower", "sword", "flame"],
  zoryan: ["tower", "raven", "star"],
  tezcal: ["sun", "flame", "sword"],
  ordai: ["axe", "sword", "sun"],
};

const FALLBACK_CHARGES: readonly MobileCharge[] = ["star", "sun", "crescent"];

export function isMetal(t: Tincture): boolean {
  return t === "or" || t === "argent";
}

export function obeysTinctureRule(arms: Arms): boolean {
  if (arms.division === "plain") {
    if (arms.field.length !== 1) return false;
    const field = arms.field[0]!;
    if (arms.charge === null) return true;
    return isMetal(field) !== isMetal(arms.charge.tincture);
  }
  if (arms.field.length !== 2) return false;
  const a = arms.field[0]!;
  const b = arms.field[1]!;
  if (isMetal(a) === isMetal(b)) return false;
  return arms.charge === null;
}

function chargesFor(culture: Culture): readonly MobileCharge[] {
  return CULTURE_CHARGES[culture.id] ?? FALLBACK_CHARGES;
}

function blazonOne(culture: Culture, rng: Rng): Arms {
  if (rng.next() < 0.7) {
    const metalField = rng.next() < 0.5;
    const field = rng.pick(metalField ? METALS : COLOURS);
    const chargeTincture = rng.pick(metalField ? COLOURS : METALS);
    const charge: ChargeSpec =
      rng.next() < 0.6
        ? { kind: "mobile", charge: rng.pick(chargesFor(culture)), tincture: chargeTincture }
        : { kind: "ordinary", ordinary: rng.pick(ORDINARIES), tincture: chargeTincture };
    return { division: "plain", field: [field], charge };
  }
  const metal = rng.pick(METALS);
  const colour = rng.pick(COLOURS);
  const field: Tincture[] = rng.next() < 0.5 ? [metal, colour] : [colour, metal];
  return { division: rng.pick(DIVIDED), field, charge: null };
}

export function blazonRealms(culture: Culture, count: number, rng: Rng): Arms[] {
  const out: Arms[] = [];
  for (let i = 0; i < count; i++) {
    out.push(blazonOne(culture, rng.fork(String(i))));
  }
  return out;
}
