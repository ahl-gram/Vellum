import type { ProspectInput } from "./input.ts";
import type { ProspectGeometry } from "./geometry.ts";
import { treatmentFor, type Treatment } from "./foreground.ts";

export type PlateEra = "before-founding" | "standing" | "ruined";

export type PlateCaption = {
  readonly title: string;
  readonly yearLine: string | null;
  readonly epithet: string;
  readonly footer: string;
};

export function eraFor(input: ProspectInput, year: number): PlateEra {
  if (year < input.founded) return "before-founding";
  if (!input.ruined) return "standing";
  if (input.ruinedYear === null) return year > input.founded ? "ruined" : "standing";
  return year >= input.ruinedYear ? "ruined" : "standing";
}

const HABITAT: Record<Treatment, string> = {
  fields: "of the open fields",
  forest: "under the greenwood",
  pines: "under the pinewood",
  palms: "under the palms",
  strand: "of the strand",
  marsh: "of the fens",
  scrub: "of the bare hills",
};

const lowerThe = (name: string): string => name.replace(/^The /, "the ");

function standingEpithet(
  input: ProspectInput,
  g: ProspectGeometry,
  seaName: string | null,
): string {
  const habitat = HABITAT[treatmentFor(input.foreground)];
  const kinds = new Set(g.foreground.map((e) => e.kind));
  const sea = seaName === null ? "the sea" : lowerThe(seaName);
  switch (input.kind) {
    case "capital":
      if (input.realmName === null) return `a chief city upon ${sea}`;
      return input.harbor
        ? `chief port of ${lowerThe(input.realmName)}`
        : `chief city of ${lowerThe(input.realmName)}`;
    case "seat":
      return input.realmName === null
        ? `a high seat ${habitat}`
        : `seat of ${lowerThe(input.realmName)}`;
    case "town":
      if (kinds.has("bridge")) return "a bridge town upon the river";
      if (input.harbor) return `a harbour town upon ${sea}`;
      return `a market town ${habitat}`;
    case "village":
      if (kinds.has("weir") || kinds.has("mill")) return "a village at the weir";
      if (input.harbor) return "a fisher village of the strand";
      if (input.onRiver) return `a river village ${habitat}`;
      return `a village ${habitat}`;
    case "hamlet":
      return `a hamlet ${habitat}`;
  }
}

function ruinEpithet(input: ProspectInput): string {
  if (input.ruinedYear === null) return "ruined in a year unrecorded";
  const when = `An. ${input.ruinedYear}`;
  if (treatmentFor(input.foreground) === "marsh" && !input.harbor) {
    return `lost to the waters ${when}`;
  }
  if (input.kind === "capital" || input.kind === "seat") return `thrown down ${when}`;
  return `ruined ${when}`;
}

export function plateCaption(
  input: ProspectInput,
  g: ProspectGeometry,
  era: PlateEra,
  year: number,
  seaName: string | null,
): PlateCaption {
  const title = `THE PROSPECT OF ${input.name.toUpperCase()}`;
  const footer = `VELLUM · CHART № ${input.seed}`;
  if (era === "before-founding") {
    return {
      title,
      yearLine: null,
      epithet: `the ground where ${input.name} will rise · An. ${year}`,
      footer,
    };
  }
  return {
    title,
    yearLine: `FOUNDED AN. ${input.founded}`,
    epithet: era === "ruined" ? ruinEpithet(input) : standingEpithet(input, g, seaName),
    footer,
  };
}
