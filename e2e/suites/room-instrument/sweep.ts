import type { Facts, InstrumentKit } from "./kit.ts";

export async function rs8Sweeps({ evaluate, check, sleep, setYear, roadsDisp }: InstrumentKit, sm: Facts): Promise<void> {
  const rs8start = await setYear(sm.minFounded);
  const startLabel = await evaluate<string>(`(()=>{document.querySelector(".rf-play").click();return document.querySelector(".rf-play").textContent;})()`);
  let prev = -Infinity, mono = true, ended = false, lastYear = null, sawInterior = false;
  for (let i = 0; i < 130; i++) {
    const st = await evaluate<{ y: number | null; lbl: string }>(`({y:window.__vellumAgesState().year,lbl:document.querySelector(".rf-play").textContent})`);
    // @ts-expect-error the year reads null only in the survey chamber, which a Play from the earliest founding never enters, so a null never reaches here; one would read as 0
    if (st.y < prev) mono = false;
    // @ts-expect-error the year reads null only in the survey chamber, which a Play from the earliest founding never enters, so a null never reaches here; one would read as 0
    if (st.y >
      // @ts-expect-error setYear reads the year back as null only in the survey chamber, and it scrubs into the ages half, so a null never reaches here; one would read as 0
      rs8start &&
      // @ts-expect-error the year reads null only in the survey chamber, which a Play from the earliest founding never enters, so a null never reaches here; one would read as 0
      st.y < sm.present) sawInterior = true;
    // @ts-expect-error the year reads null only in the survey chamber, which a Play from the earliest founding never enters, so prev never takes a null here
    prev = st.y; lastYear = st.y;
    if (st.lbl === "Play") { ended = true; break; }
    await sleep(110);
  }
  check(
    "RS8 Play sweeps through interior years monotonically and auto-pauses at the present",
    startLabel === "Pause" && mono && sawInterior && ended && lastYear === sm.present,
    `start=${startLabel} mono=${mono} interior=${sawInterior} ended=${ended} last=${lastYear} present=${sm.present}`,
  );
  const rs9roads = await roadsDisp();
  check("RS9 roads return at the end-of-Play present park", rs9roads !== "none", `roads=${rs9roads}`);
}

export async function rs10Drag({ evaluate, check, sleep, setYear, yearNow, clickPlay }: InstrumentKit, sm: Facts): Promise<void> {
  await setYear(sm.minFounded);
  await clickPlay();
  await sleep(220);
  const rs10 = await evaluate<{ before: string; after: string; year: number | null; mid: number }>(`(()=>{
    const before=document.querySelector(".rf-play").textContent;
    const s=document.querySelector(".rf-range");const mid=${Math.floor((sm.minFounded + sm.present) / 2)};
    const a=window.__vellumAgesState();
    s.value=String(Number(s.max)/2+(mid-a.min));s.dispatchEvent(new Event("input",{bubbles:true}));
    return{before,after:document.querySelector(".rf-play").textContent,year:window.__vellumAgesState().year,mid};
  })()`);
  await sleep(150);
  const rs10after = await yearNow();
  check(
    "RS10 a manual drag during Play pauses it and the sweep stops advancing",
    rs10.before === "Pause" && rs10.after === "Play" && rs10.year === rs10.mid && rs10after === rs10.mid,
    JSON.stringify(rs10) + ` settled=${rs10after}`,
  );
}

export async function rs11Forward({ check, sleep, setYear, yearNow, clickPlay }: InstrumentKit, sm: Facts): Promise<void> {
  const rs11mid = Math.floor((sm.minFounded + sm.present) / 2);
  await setYear(rs11mid);
  await clickPlay();
  let rs11min = Infinity, rs11max = -Infinity;
  for (let i = 0; i < 6; i++) {
    const y = await yearNow();
    // @ts-expect-error the year reads null only in the survey chamber, which a Play from a year in the ages half never enters; a null would be kept as the extreme, and RS11 would read false and red by name
    if (y < rs11min)
      // @ts-expect-error the year reads null only in the survey chamber, which a Play from a year in the ages half never enters; a null would be kept as the extreme, and RS11 would read false and red by name
      rs11min = y;
    // @ts-expect-error the year reads null only in the survey chamber, which a Play from a year in the ages half never enters; a null would be kept as the extreme, and RS11 would read false and red by name
    if (y > rs11max)
      // @ts-expect-error the year reads null only in the survey chamber, which a Play from a year in the ages half never enters; a null would be kept as the extreme, and RS11 would read false and red by name
      rs11max = y;
    await sleep(70);
  }
  check(
    "RS11 drag-then-Play runs FORWARD from the dragged year (#220: play from any year)",
    rs11min >= rs11mid && rs11max > rs11mid,
    `observed min=${rs11min} max=${rs11max} dragged=${rs11mid}`,
  );
}

export async function rs12Pause({ evaluate, check, sleep, setYear, yearNow, clickPlay }: InstrumentKit, sm: Facts): Promise<void> {
  await setYear(sm.minFounded);
  await clickPlay();
  await sleep(700);
  const frozen = await evaluate<{ year: number | null; lbl: string }>(`(()=>{document.querySelector(".rf-play").click();return{year:window.__vellumAgesState().year,lbl:document.querySelector(".rf-play").textContent};})()`);
  await sleep(260);
  const stillFrozen = await yearNow();
  await clickPlay();
  await sleep(120);
  const resumedEarly = await yearNow();
  await sleep(700);
  const resumed = await yearNow();
  check(
    "RS12 the Pause button freezes mid-sweep; Play resumes from the frozen year (not min/present)",
    // @ts-expect-error a year read in the survey chamber is null, and a comparison reads null as 0, which fails this clause, so RS12 reads false and reds by name
    frozen.lbl === "Play" && frozen.year > sm.minFounded &&
      // @ts-expect-error the same null reads as 0 here, which passes this bound, but the clause before it has already read false for it
      frozen.year < sm.present &&
      // @ts-expect-error a year read in the survey chamber is null, and a comparison reads null as 0, which fails this clause, so RS12 reads false and reds by name
      stillFrozen === frozen.year && resumedEarly >=
        // @ts-expect-error the same frozen year, which the clause before has already read false for if it is null
        frozen.year &&
      // @ts-expect-error a year read in the survey chamber is null, and a comparison reads null as 0, which fails this clause, so RS12 reads false and reds by name
      resumed >
        // @ts-expect-error the same frozen year, which the clause before has already read false for if it is null
        frozen.year &&
        // @ts-expect-error the same null reads as 0 here, which passes this bound, but the clause before it has already read false for it
        resumed <= sm.present,
    `frozen=${frozen.year} early=${resumedEarly} resumed=${resumed} min=${sm.minFounded} present=${sm.present}`,
  );
}

export async function rs14Glyphs({ evaluate, check }: InstrumentKit): Promise<void> {
  const rs14 = await evaluate<{ hasGlyph: boolean; dataStateHits: number }>(`(()=>{
    const g=[...document.querySelectorAll('.rf-chart #layer-settlements g.settlement')].find((el)=>getComputedStyle(el).display!=="none");
    return{hasGlyph:!!(g&&g.querySelector("path, circle, text")),
      dataStateHits:document.querySelectorAll(".place-hit[data-state]").length};
  })()`);
  check("RS14 the sweep shows real glyphs, not dots (no data-state dots remain)", rs14.hasGlyph && rs14.dataStateHits === 0, JSON.stringify(rs14));
}

export async function rs15Slide({ evaluate, check }: InstrumentKit): Promise<void> {
  const rs15 = await evaluate<{ li: false } | { li: true; prop: string; pastTf: string }>(`(()=>{
    const li=document.querySelector(".rf-log-strip li");
    if(!li)return{li:false};
    const prop=getComputedStyle(li).transitionProperty;
    const had=li.classList.contains("inked");
    li.classList.add("inked");const pastTf=getComputedStyle(li).transform;
    if(!had)li.classList.remove("inked");
    return{li:true,prop,pastTf};
  })()`);
  check("RS15 journal inked-rows slide (transform in the transition + an indent)", rs15.li && rs15.prop.includes("transform") && rs15.pastTf !== "none", JSON.stringify(rs15));
}

export async function rs16Strip({ evaluate, check }: InstrumentKit): Promise<void> {
  const rs16 = await evaluate<{ rows: number; scrollH: number; clientH: number }>(`(()=>{const s=document.querySelector(".rf-log-strip");return{rows:s.querySelectorAll("li").length,scrollH:s.scrollHeight,clientH:s.clientHeight};})()`);
  check("RS16 the journal strip shows every entry without scrolling (#93 Part 2)", rs16.rows > 0 && rs16.scrollH <= rs16.clientH + 1, JSON.stringify(rs16));
}

export async function rs17Story({ evaluate, check, sleep, setYear, clickPlay }: InstrumentKit, sm: Facts): Promise<void> {
  await setYear(sm.present);
  await clickPlay();
  let rs17open = null;
  for (let i = 0; i < 40; i++) {
    const st = await evaluate<{ chamber: string; t: number | null; playing: boolean; readout: string }>(`(()=>{const a=window.__vellumAgesState();return{chamber:a.chamber,t:a.t,playing:a.playing,readout:document.querySelector(".rf-year").textContent};})()`);
    if (st.chamber === "survey") { rs17open = st; break; }
    await sleep(50);
  }
  await evaluate(`(()=>{const b=document.querySelector(".rf-play");if(b.textContent==="Pause")b.click();})()`);
  check(
    "RS17 a Play from the present park opens the whole story from the survey's first leg",
    // @ts-expect-error t is null only in the ages chamber, and rs17open is kept only once the chamber is the survey, so a null never reaches here; one would read as 0 and pass this clause
    !!rs17open && rs17open.playing === true && rs17open.t < 0.5 && rs17open.readout === "the survey",
    JSON.stringify(rs17open),
  );
}
