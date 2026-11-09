# The guide grows with the site: four cases, run

`node out/1155/mock/growth.ts`, the round's ladders against the real route tree at 089881ad. The check is `untaught` and the seating is `seated`, both in `mock/ladder/guide.ts`; neither reads a file, both call `seatOf` from `src/layouts/nav.ts`. In the last two cases the new route is seated under the Explorer by a wrapper round `seatOf` standing in for its line in `ROUTE_CHILDREN`, which the round may not edit; its ladder says nothing of where it sits.

## Today

- `untaught()` names: nothing, the check passes
- the Explorer's subrooms, as the guide seats them: The Prospect, The Wayfarer's Ribbon, The Portfolio

## The Wayfarer's Ribbon's ladder taken away

- `untaught()` names: `/ribbon/`, so the check reds
- the Explorer's subrooms, as the guide seats them: The Prospect, The Portfolio

## A new subroom of the Explorer, /explorer/sounding-room/, in the tree with no ladder

- `untaught()` names: `/explorer/sounding-room/`, so the check reds
- the Explorer's subrooms, as the guide seats them: The Prospect, The Wayfarer's Ribbon, The Portfolio

## The same subroom given its ladder, a stand-in of one empty lesson

- `untaught()` names: nothing, the check passes
- the Explorer's subrooms, as the guide seats them: The Prospect, The Wayfarer's Ribbon, The Portfolio, The Sounding Room
