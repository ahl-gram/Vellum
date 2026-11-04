import type { Rng } from "../core/rng.ts";
import { CELLS_PER_LEAGUE } from "../render/layers/scalebar.ts";
import type { RibbonEvent } from "./events.ts";
import type { RibbonInput } from "./input.ts";

const the = (r: string): string => (r.startsWith("The ") ? r : `the ${r}`);

const NAMED_CROSSINGS = [
  (r: string): string => `a bridge of stone over ${the(r)}`,
  (r: string): string => `a timber bridge over ${the(r)}`,
  (r: string): string => `here ${the(r)} is crossed by a bridge`,
];

const ENTERED_REALMS = [
  (n: string): string => `here you enter ${n}`,
  (n: string): string => `here begins ${n}`,
  (n: string): string => `the road passes into ${n}`,
];

const ENTERED_WOODS = [
  (n: string): string => `the road enters ${n}`,
  (n: string): string => `the way runs into ${n}`,
  (n: string): string => `into the shade of ${n}`,
];

const UNNAMED_CROSSINGS = ["a ford", "a brook, crossed by a ford", "a wooden foot-bridge"];

const SUMMITS = ["here the road climbs", "a hard pull to the height", "the height of the way"];

const TIER_TAGS: Record<string, string> = {
  capital: "the capital",
  town: "a fair town",
  village: "a village",
  hamlet: "a hamlet",
};

export function tierTag(tier: string): string {
  return TIER_TAGS[tier] ?? "a place";
}

export function eventCaption(e: RibbonEvent, rng: Rng): string {
  switch (e.kind) {
    case "waypoint":
      return e.name;
    case "crossing":
      return e.name === null
        ? rng.fork(`ford-${e.k}`).pick(UNNAMED_CROSSINGS)
        : rng.fork(`bridge-${e.k}`).pick(NAMED_CROSSINGS)(e.name);
    case "branch":
      return `to ${e.toName}`;
    case "summit":
      return rng.fork(`summit-${e.k}`).pick(SUMMITS);
    case "border":
      return rng.fork(`border-${e.k}`).pick(ENTERED_REALMS)(e.name);
    case "forest":
      return rng.fork(`forest-${e.k}`).pick(ENTERED_WOODS)(e.name);
  }
}

const roundedLeagues = (input: RibbonInput): number => Math.round(input.totalLeagues);

export function stagesLine(input: RibbonInput): string {
  const stops = input.events.flatMap((e) =>
    e.kind === "waypoint" && e.dist > 0 && e.index !== input.toIdx
      ? [`to ${e.name} ${Math.round(e.dist / CELLS_PER_LEAGUE)}`]
      : [],
  );
  stops.push(`to ${input.toName} ${roundedLeagues(input)}`);
  return `From ${input.fromName} ${stops.join(", ")} leagues`;
}

export function ribbonTitle(input: RibbonInput): { title: string; subtitle: string[] } {
  const leagues = roundedLeagues(input);
  const realm = input.realmName === null ? input.worldName : input.realmName;
  return {
    title: `The ROAD from ${input.fromName.toUpperCase()} to ${input.toName.toUpperCase()}`,
    subtitle: [
      `in ${realm} · containing ${leagues} leagues`,
      `as it was measured by the wayfarers' chain in the year ${input.year}`,
    ],
  };
}
