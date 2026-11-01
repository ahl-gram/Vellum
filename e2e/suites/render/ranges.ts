// The Explorer's range inputs carry exactly the limits the address and their scripts clamp with, and reach both (Issue #1035).
import { ISLANDS_SEEDS_CHOICE } from "../../../src/site/explorer/land-rows.ts";
import { COAST_MAX, COAST_MIN, LAND_MAX, LAND_MIN } from "../../../src/site/shared/address-grammar.ts";
import { MAX_ISLANDS } from "../../../src/terrain/lobes.ts";
import type { Payload, SuiteContext } from "../../types.ts";

const RANGES = [
  {
    id: "land",
    code: "R19a",
    says: "the sea-level slider's limits are LAND_MIN and LAND_MAX in thousandths",
    min: Math.round(LAND_MIN * 1000),
    max: Math.round(LAND_MAX * 1000),
  },
  {
    id: "coast",
    code: "R19b",
    says: "the coast slider's limits are COAST_MIN and COAST_MAX in hundredths",
    min: Math.round(COAST_MIN * 100),
    max: Math.round(COAST_MAX * 100),
  },
  {
    id: "islands",
    code: "R19c",
    says: "the islands slider's limits are the seed's choice and MAX_ISLANDS",
    min: ISLANDS_SEEDS_CHOICE,
    max: MAX_ISLANDS,
  },
] as const;

type Reach = { min: string | null; max: string | null; lo: string; hi: string } | null;
const REACH: Payload<Record<string, Reach>> = `(() => { const out = {};
  for (const id of ${JSON.stringify(RANGES.map((r) => r.id))}) { const el = document.getElementById(id);
    if (el === null) { out[id] = null; continue; }
    const c = el.cloneNode(false); c.value = "1e9"; const hi = c.value; c.value = "-1e9";
    out[id] = { min: el.getAttribute("min"), max: el.getAttribute("max"), lo: c.value, hi }; }
  return out; })()`;

export async function r19RangeLimits({ evaluate, check }: SuiteContext): Promise<void> {
  const got = await evaluate(REACH);
  for (const { id, code, says, min, max } of RANGES) {
    const r = got[id];
    check(
      `${code} ${says}, and the slider reaches both`,
      !!r && r.min === String(min) && r.lo === String(min) && r.max === String(max) && r.hi === String(max),
      JSON.stringify({ want: { min, max }, got: r }),
    );
  }
}
