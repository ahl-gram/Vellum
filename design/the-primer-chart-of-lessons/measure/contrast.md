# The chart of lessons' inks against the 4.5:1 floor

Computed from the token values in `src/styles/shared/shell.css` at 94ad4392 with the WCAG formula, each wash blended over its ground as the mock declares it (`mock/dress.ts`). Not sampled from pixels. A mark that is not text is held to 3:1, the floor for a graphic a reader must see; the house's own floor is for text.

| what | inks | ratio | floor | passes |
|---|---|---|---|---|
| a taught room's name, dark ink, on the land wash | --ink-dark on --parchment-deep 0.6 over --chart-paper | 8.41:1 | 4.5:1 | yes |
| a taught room's name, dark ink, on the sea | --ink-dark on --chart-paper | 9.14:1 | 4.5:1 | yes |
| an untaught place's name, brown, on the land wash | --ink-brown on the land wash | 5.02:1 | 4.5:1 | yes |
| an untaught place's name, brown, on the sea | --ink-brown on --chart-paper | 5.45:1 | 4.5:1 | yes |
| the open room's name on its gold light | --ink-dark on --control-gold | 8.72:1 | 4.5:1 | yes |
| a lesson's numeral on a waypoint not done | --ink-dark on --parchment-bright | 10.44:1 | 4.5:1 | yes |
| a done lesson's numeral on its red seal | --parchment-bright on --iron-red | 9.68:1 | 4.5:1 | yes |
| the same, where the seal's cream shine is brightest | --parchment-bright on --parchment-bright 0.3 over --iron-red | 4.55:1 | 4.5:1 | yes |
| the key line under the chart, on the sheet | --ink-brown on --parchment-panel | 5.64:1 | 4.5:1 | yes |
| a ring's step not yet done (a mark, not text) | --ink-faded on the land wash | 3.49:1 | 3:1 | yes |
| a ring's step done (a mark, not text) | --iron-red on the land wash | 7.80:1 | 3:1 | yes |
| a begun waypoint's red rim (a mark, not text) | --iron-red on --parchment-bright | 9.68:1 | 3:1 | yes |
| the dark dress: a name, parchment, on the panel | --parchment on --chart-ink 0.985 | 9.95:1 | 4.5:1 | yes |
| the dark dress: a numeral, cream, on a waypoint | --parchment-bright on --chart-ink | 12.11:1 | 4.5:1 | yes |
| the dark dress: a done seal's red fill against the panel (a mark) | --iron-red against --chart-ink 0.985 | 1.20:1 | 3:1 | NO |
| the dark dress: the same seal's cream rim against the panel (a mark) | --parchment-bright against --chart-ink 0.985 | 11.59:1 | 3:1 | yes |
| the card: a step count, brown, on the card | --ink-brown on --parchment-panel | 5.64:1 | 4.5:1 | yes |
| the card: a done count, red, on the card | --iron-red on --parchment-panel | 8.78:1 | 4.5:1 | yes |

Written by `node out/1256/mock/measure.ts`.
