import type { SuiteContext } from "../types.ts";

export async function pr24Redraw({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  const midDraw = await evaluate<{ bind: boolean; print: boolean; atlasEmpty: boolean; hasAtlas: boolean }>(`(()=>{const s=document.getElementById("pr-seed");s.value="2024";document.getElementById("pr-draw").click();return{bind:document.getElementById("pr-bind").disabled,print:document.getElementById("pr-print").disabled,atlasEmpty:document.getElementById("pr-atlas").children.length===0,hasAtlas:document.body.classList.contains("has-atlas")};})()`);
  let reenabled = null;
  for (let i = 0; i < 160; i++) {
    let s = null;
    try { s = await evaluate<{ seed: number; status: string; bind: boolean }>(`(()=>{const st=window.__vellumPrintRoomState();return{seed:st.seed,status:document.getElementById("pr-status").textContent,bind:document.getElementById("pr-bind").disabled};})()`); } catch {}
    if (s && s.seed === 2024 && s.status === "" && s.bind === false) { reenabled = s; break; }
    await sleep(50);
  }
  check(
    "PR24 a redraw disables Bind mid-flight (no stale-world bind), re-enabled on the new proof",
    midDraw.bind === true && midDraw.print === true && midDraw.atlasEmpty === true &&
      midDraw.hasAtlas === false && !!reenabled,
    JSON.stringify({ midDraw, reenabled }),
  );
}

export async function pr24bInFlight({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  // The interleaving here is deterministic, not lucky: the Print Room shares ONE FIFO render worker with no job cancellation, so the bind posted first always settles first, ahead of the redraw queued behind it. PR27 rests on the same property.
  const btd = await evaluate<{ bindDisabled: boolean; atlasEmpty: boolean }>(`(()=>{document.getElementById("pr-bind").click();const s=document.getElementById("pr-seed");s.value="909";document.getElementById("pr-draw").click();return{bindDisabled:document.getElementById("pr-bind").disabled,atlasEmpty:document.getElementById("pr-atlas").children.length===0};})()`);
  let btdSettled = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try { s = await evaluate<{ seed: number; status: string; bind: boolean }>(`(()=>{const st=window.__vellumPrintRoomState();return{seed:st.seed,status:document.getElementById("pr-status").textContent,bind:document.getElementById("pr-bind").disabled};})()`); } catch {}
    if (s && s.seed === 909 && s.status === "" && s.bind === false) { btdSettled = s; break; }
    await sleep(50);
  }
  await sleep(250); // let any (wrongly) surviving stale bind inject before asserting emptiness
  const btdAtlas = await evaluate<{ figs: number; hasAtlas: boolean }>(`(()=>({figs:document.querySelectorAll("#pr-atlas figure").length,hasAtlas:document.body.classList.contains("has-atlas")}))()`);
  check(
    "PR24b an in-flight bind is dropped when a redraw supersedes it (no stale-world atlas)",
    btd.bindDisabled === true && btd.atlasEmpty === true && !!btdSettled &&
      btdAtlas.figs === 0 && btdAtlas.hasAtlas === false,
    JSON.stringify({ btd, btdSettled, btdAtlas }),
  );
}

export async function pr24cRebind({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  // A click on the previous binding's thumbnail DURING a re-bind: the old plates stay turnable until the new ones land (skeptic on PR #496: revoked up front, the sheet and the index blanked).
  await evaluate(`document.getElementById("pr-bind").click()`);
  let boundOnce = false;
  for (let i = 0; i < 300; i++) {
    let ok = null;
    try { ok = await evaluate<boolean>(`(()=>{const imgs=[...document.querySelectorAll("#pr-contents .plates img")];return !!window.__vellumBoundAtlas && imgs.length>0 && imgs.every(im=>im.complete&&im.naturalWidth>0) && !document.getElementById("pr-bind").disabled;})()`); } catch {}
    if (ok) { boundOnce = true; break; }
    await sleep(50);
  }
  const midRebind = await evaluate<{ binding: boolean; here: string | undefined; src: string; stillBound: boolean } | null>(`(()=>{document.getElementById("pr-bind").click();const b=document.querySelector('#pr-contents .plates figure[data-plate="theme-climate"] .thumb');if(!b)return null;b.click();const t=document.getElementById("pr-turned");return{binding:document.getElementById("pr-bind").disabled,here:(document.querySelector("#pr-contents .plates figure.here")||{dataset:{}}).dataset.plate,src:t.src.slice(0,5),stillBound:document.body.classList.contains("has-atlas")};})()`);
  // Poll for the DECODED state, not for Bind's re-enable: the blobs decode after the binding lands, and a loaded CI lane read them mid-decode at the first sample (PR #500's run at 91da0e7). A value that never settles fails on the last sample.
  let rebound = null;
  for (let i = 0; i < 300; i++) {
    let s = null;
    try { s = await evaluate<{ imgs: number; loaded: boolean; turnedLoaded: boolean; here: string | undefined; print: boolean } | null>(`(()=>{if(document.getElementById("pr-bind").disabled)return null;const imgs=[...document.querySelectorAll("#pr-contents .plates img")];const t=document.getElementById("pr-turned");return{imgs:imgs.length,loaded:imgs.length>0&&imgs.every(im=>im.complete&&im.naturalWidth>0),turnedLoaded:!t.hidden&&t.complete&&t.naturalWidth>0,here:(document.querySelector("#pr-contents .plates figure.here")||{dataset:{}}).dataset.plate,print:!document.getElementById("pr-print").disabled};})()`); } catch {}
    if (s) rebound = s;
    if (s && s.loaded && s.turnedLoaded) break;
    await sleep(50);
  }
  check(
    "PR24c a turn during a re-bind stays on a live plate, and the new binding lands with every thumbnail and the sheet decoded",
    boundOnce && !!midRebind && midRebind.binding === true && midRebind.here === "theme-climate" && midRebind.src === "blob:" && midRebind.stillBound === true &&
      !!rebound && rebound.loaded === true && rebound.turnedLoaded === true && rebound.here === "antique" && rebound.print === true,
    JSON.stringify({ boundOnce, midRebind, rebound }),
  );
}

export async function pr26Redraw({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  let orderReady = false;
  for (let i = 0; i < 160; i++) {
    let ok = null;
    try { ok = await evaluate<boolean>(`(()=>{const g=document.querySelector('[data-poster="grand"]');const f=document.getElementById("pr-format");return !!document.querySelector("#pr-preview svg")&&document.getElementById("pr-status").textContent===""&&!!g&&!g.disabled&&!!f&&!f.disabled;})()`); } catch {}
    if (ok) { orderReady = true; break; }
    await sleep(50);
  }
  const midPoster = await evaluate<{ platesDisabled: boolean; format: boolean | null; status: string }>(`(()=>{const s=document.getElementById("pr-seed");s.value="777";document.getElementById("pr-draw").click();const plates=[...document.querySelectorAll("[data-poster]")];const f=document.getElementById("pr-format");return{platesDisabled:plates.length>0&&plates.every((b)=>b.disabled),format:f?f.disabled:null,status:document.getElementById("pr-status").textContent};})()`);
  let orderReenabled = null;
  for (let i = 0; i < 160; i++) {
    let s = null;
    try { s = await evaluate<{ seed: number; status: string; plate: boolean; format: boolean }>(`(()=>{const st=window.__vellumPrintRoomState();const g=document.querySelector('[data-poster="grand"]');const f=document.getElementById("pr-format");return{seed:st.seed,status:document.getElementById("pr-status").textContent,plate:g?g.disabled:true,format:f?f.disabled:true};})()`); } catch {}
    if (s && s.seed === 777 && s.status === "" && s.plate === false && s.format === false) { orderReenabled = s; break; }
    await sleep(50);
  }
  check(
    "PR26 a redraw disables the plate controls mid-flight (no stale-world poster), re-enabled on the new proof",
    orderReady && midPoster.platesDisabled === true && midPoster.format === true && !!orderReenabled,
    JSON.stringify({ orderReady, midPoster, orderReenabled }),
  );
}

export async function pr27OrderDuring({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  let pr27Ready = false;
  for (let i = 0; i < 160; i++) {
    let ok = null;
    try { ok = await evaluate<boolean>(`(()=>{const g=document.querySelector('[data-poster="grand"]');const f=document.getElementById("pr-format");return !!document.querySelector("#pr-preview svg")&&document.getElementById("pr-status").textContent===""&&!!g&&!g.disabled&&!!f&&!f.disabled;})()`); } catch {}
    if (ok) { pr27Ready = true; break; }
    await sleep(50);
  }
  const pr27Start = await evaluate<{ platesDisabled: boolean; status: string }>(`(()=>{document.getElementById("pr-format").value="svg";window.__vellumLastPoster=undefined;document.querySelector('[data-poster="desk"]').click();const s=document.getElementById("pr-seed");s.value="888";document.getElementById("pr-draw").click();const plates=[...document.querySelectorAll("[data-poster]")];return{platesDisabled:plates.every((b)=>b.disabled),status:document.getElementById("pr-status").textContent};})()`);
  let pr27Violated = false;
  let pr27OrderInDraw = false;
  let pr27Settled = null;
  for (let i = 0; i < 400; i++) {
    let s = null;
    try { s = await evaluate<{ seed: number; status: string; anyEnabled: boolean; orderDone: boolean }>(`(()=>{const st=window.__vellumPrintRoomState();const plates=[...document.querySelectorAll("[data-poster]")];return{seed:st.seed,status:document.getElementById("pr-status").textContent,anyEnabled:plates.some((b)=>!b.disabled),orderDone:!!window.__vellumLastPoster};})()`); } catch {}
    if (s) {
      const drawing = s.status === "Pulling a proof…";
      if (drawing && s.orderDone) pr27OrderInDraw = true;
      if (drawing && s.anyEnabled) pr27Violated = true;
      if (s.seed === 888 && s.status === "" && s.anyEnabled) { pr27Settled = s; break; }
    }
    await sleep(30);
  }
  check(
    "PR27 an order finishing during a redraw keeps the counter closed until the new proof settles (reverse guard)",
    pr27Ready && pr27Start.platesDisabled === true && pr27OrderInDraw === true && pr27Violated === false && !!pr27Settled,
    JSON.stringify({ pr27Ready, pr27Start, pr27OrderInDraw, pr27Violated, pr27Settled }),
  );
}
