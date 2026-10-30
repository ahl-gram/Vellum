# The outline roster's extracts

The real places a world can take the shape of, as `npm run outlines` reads them. Each file here holds one Natural Earth file's places, already projected and thinned, one place to a line: its ID (`ne-` and Natural Earth's own serial number for the feature: world identity, never renamed), its English name, its country where it has one, and its parts as integer points. `npm run outlines -- build` turns them into `src/terrain/outline-places.json`, `src/world/outline-place-ids.ts` and `src/world/outline-place-names.json`, and `test/terrain/outline-places.test.ts` rebuilds those from these files and refuses any drift.

Licence: Natural Earth's terms (https://www.naturalearthdata.com/about/terms-of-use/, read 2026-10-19 for the design round of Issue #849) say "All versions of Natural Earth raster + vector map data found on this website are in the public domain.", "No permission is needed to use Natural Earth." and "Crediting the authors is unnecessary."

| extract | full file | scale | download page | bytes | sha256 | extracted | places |
|---|---|---|---|---|---|---|---|
| `country.json` | `ne_10m_admin_0_countries.geojson` | 1:10m | https://www.naturalearthdata.com/downloads/10m-cultural-vectors/ | 13287234 | `239eec57ac17f100a11e2536cffc56752c318b50ae765b0918ff7aab4ce8f255` | 2026-10-29 | 258 |
| `unit.json` | `ne_10m_admin_0_map_units.geojson` | 1:10m | https://www.naturalearthdata.com/downloads/10m-cultural-vectors/ | 13526439 | `57da82be755f4afccd8f3b14251bb2752f5df1395f47d2d86f817470c4a48862` | 2026-10-29 | 47 |
| `state.json` | `ne_10m_admin_1_states_provinces.geojson` | 1:10m | https://www.naturalearthdata.com/downloads/10m-cultural-vectors/ | 40726851 | `22d0e3ad85eb3e27f17cabf8ba2d50e554fbc27a87796ff891d958185da62fb5` | 2026-10-29 | 4596 |
| `lake.json` | `ne_10m_lakes.geojson` | 1:10m | https://www.naturalearthdata.com/downloads/10m-physical-vectors/ | 5043554 | `2d036f53dedec578001c5c30c2959ee7d4eebc1306900fa4367c49929ec8f2d9` | 2026-10-29 | 745 |

Each full file was downloaded from `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/<file>` (the public mirror, tag v5.1.2) and is not committed. The download step is unguarded: a file that differs from the one recorded here is noticed only when someone extracts again and compares the size and checksum this table records. To add places: download the four files into one folder, then `npm run outlines -- extract <folder> <yyyy-mm-dd>`, which appends only the places not already here, never rewrites one that is, and rewrites this table with the files it read, and then `npm run outlines -- build`.
