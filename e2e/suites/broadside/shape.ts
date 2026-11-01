// The Broadside's shape and count controls (Issue #854, pull request 2): the Land panel's rows by state, the held rows' refusal, the shape box and its list, and the twins that scroll.
import { GROUP_OF, HELD_NOTES, LAND_ROWS, looseWord } from "../../../src/site/explorer/land-rows.ts";
import { writtenHash } from "../../../src/site/shared/written-address.ts";
import { sendKey } from "../../support/home.ts";
import { makeSettle, makeStable } from "../../support/settle.ts";
import type { Payload } from "../../types.ts";
import type { BroadsideKit } from "./kit.ts";

const TEXAS = "ne-1159315211";
const TEXOMA = "ne-1159124507";
const DRAFTING = "Drafting…";
const AEGEAN = "The Aegean: a thousand small isles, olive groves, a warm wine-dark sea, and gods with Greek names.";

type Seat = {
  state: Record<string, string>;
  notes: { land: string; strand: string };
  boxes: { land: boolean; strand: boolean };
  described: Record<string, string | null>;
  place: string;
  landDisabled: string | null;
  readouts: Record<"land" | "coast" | "looseness" | "islands" | "ragged", string | null>;
};
export const SEAT: Payload<Seat> = `(()=>{const group=${JSON.stringify(GROUP_OF)},state={},described={};
  for(const row of ${JSON.stringify(LAND_ROWS)}){const r=document.querySelector('#broadside .l-row[data-row="'+row+'"]');
    const ctl=r&&r.querySelector("input,select");described[row]=ctl?ctl.getAttribute("aria-describedby"):null;
    const shown=!!r&&!!r.firstElementChild&&r.firstElementChild.getClientRects().length>0;if(!shown){state[row]="hidden";continue;}
    const panel=r.closest('.panel[role="group"]'),box=r.closest(".held");
    state[row]=!panel||panel.getAttribute("aria-labelledby")!=="grp-"+group[row]||(!!box&&box.id!==group[row]+"-held")?"astray":box?"held":"live";}
  const noteOf=(g)=>{const box=document.getElementById(g+"-held"),note=document.getElementById(g+"-held-note");return !!box&&!!note&&box.getClientRects().length>0&&note.getClientRects().length>0?note.textContent:"";};
  const shown=(id)=>{const e=document.getElementById(id);return !!e&&e.getClientRects().length>0;};
  const t=(id)=>{const e=document.getElementById(id);return e?e.textContent:null;};
  return{state,described,notes:{land:noteOf("land"),strand:noteOf("strand")},boxes:{land:shown("land-held"),strand:shown("strand-held")},place:document.getElementById("place").value,landDisabled:document.getElementById("land").getAttribute("aria-disabled"),
    readouts:{land:t("land-readout"),coast:t("coast-readout"),looseness:t("looseness-readout"),islands:t("islands-readout"),ragged:t("ragged-readout")}};})()`;

const rows = (live: string[], held: string[], hidden: string[]): Record<string, string> =>
  Object.fromEntries(
    LAND_ROWS.map((r) => [
      r,
      live.includes(r) ? "live" : held.includes(r) ? "held" : hidden.includes(r) ? "hidden" : "?",
    ]),
  );

const PLAIN = rows(["type", "band", "place", "land", "coast"], ["looseness"], ["islands", "sizes", "ragged"]);
const EXACT = rows(["type", "band", "place", "looseness"], ["land", "coast"], ["islands", "sizes", "ragged"]);
const LOOSE = rows(["type", "band", "place", "looseness", "coast"], ["land"], ["islands", "sizes", "ragged"]);
const ARCH_PLAIN = rows(["type", "band", "place", "islands", "land", "coast"], ["looseness"], ["sizes", "ragged"]);
const COUNTED = rows(["type", "band", "place", "islands", "sizes", "ragged"], ["looseness", "land"], ["coast"]);
const ON_ARCH = rows(["type", "band", "place", "looseness"], ["islands", "sizes", "land", "coast"], ["ragged"]);
const LOOSENED = rows(["type", "band", "place", "looseness", "coast"], ["islands", "sizes", "land"], ["ragged"]);
const WRITTEN = rows([], ["type", "band", "place", "islands", "sizes", "land", "ragged", "looseness"], ["coast"]);

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

// Each group's box shows exactly when the group holds a row, and every held row is described by its own group's note, or by the Strand's where that note is empty (the written world's Land rows), and no live row is described at all (Issue #1159).
export function holdFaults(seat: Seat): string[] {
  const faults: string[] = [];
  for (const g of ["land", "strand"] as const) {
    const held = LAND_ROWS.filter((r) => GROUP_OF[r] === g && seat.state[r] === "held");
    if (seat.boxes[g] !== held.length > 0)
      faults.push(`the ${g} box shows ${seat.boxes[g]} with ${held.length} held rows`);
    for (const r of held) {
      const want = seat.notes[g] === "" ? "strand-held-note" : `${g}-held-note`;
      if (seat.described[r] !== want) faults.push(`${r} is described by ${seat.described[r]}, not ${want}`);
    }
  }
  for (const r of LAND_ROWS)
    if (seat.state[r] !== "held" && seat.described[r] !== null)
      faults.push(`${r} is not held yet described by ${seat.described[r]}`);
  return faults;
}
const at = (want: Record<string, string>, place: string) => (d: Seat) => same(d.state, want) && d.place === place;

type Fit = { sh: number; ch: number };
const FIT: Payload<Fit> = `(()=>{const b=document.querySelector("#broadside .slip-body");return{sh:b.scrollHeight,ch:b.clientHeight};})()`;

type List = {
  open: boolean;
  names: string[];
  subs: string[];
  drawn: boolean[];
  lit: (string | null)[];
  foot: string;
  scrolls: boolean;
  files: string[];
};
const LIST: Payload<List> = `(()=>{const panel=document.getElementById("place-list"),foot=document.getElementById("place-foot"),opts=document.getElementById("place-options");
  const li=[...opts.querySelectorAll(":scope > li")];
  return{open:panel.matches(":popover-open"),names:li.map((e)=>e.querySelector(".pl-name").textContent),subs:li.map((e)=>e.querySelector(".pl-sub").textContent),
    drawn:li.map((e)=>!!e.querySelector(".pl-sil path[d]")),lit:li.map((e)=>e.getAttribute("aria-selected")),foot:foot.hidden?"":foot.textContent,
    scrolls:opts.scrollHeight>opts.clientHeight,files:performance.getEntriesByType("resource").map((e)=>new URL(e.name).pathname).filter((p)=>p.startsWith("/outlines/"))};})()`;

type Ended = { status: string; outline: string | null; hash: string; box: string; open: boolean };
const ENDED: Payload<Ended> = `(()=>{const svg=document.querySelector("#map > svg[data-vellum-style]");
  return{status:document.getElementById("status").textContent,outline:svg?svg.getAttribute("data-vellum-outline"):null,hash:location.hash.replace(/&table=[^&]*/,""),
    box:document.getElementById("place").value,open:document.getElementById("place-list").matches(":popover-open")};})()`;
const DRAWN: Payload<{ status: string; map: boolean; islands: string | null }> =
  `({status:document.getElementById("status").textContent,map:!!document.querySelector("#map > svg[data-vellum-style]"),islands:(document.querySelector("#map > svg[data-vellum-style]")||{getAttribute:()=>null}).getAttribute("data-vellum-islands")})`;

const LOOSE_DRAWN: Payload<{ status: string; loose: string | null }> =
  `(()=>{const s=document.querySelector("#map > svg[data-vellum-style]");return{status:document.getElementById("status").textContent,loose:s?s.getAttribute("data-vellum-looseness"):null};})()`;

export async function br16To19(k: BroadsideKit): Promise<void> {
  const { evaluate, send, sleep, check } = k;
  const settle = makeSettle({ evaluate, sleep });
  const stable = makeStable(settle);
  const fits = async (label: string): Promise<Fit> => stable(FIT, label, { departed: (d) => d.ch > 0 });
  await send("Emulation.setDeviceMetricsOverride", { width: 1024, height: 768, deviceScaleFactor: 1, mobile: false });
  try {
    const countedFit = await br16Counted(k, fits);

    await br18Refuses(k);
    await br19Picks(k);
    const archFaults = await pressesRefused(k, ["islands", "isle-equal"]);
    check(
      "BR18b the held islands slider and size radio refuse the reader's press (a place on the archipelago)",
      archFaults.length === 0,
      archFaults.join("; "),
    );

    const onArch = await settle(SEAT, (d) => at(ON_ARCH, "Texas")(d), "BR17 the place-on-the-archipelago seat");
    const archFit = await fits("BR16 the slip with a place on the archipelago at rest");
    check(
      "BR17 a place on the archipelago holds the count: the place and looseness live; islands, sizes, sea level and coast held; the Land's note is the count's and the Strand's the outline's",
      same(onArch.notes, { land: HELD_NOTES.count, strand: HELD_NOTES.exact }) &&
        onArch.readouts.islands === "held" &&
        onArch.landDisabled === "true",
      JSON.stringify(onArch),
    );
    const loosened = await br16Loosened(k, fits);
    await br19Clears(k);
    const writtenFit = await br16Written(k, fits);
    check(
      "BR16 the Broadside fits 1024 by 768 without scrolling: counted, with a place on the archipelago, with that place loosened to the end over the held count, and on a written counted archipelago (Issue #1159)",
      countedFit.sh <= countedFit.ch &&
        archFit.sh <= archFit.ch &&
        loosened.fit.sh <= loosened.fit.ch &&
        writtenFit.sh <= writtenFit.ch,
      JSON.stringify({ countedFit, archFit, loosened, writtenFit }),
    );
  } finally {
    await send("Emulation.clearDeviceMetricsOverride");
  }
}

async function br16Counted(k: BroadsideKit, fits: (label: string) => Promise<Fit>): Promise<Fit> {
  const { evaluate, sleep, check, goto, EXP } = k;
  const settle = makeSettle({ evaluate, sleep });
  await goto(EXP + "#seed=1&style=antique&type=archipelago&islands=20", "broadside-counted");
  const counted = await settle(
    SEAT,
    (d) => at(COUNTED, "")(d) && d.readouts.islands === "about 20",
    "BR17 the counted seat",
  );
  const countedFit = await fits("BR16 the counted slip at rest");
  check(
    "BR17 the counted instance: the place, islands, sizes and ragged live; looseness and sea level held; coast hidden; the Strand's note is the counted one",
    same(counted.notes, { land: "", strand: HELD_NOTES.counted }) &&
      counted.readouts.ragged === "round" &&
      counted.readouts.land === "held",
    JSON.stringify(counted),
  );
  return countedFit;
}

async function br16Written(k: BroadsideKit, fits: (label: string) => Promise<Fit>): Promise<Fit> {
  const { evaluate, sleep, goto, EXP } = k;
  const settle = makeSettle({ evaluate, sleep });
  await goto(EXP + writtenHash(AEGEAN, 1), "broadside-written");
  await settle(SEAT, at(WRITTEN, ""), "BR16 the written counted archipelago's seat");
  return fits("BR16 the written counted archipelago at rest");
}

async function br16Loosened(k: BroadsideKit, fits: (label: string) => Promise<Fit>): Promise<{ fit: Fit; seat: Seat }> {
  const { evaluate, send, sleep } = k;
  const settle = makeSettle({ evaluate, sleep });
  await evaluate(`(()=>{document.getElementById("looseness").focus();return true;})()`);
  await sendKey(send, "End", "End", 35);
  await settle(LOOSE_DRAWN, (d) => d.status !== DRAFTING && d.loose === "1", "BR16 the loosened draw");
  const seat = await settle(
    SEAT,
    (d) => at(LOOSENED, "Texas")(d) && d.readouts.looseness === looseWord(1),
    "BR16 the seat loosened over the held count",
  );
  return { fit: await fits("BR16 the slip loosened to the end at rest"), seat };
}

async function br18Refuses({ evaluate, send, sleep, check }: BroadsideKit): Promise<void> {
  const before = await evaluate<string>(`(()=>{const l=document.getElementById("land");l.focus();return l.value;})()`);
  await sendKey(send, "ArrowRight", "ArrowRight", 39);
  const after = await evaluate<{ value: string; status: string; focused: boolean }>(
    `({value:document.getElementById("land").value,status:document.getElementById("status").textContent,focused:document.activeElement===document.getElementById("land")})`,
  );
  await sleep(300, "window: a wrongful draw would have started in it");
  const later = await evaluate<string>(`document.getElementById("status").textContent`);
  check(
    "BR18 a held slider refuses the reader's press: it keeps its value and draws nothing",
    after.focused && after.value === before && after.status !== DRAFTING && later !== DRAFTING,
    JSON.stringify({ before, after, later }),
  );
}

const HELD_VALUE = (id: string): Payload<string> =>
  `(()=>{const e=document.getElementById("${id}");return e.type==="radio"?document.getElementById("isle-equal").checked+","+document.getElementById("isle-varied").checked:e.value;})()`;

// Every held control a press can reach, one key each: the sea level and coast, the looseness, the islands and a size radio (BR18 holds the class, not the one slider).
async function pressesRefused({ evaluate, send, sleep }: BroadsideKit, ids: string[]): Promise<string[]> {
  const faults: string[] = [];
  for (const id of ids) {
    await evaluate(`document.getElementById("${id}").focus()`);
    const before = await evaluate(HELD_VALUE(id));
    await sendKey(send, "ArrowRight", "ArrowRight", 39);
    const after = await evaluate(HELD_VALUE(id));
    const status = await evaluate<string>(`document.getElementById("status").textContent`);
    await sleep(300, "window: a wrongful draw would have started in it");
    const later = await evaluate<string>(`document.getElementById("status").textContent`);
    if (after !== before || status === DRAFTING || later === DRAFTING)
      faults.push(`#${id}: ${before} to ${after}, status "${status}" then "${later}"`);
  }
  return faults;
}

const PRESSES: Record<string, string[]> = {
  exact: ["land", "coast"],
  loose: ["land"],
  archipelago: ["looseness"],
  plain: ["looseness"],
};

async function br19Picks(k: BroadsideKit): Promise<void> {
  const { evaluate, send, sleep, check } = k;
  const settle = makeSettle({ evaluate, sleep });
  await evaluate(`(()=>{performance.clearResourceTimings();document.getElementById("place").focus();return true;})()`);
  await send("Input.insertText", { text: "tex" });
  const list = await settle(
    LIST,
    (d) => d.open && d.names.length === 2 && d.drawn.every(Boolean),
    "BR19 the list for tex, every outline drawn",
  );
  const count = (f: string) => list.files.filter((p) => p === f).length;
  const listed =
    same(list.names, ["Texas", "Lake Texoma"]) &&
    same(list.subs, ["in United States of America", "a lake"]) &&
    same(list.lit, ["true", "false"]) &&
    list.foot === "" &&
    count("/outlines/names.json") === 1 &&
    count(`/outlines/${TEXAS}.txt`) === 1 &&
    count(`/outlines/${TEXOMA}.txt`) === 1;
  await sendKey(send, "Enter", "Enter", 13);
  const picked = await settle(
    ENDED,
    (d) => d.status !== DRAFTING && d.outline === TEXAS && d.box === "Texas",
    "BR19 the pick's draw",
  );
  await settle(SEAT, at(ON_ARCH, "Texas"), "BR19 the seat once the place is held");
  check(
    "BR19 the shape box finds a place as one types, draws each match's outline, and picks it; picking holds the count and clearing frees it",
    listed &&
      !picked.open &&
      picked.hash === `#seed=1&style=antique&type=archipelago&legend=1&arms=0&beasts=0&outline=${TEXAS}`,
    JSON.stringify({ list, picked }),
  );
}

async function br19Clears({ evaluate, send, sleep, check }: BroadsideKit): Promise<void> {
  const settle = makeSettle({ evaluate, sleep });
  await evaluate(`(()=>{const p=document.getElementById("place");p.focus();p.select();return true;})()`);
  await sendKey(send, "Backspace", "Backspace", 8);
  await sendKey(send, "Enter", "Enter", 13);
  const cleared = await settle(
    ENDED,
    (d) => d.status !== DRAFTING && d.outline === null && d.hash.endsWith("islands=20"),
    "BR19 the clearing's draw",
  );
  const drawn = await settle(DRAWN, (d) => d.map && d.status === "", "BR19 the freed count drawn");
  const seat = await settle(SEAT, at(COUNTED, ""), "BR19 the seat once the place is cleared");
  check(
    "BR19 clearing the place frees the count: the link and the seat are the counted world's again",
    cleared.hash === "#seed=1&style=antique&type=archipelago&legend=1&arms=0&beasts=0&islands=20" &&
      drawn.islands === "20" &&
      seat.readouts.islands === "about 20",
    JSON.stringify({ cleared, drawn, seat }),
  );
}

const CASES: Array<{
  name: string;
  hash: string;
  want: Record<string, string>;
  place: string;
  notes: { land: string; strand: string };
  ok: (d: Seat) => boolean;
}> = [
  {
    name: "exact",
    hash: "#seed=30&style=antique&type=island&outline=" + TEXAS,
    want: EXACT,
    place: "Texas",
    notes: { land: "", strand: HELD_NOTES.exact },
    ok: (d) => d.landDisabled === "true" && d.readouts.land === "held" && d.readouts.coast === "held",
  },
  {
    name: "loose",
    hash: "#seed=30&style=antique&type=island&outline=" + TEXAS + "&looseness=75",
    want: LOOSE,
    place: "Texas",
    notes: { land: "", strand: HELD_NOTES.loose },
    ok: (d) => d.readouts.looseness === "looser" && d.readouts.coast !== "held",
  },
  {
    name: "archipelago",
    hash: "#seed=1&style=antique&type=archipelago",
    want: ARCH_PLAIN,
    place: "",
    notes: { land: "", strand: HELD_NOTES.plain },
    ok: (d) => d.readouts.islands === "seed's choice" && d.landDisabled === null,
  },
  {
    name: "plain",
    hash: "#seed=42&style=antique",
    want: PLAIN,
    place: "",
    notes: { land: "", strand: HELD_NOTES.plain },
    ok: (d) => d.landDisabled === null && d.readouts.looseness === "held",
  },
];

export async function br17Holds(k: BroadsideKit): Promise<void> {
  const { evaluate, sleep, check, goto, EXP } = k;
  const settle = makeSettle({ evaluate, sleep });
  const seen: Array<{ name: string; ok: boolean; seat: Seat }> = [];
  const refusals: string[] = [];
  for (const c of CASES) {
    await goto(EXP + c.hash, "broadside-" + c.name);
    const seat = await settle(SEAT, at(c.want, c.place), `BR17 the ${c.name} seat`);
    seen.push({ name: c.name, ok: same(seat.notes, c.notes) && holdFaults(seat).length === 0 && c.ok(seat), seat });
    refusals.push(...(await pressesRefused(k, PRESSES[c.name] ?? [])).map((f) => `${c.name} ${f}`));
  }
  check(
    "BR18b every held slider refuses the reader's press: the sea level, the coast and the looseness keep their values and draw nothing",
    refusals.length === 0,
    refusals.join("; "),
  );
  check(
    "BR17 the Land and the Strand each hold what the world on screen cannot use and show the rest, each held row reading held under its own box's note",
    seen.every((s) => s.ok),
    JSON.stringify(seen),
  );
}

type Twins = { witness: number; rows: number; subs: string[]; foot: string; scrolls: boolean };
export async function br20Twins({ evaluate, send, sleep, check, goto, EXP }: BroadsideKit): Promise<void> {
  const settle = makeSettle({ evaluate, sleep });
  await goto(EXP + "#seed=42&style=antique", "broadside-twins");
  await evaluate(`(()=>{document.getElementById("place").focus();return true;})()`);
  await send("Input.insertText", { text: "valmiera" });
  const list = await settle(
    LIST,
    (d) => d.open && d.names.length > 6 && d.drawn.every(Boolean),
    "BR20 the list for valmiera, every outline drawn",
  );
  const witness = await evaluate<number>(
    `fetch("/outlines/names.json").then((r)=>r.json()).then((rows)=>rows.filter((r)=>r[1]==="Valmiera").length)`,
    true,
  );
  const read: Twins = {
    witness,
    rows: list.names.length,
    subs: [...new Set(list.subs)],
    foot: list.foot,
    scrolls: list.scrolls,
  };
  await sendKey(send, "Escape", "Escape", 27);
  check(
    "BR20 places alike in name, kind and country all list, each with its own outline, and the list scrolls to them rather than asking for more letters",
    witness > 6 && read.rows === witness && same(read.subs, ["in Latvia"]) && read.foot === "" && read.scrolls,
    JSON.stringify(read),
  );
}
