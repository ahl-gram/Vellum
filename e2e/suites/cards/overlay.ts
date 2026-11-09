import type { Point, SuiteContext } from "../../types.ts";
import { mouseMove } from "../../support/input.ts";

export type Manifest = Awaited<ReturnType<typeof pManifest>>;

export async function pSetup({ evaluate, waitSettled }: SuiteContext): Promise<void> {
  await evaluate(`(()=>{
      document.getElementById("seed").value="42";
      document.getElementById("style").value="antique";
      document.getElementById("theme").value="";
      document.getElementById("type").value="";
      document.getElementById("arms").checked=false;
      document.getElementById("draw").click();
    })()`);
  await waitSettled("place-cards-draw");
}

export async function pManifest({ evaluate }: SuiteContext) {
  const pm = await evaluate<{
    count: number;
    cap: number;
    capName: string;
    capFounded: number;
    ruinIdx: number;
    ruinName: string | null;
    tale: string | null;
  }>(`(()=>{
    const r=window.__vellumRunInline({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}});
    const places=r.manifest.places;
    const cap=places.findIndex((p)=>p.kind==="capital");
    const ruinIdx=places.findIndex((p)=>p.ruined);
    const tale=ruinIdx>=0?r.manifest.events.find((e)=>e.settlement===ruinIdx&&e.kind==="ruin"):null;
    return{count:places.length,cap,capName:places[cap].name,capFounded:places[cap].founded,ruinIdx,ruinName:ruinIdx>=0?places[ruinIdx].name:null,tale:tale?tale.text:null};
  })()`);
  return pm;
}

export async function p1Overlay({ evaluate, check }: SuiteContext, pm: Manifest): Promise<void> {
  const p1 = await evaluate<{ ov: boolean; hits: number; card: boolean }>(
    `(()=>{const ov=document.querySelector("#map .place-overlay");const hits=document.querySelectorAll("#map .place-hit").length;const card=!!document.getElementById("place-card");return{ov:!!ov,hits,card};})()`,
  );
  check(
    "P1 overlay built: one hit-target per place + a card host",
    p1.ov && p1.card && p1.hits === pm.count,
    `${p1.hits} hits vs ${pm.count} places`,
  );
}

export async function p3PointerEvents({ evaluate, check }: SuiteContext): Promise<void> {
  const p3 = await evaluate<{ ovPe: string; hitPe: string }>(
    `(()=>{const h=document.querySelector(".place-hit");const os=getComputedStyle(document.querySelector(".place-overlay"));return{ovPe:os.pointerEvents,hitPe:getComputedStyle(h).pointerEvents};})()`,
  );
  check(
    "P3 pointer-events: overlay none, hits auto (rest of page stays live)",
    p3.ovPe === "none" && p3.hitPe === "auto",
    `ov=${p3.ovPe} hit=${p3.hitPe}`,
  );
}

export async function p2bPressLift({ evaluate, check }: SuiteContext): Promise<void> {
  // An idle-only read would stay green with the :not(.place-hit) exclusion dropped; this P2b/P2c pair is the guard that actually bites that mutation.
  const p2m = await evaluate<{ btn: string; hit: string }>(
    `(()=>{const b=getComputedStyle(document.getElementById("draw")).transitionDuration;const h=getComputedStyle(document.querySelector(".place-hit")).transitionDuration;return{btn:b,hit:h};})()`,
  );
  check(
    "P2b press/lift reaches buttons (motion.css loaded + applied)",
    p2m.btn.includes("0.18s"),
    `#draw transition-duration=${p2m.btn}`,
  );
  check(
    "P2c press/lift does NOT reach .place-hit (exclusion holds)",
    p2m.hit === "0s",
    `.place-hit transition-duration=${p2m.hit}`,
  );
}

export async function p4Capital({ evaluate, check }: SuiteContext, pm: Manifest): Promise<void> {
  const p4 = await evaluate<{
    hidden: boolean;
    aria: string | null;
    name: string | undefined;
    rank: string | undefined;
    founded: string | undefined;
    tale: boolean;
  }>(
    `(()=>{const hit=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');hit.focus();const c=document.getElementById("place-card");return{hidden:c.hidden,aria:hit.getAttribute("aria-label"),name:(c.querySelector(".pc-name")||{}).textContent,rank:(c.querySelector(".pc-rank")||{}).textContent,founded:(c.querySelector(".pc-founded")||{}).textContent,tale:!!c.querySelector(".pc-tale")};})()`,
  );
  check(
    "P4 focus a capital: card shows name + Capital + founding year, no tale",
    p4.hidden === false &&
      p4.name === pm.capName &&
      p4.rank === "Capital" &&
      p4.founded === "Founded in the year " + pm.capFounded + "." &&
      p4.tale === false,
    JSON.stringify(p4),
  );
  check("P5 hit aria-label is name + rank (matches the card)", p4.aria === pm.capName + ", Capital", `aria=${p4.aria}`);
}

export async function p7Tooltip({ evaluate, check }: SuiteContext, pm: Manifest): Promise<void> {
  // No aria-live on purpose: a populate-while-hidden region announces unreliably and would double up with the aria-describedby path.
  const p7 = await evaluate<{ role: string | null; live: string | null; desc: string | null }>(
    `(()=>{const c=document.getElementById("place-card");const hit=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');return{role:c.getAttribute("role"),live:c.getAttribute("aria-live"),desc:hit.getAttribute("aria-describedby")};})()`,
  );
  check(
    "P7 role=tooltip, hit aria-describedby=place-card, no aria-live",
    p7.role === "tooltip" && p7.desc === "place-card" && p7.live === null,
    JSON.stringify(p7),
  );
}

export async function p8TapPins({ evaluate, check }: SuiteContext, pm: Manifest): Promise<void> {
  const p8 = await evaluate<{ startHidden: boolean; opened: boolean; survived: boolean; closed: boolean }>(
    `(()=>{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));const c=document.getElementById("place-card");const startHidden=c.hidden;const hit=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');hit.click();const opened=!c.hidden;hit.dispatchEvent(new MouseEvent("mouseleave",{bubbles:true}));const survived=!c.hidden;document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));const closed=c.hidden;return{startHidden,opened,survived,closed};})()`,
  );
  check(
    "P8 tap opens+pins from closed, survives mouseleave, Escape dismisses",
    p8.startHidden === true && p8.opened && p8.survived && p8.closed,
    JSON.stringify(p8),
  );
}

export async function p12PinSwitch({ evaluate, check }: SuiteContext, pm: Manifest): Promise<void> {
  if (pm.ruinIdx >= 0) {
    const p12 = await evaluate<{ pinnedA: string | null | undefined; afterB: string | null | undefined }>(
      `(()=>{const c=document.getElementById("place-card");const A=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');const B=document.querySelector('.place-hit[data-idx="'+${pm.ruinIdx}+'"]');A.focus();A.click();const pinnedA=!c.hidden?(c.querySelector(".pc-name")||{}).textContent:null;B.focus();B.click();const afterB=!c.hidden?(c.querySelector(".pc-name")||{}).textContent:null;document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));return{pinnedA,afterB};})()`,
    );
    check(
      "P12 pin-switch: pin A then activate B switches to B (not dismiss)",
      p12.pinnedA === pm.capName && p12.afterB === pm.ruinName,
      JSON.stringify(p12),
    );
  } else {
    check("P12 pin-switch: seed 42 has a second place to switch to", false, "no ruin in manifest");
  }
}

export async function p13AxDescription({ evaluate, check, axDescription }: SuiteContext, pm: Manifest): Promise<void> {
  if (pm.ruinIdx >= 0) {
    await evaluate(
      `(()=>{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelector('.place-hit[data-idx="'+${pm.ruinIdx}+'"]').focus();})()`,
    );
    const axDesc = await axDescription(`.place-hit[data-idx="${pm.ruinIdx}"]`);
    const readable =
      !!axDesc &&
      axDesc.includes(pm.ruinName + " ") &&
      axDesc.includes("Founded in the year") &&
      axDesc.includes(pm.tale!);
    check(
      "P13 card body reachable as a readable AX description (founding + tale, separated)",
      readable,
      JSON.stringify(axDesc),
    );
    check(
      "P17b the derivation is spoken too, not only drawn",
      !!axDesc && axDesc.includes("A word of the Oromi speech"),
      JSON.stringify(axDesc),
    );
    await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))`);
  }
}

export async function p15RealHover({ evaluate, send, check, sleep }: SuiteContext, pm: Manifest): Promise<void> {
  // A synthetic mouseenter does not set the CSS :hover state, so P15 drives a REAL CDP mouse move; it is the only check that sees the hit under actual hover.
  const p15c = await evaluate<Point>(
    `(()=>{const h=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');h.scrollIntoView({block:"center"});const r=h.getBoundingClientRect();return{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};})()`,
  );
  await mouseMove(send, 5, 5);
  await sleep(40, "pace: the move away lands before the move onto the town");
  await mouseMove(send, p15c.x, p15c.y);
  // Poll, never sleep: ringOp is read to 2dp so it tolerates 0.005, and a fixed wait with four times the slack once went red on this same ring in the zoom suite under Issue #381's second lane.
  const readP15 = () =>
    evaluate<{ bg: string; bw: string; ringOp: string }>(
      `(()=>{const h=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');const cs=getComputedStyle(h);const ring=getComputedStyle(h,"::after");return{bg:cs.backgroundColor,bw:cs.borderTopWidth,ringOp:Number(ring.opacity).toFixed(2)};})()`,
    );
  let p15 = await readP15();
  for (let i = 0; i < 60 && p15.ringOp !== "1.00"; i++) {
    await sleep(50);
    p15 = await readP15();
  }
  await mouseMove(send, 5, 5);
  check(
    "P15 hover keeps the hit transparent + borderless (no button:hover box) and grows the ring",
    p15.bg === "rgba(0, 0, 0, 0)" && p15.bw === "0px" && p15.ringOp === "1.00",
    JSON.stringify(p15),
  );
}
