// The Broadside checks (BR1-BR8, #270): the Explorer's controls regrouped by what
// they do to the world (The Land reshapes, The Hand dresses, The Press acts), the
// countersigned seals, the always-visible journal button, and the footnote
// apparatus (marks that note on hover/focus, toggle on touch, and land on real
// /glossary/ anchors). The unit pins in test/site/broadside.test.ts hold the
// SOURCE to this shape; these checks hold the built, running page to it: rendered
// grouping, real input (CDP mouse/keys, emulated hover:none), and the popover
// behavior no source test can see. Self-contained like the survey suite
// (navigates itself, scoped no-4xx + console-error delta).
export async function run(ctx) {
  const { evaluate, send, check, sleep, waitSettled, waitReady, setMobileViewport, clearMobile, consoleErrors, http4xx, PORT } = ctx;

  const EXP = `http://127.0.0.1:${PORT}/explorer/`;
  const errBase = consoleErrors.length;
  const httpBase = http4xx.length;

  const goto = async (url, label) => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url });
    await waitReady();
    await waitSettled(label);
  };
  // The Explorer waits (waitReady/waitSettled) probe #status/#map, which plain
  // pages do not carry; the glossary hop below only needs the document loaded.
  const gotoPlain = async (url, label) => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url });
    for (let i = 0; i < 100; i++) {
      if (await evaluate(`document.readyState === "complete"`)) return;
      await sleep(50);
    }
    throw new Error("gotoPlain timeout " + label);
  };

  // BR1: the grouping truth, in the RENDERED page: every control sits in the group
  // its wiring earns (the point of the issue), read from the live DOM.
  await goto(EXP + "#seed=42&style=antique", "broadside-base");
  const br1 = await evaluate(`(()=>{
    const groupOf=(id)=>{const el=document.getElementById(id);const g=el&&el.closest('[role="group"]');
      return g?g.getAttribute("aria-labelledby"):null;};
    const want={seed:"grp-land",random:"grp-land",type:"grp-land",band:"grp-land",land:"grp-land",coast:"grp-land",
      style:"grp-hand",theme:"grp-hand",legend:"grp-hand",arms:"grp-hand",ages:"grp-hand",
      draw:"grp-press","verso-turn":"grp-press","order-plates":"grp-press","journal-link":"grp-press"};
    const wrong=Object.entries(want).filter(([id,g])=>groupOf(id)!==g).map(([id])=>id+":"+groupOf(id));
    const heads=["grp-land","grp-hand","grp-press"].map((id)=>(document.getElementById(id)||{}).textContent);
    return{wrong,heads};
  })()`);
  check(
    "BR1 every control sits in its wiring-truth group under the Land/Hand/Press heads",
    br1.wrong.length === 0 && br1.heads.join("|") === "The Land|The Hand|The Press",
    JSON.stringify(br1),
  );

  // BR2: the Press's second line never changes shape (#270 ruling 2): the two gold
  // links share the action-link dressing and the journal button stays standing and
  // in place through a survey tick and untick.
  const br2 = await evaluate(`(()=>{
    const j=document.getElementById("journal-link"),o=document.getElementById("order-plates");
    const at=(el)=>({shown:el.getClientRects().length>0,top:Math.round(el.getBoundingClientRect().top)});
    const before={j:at(j),o:at(o),cls:j.className===o.className&&j.classList.contains("action-link")};
    const c=document.getElementById("ages");c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));
    const during=at(j);
    c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));
    const after=at(j);
    return{before,during,after,sameRow:before.j.top===before.o.top};
  })()`);
  check(
    "BR2 the journal button is the print link's steady gold peer: same row, standing through tick and untick",
    br2.before.cls && br2.sameRow && br2.before.j.shown && br2.during.shown && br2.after.shown &&
      br2.before.j.top === br2.during.top && br2.during.top === br2.after.top,
    JSON.stringify(br2),
  );

  // BR3: the seals are real checkboxes in chip dress. Clicking the LABEL (the user
  // path) toggles the box and the countersign: the reserved slot gains the check
  // mark and the fill flips, so state never reads by color alone.
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

  // BR4: the footnote apparatus, keyboard side. Focusing a mark opens its note
  // (a top-layer popover, real text wired aria-describedby -> role="tooltip");
  // blurring closes it; Escape (a real key, the popover's own close request)
  // closes a re-opened note while focus stays on the mark.
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

  // BR5: the hover side, through a REAL mouse move (mouseenter must fire as it does
  // for a user). Over the coast mark the note shows; away again it hides.
  const rect = await evaluate(`(()=>{const m=document.querySelector('a.fn[data-note="note-coast-warp"]');
    const r=m.getBoundingClientRect();return{x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};})()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: rect.x, y: rect.y });
  await sleep(80);
  const overOpen = await evaluate(`document.getElementById("note-coast-warp").matches(":popover-open")`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 4, y: 4 });
  await sleep(80);
  const awayClosed = await evaluate(`!document.getElementById("note-coast-warp").matches(":popover-open")`);
  check("BR5 the note shows under a real hover and hides when the pointer leaves", overOpen && awayClosed, JSON.stringify({ overOpen, awayClosed }));

  // BR6: the touch side, the ratified tap-toggle: with hover:none in force (device
  // emulation, the suite-zoom-gestures idiom: metrics override + touch is what
  // actually flips the hover/pointer media in this browser; setEmulatedMedia's
  // feature overrides are a no-op here), a tap on the mark toggles the note
  // INSTEAD of navigating, and the note carries its own glossary link.
  await setMobileViewport(390, 700);
  const br6 = await evaluate(`(()=>{
    if(!window.matchMedia("(hover: none)").matches)return{emulated:false};
    const mark=document.querySelector('a.fn[data-note="note-survey"]');
    const note=document.getElementById("note-survey");
    mark.click();
    const open=note.matches(":popover-open");
    const stayed=location.pathname==="/explorer/";
    const link=note.querySelector('a[href="/glossary/#survey"]');
    mark.click();
    return{emulated:true,open,stayed,hasLink:!!link,toggledOff:!note.matches(":popover-open")};
  })()`);
  await clearMobile();
  check(
    "BR6 under hover:none a tap toggles the note instead of navigating, and the note carries the glossary link",
    br6.emulated && br6.open && br6.stayed && br6.hasLink && br6.toggledOff,
    JSON.stringify(br6),
  );

  // BR7: the back matter is real: every anchor the marks point at exists on the
  // BUILT glossary page, inside the new drafting-table section (ruling 6).
  await gotoPlain(`http://127.0.0.1:${PORT}/glossary/`, "broadside-glossary");
  const br7 = await evaluate(`(()=>{
    const ids=["seeds-choice","coast-warp","survey","verso"].map((id)=>[id,!!document.getElementById(id)]);
    const section=document.getElementById("drafting-table");
    const toc=!!document.querySelector('.toc a[href="#drafting-table"]');
    return{missing:ids.filter(([,ok])=>!ok).map(([id])=>id),
      head:section?section.textContent:null,toc};
  })()`);
  check(
    "BR7 every mark's glossary anchor exists and the drafting-table section presides over the control terms",
    br7.missing.length === 0 && br7.head === "At the drafting table" && br7.toc,
    JSON.stringify(br7),
  );

  // BR8: the whole flow above ran clean (scoped console/network health).
  const errDelta = consoleErrors.slice(errBase);
  check(
    "BR8 the broadside flow is clean (no console errors, no 4xx)",
    errDelta.length === 0 && http4xx.length === httpBase,
    JSON.stringify({ errs: errDelta, http: http4xx.slice(httpBase) }),
  );
}
