import { createRng } from "../core/rng.ts";
import { plateDressFor } from "../prospect/dress/context.ts";
import { prospectPlate } from "../prospect/finished.ts";
import { renderMap } from "../render/map-renderer.ts";
import { armsSvgDocument, paletteForStyle } from "../render/layers/heraldry.ts";
import type { ThemeName } from "../render/layers/field.ts";
import { STYLES, type StyleName } from "../render/style.ts";
import { escapeXml } from "../render/svg.ts";
import { createLoreWriter } from "../society/lore.ts";
import { generateRegionWorld, windowAround } from "../world/region.ts";
import type { World } from "../world/types.ts";

/** key is a stable identifier (the CLI derives filenames from it, the Explorer uses it as a list key); svg is the single source of truth for the drawing. */
export type AtlasPlate = {
  readonly key: string;
  readonly title: string;
  readonly svg: string;
};

/** Filesystem-free and browser-safe (no node:fs), so the CLI and the Explorer compose the same atlas. */
export type AtlasComposition = {
  readonly world: World;
  readonly hero: AtlasPlate;
  readonly draughtings: ReadonlyArray<AtlasPlate>;
  readonly themes: ReadonlyArray<AtlasPlate>;
  readonly regions: ReadonlyArray<AtlasPlate>;
  readonly prospects: ReadonlyArray<AtlasPlate>;
  readonly bannersHtml: string;
  readonly chronicleHtml: string;
  readonly gazetteerHtml: string;
};

const KIND_LABEL: Record<string, string> = {
  capital: "Capital",
  town: "Town",
  village: "Village",
  hamlet: "Hamlet",
};

function gazetteerHtml(world: World): string {
  const lore = createLoreWriter(world, createRng(world.recipe.seed).fork("lore"));
  // hamlet is unreachable (the gazetteer reads the BASE world); listed to keep the kind index total.
  const order = { capital: 0, town: 1, village: 2, hamlet: 3 };
  const sorted = [...world.settlements].sort(
    (a, b) => order[a.kind] - order[b.kind] || a.name.localeCompare(b.name),
  );

  const rows = sorted
    .map((s) => {
      const realmId = world.realms.labels[s.x + s.y * world.elev.w] as number;
      const realm =
        realmId >= 0 && world.names.realms.length > 0
          ? (world.names.realms[realmId] ?? "—")
          : "—";
      const note = lore.settlementNote(s);
      const former = s.formerName
        ? `<span class="former">Once called ${escapeXml(s.formerName)}.</span>`
        : "";
      return `<tr>
  <td class="name ${s.kind}">${escapeXml(s.name)}${former}</td>
  <td>${KIND_LABEL[s.kind]}</td>
  <td>${escapeXml(realm)}</td>
  <td class="note">${escapeXml(note)}</td>
</tr>`;
    })
    .join("\n");

  const realmLines =
    world.names.realms.length > 1
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

function bannersHtml(world: World, style: StyleName): string {
  if (world.arms.length === 0) return "";
  const pal = paletteForStyle(STYLES[style]);
  const label = (realmId: number): string => {
    const named = world.names.realms[realmId];
    if (named) return named;
    const seatIdx = world.realms.seats[realmId];
    const seat = seatIdx !== undefined ? world.settlements[seatIdx] : undefined;
    return seat ? `Arms of ${seat.name}` : `Realm ${realmId + 1}`;
  };
  const banners = world.arms
    .map(
      (arms, realmId) =>
        `<figure class="banner">${armsSvgDocument(arms, 120, pal, `b${realmId}`)}` +
        `<figcaption>${escapeXml(label(realmId))}</figcaption></figure>`,
    )
    .join("\n");
  return `<section>
<h2>Banners of the Realms</h2>
<div class="banners">
${banners}
</div>
</section>`;
}

function chronicleHtml(world: World): string {
  const events = world.history.events;
  if (events.length === 0) return "";
  const items = events
    .map(
      (e) =>
        `<li><span class="year">${e.year}</span> ${escapeXml(e.text)}</li>`,
    )
    .join("\n");
  return `<section>
<h2>Chronicle</h2>
<p class="chronicle-intro">A brief history of ${escapeXml(world.title.title)}, in the years before the present survey.</p>
<ol class="chronicle">
${items}
</ol>
</section>`;
}

function regionPlates(world: World, width: number): AtlasPlate[] {
  const { recipe } = world;
  const capital = world.settlements.find((s) => s.kind === "capital");
  if (!capital) return [];

  const targets = [{ anchor: capital, label: `The Environs of ${capital.name}` }];
  const towns = world.settlements.filter((s) => s.kind === "town");
  if (towns.length > 0) {
    const far = towns.reduce((a, b) =>
      Math.hypot(b.x - capital.x, b.y - capital.y) >
      Math.hypot(a.x - capital.x, a.y - capital.y)
        ? b
        : a,
    );
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

export function prospectPlates(world: World, bannerStyle: StyleName): AtlasPlate[] {
  const capital = world.settlements.findIndex((s) => s.kind === "capital");
  if (capital < 0) return [];
  return [
    {
      key: "prospect-capital",
      title: `The Prospect of ${world.settlements[capital]!.name}`,
      svg: prospectPlate(world, capital, STYLES[plateDressFor(bannerStyle)], world.title.year),
    },
  ];
}

/** The curated theme-to-style pairing the bound atlas shows; the Explorer still crosses every style with every theme. */
const THEMATIC: ReadonlyArray<{ theme: ThemeName; title: string; style: StyleName }> = [
  { theme: "vegetation", title: "Vegetation", style: "antique" },
  { theme: "climate", title: "Temperature", style: "topographic" },
  { theme: "moisture", title: "Rainfall", style: "nautical" },
  { theme: "population", title: "Population", style: "ink" },
];

export function composeAtlas(
  world: World,
  opts: { width?: number; bannerStyle?: StyleName } = {},
): AtlasComposition {
  const width = opts.width ?? 1500;
  const bannerStyle = opts.bannerStyle ?? "antique";
  const hero: AtlasPlate = {
    key: "antique",
    title: "The world chart, drawn in the antique manner",
    svg: renderMap(world, { style: "antique", widthPx: width, legend: true }),
  };
  const draughtings: AtlasPlate[] = [
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
  const themes: AtlasPlate[] = THEMATIC.map(({ theme, title, style }) => ({
    key: `theme-${theme}`,
    title,
    svg: renderMap(world, { style, widthPx: width, theme, legend: true }),
  }));
  return {
    world,
    hero,
    draughtings,
    themes,
    regions: regionPlates(world, width),
    prospects: prospectPlates(world, bannerStyle),
    bannersHtml: bannersHtml(world, bannerStyle),
    chronicleHtml: chronicleHtml(world),
    gazetteerHtml: gazetteerHtml(world),
  };
}
