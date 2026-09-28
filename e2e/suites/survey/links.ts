import type { makeRoom } from "../../support/room.ts";
import type { SuiteContext } from "../../types.ts";
import type { SurveyKit } from "./kit.ts";

type Room = ReturnType<typeof makeRoom>;

export async function sv3Untick({ evaluate, check, goto, waitInked }: SurveyKit): Promise<void> {
  await goto("#seed=42&style=antique&survey", "survey-restore-for-sv3");
  await waitInked("survey-sv3-ink");
  const sv3 = await evaluate<{ track: boolean; hash: string; href: string | null; status: string }>(`(()=>{
      const c=document.getElementById("ages");c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));
      return{track:!!document.querySelector("#map .voyage-overlay"),hash:location.hash,
        href:document.getElementById("journal-link").getAttribute("href"),
        status:document.getElementById("status").textContent};
    })()`);
  check(
    "SV3 unticking clears the track and drops the flag; the journal href follows the write",
    !sv3.track && !/survey/.test(sv3.hash) && !/year=/.test(sv3.hash) &&
      sv3.href === "/reading-room/" + sv3.hash && sv3.status === "",
    JSON.stringify(sv3),
  );
}

export async function sv4DeepLink({ evaluate, check, goto, waitInked }: SurveyKit): Promise<void> {
  await goto("#seed=42&style=antique&survey", "survey-restore");
  // waitSettled keys on #status, which the settle clears BEFORE the deferred arm (#366): wait for the ink, never read in the settle's shadow.
  await waitInked("survey-restore-ink");
  const sv4 = await evaluate<{ checked: boolean; vertices: number; overlays: number; hash: string; status: string; href: string | null }>(`(()=>{
      const t=document.querySelector("#map .voyage-overlay .voyage-track");
      return{checked:document.getElementById("ages").checked,
        vertices:t?(t.getAttribute("points")||"").trim().split(/\\s+/).length:0,
        overlays:document.querySelectorAll("#map .voyage-overlay").length,
        hash:location.hash,status:document.getElementById("status").textContent,
        href:document.getElementById("journal-link").getAttribute("href")};
    })()`);
  check(
    "SV4 a survey deep link restores ticked, resting on the completed track, silently",
    sv4.checked && sv4.vertices > 10 && sv4.overlays === 1 &&
      /(^|&)survey(&|$)/.test(sv4.hash.slice(1)) && sv4.status === "" &&
      sv4.href === "/reading-room/" + sv4.hash,
    JSON.stringify(sv4),
  );
}

export async function sv5Forwards({ evaluate, send, check, sleep, EXP }: SurveyKit, room: Room): Promise<void> {
  const fwdHash = "#seed=42&style=antique&legend=1&arms=0&year=1030";
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: EXP + fwdHash });
  let landed = false;
  for (let i = 0; i < 200; i++) {
    let p = null;
    try { p = await evaluate<string>(`location.pathname`); } catch {}
    if (p === "/reading-room/") { landed = true; break; }
    await sleep(50);
  }
  const roomUp = landed && (await room.boot()) && (await room.settled());
  const sv5 = roomUp
    ? await evaluate<{ hash: boolean; chamber: string; year: number | null; seed: number }>(`(()=>{const a=window.__vellumReadingRoomAges();
        return{hash:location.hash.startsWith("#seed=42&style=antique&legend=1&arms=0"),
          chamber:a?a.chamber:"",year:a?a.year:-1,
          seed:window.__vellumReadingRoomState().seed};})()`)
    : { hash: false, chamber: "", year: -1, seed: -1 };
  check(
    "SV5 a year=N Explorer link forwards to the Reading Room, hash intact, parked at that year",
    landed && roomUp && sv5.hash && sv5.chamber === "ages" && sv5.year === 1030 && sv5.seed === 42,
    JSON.stringify({ landed, roomUp, sv5 }),
  );
}

export async function sv5bVerbatim({ evaluate, send, check, sleep, EXP }: SurveyKit): Promise<void> {
  const richHash = "#seed=7&style=ink&legend=0&arms=1&land=520&year=2&cx=0.5100&cy=0.4900&k=3.0000";
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: EXP + richHash });
  let landedB = false;
  for (let i = 0; i < 200; i++) {
    let p = null;
    try { p = await evaluate<string>(`location.pathname`); } catch {}
    if (p === "/reading-room/") { landedB = true; break; }
    await sleep(50);
  }
  const hashB = landedB ? await evaluate<string>(`location.hash`) : "";
  check(
    "SV5b the forward carries the hash verbatim: recipe, tide, and camera riders all intact",
    landedB && hashB === richHash,
    JSON.stringify({ landedB, hashB, want: richHash }),
  );
}

export async function sv5cBadYear({ evaluate, check, goto }: SurveyKit): Promise<void> {
  await goto("#seed=42&style=antique&year=abc", "survey-badyear");
  const sv5c = await evaluate<{ path: string; checked: boolean; svg: boolean }>(`({path:location.pathname,checked:document.getElementById("ages").checked,svg:!!document.querySelector("#map svg")})`);
  check(
    "SV5c a malformed year stays in the Explorer, ignored, and the chart draws",
    sv5c.path === "/explorer/" && !sv5c.checked && sv5c.svg,
    JSON.stringify(sv5c),
  );
}

export async function sv5dBothKeys({ evaluate, check, goto, waitBeat }: SurveyKit): Promise<void> {
  await goto("#seed=42&style=antique&survey&year=1030", "survey-bothkeys");
  await evaluate(`(()=>{window.__beat=false;requestAnimationFrame(()=>setTimeout(()=>{window.__beat=true;},0));})()`);
  await waitBeat("survey-bothkeys-beat");
  const sv5d = await evaluate<{ path: string; checked: boolean; track: boolean }>(`({path:location.pathname,checked:document.getElementById("ages").checked,track:!!document.querySelector("#map .voyage-overlay")})`);
  check(
    "SV5d the both-keys set stays in the Explorer and arms nothing (ignored whole)",
    sv5d.path === "/explorer/" && !sv5d.checked && !sv5d.track,
    JSON.stringify(sv5d),
  );
}

export async function sv6VersoMirrors({ evaluate, check, sleep, goto, waitInked }: SurveyKit): Promise<void> {
  await goto("#seed=42&style=antique&survey", "survey-verso");
  await waitInked("survey-verso-ink");
  await evaluate(`document.getElementById("verso-turn").click()`);
  await sleep(1500); // the ceremonial flip transition (--verso-turn 1200ms)
  const sv6 = await evaluate<{ flipped: boolean; match: boolean; status: string }>(`(()=>{
      const recto=document.querySelector("#map .voyage-overlay .voyage-track");
      const back=document.querySelector("#verso .verso-track");
      return{flipped:document.getElementById("sheet").classList.contains("versoed"),
        match:!!recto&&!!back&&recto.getAttribute("points")===back.getAttribute("points"),
        status:document.getElementById("status").textContent};
    })()`);
  check(
    "SV6 the verso mirrors the resting track (both faces byte-agree) and the flip needed no snap",
    sv6.flipped && sv6.match && sv6.status === "",
    JSON.stringify(sv6),
  );
}

export async function sv7Journal({ evaluate, send, check, PORT }: SuiteContext, room: Room): Promise<void> {
  const sv7href = await evaluate<string | null>(`document.getElementById("journal-link").getAttribute("href")`);
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}${sv7href}` });
  const sv7up = (await room.boot()) && (await room.settled());
  const sv7 = sv7up
    ? await evaluate<{ seed: number; chamber: string; t: number | null }>(`(()=>{const a=window.__vellumReadingRoomAges();
        return{seed:window.__vellumReadingRoomState().seed,chamber:a?a.chamber:"",t:a?a.t:-1};})()`)
    : { seed: -1, chamber: "", t: -1 };
  check(
    "SV7 the journal button opens this world's journal in the room, at the survey rest",
    sv7up && sv7.seed === 42 && sv7.chamber === "survey" && sv7.t === 1,
    JSON.stringify({ sv7href, sv7up, sv7 }),
  );
}
