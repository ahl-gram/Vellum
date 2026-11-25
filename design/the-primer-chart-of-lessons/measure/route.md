# The Primer's own route (question 3, answer C), measured

The route runs from home through the rooms in the page's order (`primerPage` in `src/site/primer/page.ts`): /, /explorer/, /prospect/, /ribbon/, /explorer/portfolio/, /writing-room/, /reading-room/, /print-room/, /seed-of-the-day/, /gallery/. Each leg is drawn as a curve bowed the other way from the chart of the atelier's roads, sampled at 40 points.

- Legs: 9; its length in the chart's units: 1487 (the chart is 600 wide).
- Legs that cross a leg other than their neighbour: 1.
  - /explorer/ to /prospect/ crosses /ribbon/ to /explorer/portfolio/

Written by `node out/1256/mock/measure.ts`.
