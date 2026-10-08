import type { SuiteContext } from "../../types.ts";

export async function pr0Boots({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  let booted = false;
  for (let i = 0; i < 200; i++) {
    let ok = null;
    try {
      ok = await evaluate<boolean>(`typeof window.__vellumPrintRoomUsesWorker === "function"`);
    } catch {}
    if (ok) {
      booted = true;
      break;
    }
    await sleep(75);
  }
  check("PR0 print-room page booted (worker hook present)", booted);
  check(
    "PR1 print-room render worker active (no silent cross-directory fallback)",
    await evaluate<boolean>(`window.__vellumPrintRoomUsesWorker() === true`),
  );

  let previewed = false;
  for (let i = 0; i < 120; i++) {
    let s = null;
    try {
      s = await evaluate<{ svg: boolean; status: string | undefined }>(
        `({svg:!!document.querySelector("#pr-preview svg"),status:(document.getElementById("pr-status")||{}).textContent})`,
      );
    } catch {}
    if (s && s.svg && s.status === "") {
      previewed = true;
      break;
    }
    await sleep(50);
  }
  check("PR2 deep-link renders a proof into the preview (off-thread)", previewed);
}

export async function pr3World({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  // "The Isle of Rahai" is seed 42's golden title (test/world/golden-seed42.test.ts), so PR3 witnesses the deep-linked world's identity rather than merely that a render happened.
  const st = await evaluate<{ seed: number; title: string; svg: boolean }>(
    `(()=>{const s=window.__vellumPrintRoomState();return{seed:s.seed,title:s.title,svg:!!document.querySelector("#pr-preview svg")};})()`,
  );
  check(
    "PR3 the proof is the deep-linked world (seed 42 == 'The Isle of Rahai')",
    st.svg && st.seed === 42 && st.title === "The Isle of Rahai",
    JSON.stringify(st),
  );

  await evaluate(
    `(()=>{const s=document.getElementById("pr-seed");s.value="100";document.getElementById("pr-draw").click();})()`,
  );
  let manual = null;
  for (let i = 0; i < 120; i++) {
    let s = null;
    try {
      s = await evaluate<{ seed: number; title: string; svg: boolean; status: string }>(
        `(()=>{const st=window.__vellumPrintRoomState();return{seed:st.seed,title:st.title,svg:!!document.querySelector("#pr-preview svg"),status:document.getElementById("pr-status").textContent};})()`,
      );
    } catch {}
    if (s && s.svg && s.status === "" && s.seed === 100) {
      manual = s;
      break;
    }
    await sleep(50);
  }
  check(
    "PR4 manual seed entry pulls a fresh proof",
    !!manual && manual.seed === 100 && manual.title !== st.title,
    JSON.stringify(manual),
  );

  const hash = await evaluate<string>(`location.hash`);
  check(
    "PR5 a manual draw round-trips the world into the hash",
    /(^|&|#)seed=100(&|$)/.test(hash) && /style=antique/.test(hash),
    hash,
  );

  const roadHref = await evaluate<string | null>(
    `(()=>{const a=document.getElementById("pr-explorer");return a?a.getAttribute("href"):null;})()`,
  );
  check(
    "PR30 the road back to the Explorer carries the world on the desk (the legend row's gold road, ruled 2026-08-30)",
    !!roadHref && /^\.\.\/explorer\/#/.test(roadHref) && /seed=100/.test(roadHref) && /style=antique/.test(roadHref),
    String(roadHref),
  );
}

export async function prcCarried({ evaluate, send, check, sleep, PORT }: SuiteContext): Promise<void> {
  await send("Page.navigate", {
    url: `http://127.0.0.1:${PORT}/print-room/#seed=42&style=antique&type=archipelago&band=tropical&theme=vegetation&arms=1&beasts=1&legend=0&land=350`,
  });
  let carried = null;
  for (let i = 0; i < 160; i++) {
    let s = null;
    try {
      s = await evaluate<{ svg: boolean; status: string | undefined; hash: string }>(
        `({svg:!!document.querySelector("#pr-preview svg"),status:(document.getElementById("pr-status")||{}).textContent,hash:location.hash})`,
      );
    } catch {}
    if (s && s.svg && s.status === "") {
      carried = s;
      break;
    }
    await sleep(50);
  }
  const carriedOk =
    !!carried &&
    /type=archipelago/.test(carried.hash) &&
    /band=tropical/.test(carried.hash) &&
    /theme=vegetation/.test(carried.hash) &&
    /arms=1/.test(carried.hash) &&
    /beasts=1/.test(carried.hash) &&
    /legend=0/.test(carried.hash) &&
    /land=350/.test(carried.hash) &&
    /seed=42/.test(carried.hash);
  check(
    "PRC carried params (type/band/theme/legend/arms/beasts/land) round-trip at non-defaults",
    carriedOk,
    carried ? carried.hash : "no preview",
  );
}

export async function prbBare({ evaluate, send, check, sleep, PORT }: SuiteContext): Promise<void> {
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/` });
  let bare = null;
  for (let i = 0; i < 160; i++) {
    let s = null;
    try {
      s = await evaluate<{ svg: boolean; status: string | undefined; seed: string; expected: string }>(
        `(async()=>{const {seedForDate}=await import("/explorer/engine/world/seed-of-the-day.js");return{svg:!!document.querySelector("#pr-preview svg"),status:(document.getElementById("pr-status")||{}).textContent,seed:document.getElementById("pr-seed").value,expected:String(seedForDate(new Date()))};})()`,
        true,
      );
    } catch {}
    if (s && s.svg && s.status === "") {
      bare = s;
      break;
    }
    await sleep(50);
  }
  check(
    "PRB bare Print Room visit lands on today's seed-of-the-day",
    !!bare && bare.seed === bare.expected,
    JSON.stringify(bare),
  );
}
