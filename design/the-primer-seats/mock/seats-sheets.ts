// Issue #1248 round: the contact sheets, one per item, today's look first where the surface ships, each still captioned, every measured figure in a caption read from a table in measure/. Writes sheets/*.html and shoots them through the shared camera with the main checkout as the served root, each with a probe of the page's laid-out width.
// node out/1248/mock/seats-sheets.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { OUT } from "./seats-paths.ts";
import { cell, esc, fig, MAIN, page, row, rows } from "./seats-sheet-kit.ts";
import { probeOf, shoot } from "./seats-shoot.ts";

const H1 = "1-home.md";
const home = (arm: string, w: number, col: number): string => cell(H1, (c) => c[0] === arm && c[1] === String(w), col);
const homeCap = (arm: string, w: number, lead: string): string =>
  `<b>${esc(lead)}</b> At ${w}: row ${home(arm, w, 3)} px, ${home(arm, w, 4)} px to the Glass; the row over a station: ${esc(home(arm, w, 5))}; the Gallery under the Glass ${home(arm, w, 9)}; over the coordinates line ${home(arm, w, 7)}.`;
const S: Array<{ name: string; width: number; html: string }> = [];

S.push({
  name: "sheet-1-home",
  width: 2260,
  html: page(
    "Item 1: the Primer's station on home",
    "Home at rest, today first, then the pip at Poalo with a fifth legend press, seated each way that keeps the press off the Gallery's slip, at 1024 by 768 and 1280 by 800 (square px from <code>measure/1-home.md</code>). The pip takes Poalo's town dot as every station takes its own. Words are stand-ins (item 7).",
    `<h2>Today, the control</h2>${row(fig("shots/1-home/control-1024.png", 680, homeCap("control", 1024, "Today, 1024.")), fig("shots/1-home/control-1280.png", 680, homeCap("control", 1280, "Today, 1280.")), fig("shots/1-home/control-1024-2x.png", 680, "<b>Today, 1024, the foot at twice the size.</b> The Reading Room's slip under the row (ruled livable at Issue #454's gate), the Gallery's slip under the Glass and past the window's edge."))}
<h2>A as first drawn, and B, the narrower presses</h2>${row(fig("shots/1-home/a-as-first-drawn-1024.png", 680, homeCap("a-as-first-drawn", 1024, "A, as first drawn.")), fig("shots/1-home/b-narrow-presses-1024.png", 680, homeCap("b-narrow-presses", 1024, "B, narrower presses.")), fig("shots/1-home/b-narrow-presses-1280.png", 680, homeCap("b-narrow-presses", 1280, "B at 1280.")))}
${row(fig("shots/1-home/a-as-first-drawn-1024-2x.png", 1040, "<b>A at twice the size</b>: the fifth press runs over the A of A Gallery of Worlds."), fig("shots/1-home/b-narrow-presses-1024-2x.png", 1040, "<b>B at twice the size</b>: the row ends short of the Gallery's slip."))}
<h2>D, the Gallery moored anew, E, the row left of centre, and C, which does not clear</h2>${row(fig("shots/1-home/d-gallery-moored-anew-1024.png", 680, homeCap("d-gallery-moored-anew", 1024, "D, the Gallery at 0.76, 0.53.")), fig("shots/1-home/e-row-left-of-centre-1024.png", 680, homeCap("e-row-left-of-centre", 1024, "E, the row slid left.")), fig("shots/1-home/c-gallery-slip-above-1024.png", 680, homeCap("c-gallery-slip-above", 1024, "C, the Gallery's slip above its mark: not clear.")))}
${row(fig("shots/1-home/b-and-d-together-1024.png", 680, homeCap("b-and-d-together", 1024, "B and D together.")), fig("shots/1-home/d-gallery-moored-anew-1280.png", 680, homeCap("d-gallery-moored-anew", 1280, "D at 1280.")), fig("shots/1-home/f-b-and-reading-room-above-1024.png", 680, homeCap("f-b-and-reading-room-above", 1024, "Beside B, not folded in: the Reading Room's slip above its mark, which re-takes Issue #454's 'livable' ruling.")))}
<h2>The card, and How It Works</h2>${row(fig("shots/1-home/g-b-primer-card-1024.png", 680, "<b>The Primer's card</b>, opened by the page's own press, the chart flown to Poalo; clear of the Glass and the seed card."), fig("shots/1-home/h-b-how-card-1024.png", 680, "<b>How It Works's card</b>, unchanged, with the Primer on the chart."), fig("shots/1-home/control-how-card-1024.png", 680, "<b>Today: How It Works's card</b>, the control."))}`,
    2260,
  ),
});

const T2 = "2-trail.md";
const TT = "2-trail-trim.md";
const worstOf = (file: string, seat: string | null): string => {
  const rs = rows(file).filter((c) => (seat === null || c[0] === seat) && c.some((x) => /pass|FAIL/.test(x)));
  const m = rs.map((c) => Number(/\((-?[\d.]+) to/.exec(c.find((x) => /pass \(|FAIL \(/.test(x)) ?? "(99 to")?.[1] ?? 99));
  return String(Math.min(...m));
};
const trailCap = (seat: string, lead: string): string => `<b>${esc(lead)}</b> On the Prospect at 1024: ${esc(cell(T2, (c) => c[0] === seat && c[2] === "/prospect/" && c[3] === "1024", 4))}.`;
S.push({
  name: "sheet-2-trail",
  width: 2260,
  html: page(
    "Item 2: the press on every room's trail line",
    "The head cluster of the Prospect (the tightest) and the Explorer at 1024, twice the size, the ninth nav item on in every arm. Each caption gives, on the Prospect: the nearest edge / the nearest centre (24 px or more passes the circle-against-circle reading) / the full reading of a thumb's 24 px, with its margin. Every room and every word: <code>measure/2-trail.md</code> and <code>measure/2-trail-trim.md</code>.",
    `<h2>Today, with the ninth item</h2>${row(fig("shots/2-trail/control-prospect-1024-2x.png", 1040, "<b>Today, the Prospect.</b>"), fig("shots/2-trail/control-explorer-1024-2x.png", 1040, "<b>Today, the Explorer.</b>"))}
<h2>A, the twin as first drawn, and A2, the twin trimmed</h2>${row(fig("shots/2-trail/a-twin-prospect-1024-2x.png", 1040, trailCap("a-twin", "A, the twin.")), fig("shots/2-trail/a2-twin-trimmed-prospect-1024-2x.png", 1040, `<b>A2, the twin trimmed.</b> On the Prospect at 1024: ${esc(cell(TT, (c) => c[0] === "learn this room" && c[1] === "/prospect/" && c[2] === "1024", 4))} / ${esc(cell(TT, (c) => c[0] === "learn this room" && c[1] === "/prospect/" && c[2] === "1024", 5))} / ${esc(cell(TT, (c) => c[0] === "learn this room" && c[1] === "/prospect/" && c[2] === "1024", 6))}; its thinnest margin in every room and with every word, ${worstOf(TT, null)} px.`))}
<h2>B, a line of its own, and C, in the room's corner</h2>${row(fig("shots/2-trail/b-own-line-prospect-1024-2x.png", 1040, trailCap("b-own-line", "B, its own line.") + ` The cluster grows ${esc(cell(T2, (c) => c[0] === "b-own-line" && c[2] === "/prospect/" && c[3] === "1024", 7))} px in every room; the Gallery's first row then stands ${esc(cell(TT, (c) => c[0] === "b-own-line" && c[1] === "1024", 4))} px under the cluster (today ${esc(cell(TT, (c) => c[0] === "control" && c[1] === "1024", 4))}).`), fig("shots/2-trail/c-room-folio-prospect-1024-2x.png", 1040, trailCap("c-room-folio", "C, in the corner, off the trail line.")))}
<h2>D, a manicule alone, and E, inside the chart of the atelier</h2>${row(fig("shots/2-trail/d-glyph-after-trail-prospect-1024-2x.png", 1040, trailCap("d-glyph-after-trail", "D, a manicule alone.") + ` It fails on the Print Room: ${esc(cell(T2, (c) => c[0] === "d-glyph-after-trail" && c[2] === "/print-room/" && c[3] === "1024", 4))}.`), fig("shots/2-trail/e-in-the-chart-panel-prospect-1024-2x.png", 1040, trailCap("e-in-the-chart-panel", "E, inside the panel, seen only when it is open.")))}
<h2>At full scale, 1024</h2>${row(fig("shots/2-trail/a2-twin-trimmed-prospect-1024.png", 680, "<b>A2 on the Prospect.</b>"), fig("shots/2-trail/b-own-line-prospect-1024.png", 680, "<b>B on the Prospect</b>: the plate fitted under a taller cluster."), fig("shots/2-trail/a2-twin-trimmed-explorer-1024.png", 680, "<b>A2 on the Explorer.</b>"))}`,
    2260,
  ),
});

const P3 = "3-print.md";
const pr = (arm: string, w: string, holding: string, col: number): string => cell(P3, (c) => c[0] === arm && c[1] === w && c[2] === holding, col);
const prCap = (arm: string, lead: string): string => `<b>${esc(lead)}</b> At 1024: corner ${pr(arm, "1024", "seed 42, antique", 6)} by ${pr(arm, "1024", "seed 42, antique", 7)} px, ${pr(arm, "1024", "seed 42, antique", 8)} control row(s); cut as it opens: ${esc(pr(arm, "1024", "seed 42, antique", 10))}; holding the widest: ${esc(pr(arm, "1024", "widest", 10))}; the chart ${pr(arm, "1024", "seed 42, antique", 11)}.`;
S.push({
  name: "sheet-3-print",
  width: 2260,
  html: page(
    "Item 3: the Print Room's corner beside a ninth nav item",
    "The Print Room's corner at 1024 by 768, twice the size, today with eight items and with the ninth, then each way it stays whole. Every figure from <code>measure/3-print.md</code>; \"the widest\" holds the largest seed and \"topographic\".",
    `<h2>Today</h2>${row(fig("shots/3-print/control-eight-items-1024-2x.png", 1040, prCap("control-eight-items", "Today, eight items.")), fig("shots/3-print/control-ninth-item-1024-2x.png", 1040, prCap("control-ninth-item", "Today's corner beside a ninth item.")))}
<h2>A2 and B</h2>${row(fig("shots/3-print/a2-wrap-only-where-it-must-1024-2x.png", 1040, prCap("a2-wrap-only-where-it-must", "A2, wrap only where it must.")), fig("shots/3-print/b-nav-tightened-1024-2x.png", 1040, prCap("b-nav-tightened", "B, the nav tightened in every room.")))}
<h2>A, D, and C, which does not stay whole</h2>${row(fig("shots/3-print/a-controls-on-two-lines-1024-2x.png", 680, prCap("a-controls-on-two-lines", "A, the controls always wrap.")), fig("shots/3-print/d-style-under-1024-2x.png", 680, prCap("d-style-under", "D, the style list under.")), fig("shots/3-print/c-dice-in-the-seed-box-1024-2x.png", 680, prCap("c-dice-in-the-seed-box", "C, the dice in the seed box.")))}
<h2>At full scale, 1024</h2>${row(fig("shots/3-print/control-ninth-item-1024.png", 680, "<b>Today's room beside a ninth item.</b>"), fig("shots/3-print/a2-wrap-only-where-it-must-1024.png", 680, "<b>A2.</b>"), fig("shots/3-print/b-nav-tightened-1024.png", 680, "<b>B.</b>"))}`,
    2260,
  ),
});

const H4 = "4-hand.md";
const hand = (seat: string, w: string, state: string, col: number): string => cell(H4, (c) => c[0] === seat && c[1] === w && c[2].startsWith(state) && c[3] === "antique", col);
const handCap = (seat: string, w: string, lead: string): string => `<b>${esc(lead)}</b> At ${w}, the step done: over the chart ${hand(seat, w, "done", 5)}; land under it ${esc(hand(seat, w, "done", 6))}; marks ${esc(hand(seat, w, "done", 7))}; the chart drawn ${esc(hand(seat, w, "done", 4))}; the Broadside ${hand(seat, w, "done", 14) === "SCROLLS" ? "scrolls" : "does not scroll"}.`;
const H4SEATS: Array<[string, string]> = [
  ["a-beside-the-broadside", "A, beside the Broadside, as first drawn."],
  ["b-in-the-head-cluster", "B, in the head cluster, the chart fitted clear."],
  ["b2-a-slim-line-under-the-trail", "B2, a slim line under the trail, the chart fitted clear."],
  ["c-in-the-broadside", "C, a band at the Broadside's head."],
  ["c2-in-the-broadsides-masthead", "C2, the step in the Broadside's masthead while it is in hand."],
  ["d-folded-to-a-tab", "D, folded to a tab beside the ring; a press opens it as A."],
  ["d2-one-line-beside-the-ring", "D2, the step's one line beside the ring."],
  ["e-at-the-foot", "E, along the chart's foot."],
];
S.push({
  name: "sheet-4-hand",
  width: 2260,
  html: page(
    "Item 4: the pointing hand's slip at the floor",
    "The Explorer at the islands step (the Land, step 2 of 6), once the step is done and the sea has filled with isles, at the 1024 by 768 floor, today first. \"Land under it\" is the share of the chart's land a reader can see that the slip covers: the isles the step asks the reader to watch. Every figure from <code>measure/4-hand.md</code>, which has 1280 and the arrival too.",
    `<h2>Today, the control</h2>${row(fig("shots/4-hand/control-1024-done.png", 680, "<b>Today, 1024</b>, the step done, no hand."), fig("shots/4-hand/control-1280-done.png", 680, "<b>Today, 1280.</b>"))}
${[0, 3, 6].map((i) => `<h2>${esc(H4SEATS.slice(i, i + 3).map(([, l]) => l.split(",")[0]!).join(", "))}</h2>${row(...H4SEATS.slice(i, i + 3).map(([s, l]) => fig(`shots/4-hand/${s}-1024-done.png`, 680, handCap(s, "1024", l))))}`).join("\n")}
<h2>The designer's seat, B2, in every dress, 1280</h2>${row(...["", "-ink", "-topographic", "-nautical"].map((d) => fig(`shots/4-hand/b2-a-slim-line-under-the-trail-1280-done${d}.png`, 520, `<b>B2${d ? `, ${d.slice(1)}` : ", antique"}.</b>`)))}`,
    2260,
  ),
});

const A5 = "5-atelier.md";
const atl = (arm: string, col: number): string => cell(A5, (c) => c[0] === arm, col);
S.push({
  name: "sheet-5-atelier",
  width: 2260,
  html: page(
    "Item 5: the Primer's place on the chart of the atelier",
    "The real panel, opened on Questions &amp; Answers (where you stand) and on the Primer's own page, with the Primer's place, its road and the dashed track from Q &amp; A laid in, twice the size. Figures from <code>measure/5-atelier.md</code>, in the panel's own units.",
    `<h2>Today</h2>${row(fig("shots/5-atelier/control-in-q-and-a-2x.png", 700, "<b>Today, opened in Q &amp; A.</b>"))}
${["a-at-the-landing", "b-an-isle-of-its-own", "c-on-the-south-shore"].map((k) => `<h2>${esc(k.replace(/-/g, " ").replace(/^(\w)/, (m) => m.toUpperCase()))}</h2>${row(fig(`shots/5-atelier/${k}-in-q-and-a-2x.png`, 700, `<b>Opened in Q &amp; A.</b> Collisions: ${esc(atl(`${k}-in-q-and-a`, 1))}; its label ${esc(atl(`${k}-in-q-and-a`, 2))}; its pip ${esc(atl(`${k}-in-q-and-a`, 3))}.`), fig(`shots/5-atelier/${k}-on-the-primer-2x.png`, 700, "<b>Opened on the Primer's own page.</b>"))}`).join("\n")}`,
    2260,
  ),
});

const S6 = "6-seal.md";
const seal = (k: string, col: number): string => cell(S6, (c) => c[0] === k, col);
S.push({
  name: "sheet-6-seal",
  width: 2260,
  html: page(
    "Item 6: the seal in tokens",
    "The seal beside a done step on the Primer page (1.9rem) and in the step's slip once done (1.5rem), twice the size. The numeral against each stop of the seal's ground, from <code>measure/6-seal.md</code>; the floor is 4.5:1.",
    ["a-raw-red-as-drawn", "b-a-named-token", "c-mixed-from-the-token", "d-one-red-and-a-sheen", "e-flat"].map((k) => `<h2>${esc(seal(k, 1))}</h2>${row(fig(`shots/6-seal/${k}-page-2x.png`, 1100, `<b>On the page.</b> <code>${esc(seal(k, 2))}</code>; ${esc(seal(k, 3))}.`), fig(`shots/6-seal/${k}-slip-2x.png`, 600, "<b>In the slip, done.</b>"))}`).join("\n"),
    2260,
  ),
});

const W7 = "7-words.md";
const wordRows = rows(W7).map((c) => c.map((x) => x.replace(/`/g, "")));
const groups = [...new Set(wordRows.filter((c) => /^shots\/7-words\//.test(c[3] ?? "")).map((c) => /7-words\/(w\d+-[a-z-]+?)-[a-e]-2x/.exec(c[3]!)?.[1] ?? ""))].filter(Boolean);
S.push({
  name: "sheet-7-words",
  width: 2260,
  html: page(
    "Item 7: every stand-in word, in its seat",
    "Each candidate set into its own seat on the real built pages, twice the size; (a) is always the stand-in as first drawn. Each box from <code>measure/7-words.md</code>; the lines under the lessons, the comfort lines and the commissions are listed whole in <code>notes.md</code>. The name, The Primer, is ruled (Issue #1155 ruling 3) and is not offered again.",
    groups
      .map((g) => {
        const rs = wordRows.filter((c) => (c[3] ?? "").includes(`/${g}-`));
        const width = g.startsWith("w10") ? 520 : g.startsWith("w9") ? 1040 : g.startsWith("w3") ? 680 : 520;
        return `<h2>${esc(g)}</h2>${row(...rs.map((c) => fig(c[3]!, width, `<b>(${esc(c[0]!)}) ${esc(c[1]!)}</b>; ${esc(c[2]!)}.`)))}`;
      })
      .join("\n"),
    2260,
  ),
});

mkdirSync(join(OUT, "sheets"), { recursive: true });
for (const s of S) writeFileSync(join(OUT, "sheets", `${s.name}.html`), s.html);
const res = shoot(
  "sheets",
  S.map((s) => ({ url: `/out/1248/sheets/${s.name}.html`, width: s.width, height: 1000, mobile: false as const, out: join(OUT, "sheets", `${s.name}.png`), waitMs: 1500, full: true, probe: "document.documentElement.scrollWidth" })),
  MAIN,
);
res.forEach((r, i) => {
  const w = Number(probeOf<number>(r));
  if (w > S[i]!.width) throw new Error(`${S[i]!.name} lays out ${w} px wide, past its ${S[i]!.width}`);
  console.log(`${S[i]!.name}: scrollWidth ${w} at ${S[i]!.width}`);
});
