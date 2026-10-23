// The Specimen Book's leaned and slid away states (Issue #1034, Alex's ruling 6 on Issue #997): leaned stands one press of the Glass in with the head cluster and the chart folio home on their panels, slid away arms the slide and leans to the press that fills, and the sheet's spill and the Glass's bare ground and the room folio's edge are read there.
import type { Payload } from "../../types.ts";
import { LENS, lensRest } from "../print-room/print.ts";
import { awayFaults, fillOf, fillPressOf, pressDepths, still, travelsOf } from "../slide-away/kit.ts";
import type { Pieces } from "../slide-away/kit.ts";
import { sb5dGlassBare, sb5eFolioPanel } from "./desktop.ts";
import type { SpecimenKit } from "./kit.ts";
import type { Specimen } from "./reads.ts";

const TRANSLATES: Payload<string[]> =
  `["header.chrome", ".corner.bl"].map((s) => getComputedStyle(document.querySelector(s)).translate)`;
const SELECT: Payload<{ label: string; w: number; avail: number }> = `(() => {
  const s = document.getElementById("sb-state"), cs = getComputedStyle(s), label = s.selectedIndex < 0 ? "" : s.options[s.selectedIndex].text;
  const c = document.createElement("canvas").getContext("2d");
  c.font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
  return { label, w: c.measureText(label).width, avail: s.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) };
})()`;

export async function sb16LeanedOne(k: SpecimenKit): Promise<void> {
  const lens = await k.evaluate(LENS);
  const translates = await k.evaluate(TRANSLATES);
  k.check(
    "SB16 leaned stands one press of the Glass in, where the zoomed panels show, and the head cluster and the chart folio stay home there (Alex, 2026-10-23, Issue #997 ruling 6)",
    Math.abs(lens.k - 1.4) <= 0.01 && translates.every((t) => t === "none"),
    JSON.stringify({ k: lens.k, translates }),
  );
}

async function sb17Slid(
  k: SpecimenKit,
  fill: number,
  travels: { up: number; down: number },
  slid: Pieces,
): Promise<void> {
  const want = pressDepths(fillPressOf(fill));
  const faults = awayFaults(slid, travels, "slid away");
  if (Math.abs(slid.k - want) > 0.01)
    faults.push(`the Glass stands at ${slid.k.toFixed(4)}, not the press that fills, ${want.toFixed(4)}`);
  const select = await k.evaluate(SELECT);
  if (!(select.w <= select.avail))
    faults.push(
      `the select cuts its label: "${select.label}" is ${select.w.toFixed(1)} px in ${select.avail.toFixed(1)} px`,
    );
  k.check(
    "SB17 slid away arms the slide from the select and leans the Glass to its press that fills, where the head cluster and the chart folio stand at their thin lines, and the select shows the words whole beside its chevron (Alex, 2026-10-23, Issue #997 ruling 6)",
    faults.length === 0,
    JSON.stringify({ k: slid.k, want, fill, select, ty: [slid.head.ty, slid.folio.ty] }) +
      (faults.length ? `; ${faults.join("; ")}` : ""),
  );
}

function sb5gSpills({ check }: SpecimenKit, slid: Specimen): void {
  check(
    "SB5g slid away, the sheet spills under the top and the left corners and past the foot (the slip holds the right), the magnified look leaned showed at three presses (Alex, 2026-10-23, Issue #997 ruling 6)",
    slid.map!.x < 0 && slid.map!.y < 0 && slid.map!.bottom > 800,
    JSON.stringify(slid.map),
  );
}

async function sb18SlidFromFolded(
  k: SpecimenKit,
  openFill: number,
  travels: { up: number; down: number },
): Promise<void> {
  await k.setState("folded");
  await lensRest(k, "still", "SB18 folded", LENS);
  const folded = await still(k, "SB18 folded");
  const faults: string[] = [];
  if (folded.slip?.open !== false) faults.push("the slip is not folded before the choice (the precondition)");
  await k.setState("slid");
  await lensRest(k, "leaned", "SB18 slid", LENS);
  const slid = await still(k, "SB18 slid");
  const want = pressDepths(fillPressOf(openFill));
  if (slid.slip?.open !== true) faults.push("the slip is not open after the choice");
  if (Math.abs(slid.k - want) > 0.01)
    faults.push(`the Glass stands at ${slid.k.toFixed(4)}, not the open room's press that fills, ${want.toFixed(4)}`);
  faults.push(...awayFaults(slid, travels, "slid away from folded"));
  k.check(
    "SB18 slid away chosen from folded unfolds the slip and leans the Glass to the press that fills the open room, where the head cluster and the chart folio stand at their thin lines (Alex, 2026-10-23, Issue #997 ruling 6)",
    faults.length === 0,
    JSON.stringify({ k: slid.k, want, open: slid.slip?.open }) + (faults.length ? `; ${faults.join("; ")}` : ""),
  );
}

export async function slidStep(k: SpecimenKit, rest: Specimen | null): Promise<void> {
  await k.setState("leaned");
  await lensRest(k, "leaned", "SB17 leaned", LENS);
  const home = await still(k, "SB17 home");
  const interior = await k.brightest(200, 24);
  const fill = fillOf(home, "sheet");
  const travels = travelsOf(home);
  await k.setState("slid");
  await lensRest(k, "leaned", "SB17 slid", LENS);
  const slid = await still(k, "SB17 slid");
  await sb17Slid(k, fill, travels, slid);
  const read = await k.read();
  sb5gSpills(k, read);
  await sb5dGlassBare(k, read, interior);
  await sb5eFolioPanel(k, rest, read);
  await sb18SlidFromFolded(k, fill, travels);
}
