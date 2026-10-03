import type { ReadingRoomKit } from "./kit.ts";
import { agesRead } from "./reads.ts";
import type { Ages } from "./reads.ts";

export async function rr23Usurped({ evaluate, send, check, sleep, boot, PORT }: ReadingRoomKit): Promise<void> {
  // Clicking right after boot() deterministically supersedes the boot draft (its worker round-trip is hundreds of ms); preStatus pins that the race really ran, and 1059 is seed 42's own present (the golden's year).
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/#seed=7&year=850` });
  check("RR23a the deep-linked boot draft is underway", await boot());
  const pre = await evaluate<{ preStatus: string | undefined }>(`(()=>{const st=(document.querySelector(".rf-status")||{}).textContent;const c=document.querySelector(".rr-colophon");c.querySelector("input").value="42";c.querySelector(".rr-read").click();return{preStatus:st};})()`);
  let usurped = null;
  for (let i = 0; i < 300; i++) {
    let s = null;
    try {
      s = await evaluate<{ seed: number; title: string; status: string | undefined; ages: Ages | null; hash: string }>(`(()=>{const st=window.__vellumReadingRoomState();const a=window.__vellumReadingRoomAges();return{seed:st.seed,title:st.title,status:(document.querySelector(".rf-status")||{}).textContent,ages:a,hash:location.hash};})()`);
    } catch {}
    if (s && s.status === "" && s.seed === 42 && s.title === "The Isle of Rahai") { usurped = s; break; }
    await sleep(50);
  }
  check(
    "RR23 a read that supersedes a deep link's boot draft parks the NEW world at ITS present, not the link's rest",
    pre.preStatus === "Drafting…" && !!usurped && !!usurped.ages &&
      usurped.ages.chamber === "ages" && usurped.ages.year === 1059 &&
      /year=1059(&|$)/.test(usurped.hash) && !/year=850/.test(usurped.hash),
    JSON.stringify({ pre, usurped }),
  );
}

export async function rr24BeforeArm({ evaluate, send, check, sleep, boot, settled, PORT }: ReadingRoomKit): Promise<void> {
  // Issue #418: the arm waits for an off-thread travel order, so a window NEW to this issue opens between the painted chart and the armed instrument. `.rf-ages` is hidden across it (reading-frame.css gives [hidden] display:none), so a reader cannot click the scrubber; what IS live is every handler behind it, reachable from a stray keypress, a document click, or any programmatic dispatch. Each guards on `if (!ages) return`, and until this window existed nothing could test that they do.
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/#seed=42&style=antique&legend=1` });
  const pokeBooted = await boot();
  let unarmed = null;
  for (let i = 0; i < 400; i++) {
    try {
      unarmed = await evaluate<{ panelHidden: boolean } | null>(`(()=>{const svg=!!document.querySelector(".rf-chart svg");
        const st=(document.querySelector(".rf-status")||{}).textContent;
        const a=window.__vellumReadingRoomAges?window.__vellumReadingRoomAges():undefined;
        return svg&&st!==""&&a===null?{panelHidden:document.querySelector(".rf-ages").hidden}:null;})()`);
    } catch {}
    if (unarmed) break;
    await sleep(25);
  }
  const poked = await evaluate<{ before: Ages | null; after: Ages | null; play: string }>(`(()=>{
    const before=window.__vellumReadingRoomAges();
    document.querySelector(".rf-play").click();
    const r=document.querySelector(".rf-range");
    r.value=r.max||"50";
    r.dispatchEvent(new Event("input",{bubbles:true}));
    r.dispatchEvent(new Event("change",{bubbles:true}));
    document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));
    document.dispatchEvent(new MouseEvent("click",{bubbles:true}));
    return{before,after:window.__vellumReadingRoomAges(),play:document.querySelector(".rf-play").textContent};
  })()`);
  const pokeSettled = await settled();
  const pokeRead = await evaluate(agesRead);
  check(
    "RR24 scrubbing, playing or clicking BEFORE the arm changes nothing, and the room still arrives at rest (#418)",
    pokeBooted && !!unarmed && unarmed.panelHidden === true &&
      poked.before === null && poked.after === null && poked.play === "Play" &&
      pokeSettled && !!pokeRead.ages && pokeRead.ages.chamber === "ages" &&
      pokeRead.play === "Play" && pokeRead.panelHidden === false,
    JSON.stringify({ unarmed, poked, read: pokeRead }),
  );
}

export async function rr25TearDown({ evaluate, check, sleep, settled }: ReadingRoomKit): Promise<void> {
  // Issue #418: on a COUNTER read the arm waits too, and the previous world's instrument must not outlive the chart it belonged to. clearAges runs in the task that swaps the chart, never with the deferred arm; held back with the arm, this window would show the OLD world's panel armed over the NEW world's chart, where a scrub filters these glyphs by that world's years and a release writes that year into this world's address.
  const rr25Before = await evaluate<string>(`window.__vellumReadingRoomState().title`);
  await evaluate(`(()=>{const c=document.querySelector(".rr-colophon");c.querySelector("input").value="526413615";c.querySelector(".rr-read").click();})()`);
  let rr25Window = null;
  for (let i = 0; i < 400; i++) {
    try {
      rr25Window = await evaluate<{ title: string; seed: number; ages: Ages | null; panelHidden: boolean | null; tracks: number } | null>(`(()=>{const st=window.__vellumReadingRoomState();
        const status=(document.querySelector(".rf-status")||{}).textContent;
        if(st.title===${JSON.stringify(rr25Before)}||status==="")return null;
        const p=document.querySelector(".rf-ages");
        return{title:st.title,seed:st.seed,ages:window.__vellumReadingRoomAges(),
          panelHidden:p?p.hidden:null,tracks:document.querySelectorAll(".rf-chart .voyage-track").length};})()`);
    } catch {}
    if (rr25Window) break;
    await sleep(25);
  }
  const rr25Settled = await settled();
  const rr25After = await evaluate(agesRead);
  check(
    "RR25 a counter read tears the old instrument down with the chart it belonged to, then arms the new world (#418)",
    !!rr25Window && rr25Window.ages === null && rr25Window.panelHidden === true &&
      rr25Window.tracks === 0 && rr25Window.seed === 526413615 &&
      rr25Settled && !!rr25After.ages && rr25After.panelHidden === false &&
      rr25After.ages.chamber === "ages",
    JSON.stringify({ before: rr25Before, window: rr25Window, after: rr25After }),
  );
}
