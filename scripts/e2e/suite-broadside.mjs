// Broadside e2e (BR1-BR8, #270): the regrouped controls, seals, journal button, and footnote apparatus on the built running page (the unit pins in test/site/broadside.test.ts hold the SOURCE to this shape); self-contained with scoped deltas.
export async function run(ctx) {
  const { evaluate, send, check, sleep, waitSettled, waitReady, touch, setMobileViewport, clearMobile, consoleErrors, http4xx, PORT } = ctx;

  const EXP = `http://127.0.0.1:${PORT}/explorer/`;
  const errBase = consoleErrors.length;
  const httpBase = http4xx.length;

  const goto = async (url, label) => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url });
    await waitReady();
    await waitSettled(label);
  };
  const waitInked = async (label) => {
    for (let i = 0; i < 120; i++) {
      if (await evaluate(`!!document.querySelector("#map .voyage-overlay .voyage-track")`)) return;
      await sleep(50);
    }
    throw new Error("waitInked timeout " + label);
  };
  const gotoPlain = async (url, label) => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url });
    for (let i = 0; i < 100; i++) {
      if (await evaluate(`document.readyState === "complete"`)) return;
      await sleep(50);
    }
    throw new Error("gotoPlain timeout " + label);
  };

  await goto(EXP + "#seed=42&style=antique", "broadside-base");
  const br1 = await evaluate(`(()=>{
    const groupOf=(id)=>{const el=document.getElementById(id);const g=el&&el.closest('[role="group"]');
      return g?(g.getAttribute("aria-labelledby")||g.getAttribute("aria-label")):null;};
    // #463: the seed row stands in the folio (#462 ruling 8), the rest of the Press is the legend row (ruling 4).
    const want={seed:"The seed",random:"The seed",draw:"The seed",type:"grp-land",band:"grp-land",land:"grp-land",coast:"grp-land",
      style:"grp-hand",theme:"grp-hand",legend:"grp-hand",arms:"grp-hand",ages:"grp-hand",
      "verso-turn":"grp-press","order-plates":"grp-press","journal-link":"grp-press"};
    const wrong=Object.entries(want).filter(([id,g])=>groupOf(id)!==g).map(([id])=>id+":"+groupOf(id));
    const heads=["grp-land","grp-hand","grp-press"].map((id)=>(document.getElementById(id)||{}).textContent);
    return{wrong,heads};
  })()`);
  check(
    "BR1 every control sits in its wiring-truth group: the seed row in the folio, Land and Hand on the slip, the Press as the legend row",
    br1.wrong.length === 0 && br1.heads.join("|").startsWith("The Land|The Hand|The Press"),
    JSON.stringify(br1),
  );

  const br1b = await evaluate(`(()=>{
    const l=document.getElementById("land").getBoundingClientRect();
    const c=document.getElementById("coast").getBoundingClientRect();
    return{lLeft:Math.round(l.left*10)/10,cLeft:Math.round(c.left*10)/10,
      lRight:Math.round(l.right*10)/10,cRight:Math.round(c.right*10)/10};
  })()`);
  check(
    "BR1b the sea-level and coast tracks share both edges (equal length, one column)",
    Math.abs(br1b.lLeft - br1b.cLeft) <= 1 && Math.abs(br1b.lRight - br1b.cRight) <= 1,
    JSON.stringify(br1b),
  );

  // #463 plate read: the legend row overlapped the slip's corner at 1280 and the chart folio after a resize (a mid-transition rect read the old seat). The row is placed by measurement now; both widths and the resize are the class.
  const legendRoom = `(()=>{const r=(sel)=>{const el=document.querySelector(sel);if(!el)return null;const b=el.getBoundingClientRect();return{l:Math.round(b.left*10)/10,r:Math.round(b.right*10)/10,t:Math.round(b.top),b:Math.round(b.bottom),w:Math.round(b.width)};};
    const lg=r(".legend"),bl=r(".corner.bl"),sl=r("#broadside"),gl=r(".corner.br"),sh=r("#sheet");
    const range=document.createRange();let text=0;for(const p of document.querySelectorAll(".corner.bl p")){if(!p.textContent)continue;range.selectNodeContents(p);text=Math.max(text,range.getBoundingClientRect().right);}
    return{lg,bl,sl,gl,sh,folioText:Math.round(text),w:innerWidth,h:innerHeight};})()`;
  const legendClear = (m) => !!m.lg && m.lg.l >= m.folioText + 16 && m.lg.r <= m.sl.l - 8 && m.lg.r <= m.gl.l - 8 &&
    m.sh.r <= m.gl.l - 8 && m.sh.b <= Math.min(m.bl.t, m.lg.t) - 8;
  await sleep(400); // the row's left transitions 0.32s to its measured seat; a read mid-flight is the old seat
  const at1280 = await evaluate(legendRoom);
  await send("Emulation.setDeviceMetricsOverride", { width: 1680, height: 900, deviceScaleFactor: 1, mobile: false });
  await sleep(600);
  const at1680 = await evaluate(legendRoom);
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await sleep(600);
  const back = await evaluate(legendRoom);
  await send("Emulation.clearDeviceMetricsOverride");
  await sleep(600);
  check(
    "BR1c the legend row and the sheet clear the chart folio, the Glass and the open slip at 1280, at 1680 after a resize, and back again (#463)",
    legendClear(at1280) && legendClear(at1680) && legendClear(back),
    JSON.stringify({ at1280, at1680, back }),
  );

  // Tick, wait-for-ink, and untick are three separate turns (#300): inside ONE evaluate the yield cancels the arm before it builds, so `during` would be measured on a never-armed sheet.
  const at = `((el)=>({shown:el.getClientRects().length>0,top:Math.round(el.getBoundingClientRect().top)}))`;
  const before = await evaluate(`(()=>{
    const j=document.getElementById("journal-link"),o=document.getElementById("order-plates");const at=${at};
    return{j:at(j),o:at(o),cls:j.className===o.className&&j.classList.contains("legend-btn")};
  })()`);
  await evaluate(`(()=>{const c=document.getElementById("ages");c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitInked("br2-survey-ink");
  const during = await evaluate(`(()=>{const at=${at};return at(document.getElementById("journal-link"));})()`);
  await evaluate(`(()=>{const c=document.getElementById("ages");c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  const after = await evaluate(`(()=>{const at=${at};return at(document.getElementById("journal-link"));})()`);
  const br2 = { before, during, after, sameRow: before.j.top === before.o.top };
  check(
    "BR2 the journal button is the print link's steady gold peer: same row, standing through tick and untick",
    br2.before.cls && br2.sameRow && br2.before.j.shown && br2.during.shown && br2.after.shown &&
      br2.before.j.top === br2.during.top && br2.during.top === br2.after.top,
    JSON.stringify(br2),
  );

  const br3 = await evaluate(`(()=>{
    const box=document.getElementById("ages");const lbl=box.closest("label");
    const face=()=>({mark:getComputedStyle(lbl,"::before").content,bg:getComputedStyle(lbl).backgroundColor});
    const off=face();
    lbl.click();
    const on={...face(),checked:box.checked,hash:location.hash};
    lbl.click();
    const back={...face(),checked:box.checked};
    return{off,on,back,isSeal:lbl.classList.contains("seal"),type:box.type};
  })()`);
  check(
    "BR3 a seal label click toggles its real checkbox and the countersign (check mark + fill) follows",
    br3.isSeal && br3.type === "checkbox" &&
      br3.on.checked === true && br3.back.checked === false &&
      !br3.off.mark.includes("✓") && br3.on.mark.includes("✓") && !br3.back.mark.includes("✓") &&
      br3.off.bg !== br3.on.bg && /(^|&)survey(&|$)/.test(br3.on.hash.slice(1)),
    JSON.stringify(br3),
  );

  const br4a = await evaluate(`(()=>{
    const mark=document.querySelector('a.fn[data-note="note-seeds-choice"]');
    const note=document.getElementById("note-seeds-choice");
    const wired=mark.getAttribute("aria-describedby")==="note-seeds-choice"&&note.getAttribute("role")==="tooltip";
    mark.focus();
    const open=note.matches(":popover-open")&&note.getClientRects().length>0;
    mark.blur();
    const closed=!note.matches(":popover-open");
    mark.focus();
    return{wired,open,closed,reopened:note.matches(":popover-open")};
  })()`);
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  const br4b = await evaluate(`(()=>{
    const note=document.getElementById("note-seeds-choice");
    return{escClosed:!note.matches(":popover-open"),focusHeld:document.activeElement===document.querySelector('a.fn[data-note="note-seeds-choice"]')};
  })()`);
  check(
    "BR4 a mark's note opens on focus, closes on blur, and Escape dismisses it with focus held",
    br4a.wired && br4a.open && br4a.closed && br4a.reopened && br4b.escClosed && br4b.focusHeld,
    JSON.stringify({ br4a, br4b }),
  );

  const rect = await evaluate(`(()=>{const m=document.querySelector('a.fn[data-note="note-coast-warp"]');
    const r=m.getBoundingClientRect();return{x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};})()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: rect.x, y: rect.y });
  await sleep(80);
  const overOpen = await evaluate(`document.getElementById("note-coast-warp").matches(":popover-open")`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 4, y: 4 });
  await sleep(80);
  const awayClosed = await evaluate(`!document.getElementById("note-coast-warp").matches(":popover-open")`);
  check("BR5 the note shows under a real hover and hides when the pointer leaves", overOpen && awayClosed, JSON.stringify({ overOpen, awayClosed }));

  // REAL CDP taps fire the full compat sequence a synthetic .click() skips (which once hid an off-by-one here); device metrics + touch emulation is what actually flips the hover/pointer media in this browser, setEmulatedMedia's feature overrides are a no-op.
  await setMobileViewport(390, 700);
  const emulated = await evaluate(`window.matchMedia("(hover: none)").matches`);
  // #463: on a phone the Broadside is the bottom sheet, collapsed to its head; the mark lives in its body, so open it first (the handle is the sheet's toggle).
  await sleep(120);
  await evaluate(`(()=>{const h=document.querySelector("#broadside .slip-handle");if(h&&!document.getElementById("broadside").classList.contains("open"))h.click();})()`);
  await sleep(120);
  // The post-tap sleep lets a pending anchor navigation COMMIT before a fresh evaluate reads the path: a same-evaluate read cannot see it (the guard-prover proved a dropped preventDefault survived that shape).
  const tapAt = async () => {
    const p = await evaluate(`(()=>{const m=document.querySelector('a.fn[data-note="note-survey"]');
      if(!m)return null;
      m.scrollIntoView({block:"center"});const r=m.getBoundingClientRect();
      return{x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};})()`);
    if (!p) return false;
    await touch("touchStart", [{ x: p.x, y: p.y, id: 0 }]);
    await touch("touchEnd", []);
    await sleep(500); // past the tap-dismiss window, and past any pending navigation's commit
    return true;
  };
  const probe = () => evaluate(`(()=>{const n=document.getElementById("note-survey");
    return{stayed:location.pathname==="/explorer/",open:!!n&&n.matches(":popover-open"),
      hasLink:!!document.querySelector('#note-survey a[href="/glossary/#survey"]')};})()`);
  // #463: the roads out dock INSIDE the phone sheet (room.ts seats the one legend row; the stage copy would be display:none at 390), so the Press is reachable from the opened Broadside. The class this guards: a seat decided but never applied leaves a phone with no way to the Print Room or the journal.
  const br6a = await evaluate(`(()=>{const dock=document.querySelector("#broadside .legend.in-slip");const ids=["verso-turn","order-plates","journal-link"].map((id)=>{const el=document.getElementById(id);return{id,inSheet:!!(dock&&dock.contains(el)),shown:!!el&&el.getClientRects().length>0};});return{docked:!!dock,onStage:!!document.querySelector("main > .legend"),ids};})()`);
  check(
    "BR6a on a phone the Press docks inside the opened Broadside: Turn and both roads in the sheet and hit-testable, none left on the stage",
    br6a.docked && !br6a.onStage && br6a.ids.every((i) => i.inSheet && i.shown),
    JSON.stringify(br6a),
  );
  const tapped1 = await tapAt();
  const afterTap1 = await probe();
  const tapped2 = await tapAt();
  const afterTap2 = await probe();
  await clearMobile();
  check(
    "BR6 under hover:none a real tap opens the note without navigating and a second tap closes it",
    emulated && tapped1 && tapped2 && afterTap1.open && afterTap1.stayed && afterTap1.hasLink &&
      !afterTap2.open && afterTap2.stayed,
    JSON.stringify({ emulated, tapped1, tapped2, afterTap1, afterTap2 }),
  );

  await gotoPlain(`http://127.0.0.1:${PORT}/glossary/`, "broadside-glossary");
  const br7 = await evaluate(`(()=>{
    const ids=["seeds-choice","coast-warp","survey","verso"].map((id)=>[id,!!document.getElementById(id)]);
    const section=document.getElementById("drafting-table");
    const indexed=!!document.querySelector('#index .index a.sec[href="#drafting-table"]');
    return{missing:ids.filter(([,ok])=>!ok).map(([id])=>id),
      head:section?section.textContent:null,indexed};
  })()`);
  check(
    "BR7 every mark's glossary anchor exists, the drafting-table section presides over the control terms, and the index slip lists it (the TOC's successor, #462)",
    br7.missing.length === 0 && br7.head === "At the drafting table" && br7.indexed,
    JSON.stringify(br7),
  );

  // "AbortError: Transition was skipped" is the cross-document view-transition's expected cancellation when navigations chain fast, not an app error; this suite chains Page.navigate hops from its first goto.
  const errDelta = consoleErrors.slice(errBase).filter((e) => !e.includes("AbortError: Transition was skipped"));
  check(
    "BR8 the broadside flow is clean (no console errors, no 4xx)",
    errDelta.length === 0 && http4xx.length === httpBase,
    JSON.stringify({ errs: errDelta, http: http4xx.slice(httpBase) }),
  );
}
