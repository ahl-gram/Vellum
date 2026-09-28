import type { SuiteContext } from "../../types.ts";

export async function prlLink({ evaluate, send, check, sleep, PORT }: SuiteContext) {
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#seed=42&style=antique&legend=1` });
  let exReady = false;
  for (let i = 0; i < 200; i++) {
    let ok = null;
    try { ok = await evaluate<boolean>(`typeof window.__vellumUsesWorker==="function" && !!document.querySelector("#map svg") && document.getElementById("status").textContent===""`); } catch {}
    if (ok) { exReady = true; break; }
    await sleep(75);
  }
  const orderHref = exReady ? await evaluate<string | null>(`(()=>{const a=document.getElementById("order-plates");return a?a.getAttribute("href"):null;})()`) : null;
  check(
    "PRL Explorer 'Take to the Print Room' link carries the world on screen",
    !!orderHref && /^\.\.\/print-room\/#/.test(orderHref) && /seed=42/.test(orderHref),
    String(orderHref),
  );
  return orderHref;
}

export async function prwWarp({ evaluate, send, check, sleep, PORT }: SuiteContext): Promise<void> {
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#seed=42&style=antique&legend=1&coast=90` });
  let exWarp = false;
  for (let i = 0; i < 200; i++) {
    let ok = null;
    try { ok = await evaluate<boolean>(`typeof window.__vellumUsesWorker==="function" && !!document.querySelector("#map svg") && document.getElementById("status").textContent===""`); } catch {}
    if (ok) { exWarp = true; break; }
    await sleep(75);
  }
  const warpHref = exWarp ? await evaluate<string | null>(`(()=>{const a=document.getElementById("order-plates");return a?a.getAttribute("href"):null;})()`) : null;
  check(
    "PRW Explorer 'Take to the Print Room' href carries the coast warp (coast=90)",
    !!warpHref && /coast=90/.test(warpHref) && /seed=42/.test(warpHref),
    String(warpHref),
  );
  const warpHash = warpHref && warpHref.includes("#") ? warpHref.slice(warpHref.indexOf("#")) : "#seed=42&style=antique&legend=1&coast=90";
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/${warpHash}` });
  let warpProof = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try {
      s = await evaluate<{ seed: number; svg: boolean; status: string | undefined; hash: string; stamp: string | null } | null>(`(()=>{if(typeof window.__vellumPrintRoomState!=="function")return null;const st=window.__vellumPrintRoomState();const svg=document.querySelector("#pr-preview svg");return{seed:st.seed,svg:!!svg,status:(document.getElementById("pr-status")||{}).textContent,hash:location.hash,stamp:svg?svg.getAttribute("data-vellum-coast-warp"):null};})()`);
    } catch {}
    if (s && s.svg && s.status === "" && s.seed === 42) { warpProof = s; break; }
    await sleep(50);
  }
  check(
    "PRW2 the warped world Taken to the Print Room prints warped (stamp + coast= round-trip)",
    !!warpProof && warpProof.stamp === "0.9" && /coast=90/.test(warpProof.hash),
    warpProof ? `stamp=${warpProof.stamp} hash=${warpProof.hash}` : "no proof",
  );
}
