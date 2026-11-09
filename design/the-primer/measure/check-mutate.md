# The drift check, made to bite

The same check as `measure/check.md`, run on the steps below with the live page changed under each step before the read (`node out/1155/mock/check.ts shots mutate`). Each change is one a room could make tomorrow. 6 of 6 went red.

| | step | controls | in the built markup | address | what failed |
|---|---|---|---|---|---|
| **RED** | `/explorer/#archipelago` | 2 | 2 of 2 | kept | archipelago taken out of the type list; `#type` reachable (wanted reachable), read "no such option" for "archipelago" |
| **RED** | `/explorer/#held` | 4 | 3 of 4 | kept | the held note reworded; `#land-held-note` held (wanted held), read "the shape keeps the count" for "the outline holds the count; clear the place to free the islands" |
| **RED** | `/explorer/#sea-level` | 2 | 2 of 2 | kept | the sea level row's label renamed to tide; `label[for=land]` reachable (wanted reachable), read "tide" for "sea level" |
| **RED** | `/explorer/#loupe` | 1 | 1 of 1 | kept | the loupe press taken off the Glass; `#zoom-loupe` absent (wanted reachable), read "" for "The loupe" |
| **RED** | `/reading-room/#play` | 1 | 0 of 1 | kept | Play renamed Begin; `.rf-play` reachable (wanted reachable), read "Begin" for "Play" |
| **RED** | `/print-room/#bind` | 1 | 1 of 1 | kept | Bind the atlas moved into a hidden fold; `#pr-bind` hidden (wanted reachable), read "Bind the atlas" for "Bind the atlas" |
