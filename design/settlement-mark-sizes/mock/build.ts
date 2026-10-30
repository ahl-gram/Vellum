// Issue #1104 round: draws every direction from the real engine with the round's mark variants swapped in, writes the SVGs, the contact sheets and the shot list to the main checkout's out/1104/.
// usage (from the design tree): node --import ./out/1104/mock/hooks.ts out/1104/mock/build.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { PLACES, explorerRegion, explorerSvg, worldSheet, atlasRegion, atlasRegionSvg, anchorIn, centreOf, worldOf, type Place } from "./places.ts";
import { LADDERS, ladder, setMarks, scaled, growAt, TIERS, type Mults } from "./ladder.ts";
import { DRESSES, specimenSvg, boxOf } from "./specimen.ts";
import { page, full, crop, fig, row, type Anchor } from "./sheets.ts";
import type { StyleName } from "../../../src/render/style.ts";

const OUT_ROOT = "/Users/ahl/CodeProjects/Vellum/out/1104";
const SVG = `${OUT_ROOT}/svg`;
const SHEETS = `${OUT_ROOT}/sheets`;
const STILLS = `${OUT_ROOT}/stills`;
for (const d of [SVG, SHEETS, STILLS]) mkdirSync(d, { recursive: true });

// Measured by out/1104/measure/explorer-scale.ts on the build of 108f8db6: the sheet's width on screen, Broadside open or folded alike.
const EX_1280 = 702.953;
const EX_1728 = 1113.609;
// Measured by the atlas probe (out/1104/measure/atlas-shots.json): the regional plate's width on the atlas page at 1280x800.
const ATLAS_1280 = 1001.2;
const HELD = 3;
const ASPECT = 1157.931 / 1500;

type Dir = { readonly key: string; readonly name: string; readonly mult: Mults; readonly keyMult?: Mults; readonly blurb: string };
const hold = (k: string): Dir => {
  const l = ladder(k);
  return { key: k, name: l.name, mult: l.mult, blurb: l.blurb };
};
const grown = (k: string, band: number, keyAtLadder = false): Dir => {
  const l = ladder(k);
  return {
    key: `${k}-grow${keyAtLadder ? "-keyheld" : ""}`,
    name: `${l.name}, grown with depth`,
    mult: scaled(l.mult, growAt(band)),
    keyMult: keyAtLadder ? l.mult : undefined,
    blurb: `${l.blurb}; then every mark drawn ${growAt(band).toFixed(2)} times that at band ${band} (the grow law, this round's pick)`,
  };
};

const digest = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 12);
const write = (name: string, svg: string): string => {
  writeFileSync(`${SVG}/${name}.svg`, svg);
  return `../svg/${name}.svg`;
};
function draw(name: string, d: Dir, style: StyleName, make: () => string): string {
  setMarks(d.mult, style, d.keyMult ?? d.mult);
  return write(name, make());
}

const BAND5_DIRS = (): Dir[] => [hold("today"), hold("a"), hold("b"), hold("c"), grown("a", 5), grown("b", 5)];
const facts: Record<string, unknown> = {};
const shots: unknown[] = [];
const shot = (sheet: string, width: number) => {
  shots.push({
    url: `/out/1104/sheets/${sheet}.html`,
    width,
    height: 900,
    mobile: false,
    full: true,
    out: `${STILLS}/sheet-${sheet}.png`,
    waitMs: 2500,
    probe: "String(document.documentElement.scrollWidth)",
  });
};

function placeSheet(p: Place): void {
  const sh = explorerRegion(p, 5);
  const anchors: Anchor[] = p.crops.map((c) => centreOf(sh.world, c.names));
  const rows: string[] = [];
  const legends: Record<string, string> = {};
  for (const d of BAND5_DIRS()) {
    const src = draw(`${p.key}-b5-${d.key}`, d, "antique", () => explorerSvg(sh));
    legends[d.key] = src;
    rows.push(
      `<h2>${d.name}</h2><p class="tag">${d.blurb}</p>` +
        row(
          fig(full(src, EX_1280, ASPECT), `the deepest band at its own depth, as the Explorer draws it on screen at 1280 by 800 (sheet ${EX_1280.toFixed(0)} px wide)`),
          fig(crop(src, EX_1280, anchors[0]!, 400, 280, 2), `twice the size it stands on screen: ${p.crops[0]!.what}`),
          fig(crop(src, EX_1280, anchors[1]!, 400, 280, 2), `twice the size it stands on screen: ${p.crops[1]!.what}`),
          fig(crop(src, EX_1280, anchorIn(sh.world, p.anchor), 400, 280, HELD), `held (the anchor press, three times), one to one on screen, around ${p.anchor}`),
        ),
    );
  }
  const tiers = sh.world.settlements.map((s, i) => (s.kind === "capital" ? "capital" : sh.world.realms.seats.includes(i) ? "seat" : s.kind));
  const count = TIERS.map((t) => `${tiers.filter((x) => x === t).length} ${t}`).filter((x) => !x.startsWith("0 ")).join(", ");
  facts[p.key] = { seed: p.seed, window: sh.window, title: sh.title, tiers: count };
  writeFileSync(
    `${SHEETS}/${p.key}.html`,
    page(
      `${sh.title}, chart № ${p.seed}, the deepest band`,
      `Seed ${p.seed}, the band-5 window at u0 ${p.band5.u0}, v0 ${p.band5.v0} (${Math.round(p.band5.u0 * 256)}/256, ${Math.round(p.band5.v0 * 256)}/256 of the plot; ${count}). Chosen as ${p.why}. Today first, then the directions. Each row: the whole close-up at the size it stands on screen in the Explorer at 1280 by 800, two crops at twice that, and the view held three times. A name's gap grows with a mark that grows and stays today's where a mark shrinks (a stand-in, not ruled).`,
      rows.join(""),
    ),
  );
  shot(p.key, 2060);
}

function descentSheet(p: Place): void {
  const strips: Array<{ title: string; dirAt: (band: number) => Dir }> = [
    { title: "Today (control)", dirAt: () => hold("today") },
    { title: "A. Order only, held at one size", dirAt: () => hold("a") },
    { title: "A. Order only, grown with depth", dirAt: (b) => grown("a", b) },
    { title: "B. The great made greater, held at one size", dirAt: () => hold("b") },
    { title: "B. The great made greater, grown with depth", dirAt: (b) => grown("b", b) },
  ];
  const world = worldSheet(p);
  const worldSrc = draw(`${p.key}-b0-today`, hold("today"), "antique", () => explorerSvg(world));
  const worldAnchor = anchorIn(world.world, p.anchor);
  const out: string[] = [];
  for (const st of strips) {
    const frames = [fig(crop(worldSrc, EX_1280, worldAnchor, 250, 190, 1), "world sheet, at rest (today's marks under close-ups only)")];
    for (let b = 1; b <= 5; b++) {
      const sh = explorerRegion(p, b);
      const d = st.dirAt(b);
      const src = draw(`${p.key}-b${b}-${d.key}`, d, "antique", () => explorerSvg(sh));
      frames.push(fig(crop(src, EX_1280, anchorIn(sh.world, p.anchor), 250, 190, 1), `band ${b}, at its own depth (${2 ** b} times)`));
      if (b === 5) frames.push(fig(crop(src, EX_1280, anchorIn(sh.world, p.anchor), 250, 190, HELD), "band 5 held, three times"));
    }
    out.push(`<h2>${st.title}</h2>` + row(...frames));
  }
  writeFileSync(
    `${SHEETS}/descent.html`,
    page(
      `Descending on ${p.anchor}, chart № ${p.seed}`,
      `Each frame is one to one with the Explorer at 1280 by 800, centred on the capital ${p.anchor}, at each band's own depth (where the redraft has just landed). Between two bands the marks grow with the camera, up to about one and a half times, then shrink back when the next band lands (measured: out/1104/measure/explorer-scale-1280x800.json). The grow law (each band 1.26 times the band above) is this round's pick, not a ruling.`,
      out.join(""),
    ),
  );
  shot("descent", 1960);
}

function legendSheet(): void {
  const out: string[] = [];
  for (const p of [PLACES[0]!, PLACES[2]!]) {
    const sh = explorerRegion(p, 5);
    const cells: string[] = [];
    const dirs = [...BAND5_DIRS(), grown("a", 5, true), grown("b", 5, true)];
    for (const d of dirs) {
      const svg = (() => {
        setMarks(d.mult, "antique", d.keyMult ?? d.mult);
        return explorerSvg(sh);
      })();
      const src = write(`${p.key}-b5-${d.key}`, svg);
      const m = svg.match(/<g id="layer-legend"><rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/);
      if (!m) throw new Error(`no key on ${p.key} ${d.key}`);
      const [x, y, w, h] = [1, 2, 3, 4].map((i) => Number(m[i]));
      const z = 2;
      const s = (EX_1280 / 1500) * z;
      cells.push(fig(crop(src, EX_1280, { x: x! + w! / 2, y: y! + h! / 2 }, Math.ceil(w! * s) + 24, Math.ceil(h! * s) + 24, z), `<b>${d.name}${d.keyMult ? ", key kept at the ladder's size" : ""}</b><br>twice its size on screen`));
    }
    out.push(`<h2>${sh.title}, chart № ${p.seed}</h2>` + row(...cells));
  }
  writeFileSync(
    `${SHEETS}/key.html`,
    page(
      "The key's rows on the deepest band",
      "The Explorer draws the key on every close-up by default (the legend box is ticked). Its rows call the same mark the sheet draws, so they follow whatever is ruled; the key's own row height and icon column are today's in every frame here. Each key is shown at twice the size it stands on screen at 1280 by 800.",
      out.join(""),
    ),
  );
  shot("key", 2400);
}

function atlasSheet(p: Place): void {
  const region = atlasRegion(p);
  const a = anchorIn(region, p.anchor);
  const out: string[] = [];
  const digests: Record<string, string> = {};
  for (const k of ["today", "a", "b", "c"]) {
    const d = hold(k);
    setMarks(d.mult, "antique");
    const svg = atlasRegionSvg(p);
    digests[k] = digest(svg);
    const src = write(`${p.key}-atlas-${k}`, svg);
    out.push(`<h2>${d.name}</h2><p class="tag">${d.blurb}</p>` + row(fig(full(src, ATLAS_1280, ASPECT), `the atlas's regional plate at the width it stands on the atlas page at 1280 by 800 (${ATLAS_1280.toFixed(0)} px)`), fig(crop(src, ATLAS_1280, a, 420, 300, 2), `twice that, around ${p.anchor}`)));
  }
  facts["atlasDigests"] = digests;
  writeFileSync(
    `${SHEETS}/atlas.html`,
    page(
      `The atlas's regional plate: the Environs of ${p.anchor}, chart № ${p.seed}`,
      `The bound atlas draws two regional plates per world, each a close-up (its window 0.38 of the world), so a close-up-only change reaches them too. They hold no hamlet, farmstead or mill (those need a window of 0.125 and 1/32), so ladder A draws them exactly as today: digests ${JSON.stringify(digests)}.`,
      out.join(""),
    ),
  );
  shot("atlas", 1560);
}

function worldSheetPage(p: Place): void {
  const w = worldSheet(p);
  const a = anchorIn(w.world, p.anchor);
  const out: string[] = [];
  const digests: Record<string, string> = {};
  for (const style of ["antique", "nautical"] as const) {
    for (const k of ["today", "a", "b", "c"]) {
      const d = hold(k);
      setMarks(d.mult, style);
      const svg = explorerSvg(w, style);
      digests[`${style}-${k}`] = digest(svg);
      if (k === "a") continue;
      const src = write(`${p.key}-world-${style}-${k}`, svg);
      out.push(`<h2>${style}: ${d.name}</h2>` + row(fig(full(src, EX_1280, ASPECT), `the world sheet at rest, as on screen at 1280 by 800`), fig(crop(src, EX_1280, a, 420, 300, 2), `twice that, around ${p.anchor}`)));
    }
  }
  facts["worldDigests"] = digests;
  writeFileSync(
    `${SHEETS}/world.html`,
    page(
      `Only if every sheet is ruled: the world sheet, chart № ${p.seed}`,
      `A world sheet holds capitals, seats, towns and villages only, so ladder A draws it byte for byte as today and is left out (digests ${JSON.stringify(digests)}). B and C change it, which is a regeneration of the committed charts, landed alone. Antique stands for ink (the same castle) and nautical for topographic (the same star).`,
      out.join(""),
    ),
  );
  shot("world", 1560);
}

function specimenSheet(): void {
  const rows: string[] = [];
  const table: Record<string, Record<string, Record<string, { w: number; h: number }>>> = {};
  for (const style of DRESSES) {
    const cells: string[] = [];
    for (const l of LADDERS) {
      const src = write(`specimen-${style}-${l.key}`, specimenSvg(style, l.mult));
      const W = 322;
      cells.push(
        fig(
          `<img src="${src}" width="${(W * 2).toFixed(0)}" alt="" style="display:block;background:#f3ead2">` +
            `<div style="display:flex;gap:10px;margin-top:6px;align-items:flex-end"><img src="${src}" width="${(W * (EX_1280 / 1500)).toFixed(1)}" alt=""><img src="${src}" width="${(W * (EX_1728 / 1500)).toFixed(1)}" alt=""></div>`,
          `<b>${l.name}</b><br>large: twice the sheet's own pixels; small: as on screen on the deepest band, held at one size, at 1280 by 800 and at 1728 by 1117`,
        ),
      );
      table[style] = table[style] ?? {};
      table[style]![l.key] = Object.fromEntries(TIERS.map((t) => [t, boxOf(t, style, l.mult)]));
    }
    rows.push(`<h2>${style}${style === "antique" ? " (the only dress a close-up is drawn in)" : ""}</h2>` + row(...cells));
  }
  facts["sizes"] = table;
  writeFileSync(
    `${SHEETS}/specimen.html`,
    page(
      "The seven marks side by side, in every dress",
      "A specimen, not a sheet: each mark drawn by the engine's own mark function at each ladder's sizes. Only antique is ever drawn on a close-up (the Explorer redrafts antique alone), and no world sheet holds a hamlet, farmstead or mill, so the topographic, ink and nautical rows show those three only as a key or a specimen could.",
      rows.join(""),
    ),
  );
  shot("specimen", 2800);
}

for (const p of PLACES) placeSheet(p);
descentSheet(PLACES[0]!);
legendSheet();
atlasSheet(PLACES[0]!);
worldSheetPage(PLACES[0]!);
specimenSheet();
facts["worldTitles"] = Object.fromEntries(PLACES.map((p) => [p.seed, worldOf(p.seed).title.title]));
writeFileSync(`${OUT_ROOT}/measure/build-facts.json`, JSON.stringify(facts, null, 1));
writeFileSync(`${OUT_ROOT}/sheets/shots.json`, JSON.stringify(shots, null, 1));
console.log(`wrote ${shots.length} sheets`);
