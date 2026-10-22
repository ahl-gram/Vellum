// Issue #950 round: the contact sheets, the surfaces, the overview and the shot list, from the delivery's facts.json and live/shots-result.json. Every sheet shows each plate as an <img> of its own SVG file, never inline, since every close-up carries the same clip id (`region-land-clip`) and a second inlined sheet would clip to the first one's coast. Every caption quotes a measured fact of the plate it sits under. The sheets link the house faces from design/kit/fonts.css by a relative path, served from the main checkout (`--site` the checkout).
// Run from the tree root: node out/950/mock/pages.ts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createProjection, marginFor } from "../../../src/render/transform.ts";
import { DELIVERY, GRID_H, GRID_W, RENDER_WIDTH, SHA, THEMES, uvOf, winLabel, worldOf } from "./common.ts";
import { slugOf, SVG_H, type Pick, type Plate } from "./build.ts";

const PAGES = `${DELIVERY}/pages`;
const STILLS = `${DELIVERY}/stills`;
const facts = JSON.parse(readFileSync(`${DELIVERY}/facts.json`, "utf8")) as { picks: Pick[]; plates: Plate[] };
type LiveProbe = { viewport: { w: number; h: number } | null; cutting: { w: number; h: number } | null; pfSheet: { w: number; h: number } | null; thumb: { w: number; h: number } | null; loupe: { w: number; h: number } | null };
const live = (JSON.parse(readFileSync(`${DELIVERY}/live/shots-result.json`, "utf8")) as Array<{ out: string; probe: string }>).map((r) => ({ name: r.out.split("/").pop()!.replace(".png", ""), probe: JSON.parse(r.probe) as LiveProbe }));
const probeOf = (name: string): LiveProbe => live.find((l) => l.name === name)!.probe;

// Measured on the live Explorer and Portfolio at this sha (live/shots-result.json): the sheet as the Glass shows a close-up at its band's own depth, at 1440 by 900 and at 1024 by 768; the loupe's glass; the drawer's cutting (its image is 10.6rem wide, 169.6 px, tilted; the probe reads its tilted box); the Portfolio's plate and its contents thumbnail.
const STAGE = probeOf("live-b3-1440x900").viewport!;
const STAGE_SMALL = probeOf("live-b3-1024x768").viewport!;
const LOUPE = probeOf("live-loupe-1440x900").loupe!;
const CUTTING_W = 169.6;
const CUTTING_BOX = probeOf("live-drawer-1440x900").cutting!;
const PORTFOLIO = probeOf("live-portfolio-1440x900").pfSheet!;
const THUMB = probeOf("live-portfolio-1440x900").thumb!;
const W = Math.round(STAGE.w);
const H = Math.round((W * SVG_H) / RENDER_WIDTH);

const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const plate = (place: string, arm: string, band: number, dress = "plain"): Plate => {
  const p = facts.plates.find((x) => x.place === place && x.arm === arm && x.band === band && x.dress === dress);
  if (p === undefined) throw new Error(`no plate ${place} ${arm} ${band} ${dress}`);
  return p;
};
const src = (p: Plate): string => `../svg/${encodeURIComponent(p.file)}`;
const DRESS_NAME: Record<string, string> = { plain: "antique, no theme", vegetation: "vegetation", climate: "temperature", moisture: "rainfall", population: "population" };
const ARM_NAME: Record<string, string> = { today: "today's close-up, by the engine", A: "river arm A, re-route (rivers only: the rest is today's close-up)", B: "river arm B, carve (cut after the chain; the whole close-up worked out on the carved ground)", tier: "the finer tier on arm A (the designer's bold suggestion)" };

function factLine(p: Plate): string {
  const f = p.facts;
  if (f === undefined) return "";
  const tier = f.tier ? `; <b>finer tier: ${f.tier.farmsteads} farmsteads, ${f.tier.mills} mills</b>` : "";
  const bar = f.scaleBarOverrunPx > 0 ? `; <span class="warn">the scale bar runs ${f.scaleBarOverrunPx} px past its paper (of 1500)</span>` : "; scale bar on its paper";
  const sea = f.gatedSeaNearShore > 0 ? `; ${f.gatedSeaNearShore} sea cells beside the shore shut to the sea decorations` : "";
  return `${f.towns} town${f.towns === 1 ? "" : "s"}, ${f.hamlets} hamlet${f.hamlets === 1 ? "" : "s"}${tier}; world rivers drawn: majors ${f.majors}, minors ${f.minors}; world roads drawn ${f.roads}; ${f.borderChains} realm border chain${f.borderChains === 1 ? "" : "s"} in the window${sea}${bar}; ${f.biomes} biomes, the largest ${Math.round(f.largestBiomeShare * 100)}% of the land; worked out in ${f.ms} ms`;
}

const CSS = `body{margin:0;background:#2b2118;color:#f2e8cf;font-family:'EB Garamond','Iowan Old Style',Georgia,serif}
h1{font-family:'IM Fell English SC','Iowan Old Style',Georgia,serif;font-weight:400;font-size:28px;margin:16px 24px 2px;letter-spacing:.02em}
.lede{font-family:'IM Fell English','Iowan Old Style',Georgia,serif;font-style:italic;font-size:17px;color:#e3d3ad;margin:2px 24px 6px;max-width:1700px}
.meta{font-size:14px;color:#cdbb93;margin:2px 24px 10px;max-width:1900px;line-height:1.42}
.row{margin:14px 24px 22px}
.row h2{font-weight:400;font-size:19px;margin:0 0 6px;color:#f2e8cf}
.row h2 .sub{font-size:14px;color:#cdbb93;font-style:italic}
.row h2 .mine{font-size:14px;color:#f0b98a}
.cells{display:grid;gap:14px;align-items:start}
figure{margin:0}
img{display:block;background:#f2e8cf;box-shadow:0 4px 14px rgba(0,0,0,.45)}
figcaption{font-size:13px;line-height:1.38;color:#dccb9f;margin-top:5px}
figcaption b{font-weight:600;color:#f2e8cf}
.warn{color:#f0b98a}
.lens{border-radius:50%;overflow:hidden;position:relative;box-shadow:0 6px 18px rgba(0,0,0,.55);border:2px solid #6b5536}
.lens img{position:absolute;box-shadow:none}
.cut{rotate:-2deg;border:1px solid #c9b48a}
.frame{position:relative;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,.45)}
.frame img{position:absolute;box-shadow:none}`;

const head = (title: string, width: number): string => `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=${width}"><title>${esc(title)}</title><link rel="stylesheet" href="../../../design/kit/fonts.css"><style>${CSS}body{width:${width}px}</style><body>`;

type Shot = { url: string; width: number; height: number; mobile: false; out: string; waitMs: number; full?: boolean; clip?: { x: number; y: number; width: number; height: number; scale: number }; probe?: string };
const shots: Shot[] = [];
const PROBE = "document.documentElement.scrollWidth";
const sheets: Array<{ file: string; title: string; out: string; width: number }> = [];
const addSheet = (file: string, title: string, width: number, outName: string, html: string): void => {
  writeFileSync(`${PAGES}/${file}`, html);
  sheets.push({ file, title, out: outName, width });
  shots.push({ url: `/out/950/pages/${file}`, width, height: 1000, mobile: false, out: `${DELIVERY}/${outName}`, waitMs: 3500, full: true, probe: PROBE });
};

const fig = (p: Plate, caption: string, w = W): string => `<figure><img src="${src(p)}" width="${w}" height="${Math.round((w * SVG_H) / RENDER_WIDTH)}" alt=""><figcaption>${caption}</figcaption></figure>`;
const cellsRow = (title: string, sub: string, figs: string[], cols: number, w = W, mine = ""): string =>
  `<section class="row"><h2>${title} <span class="sub">${sub}</span>${mine ? ` <span class="mine">${mine}</span>` : ""}</h2><div class="cells" style="grid-template-columns:repeat(${cols},${w}px)">${figs.join("")}</div></section>`;

// sweep-places.ts as it ran wrote "on a seed not yet used" for the sea edge, which in fact fell back to seed 42 with every seed taken; its message is corrected in the script, and the caption reads the corrected words rather than the run's.
// The first sweep's "sea edge" is a lake shore: its measure counted every water cell the gate shuts, and the gate shuts a lake whole (sweep-sea-edge.ts says why, and chose the open-sea edge). It is kept for what it shows of the coast at depth, under its true name.
const kindOf = (pick: Pick): string => (pick.kind === "sea edge" ? "lake shore (the first sweep's sea edge)" : pick.kind);
const reasonOf = (pick: Pick): string => (pick.kind === "sea edge" && pick.pickedBecause.includes("not yet used") ? pick.pickedBecause.replace("on a seed not yet used", "on any seed, every seed being taken by an earlier kind") : pick.pickedBecause);

function placeHeader(pick: Pick): string {
  const world = worldOf(pick.seed);
  const { u, v } = uvOf(world, pick.x, pick.y);
  return `<p class="meta">Chart ${pick.seed} (the chart number is the seed), "${esc(world.title.title)}". The place: ${esc(pick.name)}, world cell ${pick.x.toFixed(1)}, ${pick.y.toFixed(1)} (plot uv ${u.toFixed(4)}, ${v.toFixed(4)}). Chosen because: ${esc(pick.why)}; ${esc(reasonOf(pick))} (<i>node out/950/mock/sweep-places.ts</i>, every candidate in <i>measure/places.tsv</i>). Every window is the one the Glass commits for a camera centred there (the lattice-quantised centre, <i>decideSettle</i> in src/world/lod.ts). Every sheet is drawn as the Explorer draws a close-up (detail on, a held chain cache, 1500 px, legend on), at the default coast slider, at ${SHA}. Every plate is shown at ${W} px wide, the size the live Explorer shows a close-up at its own band's depth in a 1440 by 900 window (measured: ${STAGE.w} by ${STAGE.h}).</p>`;
}

const captionOf = (p: Plate, lead: string): string => `<b>${lead}</b>; ${winLabel(p.window)}. ${factLine(p)}${p.note ? `. <i>${esc(p.note)}</i>` : ""}`;

function placeSheet(pick: Pick): void {
  const place = slugOf(pick);
  const world = worldOf(pick.seed);
  const b = (arm: string, band: number): Plate => plate(place, arm, band);
  const rows = [
    cellsRow("The controls: today, as it ships", "band 3 is today's deepest survey; the hold magnifies the band-3 sheet to 16 and 24 times, the deepest a reader sees today", [
      fig(b("today", 3), captionOf(b("today", 3), "Band 3 at 8 times, today's close-up")),
      fig(b("today-held16", 3), captionOf(b("today-held16", 3), "The band-3 sheet held at 16 times") + ". The same ground and size as the band-4 sheet below it."),
      fig(b("today-held24", 3), captionOf(b("today-held24", 3), "The band-3 sheet held at 24 times") + ". Band 5 below shows a third less ground at 32 times."),
    ], 3),
    cellsRow("Today's close-up at depth", "drawn by the engine with no source edit; nothing in the Explorer reaches these bands today", [4, 5, 6].map((band) => fig(b("today", band), captionOf(b("today", band), `Band ${band} at ${2 ** band} times, today's close-up`))), 3),
    cellsRow("River arm A: re-route", "every world river (majors and minors) laid on the cheapest path over the close-up's own detail, inside a world cell of the world's line; a stand-in: the roads, biomes and towns around it are today's, NOT re-derived for the new rivers", [4, 5, 6].map((band) => fig(b("A", band), captionOf(b("A", band), `Band ${band}, arm A`))), 3),
    cellsRow("River arm B: carve", "every world river cut into the ground as a valley inside a world cell of its line, the world's own flow fed in where it enters and let out where it leaves; everything downstream of the ground worked out again on it", [4, 5, 6].map((band) => fig(b("B", band), captionOf(b("B", band), `Band ${band}, arm B`))), 3),
    cellsRow("River arm B cut inside the chain", "the same carve applied to every level the chain builds, so a deeper band inherits its ancestors' valleys (measure/inherit.txt); measured to drown world land at the coast that the cut after the chain does not (measure/arms-summary.txt)", [4, 5, 6].map((band) => fig(b("Binside", band), captionOf(b("Binside", band), `Band ${band}, arm B inside the chain`))), 3),
    cellsRow("River arm B without the cut", "the world's own flow fed in where each river enters and let out where it leaves, the ground left as it is; the close-up's own drainage finds the way", [4, 5, 6].map((band) => fig(b("B0", band), captionOf(b("B0", band), `Band ${band}, arm B without the cut`))), 3, W, "(mine: a variant the measurements turned up, not one of the issue's arms)"),
    cellsRow("The crossing from band 3 to band 4, arm A", "the band-3 sheet as it is, held to the band-4 ground; the arm at band 3, held the same; the arm at band 4 (decision 8 is ruled from these)", [
      fig(b("today-held16", 3), captionOf(b("today-held16", 3), "Today's band 3, held at 16 times")),
      fig(b("A-held16", 3), captionOf(b("A-held16", 3), "Arm A at band 3, held at 16 times")),
      fig(b("A", 4), captionOf(b("A", 4), "Arm A at band 4")),
    ], 3),
    cellsRow("The crossing from band 3 to band 4, arm B", "the same, for the carve", [
      fig(b("today-held16", 3), captionOf(b("today-held16", 3), "Today's band 3, held at 16 times")),
      fig(b("B-held16", 3), captionOf(b("B-held16", 3), "Arm B at band 3, held at 16 times")),
      fig(b("B", 4), captionOf(b("B", 4), "Arm B at band 4")),
    ], 3),
    cellsRow("The smallest tier at depth", "today's hamlets are in every row above; here the finer tier, from band 5, on arm A's sheet", [
      fig(b("today", 5), captionOf(b("today", 5), "Band 5, today's hamlets only")),
      fig(b("tier", 5), captionOf(b("tier", 5), "Band 5, arm A with the finer tier")),
      fig(b("tier", 6), captionOf(b("tier", 6), "Band 6, arm A with the finer tier")),
    ], 3, W, "(mine: the breakdown's bold suggestion, drawn for decision 9; the marks are stand-ins and the sheet's key does not list them)"),
  ];
  const width = 48 + 3 * W + 2 * 14;
  addSheet(`place-${place}.html`, `${kindOf(pick)}: ${pick.name}, chart ${pick.seed}`, width, `sheet-${place}.png`, `${head(`${kindOf(pick)}: ${pick.name}`, width)}<h1>Issue #950 &middot; ${esc(kindOf(pick))}: ${esc(pick.name)}, chart ${pick.seed}</h1><p class="lede">${esc(world.title.title)}: the controls first, then today's close-up at bands 4 to 6, the two river arms, the crossing, and the smallest tier.</p>${placeHeader(pick)}${rows.join("")}</body></html>`);
}

function dressSheet(pick: Pick): void {
  const place = slugOf(pick);
  const w = 420;
  const dresses = ["plain", ...THEMES];
  const rows = [3, 4, 5, 6].map((band) =>
    cellsRow(`Band ${band}`, band === 3 ? "today's deepest survey" : "nothing reaches this band today", dresses.map((d) => fig(plate(place, "today", band, d), `<b>${DRESS_NAME[d]}</b>; ${factLine(plate(place, "today", band, d)).split(";").slice(0, 1).join("")}`, w)), dresses.length, w),
  );
  const width = 48 + dresses.length * w + (dresses.length - 1) * 14;
  addSheet(`dress-${place}.html`, `every dress: ${pick.name}, chart ${pick.seed}`, width, `dress-${place}.png`, `${head(`every dress: ${pick.name}`, width)}<h1>Issue #950 &middot; every dress: ${esc(pick.name)}, chart ${pick.seed}</h1><p class="lede">The finer redraft is antique only (regionEligible in src/site/explorer/app.ts), and a survey carries a theme, so each band is drawn plain and under each of the four themes the Explorer offers (THEMES in src/site/shared/table-address.ts).</p>${placeHeader(pick)}${rows.join("")}</body></html>`);
}

function linesSheet(): void {
  const w = 440;
  const arms: Array<[string, string]> = [
    ["today-line", "today"],
    ["A-line", "arm A"],
    ["B-line", "arm B, cut after the chain"],
    ["Binside-line", "arm B, cut inside the chain"],
    ["B0-line", "arm B without the cut (mine)"],
  ];
  const rows = facts.picks.flatMap((pick) => {
    const place = slugOf(pick);
    return [5, 6].map((band) => cellsRow(`${esc(kindOf(pick))}: ${esc(pick.name)}, chart ${pick.seed}, band ${band}`, "red dashes: the world's own rivers, laid over", arms.map(([arm, label]) => fig(plate(place, arm, band), `<b>${label}</b>; ${winLabel(plate(place, arm, band).window)}`, w)), arms.length, w));
  });
  const width = 48 + arms.length * w + (arms.length - 1) * 14;
  addSheet("lines.html", "the arms against the world's line, bands 5 and 6", width, "sheet-lines.png", `${head("the arms against the world's line", width)}<h1>Issue #950 &middot; the arms against the world's line</h1><p class="lede">A diagnostic, not a direction: each place at bands 5 and 6, today's close-up, the two arms and arm B's two variants, with the world's own rivers drawn over in red dashes, so how far each strays from the world's course can be seen.</p>${rows.join("")}</body></html>`);
}

function overviewSheet(): void {
  const w = 380;
  const rows = facts.picks.map((pick) => {
    const place = slugOf(pick);
    const cells: Array<[Plate, string]> = [
      [plate(place, "today", 3), "band 3, today (8 times)"],
      [plate(place, "today", 5), "band 5, today"],
      [plate(place, "A", 5), "band 5, arm A"],
      [plate(place, "B", 5), "band 5, arm B"],
      [plate(place, "today", 6), "band 6, today"],
      [plate(place, "tier", 6), "band 6, arm A with the finer tier (mine)"],
    ];
    return cellsRow(`${esc(kindOf(pick))}: ${esc(pick.name)}, chart ${pick.seed}`, esc(pick.why), cells.map(([p, l]) => fig(p, `<b>${l}</b>; world rivers drawn: majors ${p.facts!.majors}, minors ${p.facts!.minors}; roads ${p.facts!.roads}${p.facts!.tier ? `; ${p.facts!.tier.farmsteads} farmsteads, ${p.facts!.tier.mills} mills` : `; ${p.facts!.hamlets} hamlets`}`, w)), cells.length, w);
  });
  const width = 48 + 6 * w + 5 * 14;
  addSheet("overview.html", "the round at a glance", width, "overview.png", `${head("the round at a glance", width)}<h1>Issue #950 &middot; the farther interior at a glance</h1><p class="lede">Every place the round looks at, one row each: today's deepest survey, today's close-up at band 5 beside the two river arms, and band 6 today beside the finer tier. Each place has its own sheet with the controls, every band, the crossing and the counts.</p><p class="meta">Drawn at ${SHA} from the real engine at the default coast slider. Each plate is a whole close-up as the Explorer would draw it, shrunk to ${w} px here; the place sheets show them at the live Explorer's own size (${STAGE.w} px).</p>${rows.join("")}</body></html>`);
}

/** A sheet seen through a round lens of the loupe's measured diameter, at twice the depth the sheet is shown at: the sheet's own drawing at twice the stage width, offset so the place sits under the lens's centre. */
function lens(p: Plate, world: ReturnType<typeof worldOf>, pick: Pick, sheetW: number): string {
  const proj = createProjection(GRID_W, GRID_H, sheetW, marginFor(RENDER_WIDTH) * (sheetW / RENDER_WIDTH));
  const { u, v } = uvOf(world, pick.x, pick.y);
  const gx = ((u - p.window.u0) / (p.window.u1 - p.window.u0)) * (GRID_W - 1);
  const gy = ((v - p.window.v0) / (p.window.v1 - p.window.v0)) * (GRID_H - 1);
  const d = LOUPE.w;
  return `<div class="lens" style="width:${d}px;height:${d}px"><img src="${src(p)}" style="width:${sheetW}px;height:${Math.round((sheetW * SVG_H) / RENDER_WIDTH)}px;left:${(d / 2 - proj.px(gx)).toFixed(1)}px;top:${(d / 2 - proj.py(gy)).toFixed(1)}px" alt=""></div>`;
}

function surfacesSheet(pick: Pick): void {
  const place = slugOf(pick);
  const world = worldOf(pick.seed);
  const rowsFor: Array<[Plate, string]> = [
    [plate(place, "today", 3), "Band 3, today (the control)"],
    [plate(place, "today", 4), "Band 4, today"],
    [plate(place, "today", 5), "Band 5, today"],
    [plate(place, "today", 6), "Band 6, today"],
    [plate(place, "B", 6), "Band 6, arm B"],
    [plate(place, "tier", 6), "Band 6, arm A with the finer tier (mine)"],
  ];
  const sw = Math.round(STAGE_SMALL.w);
  const pw = Math.round(PORTFOLIO.w);
  const rows = rowsFor.map(([p, label]) => {
    const cells = [
      `<figure><img src="${src(p)}" width="${sw}" height="${Math.round((sw * SVG_H) / RENDER_WIDTH)}" alt=""><figcaption><b>The Explorer's close-up in a 1024 by 768 window</b>, at its band's own depth: ${STAGE_SMALL.w} by ${STAGE_SMALL.h} px measured</figcaption></figure>`,
      `<figure>${lens(p, world, pick, 2 * Math.round(STAGE.w))}<figcaption><b>The loupe</b> over it in a 1440 by 900 window: a ${LOUPE.w} px glass (measured) at twice the depth, the sheet at ${2 * Math.round(STAGE.w)} px</figcaption></figure>`,
      `<figure><img class="cut" src="${src(p)}" width="${CUTTING_W}" height="${((CUTTING_W * SVG_H) / RENDER_WIDTH).toFixed(1)}" alt=""><figcaption><b>The Chart Table's cutting</b>, ${CUTTING_W} px (10.6rem; ${CUTTING_BOX.w} by ${CUTTING_BOX.h} measured, tilted). A STAND-IN for Sub 4: the table refuses a sheet deeper than band 3 today (<i>c.band &gt; 3</i> in surveyItemFrom)</figcaption></figure>`,
      `<figure><img src="${src(p)}" width="${THUMB.w}" height="${THUMB.h}" alt=""><figcaption><b>The Portfolio's contents thumbnail</b>, ${THUMB.w} by ${THUMB.h} measured; a stand-in for Sub 4 as above</figcaption></figure>`,
    ];
    return `<section class="row"><h2>${label} <span class="sub">${winLabel(p.window)}</span></h2><div class="cells" style="grid-template-columns:${sw}px ${LOUPE.w + 20}px 200px 200px">${cells.join("")}</div></section>`;
  });
  const portfolio = rowsFor
    .filter(([p]) => p.band >= 5 || p.arm === "today")
    .slice(2, 4)
    .map(([p, label]) => `<figure><img src="${src(p)}" width="${pw}" height="${Math.round((pw * SVG_H) / RENDER_WIDTH)}" alt=""><figcaption><b>${label}, as the Portfolio's plate</b>: ${PORTFOLIO.w} by ${PORTFOLIO.h} px measured in a 1440 by 900 window; a stand-in for Sub 4 as above</figcaption></figure>`);
  const width = 48 + sw + LOUPE.w + 20 + 400 + 3 * 14 + 40;
  const pfWidth = 48 + 2 * pw + 14;
  const all = Math.max(width, pfWidth);
  addSheet(`surfaces-${place}.html`, `every surface: ${pick.name}, chart ${pick.seed}`, all, `surfaces-${place}.png`, `${head(`every surface: ${pick.name}`, all)}<h1>Issue #950 &middot; every surface: ${esc(pick.name)}, chart ${pick.seed}</h1><p class="lede">A deep close-up on every surface that shows one, at the size it shows it there, each size measured on the live site at ${SHA} (live/). The live photographs of today's band-3 sheet on each surface are the controls: live/live-b3-1440x900.png, live-b3-1024x768.png, live-loupe-1440x900.png, live-drawer-1440x900.png and live-portfolio-1440x900.png.</p><p class="meta">The Print Room shows no gathered survey: its own page sends a gathered sheet to the Portfolio ("Sheets gathered at the Chart Table are drafted on their own page, The Portfolio", src/pages/print-room/index.astro), and its only regional plates are the bound atlas's two bare close-ups of a 0.38 window, which Issue #450 owns. So there is no Print Room plate to draw. The Explorer at 1440 by 900 shows a close-up at ${STAGE.w} px, the size every place sheet uses.</p>${placeHeader(pick)}${rows.join("")}<section class="row"><h2>The Portfolio's plate <span class="sub">band 5 and band 6, today</span></h2><div class="cells" style="grid-template-columns:repeat(2,${pw}px)">${portfolio.join("")}</div></section></body></html>`);
}

function plateStills(): void {
  writeFileSync(`${PAGES}/plate.html`, `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>plate</title><style>body{margin:0;background:#f2e8cf}img{display:block}</style><body><img id="p" alt=""><script>const q=new URLSearchParams(location.search);const i=document.getElementById("p");i.src="../svg/"+encodeURIComponent(q.get("f"));i.style.width=(q.get("w")||"${W}")+"px";</script></body></html>`);
  const proj = createProjection(GRID_W, GRID_H, RENDER_WIDTH, marginFor(RENDER_WIDTH));
  const CROP_W = 640;
  const CROP_H = 480;
  for (const p of facts.plates) {
    const keep = p.dress === "plain" ? !p.arm.endsWith("-line") : p.band === 3 || p.band === 5;
    if (!keep) continue;
    const pick = facts.picks.find((x) => slugOf(x) === p.place)!;
    const world = worldOf(pick.seed);
    const { u, v } = uvOf(world, pick.x, pick.y);
    const held = p.arm.includes("held");
    const cx = held ? RENDER_WIDTH / 2 : proj.px(((u - p.window.u0) / (p.window.u1 - p.window.u0)) * (GRID_W - 1));
    const cy = held ? proj.heightPx / 2 : proj.py(((v - p.window.v0) / (p.window.v1 - p.window.v0)) * (GRID_H - 1));
    const url = `/out/950/pages/plate.html?f=${encodeURIComponent(p.file)}`;
    shots.push({ url: `${url}&w=${W}`, width: W, height: H, mobile: false, out: `${STILLS}/full/${p.id}.png`, waitMs: 900 });
    const clip = { x: Math.round(Math.max(0, Math.min(RENDER_WIDTH - CROP_W, cx - CROP_W / 2))), y: Math.round(Math.max(0, Math.min(SVG_H - CROP_H, cy - CROP_H / 2))), width: CROP_W, height: CROP_H, scale: 1 };
    shots.push({ url: `${url}&w=${RENDER_WIDTH}`, width: RENDER_WIDTH, height: SVG_H, mobile: false, out: `${STILLS}/crop/${p.id}.png`, waitMs: 900, clip });
  }
}

mkdirSync(PAGES, { recursive: true });
overviewSheet();
for (const pick of facts.picks) placeSheet(pick);
for (const pick of facts.picks) dressSheet(pick);
linesSheet();
for (const pick of facts.picks.filter((p) => p.kind === "capital" || p.kind === "river town")) surfacesSheet(pick);
plateStills();
const sheetShots = shots.filter((s) => s.full === true);
writeFileSync(`${PAGES}/shots-sheets.json`, JSON.stringify(sheetShots, null, 1));
writeFileSync(`${PAGES}/shots-stills.json`, JSON.stringify(shots.filter((s) => s.full !== true), null, 1));
writeFileSync(`${PAGES}/sheets.json`, JSON.stringify(sheets, null, 1));
console.log(`${sheetShots.length} sheets, ${shots.length - sheetShots.length} still shots; plates at ${W} px (stage ${STAGE.w}), small stage ${STAGE_SMALL.w}, loupe ${LOUPE.w}, portfolio ${PORTFOLIO.w}, thumb ${THUMB.w}`);
