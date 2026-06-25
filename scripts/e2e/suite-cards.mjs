// Living Chart story-card overlay checks (P1-P13, #53).
// Split from e2e-explorer.mjs; behavior + check order unchanged.
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitSettled, waitAtlas, waitReady, axDescription, serverState, consoleErrors, http4xx, PORT } = ctx;
  // --- P: Living Chart story cards (#53): the DOM overlay over the baked chart.
  // Clean seed-42 antique draw (arms off, no theme) so the marks map to a known
  // manifest and the card screenshot is the standard chart. Placed before the
  // console-health check so it also covers the overlay's hover/focus/pin paths.
  await evaluate(`(()=>{
    document.getElementById("seed").value="42";
    document.getElementById("style").value="antique";
    document.getElementById("theme").value="";
    document.getElementById("type").value="";
    document.getElementById("arms").checked=false;
    document.getElementById("draw").click();
  })()`);
  await waitSettled("place-cards-draw");

  // Derive the capital + a ruin (with its tale) from the page's OWN manifest via
  // the same engine the draw used; each hit's data-idx indexes manifest.places.
  const pm = await evaluate(`(()=>{
    const r=window.__vellumRunInline({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}});
    const places=r.manifest.places;
    const cap=places.findIndex((p)=>p.kind==="capital");
    const ruinIdx=places.findIndex((p)=>p.ruined);
    const tale=ruinIdx>=0?r.manifest.events.find((e)=>e.settlement===ruinIdx&&e.kind==="ruin"):null;
    return{count:places.length,cap,capName:places[cap].name,capFounded:places[cap].founded,ruinIdx,ruinName:ruinIdx>=0?places[ruinIdx].name:null,tale:tale?tale.text:null};
  })()`);

  const p1 = await evaluate(`(()=>{const ov=document.querySelector("#map .place-overlay");const hits=document.querySelectorAll("#map .place-hit").length;const card=!!document.getElementById("place-card");return{ov:!!ov,hits,card};})()`);
  check("P1 overlay built: one hit-target per place + a card host", p1.ov && p1.card && p1.hits === pm.count, `${p1.hits} hits vs ${pm.count} places`);

  // Idle parity: the card is hidden and the hits are truly invisible. The global
  // button{} rule would otherwise paint parchment boxes over the map.
  const p2 = await evaluate(`(()=>{const c=document.getElementById("place-card");const h=document.querySelector(".place-hit");const cs=getComputedStyle(h);const os=getComputedStyle(document.querySelector(".place-overlay"));return{cardHidden:c.hidden===true,bg:cs.backgroundColor,bw:cs.borderTopWidth,ovPe:os.pointerEvents,hitPe:cs.pointerEvents};})()`);
  check("P2 idle: card hidden + hits transparent/borderless (no global-button leak)", p2.cardHidden && p2.bg === "rgba(0, 0, 0, 0)" && p2.bw === "0px", JSON.stringify(p2));
  check("P3 pointer-events: overlay none, hits auto (rest of page stays live)", p2.ovPe === "none" && p2.hitPe === "auto", `ov=${p2.ovPe} hit=${p2.hitPe}`);

  // Keyboard focus a living capital: card shows name + rank + founding, no tale.
  const p4 = await evaluate(`(()=>{const hit=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');hit.focus();const c=document.getElementById("place-card");return{hidden:c.hidden,aria:hit.getAttribute("aria-label"),name:(c.querySelector(".pc-name")||{}).textContent,rank:(c.querySelector(".pc-rank")||{}).textContent,founded:(c.querySelector(".pc-founded")||{}).textContent,tale:!!c.querySelector(".pc-tale")};})()`);
  check("P4 focus a capital: card shows name + Capital + founding year, no tale", p4.hidden === false && p4.name === pm.capName && p4.rank === "Capital" && p4.founded === "Founded in the year " + pm.capFounded + "." && p4.tale === false, JSON.stringify(p4));
  check("P5 hit aria-label is name + rank (matches the card)", p4.aria === pm.capName + ", Capital", `aria=${p4.aria}`);

  // A ruin additionally shows its abandonment tale (the kind-filtered lookup).
  if (pm.ruinIdx >= 0) {
    const p6 = await evaluate(`(()=>{const hit=document.querySelector('.place-hit[data-idx="'+${pm.ruinIdx}+'"]');hit.focus();const c=document.getElementById("place-card");return{rank:(c.querySelector(".pc-rank")||{}).textContent,aria:hit.getAttribute("aria-label"),tale:(c.querySelector(".pc-tale")||{}).textContent};})()`);
    check("P6 focus a ruin: rank Ruin, aria 'name, Ruin', and the abandonment tale", p6.rank === "Ruin" && p6.aria === pm.ruinName + ", Ruin" && p6.tale === pm.tale, JSON.stringify(p6));
  } else {
    check("P6 seed 42 has a ruin to show", false, "no ruin in manifest");
  }

  // Card a11y wiring: role=tooltip + the hit's aria-describedby="place-card" is
  // the screen-reader path to the founding year / ruin tale. No aria-live (a
  // populate-while-hidden region announces unreliably and would double up).
  const p7 = await evaluate(`(()=>{const c=document.getElementById("place-card");const hit=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');return{role:c.getAttribute("role"),live:c.getAttribute("aria-live"),desc:hit.getAttribute("aria-describedby")};})()`);
  check("P7 role=tooltip, hit aria-describedby=place-card, no aria-live", p7.role === "tooltip" && p7.desc === "place-card" && p7.live === null, JSON.stringify(p7));

  // Pin: from a CLOSED card (Escape first so "opened" is meaningful, not vacuous),
  // a tap opens+pins, the card survives a mouseleave, and Escape dismisses it.
  const p8 = await evaluate(`(()=>{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));const c=document.getElementById("place-card");const startHidden=c.hidden;const hit=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');hit.click();const opened=!c.hidden;hit.dispatchEvent(new MouseEvent("mouseleave",{bubbles:true}));const survived=!c.hidden;document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));const closed=c.hidden;return{startHidden,opened,survived,closed};})()`);
  check("P8 tap opens+pins from closed, survives mouseleave, Escape dismisses", p8.startHidden === true && p8.opened && p8.survived && p8.closed, JSON.stringify(p8));

  // Unpinned hover: mouseenter shows, mouseleave dismisses (the desktop hover card).
  const p9 = await evaluate(`(()=>{const c=document.getElementById("place-card");const hit=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');hit.dispatchEvent(new MouseEvent("mouseenter",{bubbles:true}));const shown=!c.hidden;hit.dispatchEvent(new MouseEvent("mouseleave",{bubbles:true}));const gone=c.hidden;return{shown,gone};})()`);
  check("P9 unpinned: mouseenter shows, mouseleave dismisses", p9.shown && p9.gone, JSON.stringify(p9));

  // Unpinned keyboard: focus shows, blur (tab away) dismisses.
  const p10 = await evaluate(`(()=>{const c=document.getElementById("place-card");const hit=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');hit.focus();const shown=!c.hidden;hit.blur();const gone=c.hidden;return{shown,gone};})()`);
  check("P10 unpinned: focus shows, blur dismisses", p10.shown && p10.gone, JSON.stringify(p10));

  // Outside-click: a click off any mark dismisses a pinned card (the listener's
  // fall-through). The card is pointer-events:none, so a real click never lands
  // on it; the #place-card guard is defensive only and not asserted here.
  const p11 = await evaluate(`(()=>{const c=document.getElementById("place-card");const hit=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');hit.click();const pinnedOpen=!c.hidden;document.body.dispatchEvent(new MouseEvent("click",{bubbles:true}));const dismissed=c.hidden;return{pinnedOpen,dismissed};})()`);
  check("P11 outside-click (off any mark) dismisses a pinned card", p11.pinnedOpen && p11.dismissed, JSON.stringify(p11));

  // Pin-switch regression (the review's HIGH bug): pin A, then preview+activate B.
  // The card must SWITCH to B, not dismiss. With the old currentIdx toggle it hid.
  if (pm.ruinIdx >= 0) {
    const p12 = await evaluate(`(()=>{const c=document.getElementById("place-card");const A=document.querySelector('.place-hit[data-idx="'+${pm.cap}+'"]');const B=document.querySelector('.place-hit[data-idx="'+${pm.ruinIdx}+'"]');A.focus();A.click();const pinnedA=!c.hidden?(c.querySelector(".pc-name")||{}).textContent:null;B.focus();B.click();const afterB=!c.hidden?(c.querySelector(".pc-name")||{}).textContent:null;document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));return{pinnedA,afterB};})()`);
    check("P12 pin-switch: pin A then activate B switches to B (not dismiss)", p12.pinnedA === pm.capName && p12.afterB === pm.ruinName, JSON.stringify(p12));
  } else {
    check("P12 pin-switch: seed 42 has a second place to switch to", false, "no ruin in manifest");
  }

  // A11y payoff: focusing a ruin, the hit's COMPUTED accessible description (what
  // a screen reader reads via aria-describedby) must carry the founding year and
  // the tale, and be readable (name separated from rank, not a "NameRank" run-on).
  if (pm.ruinIdx >= 0) {
    await evaluate(`(()=>{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelector('.place-hit[data-idx="'+${pm.ruinIdx}+'"]').focus();})()`);
    const axDesc = await axDescription(`.place-hit[data-idx="${pm.ruinIdx}"]`);
    const readable = !!axDesc && axDesc.includes(pm.ruinName + " ") && axDesc.includes("Founded in the year") && axDesc.includes(pm.tale);
    check("P13 card body reachable as a readable AX description (founding + tale, separated)", readable, JSON.stringify(axDesc));
    await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))`);
  }

  // Artifact: a card open over the chart, for the user to eyeball. Blur first so
  // the focus() always changes the active element and fires (the target may
  // already be focused, in which case a re-focus is a no-op event-wise).
  await evaluate(`(()=>{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();document.querySelector('.place-hit[data-idx="'+${pm.ruinIdx >= 0 ? pm.ruinIdx : pm.cap}+'"]').focus();})()`);
  await shoot("explorer-place-card.png");
  await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))`);

}
