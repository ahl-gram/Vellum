import { createRng } from "../core/rng.js";
import { renderMap } from "../render/map-renderer.js";
import { armsSvgDocument, paletteForStyle } from "../render/layers/heraldry.js";
import { STYLES } from "../render/style.js";
import { escapeXml } from "../render/svg.js";
import { createLoreWriter } from "../society/lore.js";
import { generateRegionWorld, windowAround } from "../world/region.js";
const KIND_LABEL = {
    capital: "Capital",
    town: "Town",
    village: "Village",
};
function gazetteerHtml(world) {
    const lore = createLoreWriter(world, createRng(world.recipe.seed).fork("lore"));
    const order = { capital: 0, town: 1, village: 2 };
    const sorted = [...world.settlements].sort((a, b) => order[a.kind] - order[b.kind] || a.name.localeCompare(b.name));
    const rows = sorted
        .map((s) => {
        const realmId = world.realms.labels[s.x + s.y * world.elev.w];
        const realm = realmId >= 0 && world.names.realms.length > 0
            ? (world.names.realms[realmId] ?? "—")
            : "—";
        const note = lore.settlementNote(s);
        return `<tr>
  <td class="name ${s.kind}">${escapeXml(s.name)}</td>
  <td>${KIND_LABEL[s.kind]}</td>
  <td>${escapeXml(realm)}</td>
  <td class="note">${escapeXml(note)}</td>
</tr>`;
    })
        .join("\n");
    const realmLines = world.names.realms.length > 1
        ? `<p class="realms">${world.names.realms
            .map((r) => escapeXml(lore.realmNote(r)))
            .join(" ")}</p>`
        : "";
    return `<section>
<h2>Gazetteer</h2>
${realmLines}
<table>
<thead><tr><th>Place</th><th>Rank</th><th>Realm</th><th>Travelers' notes</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
</section>`;
}
/** A plate of every realm's coat of arms. Iterates world.arms (one per seat),
 *  so a single-realm world still shows its banner, labelled by its seat. */
function bannersHtml(world) {
    if (world.arms.length === 0)
        return "";
    const pal = paletteForStyle(STYLES.antique);
    const label = (realmId) => {
        const named = world.names.realms[realmId];
        if (named)
            return named;
        const seatIdx = world.realms.seats[realmId];
        const seat = seatIdx !== undefined ? world.settlements[seatIdx] : undefined;
        return seat ? `Arms of ${seat.name}` : `Realm ${realmId + 1}`;
    };
    const banners = world.arms
        .map((arms, realmId) => `<figure class="banner">${armsSvgDocument(arms, 120, pal, `b${realmId}`)}` +
        `<figcaption>${escapeXml(label(realmId))}</figcaption></figure>`)
        .join("\n");
    return `<section>
<h2>Banners of the Realms</h2>
<div class="banners">
${banners}
</div>
</section>`;
}
/** The regional surveys: the capital's environs and the farthest town's. */
function regionPlates(world, width) {
    const { recipe } = world;
    const capital = world.settlements.find((s) => s.kind === "capital");
    if (!capital)
        return [];
    const targets = [{ anchor: capital, label: `The Environs of ${capital.name}` }];
    const towns = world.settlements.filter((s) => s.kind === "town");
    if (towns.length > 0) {
        const far = towns.reduce((a, b) => Math.hypot(b.x - capital.x, b.y - capital.y) >
            Math.hypot(a.x - capital.x, a.y - capital.y)
            ? b
            : a);
        targets.push({ anchor: far, label: `The Environs of ${far.name}` });
    }
    return targets.map((t, i) => {
        const region = generateRegionWorld(world, {
            window: windowAround(world, t.anchor, 0.38),
            gridW: recipe.gridW,
            gridH: recipe.gridH,
            title: t.label,
        });
        return {
            key: `region-${i + 1}`,
            title: t.label,
            svg: renderMap(region, { style: "antique", widthPx: width, legend: true }),
        };
    });
}
/** The thematic data plates, in atlas order, with their reader-facing captions. */
const THEMATIC = [
    { theme: "vegetation", title: "Vegetation" },
    { theme: "climate", title: "Temperature" },
    { theme: "moisture", title: "Rainfall" },
    { theme: "population", title: "Population" },
];
/**
 * Compose the atlas of a world: the antique hero chart, the other land styles,
 * the thematic data plates, the regional surveys, and the gazetteer/banners HTML
 * fragments. Pure and deterministic — same World in, same bytes out.
 */
export function composeAtlas(world, opts = {}) {
    const width = opts.width ?? 1500;
    const hero = {
        key: "antique",
        title: "The world chart, drawn in the antique manner",
        svg: renderMap(world, { style: "antique", widthPx: width, legend: true }),
    };
    const draughtings = [
        {
            key: "topographic",
            title: "Topographic",
            svg: renderMap(world, { style: "topographic", widthPx: width, legend: true }),
        },
        {
            key: "ink",
            title: "Pen & ink",
            svg: renderMap(world, { style: "ink", widthPx: width, legend: true }),
        },
        {
            key: "nautical",
            title: "Nautical",
            svg: renderMap(world, { style: "nautical", widthPx: width, legend: true }),
        },
    ];
    const themes = THEMATIC.map(({ theme, title }) => ({
        key: `theme-${theme}`,
        title,
        svg: renderMap(world, { style: "antique", widthPx: width, theme, legend: true }),
    }));
    return {
        world,
        hero,
        draughtings,
        themes,
        regions: regionPlates(world, width),
        bannersHtml: bannersHtml(world),
        gazetteerHtml: gazetteerHtml(world),
    };
}
