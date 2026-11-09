# A ninth item on the nav, measured

Each room at the 1024 floor and at 1280, today and with a ninth item added before Q & A under each candidate name, the built page laid out again after the item went in (`node out/1155/mock/top-row.ts`, the design tree's `dist/` at 089881ad, reduced motion). "Gap" is the room's corner's left edge less the nav's last item's right edge, in CSS px, on the shared top row (a negative gap would be an overlap). "Corner rows" counts the lines the corner's own controls stand on. "Cut" lists any control in the corner whose text is wider than its box. With scripts off the top row's script does not run, so the scripts-off case is not measured here: UNVERIFIABLE, and `handbook/errata/site.md` already records two corners running under the eighth item at 1024 with scripts off.

| room | width | ninth item | nav lines | gap | corner width | corner rows | cut |
|---|---|---|---|---|---|---|---|
| /explorer/ | 1024 | today (eight items) | 1 | 121 | 263 | 1 | none |
| /explorer/ | 1024 | Primer | 1 | 65 | 263 | 1 | none |
| /explorer/ | 1024 | Hornbook | 1 | 45 | 263 | 1 | none |
| /explorer/ | 1024 | Schoolroom | 1 | 32 | 263 | 1 | none |
| /explorer/ | 1280 | today (eight items) | 1 | 377 | 263 | 1 | none |
| /explorer/ | 1280 | Primer | 1 | 321 | 263 | 1 | none |
| /explorer/ | 1280 | Hornbook | 1 | 301 | 263 | 1 | none |
| /explorer/ | 1280 | Schoolroom | 1 | 288 | 263 | 1 | none |
| /writing-room/ | 1024 | today (eight items) | 1 | 162 | 221 | 0 | none |
| /writing-room/ | 1024 | Primer | 1 | 106 | 221 | 0 | none |
| /writing-room/ | 1024 | Hornbook | 1 | 86 | 221 | 0 | none |
| /writing-room/ | 1024 | Schoolroom | 1 | 73 | 221 | 0 | none |
| /writing-room/ | 1280 | today (eight items) | 1 | 418 | 221 | 0 | none |
| /writing-room/ | 1280 | Primer | 1 | 362 | 221 | 0 | none |
| /writing-room/ | 1280 | Hornbook | 1 | 342 | 221 | 0 | none |
| /writing-room/ | 1280 | Schoolroom | 1 | 329 | 221 | 0 | none |
| /reading-room/ | 1024 | today (eight items) | 1 | 123 | 261 | 1 | none |
| /reading-room/ | 1024 | Primer | 1 | 67 | 261 | 1 | none |
| /reading-room/ | 1024 | Hornbook | 1 | 47 | 261 | 1 | none |
| /reading-room/ | 1024 | Schoolroom | 1 | 34 | 261 | 1 | none |
| /reading-room/ | 1280 | today (eight items) | 1 | 379 | 261 | 1 | none |
| /reading-room/ | 1280 | Primer | 1 | 323 | 261 | 1 | none |
| /reading-room/ | 1280 | Hornbook | 1 | 303 | 261 | 1 | none |
| /reading-room/ | 1280 | Schoolroom | 1 | 290 | 261 | 1 | none |
| /print-room/ | 1024 | today (eight items) | 1 | 25 | 358 | 1 | none |
| /print-room/ | 1024 | Primer | 1 | 23 | 304 | 1 | pr-style 'antique' 47 in 38 |
| /print-room/ | 1024 | Hornbook | 1 | 3 | 304 | 1 | pr-style 'antique' 47 in 38 |
| /print-room/ | 1024 | Schoolroom | 1 | -10 | 304 | 1 | pr-style 'antique' 47 in 38 |
| /print-room/ | 1280 | today (eight items) | 1 | 239 | 400 | 1 | none |
| /print-room/ | 1280 | Primer | 1 | 183 | 400 | 1 | none |
| /print-room/ | 1280 | Hornbook | 1 | 163 | 400 | 1 | none |
| /print-room/ | 1280 | Schoolroom | 1 | 150 | 400 | 1 | none |
| /prospect/ | 1024 | today (eight items) | 1 | 87 | 296 | 3 | none |
| /prospect/ | 1024 | Primer | 1 | 31 | 296 | 3 | none |
| /prospect/ | 1024 | Hornbook | 1 | 11 | 296 | 3 | none |
| /prospect/ | 1024 | Schoolroom | 1 | -2 | 296 | 3 | none |
| /prospect/ | 1280 | today (eight items) | 1 | 343 | 296 | 3 | none |
| /prospect/ | 1280 | Primer | 1 | 287 | 296 | 3 | none |
| /prospect/ | 1280 | Hornbook | 1 | 267 | 296 | 3 | none |
| /prospect/ | 1280 | Schoolroom | 1 | 254 | 296 | 3 | none |
| /ribbon/ | 1024 | today (eight items) | 1 | 25 | 358 | 4 | none |
| /ribbon/ | 1024 | Primer | 1 | 23 | 304 | 4 | none |
| /ribbon/ | 1024 | Hornbook | 1 | 3 | 304 | 4 | none |
| /ribbon/ | 1024 | Schoolroom | 1 | -10 | 304 | 4 | none |
| /ribbon/ | 1280 | today (eight items) | 1 | 159 | 480 | 3 | none |
| /ribbon/ | 1280 | Primer | 1 | 103 | 480 | 3 | none |
| /ribbon/ | 1280 | Hornbook | 1 | 83 | 480 | 3 | none |
| /ribbon/ | 1280 | Schoolroom | 1 | 70 | 480 | 3 | none |
| /explorer/portfolio/ | 1024 | today (eight items) | 1 | 79 | 304 | 0 | none |
| /explorer/portfolio/ | 1024 | Primer | 1 | 23 | 304 | 0 | none |
| /explorer/portfolio/ | 1024 | Hornbook | 1 | 3 | 304 | 0 | none |
| /explorer/portfolio/ | 1024 | Schoolroom | 1 | -10 | 304 | 0 | none |
| /explorer/portfolio/ | 1280 | today (eight items) | 1 | 335 | 304 | 0 | none |
| /explorer/portfolio/ | 1280 | Primer | 1 | 279 | 304 | 0 | none |
| /explorer/portfolio/ | 1280 | Hornbook | 1 | 259 | 304 | 0 | none |
| /explorer/portfolio/ | 1280 | Schoolroom | 1 | 246 | 304 | 0 | none |
| /seed-of-the-day/ | 1024 | today (eight items) | 1 | 114 | 269 | 0 | none |
| /seed-of-the-day/ | 1024 | Primer | 1 | 58 | 269 | 0 | none |
| /seed-of-the-day/ | 1024 | Hornbook | 1 | 38 | 269 | 0 | none |
| /seed-of-the-day/ | 1024 | Schoolroom | 1 | 25 | 269 | 0 | none |
| /seed-of-the-day/ | 1280 | today (eight items) | 1 | 370 | 269 | 0 | none |
| /seed-of-the-day/ | 1280 | Primer | 1 | 314 | 269 | 0 | none |
| /seed-of-the-day/ | 1280 | Hornbook | 1 | 294 | 269 | 0 | none |
| /seed-of-the-day/ | 1280 | Schoolroom | 1 | 281 | 269 | 0 | none |
| /gallery/ | 1024 | today (eight items) | 1 | 211 | 173 | 0 | none |
| /gallery/ | 1024 | Primer | 1 | 155 | 173 | 0 | none |
| /gallery/ | 1024 | Hornbook | 1 | 135 | 173 | 0 | none |
| /gallery/ | 1024 | Schoolroom | 1 | 122 | 173 | 0 | none |
| /gallery/ | 1280 | today (eight items) | 1 | 467 | 173 | 0 | none |
| /gallery/ | 1280 | Primer | 1 | 411 | 173 | 0 | none |
| /gallery/ | 1280 | Hornbook | 1 | 391 | 173 | 0 | none |
| /gallery/ | 1280 | Schoolroom | 1 | 378 | 173 | 0 | none |
| /faq/ | 1024 | today (eight items) | 1 | 135 | 249 | 0 | none |
| /faq/ | 1024 | Primer | 1 | 79 | 249 | 0 | none |
| /faq/ | 1024 | Hornbook | 1 | 59 | 249 | 0 | none |
| /faq/ | 1024 | Schoolroom | 1 | 46 | 249 | 0 | none |
| /faq/ | 1280 | today (eight items) | 1 | 391 | 249 | 0 | none |
| /faq/ | 1280 | Primer | 1 | 335 | 249 | 0 | none |
| /faq/ | 1280 | Hornbook | 1 | 315 | 249 | 0 | none |
| /faq/ | 1280 | Schoolroom | 1 | 302 | 249 | 0 | none |
| /glossary/ | 1024 | today (eight items) | 1 | 207 | 176 | 1 | none |
| /glossary/ | 1024 | Primer | 1 | 151 | 176 | 1 | none |
| /glossary/ | 1024 | Hornbook | 1 | 131 | 176 | 1 | none |
| /glossary/ | 1024 | Schoolroom | 1 | 118 | 176 | 1 | none |
| /glossary/ | 1280 | today (eight items) | 1 | 463 | 176 | 1 | none |
| /glossary/ | 1280 | Primer | 1 | 407 | 176 | 1 | none |
| /glossary/ | 1280 | Hornbook | 1 | 387 | 176 | 1 | none |
| /glossary/ | 1280 | Schoolroom | 1 | 374 | 176 | 1 | none |
