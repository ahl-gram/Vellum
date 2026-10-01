import { HOST_HOOK_NAMES } from "../../../src/site/shared/host-hooks.ts";
import type { Facts, InstrumentKit } from "./kit.ts";

export async function rs0Boots({ check, room }: InstrumentKit): Promise<void> {
  const booted = await room.goto("#seed=42&style=antique&legend=1");
  check("RS0 the room boots and settles on the deep-linked world", booted);
}

export async function rs1State({ evaluate, check }: InstrumentKit): Promise<void> {
  // At a present park t is null BY DESIGN (agesState's chamber contract); a check demanding a number there would pin a bug.
  const state = await evaluate<{ chamber: string; t: number | null; year: number | null; u: number; seamU: number; held: boolean; playing: boolean; pace: number; min: number; max: number } | null>(`window.__vellumReadingRoomAges()`);
  check(
    "RS1 the room publishes the whole instrument state (u, held, min, max, playing, seamU), not just chamber+year",
    !!state &&
      state.chamber === "ages" &&
      typeof state.year === "number" &&
      state.t === null &&
      typeof state.u === "number" &&
      typeof state.seamU === "number" &&
      typeof state.held === "boolean" &&
      typeof state.min === "number" &&
      typeof state.max === "number" &&
      typeof state.playing === "boolean",
    JSON.stringify(state),
  );
}

export async function rs2Seams({ evaluate, check }: InstrumentKit): Promise<void> {
  // The expected names come from the INSTALLER (HOST_HOOK_NAMES): a hand-copied list catches a seam removed but can never catch one added to installHostHooks (the guard-prover proved that one-sidedness on the first cut).
  const surface = await evaluate<Record<string, string>>(`(()=>{
    const names=${JSON.stringify(HOST_HOOK_NAMES)};
    return Object.fromEntries(names.map((n)=>[n,typeof window[n]]));
  })()`);
  check(
    `RS2 the room publishes every seam installHostHooks installs (${HOST_HOOK_NAMES.length} of them, derived from the installer)`,
    !!surface && // eslint-disable-line @typescript-eslint/no-unnecessary-condition
      Object.keys(surface).length === HOST_HOOK_NAMES.length &&
      Object.values(surface).every((t) => t === "function"),
    JSON.stringify(surface),
  );
}

export async function rs3Parks({ evaluate, check }: InstrumentKit, sm: Facts): Promise<void> {
  const rs3 = await evaluate<{ panelShown: boolean; setDisp: string; roadsDisp: string; min: number; max: number; val: number; year: number | null; chamber: string }>(`(()=>{
    const panel=document.querySelector(".rf-ages");
    const set=document.querySelector(".rf-chart #layer-settlements");
    const roads=document.querySelector(".rf-chart #layer-roads");
    const bar=document.querySelector(".rf-range");
    const a=window.__vellumAgesState();
    return{panelShown:!panel.hidden,setDisp:set?getComputedStyle(set).display:"(no-el)",
      roadsDisp:roads?getComputedStyle(roads).display:"(no-el)",
      min:Number(bar.min),max:Number(bar.max),val:Number(bar.value),
      year:a?a.year:-1,chamber:a?a.chamber:""};
  })()`);
  check(
    "RS3 the room parks armed at the present: glyph layer + roads visible, the bar at the far right",
    rs3.panelShown && rs3.setDisp !== "none" && rs3.roadsDisp !== "none" &&
      rs3.min === 0 && rs3.max === 2 * Math.max(1, sm.present - sm.minFounded) &&
      rs3.val === rs3.max && rs3.chamber === "ages" && rs3.year === sm.present,
    JSON.stringify(rs3),
  );
}

export async function rs4AllShown({ check, visibleGroups }: InstrumentKit, sm: Facts): Promise<void> {
  const rs4visible = await visibleGroups();
  check("RS4 parked at the present year: every settlement glyph is shown", rs4visible === sm.count, `${rs4visible} visible groups vs ${sm.count} places`);
}

export async function rs5Scrub({ check, setYear, groupVis, roadsDisp, visibleGroups }: InstrumentKit, sm: Facts): Promise<void> {
  await setYear(sm.earlyFounded);
  const rs5early = await groupVis(sm.earlyIdx);
  const rs5late = sm.lateIdx >= 0 ? await groupVis(sm.lateIdx) : "hidden";
  const rs5roads = await roadsDisp();
  check(
    "RS5 scrub to the earliest founding: that glyph shows, a later town's is hidden, roads hidden in the past",
    rs5early === "shown" && rs5late === "hidden" && rs5roads === "none",
    `early=${rs5early} late=${rs5late} roads=${rs5roads}`,
  );
  const rs6grown = await visibleGroups();
  check(
    "RS6 the world reveals over time: fewer glyphs up early than at the present",
    rs6grown > 0 && rs6grown < sm.count,
    `${rs6grown} visible at year ${sm.earlyFounded} vs ${sm.count} at present`,
  );
}

export async function rs7Ruin({ check, setYear, groupVis }: InstrumentKit, sm: Facts): Promise<void> {
  if (sm.ruinIdx >= 0) {
    await setYear(Math.floor((sm.ruinFounded! +
      sm.ruinYear!) / 2));
    const before = await groupVis(sm.ruinIdx);
    await setYear(sm.ruinYear!);
    const after = await groupVis(sm.ruinIdx);
    check(
      "RS7 a ruin is hidden through its living phase (state-begins), its ruin glyph appears at the fall year",
      before === "hidden" && after === "shown",
      `before=${before} after=${after} ruinYear=${sm.ruinYear}`,
    );
  } else {
    check("RS7 seed 42 has a ruin to scrub through", false, "no ruin in manifest");
  }
}
