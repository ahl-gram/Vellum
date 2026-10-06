import type { Payload, SuiteContext } from "../../types.ts";
import type { DrawerKit } from "./kit.ts";
import { CARD, DRAWN, DRESS, PP } from "./reads.ts";

export async function cd25CardPress({ evaluate, check, settle, go, pinCard, pressCard }: DrawerKit): Promise<void> {
  await go(DRESS);
  const at = await settle(CARD, (d) => d.hits > 1, "chart-drawer-card");
  await pinCard(1);
  const armed = await settle(CARD, (d) => d.shown && !!d.press, "chart-drawer-card-press");
  check(
    "CD25 the place card's two actions stand in ONE row and BOTH answer a real pointer: #place-card is pointer-events: none, so a press that forgets to restore it passes element.click() and is dead to every reader, which is the #520 dog-ear scar exactly (#518 ruling 7)",
    at.hits > 1 && armed.shown && !!armed.press && armed.press.hit === "self" &&
      !!armed.link && armed.link.hit === "self" && armed.link.inActs && armed.pressInActs && armed.actsRow === 2 &&
      armed.press.text === "Lay the prospect on the table" && !armed.press.dim && !armed.press.disabled && armed.press.idx === "1",
    JSON.stringify({ hits: at.hits, press: armed.press, link: armed.link, actsRow: armed.actsRow }),
  );
  await pressCard(armed);
  const filed = await settle(CARD, (d) => d.cuttings === 1 && d.imgs === 1, "chart-drawer-prospect-drawn", DRAWN);
  check(
    "CD26 the filed prospect DRAWS its own plate rather than keeping a reserved frame, named for the TOWN and not for the world, and the press it was filed from relabels in place (#518 ruling 7; a prospect read 'drawing…' for good until this sub, and a press labelled only at card-show keeps offering an action it has spent)",
    filed.cuttings === 1 && filed.prospects === 1 && filed.imgs === 1 && filed.frames === 0 &&
      filed.decoded.every(Boolean) && /^The Prospect of \S/.test(filed.titles[0] || "") &&
      // The year LITERAL, not a shape: "the year is the Explorer's present" is the ratified acceptance, and seed 42's
      // present is 1059, so `\d+` would pass on any year at all and the acceptance would have no guard (PR #631's review).
      filed.titles[0] !== "The Isle of Rahai" && filed.subs[0] === "a prospect, antique, 1059" &&
      (filed.hashTable || "").indexOf("year-1059") !== -1 &&
      !!filed.press && filed.press.text === "Already on the table" && filed.press.dim && !filed.press.disabled &&
      typeof filed.hashTable === "string" && filed.hashTable.indexOf("k-p.") === 0,
    JSON.stringify({ cuttings: filed.cuttings, prospects: filed.prospects, imgs: filed.imgs, frames: filed.frames, decoded: filed.decoded, titles: filed.titles, subs: filed.subs, press: filed.press, table: filed.hashTable }),
  );
  // The DRAWN world and not the controls: a seed typed without pressing Draw is the reachable way to file a chart nobody drew.
  await evaluate(`(() => { const s = document.getElementById("seed"); s.value = "7"; })()`);
  await pinCard(2);
  const other = await settle(CARD, (d) => d.shown && !!d.press && d.press.idx === "2", "chart-drawer-card-other");
  await pressCard(other);
  const second = await settle(CARD, (d) => d.cuttings === 2, "chart-drawer-prospect-second");
  check(
    "CD30 the card files the world on the SHEET, never the one in the seed box: a seed typed and not drawn leaves the chart alone, so an item built from the control would file a plate the reader has never seen (the lodController exposes no drawn world, which is what makes this reachable)",
    second.seedBox === "7" && second.cuttings === 2 &&
      typeof second.hashTable === "string" && second.hashTable.split("_").every((s) => s.indexOf("seed-42") !== -1) &&
      second.hashTable.indexOf("seed-7") === -1,
    JSON.stringify({ seedBox: second.seedBox, cuttings: second.cuttings, table: second.hashTable }),
  );
}

// A full table costs no worker job, because the drawer fills its frames only when OPENED (Issue #520's ruling), so this boot is cheap.
export async function cd27CardAtCap({ evaluate, check, settle, go, pinCard, pressCard }: DrawerKit, SIX: string): Promise<void> {
  await go(`${DRESS}&table=${SIX}`);
  await settle(CARD, (d) => d.hits > 1, "chart-drawer-card-full");
  await pinCard(1);
  const atCap = await settle(CARD, (d) => d.shown && !!d.press, "chart-drawer-card-cap");
  await pressCard(atCap);
  const after = await evaluate(CARD);
  check(
    "CD27 at the cap the card's press wears the ruled refusal and stays PRESSABLE, so a keyboard reader still meets it and hears why, and pressing lays nothing (#518 ruling 7; disabled would drop it out of the tab order, which is why the dog-ear's ruled shape keeps answering)",
    !!atCap.press && atCap.press.text === "No room on the table" && atCap.press.dim && !atCap.press.disabled &&
      atCap.press.hit === "self" && after.cuttings === 6,
    JSON.stringify({ press: atCap.press, before: atCap.cuttings, after: after.cuttings }),
  );
}

// The page's own capture point (seat C, ruled 2026-09-17): it files and STAYS, and the year is part of a sheet's identity.
export async function cd28PagePress({ evaluate, send, check, sleep, PORT, settle, clickAt, forget }: DrawerKit) {
  await forget();
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/prospect/#seed=42&i=3` });
  for (let i = 0; i < 300; i++) { await sleep(100); if (await evaluate<boolean>(`!!(window.__vellumProspectState && window.__vellumProspectState())`)) break; }
  // The slip's fold is a transition, and CD28 derives a real pointer target from this press's rect: a fixed sleep either
  // measures a box still moving or waits longer than it needs. Poll it to REST instead, and throw naming the last read.
  const pp = await settle(PP, (d, last) => !!d.press && d.press.shown && !!last && !!last.press && d.press.centre && last.press.centre &&
    d.press.centre.x === last.press.centre.x && d.press.centre.y === last.press.centre.y, "prospect-note-open");
  check(
    "CD28 the Prospect page's press sits on the engraver's note where the room's desk actions belong, answers a real pointer, and does NOT join the roads out, which go somewhere (ruled 2026-09-17, seat C)",
    !!pp.press && pp.press.shown && pp.press.hit === "self" && pp.inNote &&
      pp.press.text === "Lay this prospect on the table" && !pp.press.dim && !pp.press.disabled &&
      /table is bare/.test(pp.count || ""),
    JSON.stringify({ press: pp.press, count: pp.count, inNote: pp.inNote, roads: pp.roads }),
  );
  if (pp.press && pp.press.centre) await clickAt(pp.press.centre.x, pp.press.centre.y);
  const one = await settle(PP, (d) => typeof d.hashTable === "string" && d.hashTable.split("_").length === 1, "prospect-filed-one");
  // The same town at a second year: the year IS part of the sheet's identity, which is the case that won "press and stay".
  // The form is submitted synthetically because the claim here is about the FILING, not about the year control, whose own gesture PB6 already drives.
  await evaluate(`(() => { const y = document.getElementById("pp-year"); y.value = String(Math.max(1, Number(y.value) - 300)); document.getElementById("pp-year-form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); })()`);
  for (let i = 0; i < 300; i++) { await sleep(100); const s = await evaluate<number | null>(`(() => { const st = window.__vellumProspectState(); return st ? st.year : null; })()`); if (s !== null && s !== one.state!.year) break; }
  let two = await evaluate(PP);
  if (two.press && two.press.centre) await clickAt(two.press.centre.x, two.press.centre.y);
  two = await settle(PP, (d) => typeof d.hashTable === "string" && d.hashTable.split("_").length === 2, "prospect-filed-two");
  check(
    "CD29 the page files and STAYS, writing the gathering into its OWN address so a reload keeps it, and the same town at a second year is a SECOND sheet rather than one deduped away (ruled 2026-09-17; the year rides in the item, which is what lets a reader gather a run of one place across the centuries)",
    typeof one.hashTable === "string" && one.hashTable.split("_").length === 1 && /one sheet laid/.test(one.count || "") &&
      typeof two.hashTable === "string" && two.hashTable.split("_").length === 2 && /two sheets laid/.test(two.count || "") &&
      new Set(two.hashTable.split("_")).size === 2 &&
      typeof two.chartHref === "string" && two.chartHref.indexOf("table=") !== -1,
    JSON.stringify({ oneTable: one.hashTable, oneCount: one.count, twoTable: two.hashTable, twoCount: two.count, chartHref: two.chartHref }),
  );
  return two;
}

export async function cd34PageRefusals({ evaluate, send, check, sleep, PORT, settle, clickAt, forget }: DrawerKit, SIX: string): Promise<void> {
  // The page's own two refusing faces. Nothing else drives them, and with no check here the two booleans handed to
  // layPressFace could be swapped and ship green, which would put "No room" on a duplicate and "Already" on a full
  // table, the exact inverse of ruling 4 (PR #631's review).
  const held = await evaluate(PP);
  check(
    "CD34 filing the SAME plate twice turns the page's press to its held face, not its full one: the two refusals are told apart here or they can be swapped with every other check green (ruled 2026-09-17)",
    !!held.press && held.press.text === "Already on the table" && held.press.dim && !held.press.disabled &&
      /two sheets laid/.test(held.count || ""),
    JSON.stringify({ press: held.press, count: held.count }),
  );
  // A boot with the cap already spent: the same press, the OTHER refusal. The six come from the ADDRESS, so the device is cleared first or the two sources are indistinguishable here.
  await forget();
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/prospect/#seed=42&i=3&table=${SIX}` });
  for (let i = 0; i < 300; i++) { await sleep(100); if (await evaluate<boolean>(`!!(window.__vellumProspectState && window.__vellumProspectState())`)) break; }
  const atCapPage = await settle(PP, (d, last) => !!d.press && d.press.shown && !!last && !!last.press && d.press.centre && last.press.centre &&
    d.press.centre.x === last.press.centre.x && d.press.centre.y === last.press.centre.y, "prospect-note-open-full");
  if (atCapPage.press && atCapPage.press.centre) await clickAt(atCapPage.press.centre.x, atCapPage.press.centre.y);
  // A refusal changes nothing, so there is no state to poll TO, and a settle here proves nothing: it returns on its FIRST satisfying read and this predicate is already true when the press is answered, so it read once and waited 0ms. What is real for "nothing happened" is a DWELL, held past the moment a wrongly accepted filing would have written the hash.
  const dwell = [];
  for (let i = 0; i < 8; i++) { dwell.push(await evaluate(PP)); await sleep(50); }
  const stillFull = dwell[dwell.length - 1]!;
  const heldSix = dwell.every((d) => typeof d.hashTable === "string" && d.hashTable.split("_").length === 6);
  check(
    "CD35 at the cap the page's press wears the FULL refusal, stays pressable, and lays nothing: the page inherits the table's six from the address it was handed, which is the cap #522 says applies here too",
    !!atCapPage.press && atCapPage.press.text === "No room on the table" && atCapPage.press.dim &&
      !atCapPage.press.disabled && atCapPage.press.hit === "self" &&
      /the table is full/.test(atCapPage.count || "") &&
      heldSix && (stillFull.hashTable || "").split("_").length === 6,
    JSON.stringify({ press: atCapPage.press, count: atCapPage.count, after: (stillFull.hashTable || "").split("_").length, heldSix, reads: dwell.length }),
  );
}

export async function cd31RoundTrip({ evaluate, send, check, sleep, PORT, settle }: DrawerKit, two: Awaited<ReturnType<typeof cd28PagePress>>): Promise<void> {
  // Home through chartTarget, the way the page offers: the Explorer restores the table with both sheets on it.
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/${two.chartHref!.slice(
    two.chartHref!.indexOf("#"))}` });
  for (let i = 0; i < 200; i++) { await sleep(150); if (await evaluate<boolean>(`!!document.querySelector("#map svg") && !!document.getElementById("chart-drawer")`)) break; }
  const home = await settle(CARD, (d) => d.cuttings === 2, "chart-drawer-round-trip");
  check(
    "CD31 the round trip closes: what the Prospect page filed comes home through chartTarget and the Explorer restores BOTH sheets, which is the epic's core insight working across a real cross-path navigation",
    home.cuttings === 2 && home.prospects === 2 &&
      home.subs.every((s) => /^a prospect, /.test(s || "")) && new Set(home.subs).size === 2,
    JSON.stringify({ cuttings: home.cuttings, prospects: home.prospects, subs: home.subs, titles: home.titles }),
  );
}

// A MIXED folio, kept to three sheets because each one is a real worker job that its lane pays for in seconds.
export async function cd32MixedFolio({ evaluate, send, check, sleep, PORT }: SuiteContext): Promise<void> {
  const MIXED = [
    "k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-5.ly-5",
    "k-p.seed-42.style-ink.i-3.year-1059",
    "k-p.seed-42.style-antique.i-1.year-1059",
  ].join("_");
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/portfolio/#table=${MIXED}` });
  for (let i = 0; i < 200; i++) { await sleep(100); if (await evaluate<boolean>(`!!window.__vellumPortfolio`)) break; }
  const PFM: Payload<{ items: number; drawn: number; rows: number; thumbs: number; awaited: number; bands: string[]; titles: string[]; downloads: number; bound: string | null } | null> = `(() => { const s = window.__vellumPortfolio ? window.__vellumPortfolio() : null; return s ? { ...s,
      rows: document.querySelectorAll("#pf-contents .row").length,
      thumbs: document.querySelectorAll("#pf-contents .thumb img").length,
      awaited: document.querySelectorAll("#pf-contents .thumb.awaited").length,
      bands: [...document.querySelectorAll("#pf-contents .row-band")].map((e) => e.textContent),
      titles: [...document.querySelectorAll("#pf-contents .row-title")].map((e) => e.textContent),
      downloads: [...document.querySelectorAll("#pf-contents .row-download")].filter((b) => !b.disabled).length,
      bound: (document.getElementById("pf-bound") || {}).textContent || null } : null; })()`;
  let pfm = await evaluate(PFM);
  for (let i = 0; i < DRAWN && (!pfm || pfm.drawn < 3); i++) { await sleep(50); pfm = await evaluate(PFM); }
  check(
    "CD32 a MIXED folio drafts every sheet in its OWN dress: the prospects draw beside the survey instead of holding a reserved place, each row names its dress and offers its own engraving, and no row is left reading 'a prospect' (#401 ruling 8, and #521 ruling 3 held the place only until this sub)",
    !!pfm && pfm.items === 3 && pfm.drawn === 3 && pfm.rows === 3 && pfm.thumbs === 3 && pfm.awaited === 0 &&
      pfm.downloads === 3 &&
      pfm.bands.filter((b) => /^a prospect, pen & ink, \d+$/.test(b || "")).length === 1 &&
      pfm.bands.filter((b) => /^a prospect, antique, \d+$/.test(b || "")).length === 1 &&
      pfm.bands.filter((b) => /^band \d+, antique$/.test(b || "")).length === 1 &&
      !pfm.bands.some((b) => /awaiting its page/.test(b || "")) &&
      pfm.titles.filter((t) => /^The Prospect of \S/.test(t || "")).length === 2 &&
      /three sheets drafted/i.test(pfm.bound || ""),
    JSON.stringify(pfm),
  );
}
