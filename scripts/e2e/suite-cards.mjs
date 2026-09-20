// Living Chart story-card overlay e2e (P1-P15, #53).
import { makeStep } from "./step-support.mjs";
import { makeSettle } from "./settle-support.mjs";
import { sampleRow, luminance } from "./pixel-support.mjs";

export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, wheel, waitSettled, waitReady, axDescription, serverState, setMobileViewport, clearMobile, consoleErrors, http4xx, PORT } = ctx;
  const step = makeStep(ctx);
  const settle = makeSettle(ctx);
  await step("P setup", async () => {
    await evaluate(`(()=>{
      document.getElementById("seed").value="42";
      document.getElementById("style").value="antique";
      document.getElementById("theme").value="";
      document.getElementById("type").value="";
      document.getElementById("arms").checked=false;
      document.getElementById("draw").click();
    })()`);
    await waitSettled("place-cards-draw");
  });

  const pm = await evaluate(`(()=>{
    const r=window.__vellumRunInline({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}});
    const places=r.manifest.places;
    const cap=places.findIndex((p)=>p.kind==="capital");
    const ruinIdx=places.findIndex((p)=>p.ruined);
    const tale=ruinIdx>=0?r.manifest.events.find((e)=>e.settlement===ruinIdx&&e.kind==="ruin"):null;
    const seatIdx=places.findIndex((p)=>p.seat&&p.kind!=="capital");
    const plainIdx=places.findIndex((p)=>!p.ruined&&p.formerName===undefined);
    const formerIdx=places.findIndex((p)=>p.formerName!==undefined);
    return{count:places.length,cap,capName:places[cap].name,capFounded:places[cap].founded,ruinIdx,ruinName:ruinIdx>=0?places[ruinIdx].name:null,tale:tale?tale.text:null,seatIdx,seatName:seatIdx>=0?places[seatIdx].name:null,capSeat:places[cap].seat,formerIdx,formerName:formerIdx>=0?places[formerIdx].formerName:null,plainIdx};
  })()`);

  const p1 = await evaluate(`(()=>{const ov=document.querySelector("#map .place-overlay");const hits=document.querySelectorAll("#map .place-hit").length;const card=!!document.getElementById("place-card");return{ov:!!ov,hits,card};})()`);
  check("P1 overlay built: one hit-target per place + a card host", p1.ov && p1.card && p1.hits === pm.count, `${p1.hits} hits vs ${pm.count} places`);

  const p2 = await evaluate(`(()=>{const c=document.getElementById("place-card");const h=document.querySelector(".place-hit");const cs=getComputedStyle(h);const os=getComputedStyle(document.querySelector(".place-overlay"));return{cardHidden:c.hidden===true,bg:cs.backgroundColor,bw:cs.borderTopWidth,ovPe:os.pointerEvents,hitPe:cs.pointerEvents};})()`);
  check("P2 idle: card hidden + hits transparent/borderless (no global-button leak)", p2.cardHidden && p2.bg === "rgba(0, 0, 0, 0)" && p2.bw === "0px", JSON.stringify(p2));
  check("P3 pointer-events: overlay none, hits auto (rest of page stays live)", p2.ovPe === "none" && p2.hitPe === "auto", `ov=${p2.ovPe} hit=${p2.hitPe}`);

  // P2 is idle-only, so a dropped :not(.place-hit) exclusion would leave it green; this P2b/P2c pair is the guard that actually bites that mutation.
  const p2m = await evaluate(`(()=>{const b=getComputedStyle(document.getElementById("draw")).transitionDuration;const h=getComputedStyle(document.querySelector(".place-hit")).transitionDuration;return{btn:b,hit:h};})()`);
  check("P2b press/lift reaches buttons (motion.css loaded + applied)", p2m.btn.includes("0.18s"), `#draw transition-duration=${p2m.btn}`);
  check("P2c press/lift does NOT reach .place-hit (exclusion holds)", p2m.hit === "0s", `.place-hit transition-duration=${p2m.hit}`);

  const p4 = await evaluate(`(()=>{const hit=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');hit.focus();const c=document.getElementById("place-card");return{hidden:c.hidden,aria:hit.getAttribute("aria-label"),name:(c.querySelector(".pc-name")||{}).textContent,rank:(c.querySelector(".pc-rank")||{}).textContent,founded:(c.querySelector(".pc-founded")||{}).textContent,tale:!!c.querySelector(".pc-tale")};})()`);
  check("P4 focus a capital: card shows name + Capital + founding year, no tale", p4.hidden === false && p4.name === pm.capName && p4.rank === "Capital" && p4.founded === "Founded in the year " + pm.capFounded + "." && p4.tale === false, JSON.stringify(p4));
  check("P5 hit aria-label is name + rank (matches the card)", p4.aria === pm.capName + ", Capital", `aria=${p4.aria}`);

  if (pm.seatIdx >= 0) {
    const p5b = await evaluate(`(()=>{const hit=document.querySelector('.place-hit[data-idx="'+${pm.seatIdx}+'"]');hit.focus();const c=document.getElementById("place-card");return{hidden:c.hidden,name:(c.querySelector(".pc-name")||{}).textContent,rank:(c.querySelector(".pc-rank")||{}).textContent,aria:hit.getAttribute("aria-label"),tale:!!c.querySelector(".pc-tale")};})()`);
    check("P5b focus a realm seat: rank 'Realm Seat', aria matches, no tale", p5b.hidden === false && p5b.rank === "Realm Seat" && p5b.name === pm.seatName && p5b.aria === pm.seatName + ", Realm Seat" && p5b.tale === false, JSON.stringify(p5b));
    // Wait out paperUnfurl before shooting: the card mounts at the animation's first keyframe (fill both), so an immediate shot catches it at zero scale and shows no card at all.
    await evaluate(`(()=>{document.querySelector('.place-hit[data-idx="'+${pm.seatIdx}+'"]').click();})()`);
    await sleep(500);
    await shoot("explorer-place-card-seat.png");
    await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))`);
  } else {
    check("P5b seed 42 has a non-capital realm seat to show", false, "no seat in manifest");
  }
  check("P5c the grand capital carries seat===true yet still ranks Capital", pm.capSeat === true && p4.rank === "Capital", `capSeat=${pm.capSeat} rank=${p4.rank}`);

  if (pm.ruinIdx >= 0) {
    const p6 = await evaluate(`(()=>{const hit=document.querySelector('.place-hit[data-idx="'+${pm.ruinIdx}+'"]');hit.focus();const c=document.getElementById("place-card");return{rank:(c.querySelector(".pc-rank")||{}).textContent,aria:hit.getAttribute("aria-label"),tale:(c.querySelector(".pc-tale")||{}).textContent};})()`);
    check("P6 focus a ruin: rank Ruin, aria 'name, Ruin', and the abandonment tale", p6.rank === "Ruin" && p6.aria === pm.ruinName + ", Ruin" && p6.tale === pm.tale, JSON.stringify(p6));
  } else {
    check("P6 seed 42 has a ruin to show", false, "no ruin in manifest");
  }

  // No aria-live on purpose: a populate-while-hidden region announces unreliably and would double up with the aria-describedby path.
  const p7 = await evaluate(`(()=>{const c=document.getElementById("place-card");const hit=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');return{role:c.getAttribute("role"),live:c.getAttribute("aria-live"),desc:hit.getAttribute("aria-describedby")};})()`);
  check("P7 role=tooltip, hit aria-describedby=place-card, no aria-live", p7.role === "tooltip" && p7.desc === "place-card" && p7.live === null, JSON.stringify(p7));

  const p8 = await evaluate(`(()=>{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));const c=document.getElementById("place-card");const startHidden=c.hidden;const hit=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');hit.click();const opened=!c.hidden;hit.dispatchEvent(new MouseEvent("mouseleave",{bubbles:true}));const survived=!c.hidden;document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));const closed=c.hidden;return{startHidden,opened,survived,closed};})()`);
  check("P8 tap opens+pins from closed, survives mouseleave, Escape dismisses", p8.startHidden === true && p8.opened && p8.survived && p8.closed, JSON.stringify(p8));

  const p9 = await evaluate(`(()=>{const c=document.getElementById("place-card");const hit=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');hit.dispatchEvent(new MouseEvent("mouseenter",{bubbles:true}));const shown=!c.hidden;hit.dispatchEvent(new MouseEvent("mouseleave",{bubbles:true}));const gone=c.hidden;return{shown,gone};})()`);
  check("P9 unpinned: mouseenter shows, mouseleave dismisses", p9.shown && p9.gone, JSON.stringify(p9));

  const p10 = await evaluate(`(()=>{const c=document.getElementById("place-card");const hit=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');hit.focus();const shown=!c.hidden;hit.blur();const gone=c.hidden;return{shown,gone};})()`);
  check("P10 unpinned: focus shows, blur dismisses", p10.shown && p10.gone, JSON.stringify(p10));

  const p11 = await evaluate(`(()=>{const c=document.getElementById("place-card");const hit=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');hit.click();const pinnedOpen=!c.hidden;document.body.dispatchEvent(new MouseEvent("click",{bubbles:true}));const dismissed=c.hidden;return{pinnedOpen,dismissed};})()`);
  check("P11 outside-click (off any mark) dismisses a pinned card", p11.pinnedOpen && p11.dismissed, JSON.stringify(p11));

  if (pm.ruinIdx >= 0) {
    const p12 = await evaluate(`(()=>{const c=document.getElementById("place-card");const A=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');const B=document.querySelector('.place-hit[data-idx="'+${pm.ruinIdx}+'"]');A.focus();A.click();const pinnedA=!c.hidden?(c.querySelector(".pc-name")||{}).textContent:null;B.focus();B.click();const afterB=!c.hidden?(c.querySelector(".pc-name")||{}).textContent:null;document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));return{pinnedA,afterB};})()`);
    check("P12 pin-switch: pin A then activate B switches to B (not dismiss)", p12.pinnedA === pm.capName && p12.afterB === pm.ruinName, JSON.stringify(p12));
  } else {
    check("P12 pin-switch: seed 42 has a second place to switch to", false, "no ruin in manifest");
  }

  if (pm.ruinIdx >= 0) {
    await evaluate(`(()=>{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelector('.place-hit[data-idx="'+${pm.ruinIdx}+'"]').focus();})()`);
    const axDesc = await axDescription(`.place-hit[data-idx="${pm.ruinIdx}"]`);
    const readable = !!axDesc && axDesc.includes(pm.ruinName + " ") && axDesc.includes("Founded in the year") && axDesc.includes(pm.tale);
    check("P13 card body reachable as a readable AX description (founding + tale, separated)", readable, JSON.stringify(axDesc));
    await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))`);
  }

  const p14 = await evaluate(`(()=>{
    const c = document.getElementById("place-card");
    if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
    document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));
    const cap = document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');
    cap.dispatchEvent(new MouseEvent("mouseenter",{bubbles:true}));
    const ih = c.querySelector(".pc-inner");
    const csh = ih ? getComputedStyle(ih) : null;
    const hoverName = csh ? csh.animationName : null;
    const hoverDur = csh ? parseFloat(csh.animationDuration) : null;
    const pinnedAtHover = c.classList.contains("pinned");
    cap.dispatchEvent(new MouseEvent("mouseleave",{bubbles:true}));
    cap.click();
    const ip = c.querySelector(".pc-inner");
    const csp = ip ? getComputedStyle(ip) : null;
    const pinName = csp ? csp.animationName : null;
    const pinDur = csp ? parseFloat(csp.animationDuration) : null;
    const pinnedAtPin = c.classList.contains("pinned");
    document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));
    return {hoverName,hoverDur,pinName,pinDur,pinnedAtHover,pinnedAtPin};
  })()`);
  check("P14 card unfurl wired: .pc-inner runs paperUnfurl, pinned grade > hover grade, .pinned only on pin",
    p14.hoverName === "paperUnfurl" && p14.pinName === "paperUnfurl" &&
    p14.pinnedAtHover === false && p14.pinnedAtPin === true &&
    Number.isFinite(p14.pinDur) && Number.isFinite(p14.hoverDur) && p14.pinDur > p14.hoverDur,
    JSON.stringify(p14));

  // A synthetic mouseenter does not set the CSS :hover state, so P15 drives a REAL CDP mouse move; it is the only check that sees the hit under actual hover.
  const p15c = await evaluate(`(()=>{const h=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');h.scrollIntoView({block:"center"});const r=h.getBoundingClientRect();return{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};})()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5, buttons: 0 });
  await sleep(40);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: p15c.x, y: p15c.y, buttons: 0 });
  // Poll, never sleep: ringOp is read to 2dp so it tolerates 0.005, and this is the same ring Z8b reads in suite-zoom, where a fixed wait with four times the slack still went red under #381's second lane.
  const readP15 = () => evaluate(`(()=>{const h=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');const cs=getComputedStyle(h);const ring=getComputedStyle(h,"::after");return{bg:cs.backgroundColor,bw:cs.borderTopWidth,ringOp:Number(ring.opacity).toFixed(2)};})()`);
  let p15 = await readP15();
  for (let i = 0; i < 60 && p15.ringOp !== "1.00"; i++) {
    await sleep(50);
    p15 = await readP15();
  }
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5, buttons: 0 });
  check("P15 hover keeps the hit transparent + borderless (no button:hover box) and grows the ring", p15.bg === "rgba(0, 0, 0, 0)" && p15.bw === "0px" && p15.ringOp === "1.00", JSON.stringify(p15));

  // #124 the philologist's glass: seed 42 speaks oromi (the seed-42 covenant pins that), so the tongue line is checkable by name and not merely by shape.
  const p16 = await evaluate(`(()=>{
    if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
    const hit=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');
    hit.focus();
    const c=document.getElementById("place-card");
    return{
      tongue:(c.querySelector(".pc-tongue")||{}).textContent,
      roots:(c.querySelector(".pc-roots")||{}).textContent,
      former:(c.querySelector(".pc-former")||{}).textContent,
      order:[...c.querySelectorAll(".pc-inner > *")].map((e)=>e.className).join(","),
      // Since #522 the card's actions sit in ONE row, so the order string names the ROW and the row's own members are read beside it: without this the re-pin would drop what the old string proved, that the actions stand between the founding and the tale.
      acts:[...c.querySelectorAll(".pc-acts > *")].map((e)=>e.className).join(","),
    };
  })()`);
  check("P16 the glass reads the capital's name: tongue, syllabified word, glossed roots (#124), and the card's ACTION ROW stands between the founding and the note with both actions inside it (#522)",
    typeof p16.tongue === "string" && p16.tongue.startsWith("A word of the Oromi speech: ") && p16.tongue.includes("·") &&
    typeof p16.roots === "string" && p16.roots.includes(", ") && !p16.roots.startsWith("Of uncertain") &&
    p16.order.split(",").filter((c)=>c!=="pc-former").join(",") === "pc-name,pc-rank,pc-founded,pc-acts,pc-tongue,pc-roots" &&
    p16.acts === "pc-prospect,pc-lay",
    JSON.stringify(p16));
  if (pm.formerIdx >= 0) {
    const p18 = await evaluate(`(()=>{
      if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
      document.querySelector('.place-hit[data-idx="'+${pm.formerIdx}+'"]').focus();
      const c=document.getElementById("place-card");
      return{former:(c.querySelector(".pc-former")||{}).textContent,order:[...c.querySelectorAll(".pc-inner > *")].map((e)=>e.className).join(",")};
    })()`);
    check("P18 a renamed place states its former name plainly, between the founding and the slip (#49)",
      p18.former === `Once called ${pm.formerName}.` &&
      p18.order === "pc-name,pc-rank,pc-founded,pc-former,pc-acts,pc-tongue,pc-roots",
      JSON.stringify(p18));
  } else {
    check("P18 seed 42 has a renamed place to read", false, "none in manifest");
  }

  if (pm.plainIdx >= 0) {
    const p18b = await evaluate(`(()=>{
      if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
      document.querySelector('.place-hit[data-idx="'+${pm.plainIdx}+'"]').focus();
      const c=document.getElementById("place-card");
      return{former:!!c.querySelector(".pc-former"),order:[...c.querySelectorAll(".pc-inner > *")].map((e)=>e.className).join(",")};
    })()`);
    check("P18b a place that was never renamed shows no former line at all (#49)",
      p18b.former === false && p18b.order === "pc-name,pc-rank,pc-founded,pc-acts,pc-tongue,pc-roots",
      JSON.stringify(p18b));
  } else {
    check("P18b seed 42 has an unrenamed living place to read", false, "none in manifest");
  }

  if (pm.ruinIdx >= 0) {
    const p17 = await evaluate(`(()=>{
      const hit=document.querySelector('.place-hit[data-idx="'+${pm.ruinIdx}+'"]');
      hit.focus();
      const c=document.getElementById("place-card");
      return{
        order:[...c.querySelectorAll(".pc-inner > *")].map((e)=>e.className).join(","),
        tale:(c.querySelector(".pc-tale")||{}).textContent,
        roots:(c.querySelector(".pc-roots")||{}).textContent,
      };
    })()`);
    check("P17 a ruin keeps its tale and gains the note beneath it, in that order (#124)",
      p17.order === "pc-name,pc-rank,pc-founded,pc-acts,pc-tale,pc-tongue,pc-roots" &&
      p17.tale === pm.tale && typeof p17.roots === "string" && p17.roots.length > 0,
      JSON.stringify(p17));
    const axDesc16 = await axDescription(`.place-hit[data-idx="${pm.ruinIdx}"]`);
    check("P17b the derivation is spoken too, not only drawn", !!axDesc16 && axDesc16.includes("A word of the Oromi speech"), JSON.stringify(axDesc16));
  } else {
    check("P17 seed 42 has a ruin to read", false, "no ruin in manifest");
  }
  await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))`);

  await evaluate(`(()=>{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelector('.place-hit[data-idx="'+${pm.ruinIdx >= 0 ? pm.ruinIdx : pm.cap}+'"]').focus();})()`);
  await sleep(500);
  await shoot("explorer-place-card.png");
  await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))`);

  // #633: a card taller than its box cannot be fitted by any offset, so the bound IS the principle and the sweep only confirms it. The 0.5px tolerance is for the sub-pixel residual of a cap published in CSS pixels from a fractional rect; it cannot hide a real regression, whose smallest measured instance is 8.61px (seed 5 at 390 on main, 2026-09-19).
  // #633: a card taller than its box cannot be fitted by any offset, so the bound IS the principle. Swept 2026-09-19: the smallest real overage measured is 8.61px, so 0.5px is the sub-pixel residual of a cap published from a fractional rect and cannot hide one.
  const OVER_BOX_TOLERANCE = 0.5;
  // Swept 2026-09-20 over the 9 capped cards of the four sitting seeds at 320 (out/633-fade-sweep.mjs): the fade lifts the foot row between 7.8 and 25.9 above the same card's own text, and this same build with the fade rule deleted reads -2.8, so 4.0 sits below the worst case and 6.8 above that control. A floor of 12, picked before the sweep, would have failed on Laihoanui at 7.8.
  const FADE_LIFT_FLOOR = 4.0;
  // Seed 4294967295 is the WITNESS that makes this bite: its Kralgov card measured 150.95px past a 247.02px box at 320 and 61.27px past a 301.05px box at 390 on main at 18bacfd. Every place is measured, not that one card, because the defect is a class and a copy change that promotes a different place to the worst would leave a single-card guard green.
  const NARROW_SEED = 4294967295;
  const narrowCount = await evaluate(`window.__vellumRunInline({kind:"draw",seed:${NARROW_SEED},overrides:{},render:{style:"antique",widthPx:1500,legend:true}}).manifest.places.length`);
  // Focus rather than a pointer, deliberately: focus reaches EVERY mark, including the ones a neighbour's 26px hit covers at rest, and showPlaceCard composes the same card on both paths. Whether a pointer can reach a mark is a different question with its own issue.
  const SWEEP = `(() => {
    const vp = document.getElementById("map-viewport");
    if (!vp) return { error: "no map-viewport" };
    const v = vp.getBoundingClientRect();
    const rows = [];
    for (const h of document.querySelectorAll(".place-overlay .place-hit")) {
      const want = (h.getAttribute("aria-label") || "").split(", ")[0];
      h.focus();
      const card = document.getElementById("place-card");
      if (!card || card.hidden) { rows.push({ want, shown: false }); continue; }
      const got = (card.querySelector(".pc-name") || {}).textContent;
      const c = card.getBoundingClientRect();
      rows.push({ want, got, shown: true, h: +c.height.toFixed(2), over: +(c.height - v.height).toFixed(2) });
    }
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    return { boxW: +v.width.toFixed(2), boxH: +v.height.toFixed(2), rows };
  })()`;
  const sweepAt = async (width) => {
    await setMobileViewport(width, 844);
    // The metrics override has to be in effect BEFORE the boot navigate, and this suite otherwise never navigates at all, so the group re-boots through about:blank rather than resizing the page it inherited.
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#seed=${NARROW_SEED}&style=antique` });
    if (!(await waitReady())) throw new Error(`P19 the explorer never drew at ${width}`);
    // The card's height is set by wrapped text, so a face still swapping in measures a different card.
    let fonts = null;
    for (let i = 0; i < 100; i++) {
      fonts = await evaluate(`document.fonts ? document.fonts.status : "no-fonts-api"`);
      if (fonts !== "loading") break;
      await sleep(50);
    }
    if (fonts === "loading") throw new Error(`P19 the faces never finished loading at ${width}`);
    const d = await evaluate(SWEEP);
    if (!d || d.error) throw new Error(`P19 the sweep found no chart box at ${width}: ${JSON.stringify(d)}`);
    return d;
  };
  const verdict = (d, width) => {
    const missed = d.rows.filter((r) => !r.shown || r.got !== r.want);
    const worst = d.rows.filter((r) => r.shown).sort((a, b) => b.over - a.over)[0];
    return {
      ok: d.rows.length === narrowCount && missed.length === 0 && !!worst && worst.over <= OVER_BOX_TOLERANCE,
      detail: JSON.stringify({ width, box: `${d.boxW}x${d.boxH}`, places: d.rows.length, of: narrowCount, missed: missed.map((r) => r.want), worst }),
    };
  };

  await step("P19, P19b", async () => {
    const at390 = verdict(await sweepAt(390), 390);
    check("P19 at the ruled phone width no place card is taller than the chart box it is clamped into (#633)", at390.ok, at390.detail);
    const at320 = verdict(await sweepAt(320), 320);
    check("P19b and the same holds at 320, where two cards in three were over the box before this (#633)", at320.ok, at320.detail);
  });

  // #633: these stand on the 320 page P19b left, where the cap bites. They are the half P19 and P19b cannot see: those two read the card's own rect, and a rect is blind to whether the overflow scrolls, whether the card answers a pointer, and whether anything is painted to say the card goes on.
  await step("P20 to P26", async () => {
    // The unpinned arm reads a card that is SHOWN: a hidden one reports its host's pointer-events by inheritance and would pass whatever this rule said.
    const at = await evaluate(`(() => {
      const hit = [...document.querySelectorAll(".place-overlay .place-hit")].find((e) => (e.getAttribute("aria-label") || "").split(", ")[0] === "Kralgov");
      if (!hit) return { error: "no Kralgov" };
      hit.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      const card = document.getElementById("place-card");
      const inner = card && card.querySelector(".pc-inner");
      const b = hit.getBoundingClientRect();
      return { shownUnpinned: !!card && !card.hidden && !card.classList.contains("pinned"),
        restPe: inner ? getComputedStyle(inner).pointerEvents : null,
        x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) };
    })()`);
    if (at.error) throw new Error(`P20 ${at.error}`);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: at.x, y: at.y });
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: at.x, y: at.y, button: "left", clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: at.x, y: at.y, button: "left", clickCount: 1 });
    const open = await settle(
      `(() => { const c = document.getElementById("place-card"); if (!c || c.hidden) return null; const i = c.querySelector(".pc-inner"); const r = c.getBoundingClientRect(); const cs = getComputedStyle(i);
        return { name: (c.querySelector(".pc-name") || {}).textContent, pinned: c.classList.contains("pinned"), more: c.classList.contains("pc-more"),
          pe: cs.pointerEvents, over: +(i.scrollHeight - i.clientHeight).toFixed(2), top: +r.top.toFixed(2), bottom: +r.bottom.toFixed(2), left: +r.left.toFixed(2), right: +r.right.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; })()`,
      (d, last) => !!d && d.name === "Kralgov" && d.pinned && !!last && last.name === "Kralgov" && d.h === last.h && d.pe === last.pe,
      "P20 Kralgov pinned at 320",
    );
    check("P20 a SHOWN unpinned card does not take the pointer and a pinned scrolling one does, or the card takes it from its own mark (#633)",
      at.shownUnpinned === true && at.restPe === "none" && open.pe === "auto",
      JSON.stringify({ shownUnpinned: at.shownUnpinned, unpinned: at.restPe, pinned: open.pe }));
    check("P21 the capped card carries the mark that says it continues, and it has something left to show (#633)",
      open.more === true && open.over > 1, JSON.stringify({ more: open.more, hiddenTail: open.over }));

    // A rect cannot see paint, so the fade is read as pixels: the foot row against this same card's own mid-height row, which carries text on every build and is the control.
    const foot = await sampleRow(send, Math.round(open.left), Math.round(open.bottom) - 6, Math.round(open.right - open.left));
    const mid = await sampleRow(send, Math.round(open.left), Math.round(open.top + open.h / 2), Math.round(open.right - open.left));
    const median = (px) => { const l = px.map(luminance).sort((a, b) => a - b); return +l[Math.floor(l.length / 2)].toFixed(1); };
    const lift = +(median(foot) - median(mid)).toFixed(1);
    check("P22 the fade actually PAINTS: the card's foot reads lighter than its own text (#633)",
      lift >= FADE_LIFT_FLOOR, JSON.stringify({ lift, floor: FADE_LIFT_FLOOR, foot: median(foot), mid: median(mid) }));

    // P26 is P24's positive half: P24 proves a card with NO tail releases the gesture, and a guard that only proves the negative is half a guard.
    const beforeWheel = await evaluate(`(() => { const i = document.querySelector("#place-card .pc-inner"); return { scrollTop: +i.scrollTop.toFixed(2), k: window.__vellumZoomState().k }; })()`);
    const onCard = { x: Math.round(open.left + (open.right - open.left) / 2), y: Math.round(open.top + open.h / 2) };
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: onCard.x, y: onCard.y });
    await sleep(120);
    await wheel(onCard.x, onCard.y, 240);
    await sleep(600);
    const afterWheel = await evaluate(`(() => { const i = document.querySelector("#place-card .pc-inner"); return { scrollTop: +i.scrollTop.toFixed(2), k: window.__vellumZoomState().k }; })()`);
    check("P26 a pinned card that HAS a tail holds the wheel and scrolls it, and the camera under it stays put (#633)",
      afterWheel.scrollTop > beforeWheel.scrollTop + 1 && afterWheel.k === beforeWheel.k,
      JSON.stringify({ before: beforeWheel, after: afterWheel }));
    await evaluate(`(() => { const i = document.querySelector("#place-card .pc-inner"); i.scrollTop = 0; })()`);
    await sleep(200);

    const bare = await evaluate(`(() => { const c = document.getElementById("place-card").getBoundingClientRect(); const v = document.getElementById("map-viewport").getBoundingClientRect(); return { x: Math.round(v.left + 20), y: Math.round(c.top > v.top + 48 ? v.top + 20 : v.bottom - 20), k: window.__vellumZoomState().k }; })()`);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: bare.x, y: bare.y });
    await sleep(120);
    await wheel(bare.x, bare.y, -240);
    const deep = await settle(
      `(() => { const c = document.getElementById("place-card"); if (!c || c.hidden) return null; const v = document.getElementById("map-viewport").getBoundingClientRect(); const r = c.getBoundingClientRect();
        return { k: window.__vellumZoomState().k, w: +r.width.toFixed(2), h: +r.height.toFixed(2), boxH: +v.height.toFixed(2), over: +(r.height - v.height).toFixed(2) }; })()`,
      (d, last) => !!d && d.k > 1.05 && !!last && d.k === last.k && d.h === last.h,
      "P23 the camera coming to rest above k=1",
    );
    // The card is a fixed 16rem, so its rendered width is the control that says which way the scales compose: unchanged means the counter-scale cancels the mount and the cap must be raw.
    check("P23 the cap still holds once the reader zooms, and the card's own width proves the scales cancel (#633)",
      deep.k > 1.05 && deep.w === open.w && deep.over <= OVER_BOX_TOLERANCE,
      JSON.stringify({ kBefore: bare.k, kAfter: deep.k, widthAtRest: open.w, widthDeep: deep.w, box: deep.boxH, card: deep.h, over: deep.over }));

    // P25: the scroll offset belongs to the CONTAINER, so a card switched to from a scrolled one opened at the old offset with its own name above the fold. Switched by focus, because a pinned card's body can cover the next mark and a click would never reach it.
    await evaluate(`(() => { const i = document.querySelector("#place-card .pc-inner"); i.scrollTop = i.scrollHeight; })()`);
    // The gesture goes in its OWN call: inside a polled expression the second poll clicks the same mark again and toggles the card shut, which is how the first version of this check timed out on a null read.
    await evaluate(`(() => { const h = [...document.querySelectorAll(".place-overlay .place-hit")].find((e) => (e.getAttribute("aria-label") || "").split(", ")[0] === "Skenitsa"); if (h) { h.focus(); h.click(); } })()`);
    const switched = await settle(
      `(() => { const c = document.getElementById("place-card"); if (!c || c.hidden) return null; const i = c.querySelector(".pc-inner"); const n = c.querySelector(".pc-name");
        const ir = i.getBoundingClientRect(), nr = n.getBoundingClientRect();
        return { name: n.textContent, scrollTop: +i.scrollTop.toFixed(2), nameBelowTop: +(nr.top - ir.top).toFixed(2), h: +c.getBoundingClientRect().height.toFixed(2) }; })()`,
      (d, last) => !!d && !!last && d.h === last.h && d.scrollTop === last.scrollTop,
      "P25 the card after a switch from a scrolled one",
    );
    check("P25 a card switched to from a scrolled one opens at its own top, with its name below the fold and not above it (#633)",
      switched.scrollTop === 0 && switched.nameBelowTop >= 0, JSON.stringify(switched));

    await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))`);
    await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  });

  // #633: the other half of the cold review's second finding. A pinned card that has nothing to scroll must NOT eat the camera, and at the ruled phone width that is EVERY card, over roughly half the chart.
  await step("P24", async () => {
    await setMobileViewport(390, 844);
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#seed=${NARROW_SEED}&style=antique` });
    if (!(await waitReady())) throw new Error("P24 the explorer never drew at 390");
    const at = await evaluate(`(() => { const h = [...document.querySelectorAll(".place-overlay .place-hit")].find((e) => (e.getAttribute("aria-label") || "").split(", ")[0] === "Kralgov"); const b = h.getBoundingClientRect(); return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }; })()`);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: at.x, y: at.y });
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: at.x, y: at.y, button: "left", clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: at.x, y: at.y, button: "left", clickCount: 1 });
    const card = await settle(
      `(() => { const c = document.getElementById("place-card"); if (!c || c.hidden) return null; const i = c.querySelector(".pc-inner"); const r = c.getBoundingClientRect();
        return { name: (c.querySelector(".pc-name") || {}).textContent, pinned: c.classList.contains("pinned"), scrolls: c.classList.contains("pc-scrolls"),
          tail: +(i.scrollHeight - i.clientHeight).toFixed(2), pe: getComputedStyle(i).pointerEvents, k: window.__vellumZoomState().k,
          x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), h: +r.height.toFixed(2) }; })()`,
      (d, last) => !!d && d.name === "Kralgov" && d.pinned && !!last && d.h === last.h,
      "P24 Kralgov pinned at 390",
    );
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: card.x, y: card.y });
    await sleep(120);
    await wheel(card.x, card.y, -240);
    await sleep(600);
    const after = await evaluate(`window.__vellumZoomState().k`);
    check("P24 a pinned card with nothing to scroll does NOT swallow the camera under it (#633)",
      card.tail <= 1 && card.scrolls === false && card.pe === "none" && after > card.k + 0.05,
      JSON.stringify({ tail: card.tail, scrolls: card.scrolls, pointerEvents: card.pe, kBefore: card.k, kAfterWheelOverCard: after }));
    await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))`);
    await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  });

  await step("P restore", async () => {
    // settle-doctrine clause 14: the next suite starts on whatever page is current, and the runner's viewport reset is the ERROR path only.
    await clearMobile();
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/` });
    if (!(await waitReady())) throw new Error("P restore the explorer never drew again");
  });
}
