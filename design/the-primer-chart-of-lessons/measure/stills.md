# Every still, as the probe measured it

Read from `measure/stills-results.json` and `measure/crops-results.json`, taken by `scripts/design/shoot.ts` at a true layout viewport (1280 by 800, or 1024 by 768) over the tree's built site at 94ad4392. A crop's row is its full shot's; the crop itself was shot again at twice the size from the same page.

- **page width**: `document.documentElement.scrollWidth`; equal to the window means nothing runs off sideways.
- **seals**: the page's own `li.step.sealed` count, which says the shot read the seals it was given; **opens on**: the room the page opened (`roomOnArrival`).
- **first step's top**: where the open room's first step starts on the page, in px from the page's top; today it is 485 at 1280 and 539 at 1024, and a window is 800 or 768 tall.
- **name px / numeral px**: the smallest place name and a lesson's numeral, in screen px; **waypoint gap**: the least paper between two waypoints; **places' clearance**: the least paper between two different places' marks (pips, waypoints, rings).
- **collisions**: names against names, waypoints, pips and rings, and waypoints against waypoints, by their boxes (a waypoint as a circle); **card covers**: how many names, waypoints and pips a card lies over.

| still | width | page width | seals | opens on | first step's top | chart (px) | name px | numeral px | waypoint gap | places' clearance | collisions | card covers | 4xx or errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| x-today-first-visit-1280.png | 1280 | 1280 | 0 | explorer | 485 | none | none | none | none | none | 0 | no card | none |
| x-today-first-visit-1024.png | 1024 | 1024 | 0 | explorer | 539 | none | none | none | none | none | 0 | no card | none |
| x-today-returner-1280.png | 1280 | 1280 | 36 | explorer | 485 | none | none | none | none | none | 0 | no card | none |
| x-today-returner-1024.png | 1024 | 1024 | 36 | explorer | 539 | none | none | none | none | none | 0 | no card | none |
| x-today-head-chart-open-1280.png | 1280 | 1280 | 36 | explorer | 485 | none | none | none | none | none | 0 | no card | none |
| q1-a-at-the-head-of-the-page-1280.png | 1280 | 1280 | 36 | explorer | 1012 | 734 by 454 | 13.5 | 10.9 | 2.3 | 35.7 | 0 | no card | none |
| q1-a-at-the-head-of-the-page-1024.png | 1024 | 1024 | 36 | explorer | 987 | 573 by 355 | 10.6 | 8.5 | 1.8 | 27.9 | 0 | no card | none |
| q1-a-at-the-head-of-the-page-1280-2x.png | 1280 | 1280 | 36 | explorer | 1012 | 734 by 454 | 13.5 | 10.9 | 2.3 | 35.7 | 0 | no card | none |
| q1-a-at-the-head-of-the-page-first-visit-1280.png | 1280 | 1280 | 0 | explorer | 1012 | 734 by 454 | 13.5 | 10.9 | 2.3 | 35.7 | 0 | no card | none |
| q1-a-at-the-head-of-the-page-one-step-1280.png | 1280 | 1280 | 36 | explorer | 848 (its one step, ending at 958) | 734 by 454 | 13.5 | 10.9 | 2.3 | 35.7 | 0 | no card | none |
| q1-b-in-the-index-slip-1280.png | 1280 | 1280 | 36 | explorer | 485 | 201 by 128 | none | 3.5 | 0.7 | 11.5 | 0 | no card | none |
| q1-b-in-the-index-slip-1024.png | 1024 | 1024 | 36 | explorer | 539 | 201 by 128 | none | 3.5 | 0.7 | 11.5 | 0 | no card | none |
| q1-b-in-the-index-slip-1280-2x.png | 1280 | 1280 | 36 | explorer | 485 | 201 by 128 | none | 3.5 | 0.7 | 11.5 | 0 | no card | none |
| q1-b-in-the-index-slip-one-step-1280.png | 1280 | 1280 | 36 | explorer | 316 (its one step, ending at 426) | 201 by 128 | none | 3.5 | 0.7 | 11.5 | 0 | no card | none |
| q1-c-behind-a-press-1280.png | 1280 | 1280 | 36 | explorer | 485 | 550 by 340 | 10.1 | 8.2 | 1.7 | 26.8 | 0 | 0 | none |
| q1-c-behind-a-press-1024.png | 1024 | 1024 | 36 | explorer | 539 | 518 by 321 | 9.5 | 7.7 | 1.6 | 25.2 | 0 | 0 | none |
| q1-c-behind-a-press-shut-1280.png | 1280 | 1280 | 36 | explorer | 485 | none | none | none | none | none | 0 | no card | none |
| q1-d-at-the-head-with-a-card-1280.png | 1280 | 1280 | 36 | explorer | 1012 | 734 by 454 | 13.5 | 10.9 | 2.3 | 35.7 | 0 | 14 | none |
| q1-d-at-the-head-with-a-card-1024.png | 1024 | 1024 | 36 | explorer | 987 | 573 by 355 | 10.6 | 8.5 | 1.8 | 27.9 | 0 | 21 | none |
| q2-a-a-waypoint-for-each-lesson-1280.png | 1280 | 1280 | 36 | explorer | 1012 | 734 by 454 | 13.5 | 10.9 | 2.3 | 35.7 | 0 | no card | none |
| q2-a-a-waypoint-for-each-lesson-1024.png | 1024 | 1024 | 36 | explorer | 987 | 573 by 355 | 10.6 | 8.5 | 1.8 | 27.9 | 0 | no card | none |
| q2-b-a-ring-of-steps-round-each-room-1280.png | 1280 | 1280 | 36 | explorer | 1019 | 734 by 461 | 13.5 | none | none | 28.8 | 0 | no card | none |
| q2-b-a-ring-of-steps-round-each-room-1024.png | 1024 | 1024 | 36 | explorer | 971 | 573 by 360 | 10.6 | none | none | 22.5 | 0 | no card | none |
| q3-a-the-roads-you-have-taken-1280.png | 1280 | 1280 | 36 | explorer | 1012 | 734 by 454 | 13.5 | 10.9 | 2.3 | 35.7 | 0 | no card | none |
| q3-a-the-roads-you-have-taken-1024.png | 1024 | 1024 | 36 | explorer | 987 | 573 by 355 | 10.6 | 8.5 | 1.8 | 27.9 | 0 | no card | none |
| q3-b-the-lessons-alone-1280.png | 1280 | 1280 | 36 | explorer | 1012 | 734 by 454 | 13.5 | 10.9 | 2.3 | 35.7 | 0 | no card | none |
| q3-b-the-lessons-alone-1024.png | 1024 | 1024 | 36 | explorer | 966 | 573 by 355 | 10.6 | 8.5 | 1.8 | 27.9 | 0 | no card | none |
| q3-c-the-primers-own-route-1280.png | 1280 | 1280 | 36 | explorer | 1012 | 734 by 454 | 13.5 | 10.9 | 2.3 | 35.7 | 0 | no card | none |
| q3-c-the-primers-own-route-1024.png | 1024 | 1024 | 36 | explorer | 987 | 573 by 355 | 10.6 | 8.5 | 1.8 | 27.9 | 0 | no card | none |
| q4-a-done-when-what-can-be-done-here-is-done-1280.png | 1280 | 1280 | 36 | explorer | 1012 | 734 by 454 | 13.5 | 10.9 | 2.3 | 35.7 | 0 | no card | none |
| q4-a-done-when-what-can-be-done-here-is-done-1024.png | 1024 | 1024 | 36 | explorer | 987 | 573 by 355 | 10.6 | 8.5 | 1.8 | 27.9 | 0 | no card | none |
| q4-b-done-only-when-every-step-is-1280.png | 1280 | 1280 | 36 | explorer | 1012 | 734 by 454 | 13.5 | 10.9 | 2.3 | 35.7 | 0 | no card | none |
| q4-b-done-only-when-every-step-is-1024.png | 1024 | 1024 | 36 | explorer | 987 | 573 by 355 | 10.6 | 8.5 | 1.8 | 27.9 | 0 | no card | none |
| q4-a-the-card-1280.png | 1280 | 1280 | 36 | explorer | 485 | 550 by 340 | 10.1 | 8.2 | 1.7 | 26.8 | 0 | 0 | none |
| q5-a-the-room-lit-and-the-hand-1280.png | 1280 | 1280 | 36 | explorer | 1012 | 734 by 454 | 13.5 | 10.9 | 2.3 | 35.7 | 0 | no card | none |
| q5-a-the-room-lit-and-the-hand-1024.png | 1024 | 1024 | 36 | explorer | 987 | 573 by 355 | 10.6 | 8.5 | 1.8 | 27.9 | 0 | no card | none |
| q5-b-you-are-here-1280.png | 1280 | 1280 | 36 | explorer | 1012 | 734 by 454 | 13.5 | 10.9 | 2.3 | 35.7 | 1 | no card | none |
| q5-b-you-are-here-1024.png | 1024 | 1024 | 36 | explorer | 966 | 573 by 355 | 10.6 | 8.5 | 1.8 | 27.9 | 1 | no card | none |
| q6-a-every-place-in-the-rooms-own-names-1280.png | 1280 | 1280 | 36 | explorer | 1012 | 734 by 454 | 13.5 | 10.9 | 2.3 | 35.7 | 0 | no card | none |
| q6-a-every-place-in-the-rooms-own-names-1024.png | 1024 | 1024 | 36 | explorer | 987 | 573 by 355 | 10.6 | 8.5 | 1.8 | 27.9 | 0 | no card | none |
| q6-b-every-place-in-the-head-charts-names-1280.png | 1280 | 1280 | 36 | explorer | 1024 | 734 by 466 | 13.9 | 11.2 | 2.3 | 36.6 | 0 | no card | none |
| q6-b-every-place-in-the-head-charts-names-1024.png | 1024 | 1024 | 36 | explorer | 996 | 573 by 364 | 10.8 | 8.7 | 1.8 | 28.6 | 0 | no card | none |
| q6-c-only-the-rooms-with-lessons-1280.png | 1280 | 1280 | 36 | explorer | 1022 | 734 by 464 | 16.5 | 11.4 | 2.4 | 37.3 | 0 | no card | none |
| q6-c-only-the-rooms-with-lessons-1024.png | 1024 | 1024 | 36 | explorer | 995 | 573 by 362 | 12.9 | 8.9 | 1.9 | 29.1 | 0 | no card | none |
| q7-the-words-under-the-chart-1280.png | 1280 | 1280 | 36 | explorer | 1012 | 734 by 454 | 13.5 | 10.9 | 2.3 | 35.7 | 0 | no card | none |
| q7-the-words-on-the-card-1280.png | 1280 | 1280 | 36 | explorer | 485 | 550 by 340 | 10.1 | 8.2 | 1.7 | 26.8 | 0 | 0 | none |
| q7-the-words-under-the-chart-1024.png | 1024 | 1024 | 36 | explorer | 987 | 573 by 355 | 10.6 | 8.5 | 1.8 | 27.9 | 0 | no card | none |
| q7-the-words-on-the-card-1024.png | 1024 | 1024 | 36 | explorer | 539 | 518 by 321 | 9.5 | 7.7 | 1.6 | 25.2 | 0 | 0 | none |

Written by `node out/1256/mock/tables.ts`.
