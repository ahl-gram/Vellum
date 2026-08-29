// The document rooms' index slip (#462 Landfall Sub 7, document-room rulings 1 to 4): the index is server-rendered from the page's own sections, inks the section being read, folds to hand the sheet the width, is the bottom sheet on a phone, and on the Glossary narrows to the term names typed. Every geometry is MEASURED; the scripts-off arm carries its control.
import { scopedHealth } from "./room-support.mjs";

const FAQ = "/faq/";
const GLOSSARY = "/glossary/";

const READ = `(() => {
  const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, right: b.right, bottom: b.bottom }; };
  const slip = document.getElementById("index");
  const cs = slip ? getComputedStyle(slip) : null;
  const body = slip ? slip.querySelector(".slip-body") : null;
  const rows = slip ? [...slip.querySelectorAll(".index > li")] : [];
  return {
    innerW: innerWidth, innerH: innerHeight, scrollW: document.documentElement.scrollWidth, scrollY: window.scrollY,
    h2s: [...document.querySelectorAll(".sheet h2[id]")].map((h) => h.id),
    entries: document.querySelectorAll(".sheet :is(.q, .term)[id]").length,
    rows: rows.map((li) => li.dataset.sec),
    rowEntries: rows.map((li) => li.querySelectorAll("a[href^='#']").length - 1),
    inked: rows.filter((li) => li.classList.contains("inked")).map((li) => li.dataset.sec),
    now: [...document.querySelectorAll("#index [data-for].now")].map((el) => el.dataset.for),
    slip: r("#index"), slipPosition: cs && cs.position, slipVisibility: cs && cs.visibility,
    folded: !!slip && slip.classList.contains("folded"), open: !!slip && slip.classList.contains("open"),
    bodyDisplay: body ? getComputedStyle(body).display : null,
    tab: r(".slip-tab"), tabVisibility: (() => { const t = document.querySelector(".slip-tab"); return t ? getComputedStyle(t).visibility : null; })(),
    folio: r(".corner.tr"), h1: r("main h1.room-name"),
    main: r("body > main"), sheet: r(".sheet"),
    count: (document.querySelector(".folio-room .dateline, .folio-room .gloss") || {}).textContent,
    toc: !!document.querySelector(".toc"),
    columns: getComputedStyle(document.querySelector(".columns")).columnWidth,
  };
})()`;

export async function run(ctx) {
  const { evaluate, send, check, sleep, setMobileViewport, clearMobile, touch, waitReady, PORT } = ctx;
  const gate = scopedHealth(ctx);

  // A room's readiness is its own shell (waitReady keys on the Explorer's members); the index script runs at parse, so the slip's inline top is the boot signal.
  const goto = async (path) => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}${path}` });
    for (let i = 0; i < 200; i++) {
      const up = await evaluate(`document.readyState === "complete" && !!document.getElementById("index")`).catch(() => false);
      if (up) break;
      await sleep(25);
    }
    await sleep(300);
  };
  const tapAt = async (x, y) => {
    await touch("touchStart", [{ x: Math.round(x), y: Math.round(y) }]);
    await touch("touchEnd", []);
    await sleep(450);
  };

  // The desktop arm at the sibling suites' 1280x800: the harness window is taller, and a tall viewport cannot scroll a late section up to the reading line.
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await goto(FAQ);
  const faq = await evaluate(READ);
  check(
    "IX1 the Q & A stands its name top right and its index open beside the sheet: every h2 a row with its questions, the count line the page's own tally, the slip hung under the folio, the sheet ending short of the slip's column, no TOC left on the sheet, 22rem columns (#462 rulings 1, 3, 6)",
    faq.h1 !== null && faq.folio !== null && faq.h1.right <= faq.innerW && faq.h1.y < 60 &&
      faq.slipPosition === "fixed" && !faq.folded && faq.slip.y >= faq.folio.bottom + 10 &&
      JSON.stringify(faq.rows) === JSON.stringify(faq.h2s) && faq.rowEntries.reduce((a, b) => a + b, 0) === faq.entries &&
      faq.count === `${faq.entries} questions in ${faq.h2s.length} sections` &&
      faq.sheet.right <= faq.slip.x - 8 && !faq.toc && faq.columns === "352px" && faq.scrollW <= faq.innerW,
    `h1 ${JSON.stringify(faq.h1)}, slip ${faq.slipPosition} y=${faq.slip && faq.slip.y.toFixed(1)} folio bottom=${faq.folio && faq.folio.bottom.toFixed(1)}, rows ${faq.rows.length}/${faq.h2s.length}, entries ${faq.rowEntries.join("+")}=${faq.entries}, count "${faq.count}", sheet right ${faq.sheet && faq.sheet.right.toFixed(1)} vs slip x ${faq.slip && faq.slip.x.toFixed(1)}, toc ${faq.toc}, columns ${faq.columns}, scrollW ${faq.scrollW}/${faq.innerW}`,
  );

  const target = faq.h2s[2];
  const firstEntryOf = await evaluate(`(() => { const h = document.getElementById(${JSON.stringify(target)}); let e = h.nextElementSibling; while (e && !e.matches(".q[id], .term[id]")) e = e.nextElementSibling; return e ? e.id : null; })()`);
  await evaluate(`document.getElementById(${JSON.stringify(target)}).scrollIntoView()`);
  await sleep(250);
  const atHead = await evaluate(READ);
  await evaluate(`document.getElementById(${JSON.stringify(firstEntryOf)}).scrollIntoView()`);
  await sleep(250);
  const atEntry = await evaluate(READ);
  check(
    "IX2 following a section's head inks that row alone with no question marked yet (never the section above's last one); reaching its first question marks that one, the reader's place kept as the page moves (#462 ruling 1)",
    atHead.scrollY > 0 && JSON.stringify(atHead.inked) === JSON.stringify([target]) && atHead.now.length === 0 &&
      JSON.stringify(atEntry.inked) === JSON.stringify([target]) && JSON.stringify(atEntry.now) === JSON.stringify([firstEntryOf]),
    `at the head #${target}: inked ${JSON.stringify(atHead.inked)}, now ${JSON.stringify(atHead.now)}; at its first question #${firstEntryOf}: inked ${JSON.stringify(atEntry.inked)}, now ${JSON.stringify(atEntry.now)}`,
  );

  await evaluate(`document.querySelector("#index .slip-fold").click()`);
  await sleep(900);
  const folded = await evaluate(READ);
  await evaluate(`document.querySelector(".slip-tab").click()`);
  await sleep(900);
  const back = await evaluate(READ);
  check(
    "IX3 folding the index hands the sheet the width in one settle and stands the bookmark tab on the right edge; the tab brings the index back and the sheet shrinks the same way (#462 ruling 2, Alex's own wording)",
    folded.folded && folded.slipVisibility === "hidden" && folded.tabVisibility === "visible" && folded.tab.right >= folded.innerW - 1 &&
      folded.main.right > faq.main.right + 200 && folded.sheet.right > faq.sheet.right + 200 &&
      !back.folded && back.slipVisibility === "visible" && back.tabVisibility === "hidden" && Math.abs(back.main.right - faq.main.right) < 1,
    `folded: slip ${folded.slipVisibility} tab ${folded.tabVisibility} right=${folded.tab && folded.tab.right}, main right ${faq.main.right.toFixed(1)} -> ${folded.main.right.toFixed(1)} -> ${back.main.right.toFixed(1)}, sheet right ${faq.sheet.right.toFixed(1)} -> ${folded.sheet.right.toFixed(1)}`,
  );

  await goto(GLOSSARY);
  const glossary = await evaluate(READ);
  await evaluate(`document.querySelector(".find input").focus()`);
  await send("Input.insertText", { text: "glass" });
  await sleep(150);
  const found = await evaluate(`(() => {
    const links = [...document.querySelectorAll("#index .terms a")];
    const hits = links.filter((a) => a.classList.contains("hit"));
    const shown = links.filter((a) => getComputedStyle(a).display !== "none");
    const rows = [...document.querySelectorAll("#index .index > li")];
    return { hits: hits.map((a) => a.textContent), shown: shown.length, total: links.length,
      empty: rows.filter((li) => getComputedStyle(li).display === "none").length, rows: rows.length,
      defsMatch: [...document.querySelectorAll(".sheet .def")].filter((d) => /glass/i.test(d.textContent)).length };
  })()`);
  await evaluate(`(() => { const i = document.querySelector(".find input"); i.value = ""; i.dispatchEvent(new Event("input", { bubbles: true })); })()`);
  await sleep(100);
  const cleared = await evaluate(`(() => { const links = [...document.querySelectorAll("#index .terms a")]; return { shown: links.filter((a) => getComputedStyle(a).display !== "none").length, total: links.length, hits: links.filter((a) => a.classList.contains("hit")).length, empty: [...document.querySelectorAll("#index .index > li")].filter((li) => getComputedStyle(li).display === "none").length }; })()`);
  check(
    "IX4 the Glossary's find box narrows the index to the term NAMES typed (every shown term carries the query, sections with none fold away, and definitions that merely mention it do not count), and clearing it restores the whole index (#462 ruling 4)",
    glossary.count === `${glossary.entries} terms in ${glossary.h2s.length} sections` &&
      found.hits.length >= 2 && found.hits.every((t) => /glass/i.test(t)) && found.shown === found.hits.length &&
      found.empty > 0 && found.empty < found.rows && found.defsMatch > found.hits.length &&
      cleared.shown === cleared.total && cleared.hits === 0 && cleared.empty === 0,
    `count "${glossary.count}"; "glass": hits ${JSON.stringify(found.hits)} shown ${found.shown}/${found.total}, sections folded ${found.empty}/${found.rows}, definitions mentioning it ${found.defsMatch}; cleared: shown ${cleared.shown}/${cleared.total}, folded ${cleared.empty}`,
  );

  await setMobileViewport(390, 844);
  await goto(FAQ);
  const phone = await evaluate(READ);
  await tapAt(phone.innerW / 2, phone.slip.y + 40);
  const opened = await evaluate(READ);
  const entry = await evaluate(`(() => { const a = document.querySelector("#index .entries li:nth-child(2) a"); const r = a.getBoundingClientRect(); return { href: a.getAttribute("href"), x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
  await tapAt(entry.x, entry.y);
  await sleep(400);
  const jumped = await evaluate(READ);
  const landed = await evaluate(`(() => { const t = document.querySelector(${JSON.stringify(entry.href)}); const r = t.getBoundingClientRect(); return { top: r.top, hash: location.hash }; })()`);
  check(
    "IX5 at 390 the index is the bottom sheet collapsed to its head at the foot of the viewport; a tap on the head opens it, a tap on a question jumps to it below the band and closes the sheet again (#462 ruling 2, the phone half)",
    phone.slipPosition === "fixed" && Math.abs(phone.slip.bottom - phone.innerH) < 1 && !phone.open && phone.bodyDisplay === "none" && phone.slip.h < 140 &&
      opened.open && opened.bodyDisplay !== "none" && opened.slip.h > phone.slip.h + 100 &&
      !jumped.open && landed.hash === entry.href && landed.top >= 90 && landed.top < 200 && jumped.scrollW <= jumped.innerW,
    `collapsed: bottom ${phone.slip && phone.slip.bottom} of ${phone.innerH}, h ${phone.slip && phone.slip.h.toFixed(1)}, body ${phone.bodyDisplay}; opened: ${opened.open} h ${opened.slip && opened.slip.h.toFixed(1)}; after the tap: open=${jumped.open}, hash ${landed.hash} vs ${entry.href}, target top ${landed.top.toFixed(1)}, scrollW ${jumped.scrollW}/${jumped.innerW}`,
  );

  await send("Emulation.setScriptExecutionDisabled", { value: true });
  await goto(GLOSSARY);
  const noJs = await evaluate(READ);
  const noJsLink = await evaluate(`(() => { const a = document.querySelector("#index .terms a"); return { href: a.getAttribute("href"), target: !!document.querySelector(a.getAttribute("href")) }; })()`);
  await send("Emulation.setScriptExecutionDisabled", { value: false });
  check(
    "IX6 with SCRIPT EXECUTION DISABLED the index still stands, every section and term server-rendered with a real anchor, and NO row is inked: the ink is the control, since the binder alone sets it and every other term here is equally true with scripts on (#462 ruling 1, the no-JS floor)",
    JSON.stringify(noJs.rows) === JSON.stringify(noJs.h2s) && noJs.rowEntries.reduce((a, b) => a + b, 0) === noJs.entries &&
      noJsLink.target && noJs.inked.length === 0,
    `rows ${noJs.rows.length}/${noJs.h2s.length}, entries ${noJs.rowEntries.reduce((a, b) => a + b, 0)}/${noJs.entries}, first term ${noJsLink.href} resolves=${noJsLink.target}, inked ${JSON.stringify(noJs.inked)} (the CONTROL: empty says script really was off)`,
  );

  await clearMobile();
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  gate.check("IX7 the document-room suite drove both rooms with no console error and no 4xx");
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/` });
  await waitReady();
}
