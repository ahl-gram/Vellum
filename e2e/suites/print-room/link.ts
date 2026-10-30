import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";

export async function prlLink({ evaluate, send, check, sleep, PORT }: SuiteContext) {
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#seed=42&style=antique&legend=1` });
  let exReady = false;
  for (let i = 0; i < 200; i++) {
    let ok = null;
    try {
      ok = await evaluate<boolean>(
        `typeof window.__vellumUsesWorker==="function" && !!document.querySelector("#map svg") && document.getElementById("status").textContent===""`,
      );
    } catch {}
    if (ok) {
      exReady = true;
      break;
    }
    await sleep(75);
  }
  const orderHref = exReady
    ? await evaluate<string | null>(
        `(()=>{const a=document.getElementById("order-plates");return a?a.getAttribute("href"):null;})()`,
      )
    : null;
  check(
    "PRL Explorer 'Take to the Print Room' link carries the world on screen",
    !!orderHref && /^\.\.\/print-room\/#/.test(orderHref) && /seed=42/.test(orderHref),
    String(orderHref),
  );
  const plainHash = await evaluate<string>(`location.hash.replace(/&table=[^&]*/, "")`);
  check(
    "PRW6 a plain chart's link is byte-identical to today's",
    plainHash === "#seed=42&style=antique&legend=1&arms=0&beasts=0",
    plainHash,
  );
  return orderHref;
}

async function prw2WarpedProof({
  evaluate,
  check,
  sleep,
}: Pick<SuiteContext, "evaluate" | "check" | "sleep">): Promise<void> {
  let warpProof = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try {
      s = await evaluate<{
        seed: number;
        svg: boolean;
        status: string | undefined;
        hash: string;
        stamp: string | null;
      } | null>(
        `(()=>{if(typeof window.__vellumPrintRoomState!=="function")return null;const st=window.__vellumPrintRoomState();const svg=document.querySelector("#pr-preview svg");return{seed:st.seed,svg:!!svg,status:(document.getElementById("pr-status")||{}).textContent,hash:location.hash,stamp:svg?svg.getAttribute("data-vellum-coast-warp"):null};})()`,
      );
    } catch {}
    if (s && s.svg && s.status === "" && s.seed === 42) {
      warpProof = s;
      break;
    }
    await sleep(50);
  }
  check(
    "PRW2 the warped world Taken to the Print Room prints warped (stamp + coast= round-trip)",
    !!warpProof && warpProof.stamp === "0.9" && /coast=90/.test(warpProof.hash),
    warpProof ? `stamp=${warpProof.stamp} hash=${warpProof.hash}` : "no proof",
  );
}

export async function prwWarp({ evaluate, send, check, sleep, PORT }: SuiteContext): Promise<void> {
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#seed=42&style=antique&legend=1&coast=90` });
  let exWarp = false;
  for (let i = 0; i < 200; i++) {
    let ok = null;
    try {
      ok = await evaluate<boolean>(
        `typeof window.__vellumUsesWorker==="function" && !!document.querySelector("#map svg") && document.getElementById("status").textContent===""`,
      );
    } catch {}
    if (ok) {
      exWarp = true;
      break;
    }
    await sleep(75);
  }
  const warpHref = exWarp
    ? await evaluate<string | null>(
        `(()=>{const a=document.getElementById("order-plates");return a?a.getAttribute("href"):null;})()`,
      )
    : null;
  check(
    "PRW Explorer 'Take to the Print Room' href carries the coast warp (coast=90)",
    !!warpHref && /coast=90/.test(warpHref) && /seed=42/.test(warpHref),
    String(warpHref),
  );
  const warpHash =
    warpHref && warpHref.includes("#")
      ? warpHref.slice(warpHref.indexOf("#"))
      : "#seed=42&style=antique&legend=1&coast=90";
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/${warpHash}` });
  await prw2WarpedProof({ evaluate, check, sleep });
}

type Seen = {
  drawn: boolean;
  outline: string | null;
  looseness: string | null;
  islands: string | null;
  isleSize: string | null;
  raggedness: string | null;
  hash: string;
  href: string | null;
};
// The Explorer's table pair is the device's stored table when the link carries none (folioOnArrival), so every exact compare takes it out first.
const SEEN = `(()=>{const svg=document.querySelector("#map > svg[data-vellum-style]"),a=document.getElementById("order-plates"),strip=(s)=>s.replace(/&table=[^&]*/,""),at=(n)=>svg?svg.getAttribute("data-vellum-"+n):null;
  return{drawn:!!svg&&document.getElementById("status").textContent==="",outline:at("outline"),looseness:at("looseness"),islands:at("islands"),isleSize:at("isle-size"),raggedness:at("raggedness"),hash:strip(location.hash),href:a?strip(a.getAttribute("href")):null};})()`;

// Through about:blank, because a navigate that differs only in the hash is same-document and never re-boots the page (settle-doctrine clause 9); the poll keeps its last read and the check asserts on that.
async function explorerAt({ evaluate, send, sleep, PORT }: SuiteContext, hash: string): Promise<Seen | null> {
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/${hash}` });
  let seen: Seen | null = null;
  for (let i = 0; i < 200; i++) {
    try {
      seen = await evaluate<Seen>(SEEN);
    } catch {}
    if (seen && seen.drawn) return seen;
    await sleep(75);
  }
  return seen;
}

const PLACE = "ne-1159315211";
const PLACE_HASH = `#seed=42&style=antique&legend=1&arms=0&beasts=0&outline=${PLACE}&looseness=50`;

export async function prwPlace(ctx: SuiteContext): Promise<void> {
  const { evaluate, send, check, sleep, PORT } = ctx;
  const seen = await explorerAt(ctx, PLACE_HASH);
  check(
    "PRW3 a place's link opens it in the Explorer, writes back the same link, and its road to the Print Room carries it",
    !!seen &&
      seen.outline === PLACE &&
      seen.looseness === "0.5" &&
      seen.hash === PLACE_HASH &&
      !!seen.href &&
      seen.href.endsWith(`&outline=${PLACE}&looseness=50`),
    JSON.stringify(seen),
  );
  const hash = seen && seen.href && seen.href.includes("#") ? seen.href.slice(seen.href.indexOf("#")) : PLACE_HASH;
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/${hash}` });
  let proof: { stamp: string | null; hash: string } | null = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try {
      s = await evaluate<{ svg: boolean; status: string | undefined; stamp: string | null; hash: string } | null>(
        `(()=>{if(typeof window.__vellumPrintRoomState!=="function")return null;const svg=document.querySelector("#pr-preview svg");return{svg:!!svg,status:(document.getElementById("pr-status")||{}).textContent,stamp:svg?svg.getAttribute("data-vellum-outline"):null,hash:location.hash};})()`,
      );
    } catch {}
    if (s && s.svg && s.status === "") {
      proof = s;
      break;
    }
    await sleep(50);
  }
  check(
    "PRW4 the place Taken to the Print Room prints as that place",
    !!proof && proof.stamp === PLACE && proof.hash.includes(`outline=${PLACE}&looseness=50`),
    JSON.stringify(proof),
  );
}

const COUNT_HASH =
  "#seed=1&style=antique&type=archipelago&legend=1&arms=0&beasts=0&islands=20&isleSize=varied&raggedness=40";

export async function prwCount(ctx: SuiteContext): Promise<void> {
  const seen = await explorerAt(ctx, COUNT_HASH);
  ctx.check(
    "PRW5 a counted link opens its count in the Explorer and writes back the same link",
    !!seen &&
      seen.islands === "20" &&
      seen.isleSize === "varied" &&
      seen.raggedness === "0.4" &&
      seen.hash === COUNT_HASH,
    JSON.stringify(seen),
  );
}

const DRAFTING = "Drafting…";
const FLOOD = "150";
const ISLAND_HASH = "#seed=1&style=antique&type=island&legend=1&arms=0&beasts=0";

type Moved = { started: boolean; before: string | null };
type Resolved = { status: string; dis: boolean; map: boolean };
type Redrawn = {
  status: string;
  fresh: boolean;
  land: string | null;
  outline: string | null;
  islands: string | null;
  mapType: string | null;
  hash: string;
};

const MOVE_LAND: Payload<Moved> = `(()=>{const svg=document.querySelector("#map > svg[data-vellum-style]");const before=svg?svg.getAttribute("data-vellum-land-fraction"):null;if(svg)svg.setAttribute("data-prw-old","");const l=document.getElementById("land");l.value="${FLOOD}";l.dispatchEvent(new Event("change",{bubbles:true}));return{before,started:document.getElementById("status").textContent==="${DRAFTING}"};})()`;
const PICK_ISLAND: Payload<Moved> = `(()=>{const svg=document.querySelector("#map > svg[data-vellum-style]");if(svg)svg.setAttribute("data-prw-old","");const t=document.getElementById("type");t.value="island";t.dispatchEvent(new Event("change",{bubbles:true}));return{before:null,started:document.getElementById("status").textContent==="${DRAFTING}"};})()`;
const RESOLVED: Payload<Resolved> = `({status:document.getElementById("status").textContent,dis:document.getElementById("verso-turn").disabled,map:!!document.querySelector("#map > svg[data-vellum-style]")})`;
const REDRAWN: Payload<Redrawn> = `(()=>{const svg=document.querySelector("#map > svg[data-vellum-style]"),at=(n)=>svg?svg.getAttribute("data-vellum-"+n):null;return{status:document.getElementById("status").textContent,fresh:!!svg&&!svg.hasAttribute("data-prw-old"),land:at("land-fraction"),outline:at("outline"),islands:at("islands"),mapType:at("map-type"),hash:location.hash.replace(/&table=[^&]*/,"")};})()`;

// Waits for the draw to end either way, never on waitSettled, so a draw the engine refuses reds the check on its own status line instead of timing the wait out.
async function redrawAfter(
  ctx: SuiteContext,
  move: Payload<Moved>,
  label: string,
): Promise<{ moved: Moved; after: Redrawn }> {
  const settle = makeSettle({ evaluate: ctx.evaluate, sleep: ctx.sleep });
  const moved = await ctx.evaluate(move);
  await settle(RESOLVED, (d) => d.status !== DRAFTING && !d.dis && d.map, label);
  return { moved, after: await ctx.evaluate(REDRAWN) };
}

export async function prwPlaceLand(ctx: SuiteContext): Promise<void> {
  const seen = await explorerAt(ctx, PLACE_HASH);
  const { moved, after } = await redrawAfter(ctx, MOVE_LAND, "PRW7 the land move's draw");
  ctx.check(
    "PRW7 sea level moved on a shaped world stays out of its link and its draw",
    !!seen &&
      seen.outline === PLACE &&
      moved.started &&
      moved.before !== null &&
      moved.before !== String(Number(FLOOD) / 1000) &&
      after.status === "" &&
      after.fresh &&
      after.outline === PLACE &&
      after.land === moved.before &&
      after.hash === PLACE_HASH,
    JSON.stringify({ moved, after }),
  );
}

export async function prwCountType(ctx: SuiteContext): Promise<void> {
  const seen = await explorerAt(ctx, COUNT_HASH);
  const { moved, after } = await redrawAfter(ctx, PICK_ISLAND, "PRW8 the type change's draw");
  ctx.check(
    "PRW8 a counted world turned to an island drops its count from the link and the draw",
    !!seen &&
      seen.islands === "20" &&
      moved.started &&
      after.status === "" &&
      after.fresh &&
      after.islands === null &&
      after.mapType === "island" &&
      after.hash === ISLAND_HASH,
    JSON.stringify({ moved, after }),
  );
}
