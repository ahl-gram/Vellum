# Question 6: which places with no lessons stay on the chart, and in whose names?

The chart of the atelier has five places with no lessons: home (Vellum), the Atlas, the Primer's own isle, Questions & Answers and the Glossary. The last two are the ones the Primer's closing tells you to lean on. Three rooms also go by two names: the slip and the page say "The Seed of the Day", "The Wayfarer's Ribbon" and "Questions & Answers", while the chart of the atelier says "Today", "The Ribbon" and "Q & A".

## A (Recommended): every place, the others pale, in the rooms' own names

The same map as the chart of the atelier, so a reader knows it at a glance. The places with no lessons are drawn pale. Each room is named as the slip beside it names it, so the chart and the list read alike.

- What you give up: the longest names ("The Seed of the Day") make the chart busier, and the smallest name is 13.5 px at 1280 and 10.6 px at 1024. Nothing touches.
- What it costs Sub 11: nothing beyond the drawing; the names come from the site's list of room names (`ROUTE_NAMES` in `src/layouts/nav.ts`).

Stills: `stills/q6-a-every-place-in-the-rooms-own-names-1280.png`, `stills/q6-a-every-place-in-the-rooms-own-names-1280-2x.png`, `stills/q6-a-every-place-in-the-rooms-own-names-1024.png`, `stills/q6-a-every-place-in-the-rooms-own-names-1024-2x.png`.

## B: every place, in the chart of the atelier's names

As A, but named as the head's chart names them: Today, The Ribbon, Q & A.

- What it gives: the two charts match word for word.
- What you give up: the chart and the slip beside it name three rooms differently.
- What it costs Sub 11: nothing beyond the drawing; the names come from `PLACES` in `src/layouts/atelier-chart.ts`.

Stills: `stills/q6-b-every-place-in-the-head-charts-names-1280.png`, `stills/q6-b-every-place-in-the-head-charts-names-1280-2x.png`, `stills/q6-b-every-place-in-the-head-charts-names-1024.png`, `stills/q6-b-every-place-in-the-head-charts-names-1024-2x.png`.

## C: only home and the rooms with lessons

The Atlas, the Primer's isle, Questions & Answers and the Glossary leave the chart.

- What it gives: a cleaner chart drawn a little larger: its smallest name is 16.5 px at 1280 and 12.9 px at 1024, where A's smallest (a pale place's) is 13.5 and 10.6.
- What you give up: it is no longer the map the reader knows, and the two places the Primer says to lean on are gone from it.

Stills: `stills/q6-c-only-the-rooms-with-lessons-1280.png`, `stills/q6-c-only-the-rooms-with-lessons-1280-2x.png`, `stills/q6-c-only-the-rooms-with-lessons-1024.png`, `stills/q6-c-only-the-rooms-with-lessons-1024-2x.png`.
