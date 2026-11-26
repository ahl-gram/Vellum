// Issue #793 round: the references' data file and their downloads. Reads each Commons file's page, original URL, pixel size and licence field from the Commons API (imageinfo with extmetadata) and fetches a working copy at up to 3000 px wide into the main checkout's out/793/refs/. A generic client name only. Run: node out/793/refs-tool/fetch-refs.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { OUT_ROOT } from "../mock/root.ts";

const REFS = `${OUT_ROOT}refs/`;
const UA = "VellumDesignRound/1.0 (design reference fetch)";
export const FILES: ReadonlyArray<{ readonly key: string; readonly title: string; readonly why: string }> = [
  { key: "cologne", title: "File:Frans Hogenberg, Colonia Agrippina (FL43895807 3941855).jpg", why: "streets with the land: the walled half-ring on the river, gates where the roads come in, the streets running to them" },
  { key: "bern", title: "File:MerianBern.jpg", why: "streets with the land: a town laid along the ridge in its river's loop, the streets following the ground" },
  { key: "freiburg", title: "File:Merian Freiburg im Breisgau.jpg", why: "between the two: a founded town whose market streets cross at right angles inside a wall shaped to the ground" },
  { key: "aigues-mortes", title: "File:Plan d'Aigues Mortes et environs - (Bellin) - btv1b85921883.jpg", why: "streets on a grid: a planned port, a rectangle of blocks in a rectangular wall at the water" },
  { key: "valletta", title: "File:Valetta1589.jpg", why: "streets on a grid: a planned capital laid on a grid across its peninsula, the grid ignoring the slope" },
  { key: "palmanova", title: "File:Map of Palmanova in 1593 by Joris Hoefnagel.jpg", why: "a third answer not drawn: the ideal town, streets radiating from the market to the gates, from the Civitates itself" },
];

type Info = { url: string; descriptionurl: string; width: number; height: number; thumburl?: string; thumbwidth?: number; thumbheight?: number; extmetadata?: Record<string, { value: string }> };

const pause = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
async function polite(url: string): Promise<Response> {
  for (let tries = 0; tries < 5; tries++) {
    await pause(3000 + tries * 5000);
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok && !(res.headers.get("content-type") ?? "").startsWith("text/html")) return res;
  }
  throw new Error(`${url} kept refusing`);
}

const plain = (s: string | undefined): string | null => (s === undefined ? null : s.replace(/<[^>]*>/g, "").trim());

mkdirSync(REFS, { recursive: true });
const out: Record<string, unknown> = {};
for (const f of FILES) {
  const api = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=3000&titles=${encodeURIComponent(f.title)}`;
  const res = await polite(api);
  const json = (await res.json()) as { query: { pages: Record<string, { imageinfo?: Info[] }> } };
  const page = Object.values(json.query.pages)[0];
  const info = page?.imageinfo?.[0];
  if (info === undefined) throw new Error(`no imageinfo for ${f.title}`);
  const m = info.extmetadata ?? {};
  const fetchUrl = info.thumburl ?? info.url;
  const img = await polite(fetchUrl);
  const ext = (fetchUrl.split("?")[0]!.split(".").pop() ?? "jpg").toLowerCase();
  const file = `${f.key}.${ext}`;
  writeFileSync(`${REFS}${file}`, Buffer.from(await img.arrayBuffer()));
  out[f.key] = {
    title: f.title,
    page: info.descriptionurl,
    original: info.url,
    width: info.width,
    height: info.height,
    downloaded: file,
    downloadedFrom: fetchUrl,
    downloadedWidth: info.thumbwidth ?? info.width,
    licence: plain(m["LicenseShortName"]?.value),
    artist: plain(m["Artist"]?.value),
    date: plain(m["DateTimeOriginal"]?.value),
    why: f.why,
  };
  console.log(`${f.key}: ${info.width}x${info.height}, ${plain(m["LicenseShortName"]?.value)}, saved ${file}`);
}
writeFileSync(`${REFS}refs.json`, JSON.stringify(out, null, 1));
