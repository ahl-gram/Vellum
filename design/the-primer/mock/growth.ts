// Issue #1155 round: the guide's claim to grow with the site, run rather than described. Four scratch cases against the real route tree (`ROUTE_NAMES` and `seatOf` in `src/layouts/nav.ts`) and the round's ladders: today; one ladder taken away; a new subroom added to the tree with no ladder; the same subroom given its ladder. The new subroom is seated by a wrapper round `seatOf` that stands in for its line in `ROUTE_CHILDREN`, which the round may not edit; the ladder itself says nothing of where it sits. Writes measure/growth.md.
// node out/1155/mock/growth.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROUTE_NAMES, seatOf } from "../../../src/layouts/nav.ts";
import { LADDERS, seated, untaught } from "./ladder/guide.ts";
import type { Ladder } from "./ladder/shape.ts";
import { OUT_1155 } from "./paths.ts";

const NEW_ROUTE = "/explorer/sounding-room/";
const names = { ...ROUTE_NAMES, [NEW_ROUTE]: "The Sounding Room" };
const seat = (route: string): string | null | undefined => (route === NEW_ROUTE ? "/explorer/" : seatOf(route));
const newLadder: Ladder = {
  route: NEW_ROUTE,
  what: "A room invented for this check alone: it does not exist.",
  lessons: [{ id: "first", title: "Its first lesson", gloss: "a stand-in", steps: [] }],
};

const show = (title: string, list: readonly string[], seats: ReturnType<typeof seated>): string =>
  `## ${title}\n\n- \`untaught()\` names: ${list.length === 0 ? "nothing, the check passes" : list.map((r) => `\`${r}\``).join(", ") + ", so the check reds"}\n- the Explorer's subrooms, as the guide seats them: ${seats.find((s) => s.ladder.route === "/explorer/")?.under.map((u) => u.name).join(", ") ?? "none"}\n`;

const out = [
  "# The guide grows with the site: four cases, run",
  "",
  "`node out/1155/mock/growth.ts`, the round's ladders against the real route tree at 089881ad. The check is `untaught` and the seating is `seated`, both in `mock/ladder/guide.ts`; neither reads a file, both call `seatOf` from `src/layouts/nav.ts`. In the last two cases the new route is seated under the Explorer by a wrapper round `seatOf` standing in for its line in `ROUTE_CHILDREN`, which the round may not edit; its ladder says nothing of where it sits.",
  "",
  show("Today", untaught(), seated()),
  show("The Wayfarer's Ribbon's ladder taken away", untaught(LADDERS.filter((l) => l.route !== "/ribbon/")), seated(LADDERS.filter((l) => l.route !== "/ribbon/"))),
  show(`A new subroom of the Explorer, ${NEW_ROUTE}, in the tree with no ladder`, untaught(LADDERS, names, seat), seated(LADDERS, seat, names)),
  show("The same subroom given its ladder, a stand-in of one empty lesson", untaught([...LADDERS, newLadder], names, seat), seated([...LADDERS, newLadder], seat, names)),
].join("\n");
writeFileSync(join(OUT_1155, "measure", "growth.md"), out);
console.log(out);
