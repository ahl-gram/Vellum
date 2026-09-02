import type { ProspectPlateResult } from "../explorer/prospect-job.ts";

type Facts = Omit<ProspectPlateResult, "svg">;

const ERA_WORD = { "before-founding": "Before the founding", standing: "Standing", ruined: "Ruined" } as const;

export function eraLine(r: Pick<Facts, "era" | "year">): string {
  return `${ERA_WORD[r.era]} · An. ${r.year}`;
}

export function whereLine(r: Pick<Facts, "era" | "epithet" | "founded">): string {
  return r.era === "before-founding" ? r.epithet : `${r.epithet} · founded An. ${r.founded}`;
}

export function subLine(r: Pick<Facts, "title" | "formerName">): string {
  return r.formerName ? `${r.title} · once called ${r.formerName}` : `${r.title} · drawn side-on from the town's own ground`;
}
