import type { Facts, InstrumentKit } from "./kit.ts";

export async function rs0Boots({ check, room }: InstrumentKit): Promise<void> {
  const booted = await room.goto("#seed=42&style=antique&legend=1");
  check("RS0 the room boots and settles on the deep-linked world", booted);
}
export async function rs3Parks({ evaluate, check }: InstrumentKit, sm: Facts): Promise<void> {
  const rs3 = await evaluate<{
    panelShown: boolean;
    setDisp: string;
    roadsDisp: string;
    min: number;
    max: number;
    val: number;
    year: number | null;
    chamber: string;
  }>(`(()=>{
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
    rs3.panelShown &&
      rs3.setDisp !== "none" &&
      rs3.roadsDisp !== "none" &&
      rs3.min === 0 &&
      rs3.max === 2 * Math.max(1, sm.present - sm.minFounded) &&
      rs3.val === rs3.max &&
      rs3.chamber === "ages" &&
      rs3.year === sm.present,
    JSON.stringify(rs3),
  );
}

export async function rs4AllShown({ check, visibleGroups }: InstrumentKit, sm: Facts): Promise<void> {
  const rs4visible = await visibleGroups();
  check(
    "RS4 parked at the present year: every settlement glyph is shown",
    rs4visible === sm.count,
    `${rs4visible} visible groups vs ${sm.count} places`,
  );
}

export async function rs5Scrub(
  { check, setYear, groupVis, roadsDisp, visibleGroups }: InstrumentKit,
  sm: Facts,
): Promise<void> {
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
    await setYear(Math.floor((sm.ruinFounded! + sm.ruinYear!) / 2));
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
