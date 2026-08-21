import type { Rng } from "../core/rng.ts";
import type { RibbonEvent } from "./events.ts";
import type { RibbonInput } from "./input.ts";

const NAMED_CROSSINGS = [
  (r: string): string => `a bridge of stone over the ${r}`,
  (r: string): string => `a timber bridge over the ${r}`,
  (r: string): string => `here the ${r} is crossed by a bridge`,
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
        ? rng.fork(`ford-${Math.round(e.dist)}`).pick(UNNAMED_CROSSINGS)
        : rng.fork(`bridge-${Math.round(e.dist)}`).pick(NAMED_CROSSINGS)(e.name);
    case "branch":
      return `to ${e.toName}`;
    case "summit":
      return rng.fork(`summit-${Math.round(e.dist)}`).pick(SUMMITS);
  }
}

export function ribbonTitle(input: RibbonInput): { title: string; subtitle: string[] } {
  const leagues = Math.round(input.totalLeagues);
  const realm = input.realmName === null ? input.worldName : input.realmName;
  return {
    title: `The ROAD from ${input.fromName.toUpperCase()} to ${input.toName.toUpperCase()}`,
    subtitle: [
      `in ${realm} · containing ${leagues} leagues`,
      `as it was measured by the wayfarers' chain in the year ${input.year}`,
    ],
  };
}
