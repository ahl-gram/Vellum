// The bound atlas's running head: a string like plate-markup.ts, so the suite that reads its dress runs this producer rather than a copy of it.
import { escapeXml } from "../../render/svg.ts";
import type { AtlasDocumentData } from "../../atlas/document.ts";

export const atlasHeadMarkup = (
  atlas: Pick<AtlasDocumentData, "title" | "subtitle" | "seed">,
): string => `<header class="atlas-head print-only">
  <h1>${escapeXml(atlas.title)}</h1>
  <p class="subtitle">${escapeXml(atlas.subtitle)}</p>
  <p class="chartno">VELLUM · CHART № ${atlas.seed}</p>
</header>`;
