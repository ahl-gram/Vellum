// The Ribbon's courtesies (Issue #429): an address the roads refuse is named on the slip, and each town row opens its town's prospect.
import type { Payload } from "../../types.ts";
import { pressAt } from "../print-room/kit.ts";
import { prospectKit, type Prospect } from "../prospect/kit.ts";
import type { RibbonKit } from "./kit.ts";
import { ORPHAN } from "./room.ts";

const REFUSED =
  "No road leaves Tewetulua; this is the road from the capital. The road cannot take you to Tewetulua; this is the road to the farthest place from Laukuwelua.";

type Note = { note: string | null; shown: boolean };
const NOTE: Payload<Note> = `(() => { const n = document.getElementById("rb-fallback"); return { note: n ? n.textContent : null, shown: !!n && n.getBoundingClientRect().width > 0 }; })()`;

export async function rb19Refused(k: RibbonKit): Promise<void> {
  const { evaluate, check, goto, opened } = k;
  await goto(`#seed=42&a=${ORPHAN}&b=${ORPHAN}`);
  const st = await opened("RB19: a road asked from and to Tewetulua");
  const refused = await evaluate(NOTE);
  // Wiring, not a gesture claim: RB6 picks a destination the same way, and the claim is the slip's note clearing, not the select's feel.
  await evaluate(
    `(() => { const sel = document.getElementById("rb-from"); sel.value = "1"; sel.dispatchEvent(new Event("change")); })()`,
  );
  const picked = await opened("RB19: the pick from Paukilua", (s) => s.from === 1);
  const cleared = await evaluate(NOTE);
  check(
    "RB19 an address the roads refuse is named on the slip: asked from and to Tewetulua, which no road leaves, the slip's gloss says the scroll sets out from the capital and why it cannot end there, and a departure picked from the list clears it (Issue #429)",
    st.from === 0 &&
      refused.note === REFUSED &&
      refused.shown &&
      picked.from === 1 &&
      cleared.note === "" &&
      !cleared.shown,
    JSON.stringify({ from: st.from, refused, picked: picked.from, cleared }),
  );
}

type Rows = {
  cls: string;
  name: string | null;
  idx: string | null;
  links: { href: string | null; label: string | null; before: string | null }[];
}[];
const ROWS: Payload<Rows> = `(() => { const from = [...document.getElementById("rb-from").options];
  return [...document.querySelectorAll("#rb-itinerary li")].map((li) => { const strong = li.querySelector(".lean strong"), name = strong ? strong.textContent : null, opt = from.find((o) => o.textContent === name);
    return { cls: li.className, name, idx: opt ? opt.value : null, links: [...li.querySelectorAll("a")].map((a) => ({ href: a.getAttribute("href"), label: a.getAttribute("aria-label"), before: a.previousElementSibling && a.previousElementSibling.className })) }; });
})()`;

type Reach = { x: number; y: number; hit: string | null } | null;
const reachOf = (
  inner: number,
): Payload<Reach> => `(() => { const li = document.querySelectorAll("#rb-itinerary li")[${inner}], a = li && li.querySelector("a");
  if (!a) return null; a.scrollIntoView({ block: "center" }); const r = a.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, hit = document.elementFromPoint(x, y);
  return { x, y, hit: hit === a ? "self" : hit && hit.tagName + (hit.className ? "." + hit.className.split(" ").join(".") : "") }; })()`;

export async function rb20RowProspects(k: RibbonKit): Promise<void> {
  const { evaluate, check, goto, opened } = k;
  await goto("#seed=42&style=ink");
  await opened("RB20: chart 42 in ink");
  const rows = await evaluate(ROWS);
  const faults = rows.flatMap((r, i) => {
    if (r.cls !== "waypoint") return r.links.length > 0 ? [`row ${i} (${r.cls}) carries a link`] : [];
    const [link] = r.links;
    const ok =
      r.idx !== null &&
      r.links.length === 1 &&
      link!.href === `/prospect/#seed=42&style=ink&i=${r.idx}` &&
      link!.label === `See ${r.name} in The Prospect` &&
      link!.before === "lean";
    return ok ? [] : [`row ${i} (${r.name})`];
  });
  const inner = rows.findIndex((r, i) => r.cls === "waypoint" && i > 0 && i < rows.length - 1);
  const reach = inner < 0 ? null : await evaluate(reachOf(inner));
  let landed: Prospect | null = null;
  if (reach !== null && reach.hit === "self") {
    await pressAt(k, reach.x, reach.y);
    landed = await prospectKit(k).opened("RB20: the row's prospect");
  }
  check(
    "RB20 each town row opens its town's prospect: on chart 42 in ink every waypoint row carries one pill beside its lean to The Prospect of that town on the same world, named for it, and no other row does; a real press on a town along the way opens that town's prospect (Issue #429)",
    faults.length === 0 &&
      inner > 0 &&
      reach !== null &&
      reach.hit === "self" &&
      landed !== null &&
      landed.seed === 42 &&
      String(landed.index) === rows[inner]!.idx &&
      landed.name === rows[inner]!.name &&
      landed.hash === "#seed=42&style=ink&i=" + rows[inner]!.idx,
    JSON.stringify({
      faults,
      inner,
      reach,
      landed: landed && { seed: landed.seed, index: landed.index, name: landed.name, hash: landed.hash },
    }),
  );
}
