# Item 4: the slim slip in the head cluster while the reader zooms

The Glass lesson's "anew" step ("Keep pressing Draw nearer until the chart is drafted anew.") on the built Explorer at b6a77459, reduced motion, seed 42, the slim slip (B2) in the head cluster and the ring on Draw nearer, the head's slide-away armed by a pointerdown on the Glass as a reader's press arms it (`node out/1248/mock/seats-hand-zoom.ts`). Each row reads the slip's box against the window: its top and foot in px from the window's top, how much of its height stands in the window, the head cluster's own translate and where its top stands, and whether a region has been drafted anew. Every result came back with no 4xx and no console error.

| state | width | slip's top to foot | in the window | wholly in the window | head cluster's translate | region drafted | still |
|---|---|---|---|---|---|---|---|
| at-rest | 1024 | 138 to 209 | 71.484375 of 71 px | yes | none, its top at 22 | no | `shots/4-hand/zoom-b2-at-rest-1024.png` |
| at-rest | 1280 | 138 to 190 | 52.046875 of 52 px | yes | none, its top at 22 | no | `shots/4-hand/zoom-b2-at-rest-1280.png` |
| one-press | 1024 | 138 to 209 | 71.484375 of 71 px | yes | none, its top at 22 | no | `shots/4-hand/zoom-b2-one-press-1024.png` |
| one-press | 1280 | 138 to 190 | 52.046875 of 52 px | yes | none, its top at 22 | no | `shots/4-hand/zoom-b2-one-press-1280.png` |
| two-presses | 1024 | 138 to 209 | 71.484375 of 71 px | yes | none, its top at 22 | yes | `shots/4-hand/zoom-b2-two-presses-1024.png` |
| two-presses | 1280 | 33 to 85 | 52.046875 of 52 px | yes | 0px -105px, its top at -83 | yes | `shots/4-hand/zoom-b2-two-presses-1280.png` |
| drafted-anew | 1024 | 138 to 209 | 71.484375 of 71 px | yes | none, its top at 22 | yes | `shots/4-hand/zoom-b2-drafted-anew-1024.png` |
| drafted-anew | 1280 | 33 to 85 | 52.046875 of 52 px | yes | 0px -105px, its top at -83 | yes | `shots/4-hand/zoom-b2-drafted-anew-1280.png` |
| four-presses | 1024 | 33 to 104 | 71.484375 of 71 px | yes | 0px -105px, its top at -83 | yes | `shots/4-hand/zoom-b2-four-presses-1024.png` |
| four-presses | 1280 | 33 to 85 | 52.046875 of 52 px | yes | 0px -105px, its top at -83 | yes | `shots/4-hand/zoom-b2-four-presses-1280.png` |
| six-presses | 1024 | 33 to 104 | 71.484375 of 71 px | yes | 0px -105px, its top at -83 | yes | `shots/4-hand/zoom-b2-six-presses-1024.png` |
| six-presses | 1280 | 33 to 85 | 52.046875 of 52 px | yes | 0px -105px, its top at -83 | yes | `shots/4-hand/zoom-b2-six-presses-1280.png` |
