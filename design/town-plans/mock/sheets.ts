// Issue #793 round: the contact sheets, the plate viewer and the shot list for scripts/design/shoot.ts. Every sheet links the house faces from design/kit/fonts.css, so it is shot with --site set to the main checkout. Run after build.ts: node out/793/mock/sheets.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { OUT_ROOT as ROOT } from "./root.ts";
import { DIRECTIONS, PLACES, type Place } from "./places.ts";
import { closeupBand } from "./closeup.ts";

const SHEETS = `${ROOT}sheets/`;
const STILLS = `${ROOT}stills/`;
mkdirSync(SHEETS, { recursive: true });

const css = `body{margin:0;background:#2b2118;font-family:'EB Garamond',serif;color:#f2e8cf}
h1{font-family:'IM Fell English SC',serif;font-size:24px;font-weight:400;margin:16px 20px 2px}
p.why{font-family:'IM Fell English',serif;font-style:italic;font-size:15px;margin:0 20px 8px;color:#d9c8a0}
h2{font-size:16px;font-weight:400;margin:12px 20px 4px;color:#d9c8a0}
.grid{display:grid;grid-template-columns:repeat(3,480px);gap:12px 16px;padding:4px 20px 14px}
figure{margin:0}figcaption{font-size:14px;margin:4px 0 0;color:#d9c8a0}
img{display:block;width:480px;height:355px;object-fit:contain;background:#f2e8cf;box-shadow:0 6px 18px rgb(0 0 0 / 0.5)}`;

const head = (title: string): string =>
  `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title><link rel="stylesheet" href="../../../design/kit/fonts.css"><style>${css}</style>`;

const fig = (file: string, caption: string): string => `<figure><img src="../stills/${file}" alt=""><figcaption>${caption}</figcaption></figure>`;

const VIEWS = [
  { key: "plan", name: "From directly above" },
  { key: "bird", name: "The bird's-eye" },
  { key: "prof", name: "The profile" },
] as const;

function control(view: string, place: Place): string {
  if (view === "plan") return `Today: the Explorer's close-up, band ${closeupBand(place.kind)} (the control)`;
  if (view === "bird") return "The ruled mock C, its invented town (the control)";
  return "Today's plate, E (the control)";
}

for (const place of PLACES) {
  const blocks = (["antique", "ink"] as const)
    .map(
      (dress) =>
        `<h2>${dress === "antique" ? "Antique, hand-coloured" : "Ink"}</h2><div class="grid">${VIEWS.map((v) =>
          [fig(`${v.key}-control-${place.slug}-${dress}.svg`, `${v.name}. ${control(v.key, place)}`), ...DIRECTIONS.map((d) => fig(`${v.key}-${d.key}-${place.slug}-${dress}.svg`, `${v.name}. ${d.name}`))].join(""),
        ).join("")}</div>`,
    )
    .join("");
  writeFileSync(`${SHEETS}${place.slug}.html`, `${head(place.slug)}<h1>Issue #793, ${place.title}</h1><p class="why">Chosen because it is ${place.why}.</p>${blocks}`);
}

const shoreSheet = ["capital-laukuwelua", "town-tau"]
  .map((slug) => {
    const p = PLACES.find((q) => q.slug === slug)!;
    return `<h2>${p.title}, streets with the land</h2><div class="grid" style="grid-template-columns:repeat(2,480px)">${VIEWS.filter((v) => v.key !== "prof").map((v) => fig(`${v.key}-land-${slug}-antique.svg`, `${v.name}. Walled on the water too`) + fig(`${v.key}-land-open-${slug}-antique.svg`, `${v.name}. Open to the water, a quay where the wall would stand`)).join("")}</div>`;
  })
  .join("");
writeFileSync(`${SHEETS}shore.html`, `${head("shore")}<h1>Issue #793, the wall at the water</h1><p class="why">Every capital and town is a river-mouth port, and a quarter to a half of a plain ring round each lies in the sea. The profile is not shown: today's plate stands its front row of houses before the wall, so both draw the same there.</p>${shoreSheet}`);

const widthSheet = ["capital-laukuwelua", "capital-grurgthohold", "town-tau", "village-lokai"]
  .map((slug) => {
    const p = PLACES.find((q) => q.slug === slug)!;
    return `<h2>${p.title}</h2><div class="grid">${fig(`prof-control-${slug}-antique.svg`, "Today's plate, E (the control)")}${fig(`prof-land-${slug}-antique.svg`, "From the plan, at today's width")}${fig(`prof-land-true-${slug}-antique.svg`, "From the plan, at the land's own width")}</div>`;
  })
  .join("");
writeFileSync(`${SHEETS}profile-width.html`, `${head("profile width")}<h1>Issue #793, how wide the profile draws the plan</h1><p class="why">Today's plate stretches a town about three times wider than the land it stands on; the plan can keep that or keep the land's own width.</p>${widthSheet}`);

const detailSheet = ["capital-laukuwelua", "seat-mectlan", "town-tau"]
  .map((slug) => {
    const p = PLACES.find((q) => q.slug === slug)!;
    return DIRECTIONS.map((d) => `<h2>${p.title}, ${d.name}</h2><div class="grid" style="grid-template-columns:repeat(2,480px)">${fig(`bird-${d.key}-${slug}-antique.svg`, "Full: a house every frontage, the yards built up in the greater kinds")}${fig(`bird-${d.key}-lean-${slug}-antique.svg`, "Lean: wider houses, more gaps, the yards left open")}</div>`).join("");
  })
  .join("");
writeFileSync(`${SHEETS}detail.html`, `${head("detail")}<h1>Issue #793, how much each kind is built up</h1><p class="why">The full tier puts a capital's bird's-eye at about 2.6 times today's plate; the lean tier puts it near the ruled mock C's own size.</p>${detailSheet}`);

const SMALL = [352, 240, 160];
const smallSheet = ["capital-laukuwelua", "town-tau"]
  .flatMap((slug) =>
    (["bird", "prof"] as const).map((v) => {
      const arms = ["control", "land", "grid"];
      return `<h2>${slug}, ${v === "bird" ? "the bird's-eye" : "the profile"}</h2>${SMALL.map((w) => `<div class="grid" style="grid-template-columns:repeat(3,${w}px)">${arms.map((a) => `<figure><img style="width:${w}px;height:${Math.round((w * 384) / 520)}px" src="../stills/${v}-${a}-${slug}-antique.svg" alt=""><figcaption>${w}px, ${a === "control" ? "the control" : a === "land" ? "A" : "B"}</figcaption></figure>`).join("")}</div>`).join("")}`;
    }),
  )
  .join("");
writeFileSync(`${SHEETS}small.html`, `${head("small")}<h1>Issue #793, at the sizes a plate is shown</h1><p class="why">352px is the earlier round's proxy for the Prospect page's folio column; at 400px and below today's plate drops its key, and at 240px and below its cartouche (SMALL_WIDTH and SMALLEST_WIDTH in src/prospect/dress/compose-e.ts); 160px is the earlier round's place-mark card.</p>${smallSheet}`);

writeFileSync(`${SHEETS}plate.html`, `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>plate</title><style>body{margin:0;background:#f2e8cf}img{display:block}</style><img id="p" alt=""><script>const q=new URLSearchParams(location.search);const i=document.getElementById('p');i.src='../stills/'+q.get('f');i.style.width=(q.get('w')||'1040')+'px';</script>`);

const probe = "String(document.documentElement.scrollWidth)";
const shots: unknown[] = [];
const sheet = (name: string, width: number): void => {
  shots.push({ url: `/out/793/sheets/${name}.html`, width, height: 900, mobile: false, out: `${STILLS}sheet-${name}.png`, full: true, waitMs: 2500, probe });
};
for (const p of PLACES) sheet(p.slug, 1540);
sheet("shore", 1040);
sheet("profile-width", 1540);
sheet("small", 1140);
sheet("detail", 1040);
const CROPS: Record<string, { x: number; y: number }> = { plan: { x: 260, y: 270 }, bird: { x: 260, y: 300 }, prof: { x: 260, y: 120 } };
for (const slug of ["capital-laukuwelua", "town-tau", "capital-grurgthohold"])
  for (const v of ["plan", "bird", "prof"])
    for (const a of ["control", "land", "grid"]) {
      const f = `${v}-${a}-${slug}-antique.svg`;
      shots.push({ url: `/out/793/sheets/plate.html?f=${f}&w=1040`, width: 1040, height: 770, mobile: false, out: `${STILLS}full-${v}-${a}-${slug}-antique.png`, waitMs: 1500 });
      const c = CROPS[v]!;
      shots.push({ url: `/out/793/sheets/plate.html?f=${f}&w=1040`, width: 1040, height: 770, mobile: false, out: `${STILLS}crop-${v}-${a}-${slug}-antique.png`, waitMs: 1500, clip: { x: c.x, y: c.y, width: 520, height: 300, scale: 2 } });
    }
for (const v of ["plan", "bird"])
  for (const a of ["land", "grid"]) {
    const f = `${v}-${a}-capital-laukuwelua-ink.svg`;
    const c = CROPS[v]!;
    shots.push({ url: `/out/793/sheets/plate.html?f=${f}&w=1040`, width: 1040, height: 770, mobile: false, out: `${STILLS}full-${v}-${a}-capital-laukuwelua-ink.png`, waitMs: 1500 });
    shots.push({ url: `/out/793/sheets/plate.html?f=${f}&w=1040`, width: 1040, height: 770, mobile: false, out: `${STILLS}crop-${v}-${a}-capital-laukuwelua-ink.png`, waitMs: 1500, clip: { x: c.x, y: c.y, width: 520, height: 300, scale: 2 } });
  }
for (const v of ["plan", "bird"]) {
  const f = `${v}-land-open-capital-laukuwelua-antique.svg`;
  const c = CROPS[v]!;
  shots.push({ url: `/out/793/sheets/plate.html?f=${f}&w=1040`, width: 1040, height: 770, mobile: false, out: `${STILLS}crop-${v}-land-open-capital-laukuwelua-antique.png`, waitMs: 1500, clip: { x: c.x, y: c.y, width: 520, height: 300, scale: 2 } });
}
for (const d of ["land", "grid"]) {
  const f = `bird-${d}-lean-capital-laukuwelua-antique.svg`;
  shots.push({ url: `/out/793/sheets/plate.html?f=${f}&w=1040`, width: 1040, height: 770, mobile: false, out: `${STILLS}full-bird-${d}-lean-capital-laukuwelua-antique.png`, waitMs: 1500 });
  shots.push({ url: `/out/793/sheets/plate.html?f=${f}&w=1040`, width: 1040, height: 770, mobile: false, out: `${STILLS}crop-bird-${d}-lean-capital-laukuwelua-antique.png`, waitMs: 1500, clip: { x: 260, y: 300, width: 520, height: 300, scale: 2 } });
}
writeFileSync(`${SHEETS}shots.json`, JSON.stringify(shots, null, 1));
console.log(`${shots.length} shots listed in ${SHEETS}shots.json`);
