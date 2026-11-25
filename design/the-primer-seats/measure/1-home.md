# Item 1: the Primer's station on home, measured

The real built home page at b6a77459, reduced motion, through the shared camera (`node out/1248/mock/seats-home.ts` from the design tree). Areas are square CSS px. "Row over" is the legend row's whole box, its footing included, against each station's slip and mark; "fifth press over" is the Primer's press box alone. The Gallery columns read its slip and mark against the row, the Glass's visible presses, and the window's edge. The pip columns: whole in the window, edge distance from its mark to the nearest other station's mark, and any area it shares with another station, the Glass, the seed card or the row. Every result came back with no 4xx and no console error.

| arm | width | row lines | row width | row to the Glass | row over (station: area) | fifth press over | row over the coordinates line | Gallery under the row | Gallery under the Glass | Gallery past the window's edge | pip: in window, nearest, shared area | card | still |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| control | 1024 | 1 | 656 | 123 | reading-room 3481 | no fifth press | 234 | 0 | 1337 | 8 |  |  | `shots/1-home/control-1024.png` |
| control | 1280 | 1 | 656 | 251 | reading-room 2695 | no fifth press | 0 | 0 | 0 | 0 |  |  | `shots/1-home/control-1280.png` |
| a-as-first-drawn | 1024 | 1 | 781 | 61 | reading-room 3481, gallery 1108 | gallery 413 | 1354 | 1108 | 1337 | 8 | yes, 247.9 px, 0 |  | `shots/1-home/a-as-first-drawn-1024.png` |
| a-as-first-drawn | 1280 | 1 | 781 | 189 | reading-room 2695, gallery 410 | none | 0 | 410 | 0 | 0 | yes, 259.6 px, 0 |  | `shots/1-home/a-as-first-drawn-1280.png` |
| b-narrow-presses | 1024 | 1 | 705 | 99 | reading-room 3481 | none | 677 | 0 | 1337 | 8 | yes, 247.9 px, 0 |  | `shots/1-home/b-narrow-presses-1024.png` |
| b-narrow-presses | 1280 | 1 | 705 | 227 | reading-room 2695 | none | 0 | 0 | 0 | 0 | yes, 259.6 px, 0 |  | `shots/1-home/b-narrow-presses-1280.png` |
| c-gallery-slip-above | 1024 | 1 | 781 | 61 | reading-room 3481, gallery 114 | none | 1354 | 114 | 1337 | 8 | yes, 247.9 px, 0 |  | `shots/1-home/c-gallery-slip-above-1024.png` |
| c-gallery-slip-above | 1280 | 1 | 781 | 189 | reading-room 2695, gallery 3 | none | 0 | 3 | 0 | 0 | yes, 259.6 px, 0 |  | `shots/1-home/c-gallery-slip-above-1280.png` |
| d-gallery-moored-anew | 1024 | 1 | 781 | 61 | reading-room 3481 | none | 1354 | 0 | 0 | 0 | yes, 247.9 px, 0 |  | `shots/1-home/d-gallery-moored-anew-1024.png` |
| d-gallery-moored-anew | 1280 | 1 | 781 | 189 | reading-room 2695 | none | 0 | 0 | 0 | 0 | yes, 259.6 px, 0 |  | `shots/1-home/d-gallery-moored-anew-1280.png` |
| b-and-d-together | 1024 | 1 | 705 | 99 | reading-room 3481 | none | 677 | 0 | 0 | 0 | yes, 247.9 px, 0 |  | `shots/1-home/b-and-d-together-1024.png` |
| b-and-d-together | 1280 | 1 | 705 | 227 | reading-room 2695 | none | 0 | 0 | 0 | 0 | yes, 259.6 px, 0 |  | `shots/1-home/b-and-d-together-1280.png` |
| e-row-left-of-centre | 1024 | 1 | 781 | 102 | reading-room 3481 | none | 2095 | 0 | 1337 | 8 | yes, 247.9 px, 0 |  | `shots/1-home/e-row-left-of-centre-1024.png` |
| e-row-left-of-centre | 1280 | 1 | 781 | 212 | reading-room 2695 | none | 0 | 0 | 0 | 0 | yes, 259.6 px, 0 |  | `shots/1-home/e-row-left-of-centre-1280.png` |
| f-b-and-reading-room-above | 1024 | 1 | 705 | 99 | none | none | 677 | 0 | 1337 | 8 | yes, 247.9 px, 0 |  | `shots/1-home/f-b-and-reading-room-above-1024.png` |
| f-b-and-reading-room-above | 1280 | 1 | 705 | 227 | none | none | 0 | 0 | 0 | 0 | yes, 259.6 px, 0 |  | `shots/1-home/f-b-and-reading-room-above-1280.png` |
| g-b-primer-card | 1024 | 1 | 705 | 99 | none | none | 920 | 0 | 0 | 770 | yes, 390.7 px, 0 | lf-card-primer, in the window, 0 over the Glass, 0 over the seed card | `shots/1-home/g-b-primer-card-1024.png` |
| g-b-primer-card | 1280 | 1 | 705 | 227 | none | none | 0 | 0 | 0 | 677 | yes, 408.3 px, 0 | lf-card-primer, in the window, 0 over the Glass, 0 over the seed card | `shots/1-home/g-b-primer-card-1280.png` |
| h-b-how-card | 1024 | 1 | 705 | 99 | none | none | 1195 | 0 | 0 | 474 | NO, 390.7 px, 0 | lf-card-how, in the window, 0 over the Glass, 36813 over the seed card | `shots/1-home/h-b-how-card-1024.png` |
| h-b-how-card | 1280 | 1 | 705 | 227 | none | none | 0 | 0 | 0 | 491 | NO, 408.3 px, 0 | lf-card-how, in the window, 0 over the Glass, 36813 over the seed card | `shots/1-home/h-b-how-card-1280.png` |
| control-how-card | 1024 | 1 | 656 | 123 | none | no fifth press | 751 | 0 | 0 | 474 |  | lf-card-how, in the window, 0 over the Glass, 36813 over the seed card | `shots/1-home/control-how-card-1024.png` |
| control-how-card | 1280 | 1 | 656 | 251 | none | no fifth press | 0 | 0 | 0 | 491 |  | lf-card-how, in the window, 0 over the Glass, 36813 over the seed card | `shots/1-home/control-how-card-1280.png` |
| verb-a-learn-one | 1024 | 1 | 781 | 61 | reading-room 3481, gallery 1108 | gallery 413 | 1354 | 1108 | 1337 | 8 | yes, 247.9 px, 0 |  |  |
| verb-a-learn-one | 1280 | 1 | 781 | 189 | reading-room 2695, gallery 410 | none | 0 | 410 | 0 | 0 | yes, 259.6 px, 0 |  |  |
| verb-b-learn-one | 1024 | 1 | 705 | 99 | reading-room 3481 | none | 677 | 0 | 1337 | 8 | yes, 247.9 px, 0 |  |  |
| verb-b-learn-one | 1280 | 1 | 705 | 227 | reading-room 2695 | none | 0 | 0 | 0 | 0 | yes, 259.6 px, 0 |  |  |
| verb-a-learn-how | 1024 | 1 | 781 | 61 | reading-room 3481, gallery 1108 | gallery 413 | 1354 | 1108 | 1337 | 8 | yes, 247.9 px, 0 |  |  |
| verb-a-learn-how | 1280 | 1 | 781 | 189 | reading-room 2695, gallery 410 | none | 0 | 410 | 0 | 0 | yes, 259.6 px, 0 |  |  |
| verb-b-learn-how | 1024 | 1 | 705 | 99 | reading-room 3481 | none | 677 | 0 | 1337 | 8 | yes, 247.9 px, 0 |  |  |
| verb-b-learn-how | 1280 | 1 | 705 | 227 | reading-room 2695 | none | 0 | 0 | 0 | 0 | yes, 259.6 px, 0 |  |  |
| verb-a-start-here | 1024 | 1 | 781 | 61 | reading-room 3481, gallery 1108 | gallery 413 | 1354 | 1108 | 1337 | 8 | yes, 247.9 px, 0 |  |  |
| verb-a-start-here | 1280 | 1 | 781 | 189 | reading-room 2695, gallery 410 | none | 0 | 410 | 0 | 0 | yes, 259.6 px, 0 |  |  |
| verb-b-start-here | 1024 | 1 | 705 | 99 | reading-room 3481 | none | 677 | 0 | 1337 | 8 | yes, 247.9 px, 0 |  |  |
| verb-b-start-here | 1280 | 1 | 705 | 227 | reading-room 2695 | none | 0 | 0 | 0 | 0 | yes, 259.6 px, 0 |  |  |
| verb-a-learn-the-rooms | 1024 | 1 | 781 | 61 | reading-room 3481, gallery 1108 | gallery 413 | 1354 | 1108 | 1337 | 8 | yes, 247.9 px, 0 |  |  |
| verb-a-learn-the-rooms | 1280 | 1 | 781 | 189 | reading-room 2695, gallery 410 | none | 0 | 410 | 0 | 0 | yes, 259.6 px, 0 |  |  |
| verb-b-learn-the-rooms | 1024 | 1 | 705 | 99 | reading-room 3481 | none | 677 | 0 | 1337 | 8 | yes, 247.9 px, 0 |  |  |
| verb-b-learn-the-rooms | 1280 | 1 | 705 | 227 | reading-room 2695 | none | 0 | 0 | 0 | 0 | yes, 259.6 px, 0 |  |  |
| verb-a-learn-to-make-one | 1024 | 1 | 781 | 61 | reading-room 3481, gallery 1108 | gallery 413 | 1354 | 1108 | 1337 | 8 | yes, 247.9 px, 0 |  |  |
| verb-a-learn-to-make-one | 1280 | 1 | 781 | 189 | reading-room 2695, gallery 410 | none | 0 | 410 | 0 | 0 | yes, 259.6 px, 0 |  |  |
| verb-b-learn-to-make-one | 1024 | 1 | 705 | 99 | reading-room 3481 | none | 677 | 0 | 1337 | 8 | yes, 247.9 px, 0 |  |  |
| verb-b-learn-to-make-one | 1280 | 1 | 705 | 227 | reading-room 2695 | none | 0 | 0 | 0 | 0 | yes, 259.6 px, 0 |  |  |
