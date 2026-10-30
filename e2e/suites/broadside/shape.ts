// The Broadside's shape and count controls (Issue #854, pull request 2): the Land panel's rows by state, the held rows' refusal, the shape box and its list, and the twins that scroll.
import { HELD_NOTES, LAND_ROWS } from "../../../src/site/explorer/land-rows.ts";
import { sendKey } from "../../support/home.ts";
import { makeSettle, makeStable } from "../../support/settle.ts";
import type { Payload } from "../../types.ts";
import type { BroadsideKit } from "./kit.ts";

const TEXAS = "ne-1159315211";
const TEXOMA = "ne-1159124507";
const DRAFTING = "Drafting…";

type Seat = {
  state: Record<string, string>;
  note: string;
  place: string;
  landDisabled: string | null;
  readouts: Record<"land" | "coast" | "looseness" | "islands" | "ragged", string | null>;
};
const SEAT: Payload<Seat> = `(()=>{const ledger=document.querySelector('[aria-labelledby="grp-land"] .ledger'),box=document.getElementById("land-held"),note=document.getElementById("land-held-note");
  const state={};for(const row of ${JSON.stringify(LAND_ROWS)}){const r=ledger.querySelector('.l-row[data-row="'+row+'"]');
    const shown=!!r&&!!r.firstElementChild&&r.firstElementChild.getClientRects().length>0;state[row]=!shown?"hidden":box.contains(r)?"held":"live";}
  const t=(id)=>{const e=document.getElementById(id);return e?e.textContent:null;};
  return{state,note:box.getClientRects().length>0?note.textContent:"",place:document.getElementById("place").value,landDisabled:document.getElementById("land").getAttribute("aria-disabled"),
    readouts:{land:t("land-readout"),coast:t("coast-readout"),looseness:t("looseness-readout"),islands:t("islands-readout"),ragged:t("ragged-readout")}};})()`;

const rows = (live: string[], held: string[], hidden: string[]): Record<string, string> =>
  Object.fromEntries(
    LAND_ROWS.map((r) => [
      r,
      live.includes(r) ? "live" : held.includes(r) ? "held" : hidden.includes(r) ? "hidden" : "?",
    ]),
  );

const PLAIN = rows(["place", "land", "coast"], ["looseness"], ["islands", "sizes", "ragged"]);
const EXACT = rows(["place", "looseness"], ["land", "coast"], ["islands", "sizes", "ragged"]);
const LOOSE = rows(["place", "looseness", "coast"], ["land"], ["islands", "sizes", "ragged"]);
const ARCH_PLAIN = rows(["place", "islands", "land", "coast"], ["looseness"], ["sizes", "ragged"]);
const COUNTED = rows(["place", "islands", "sizes", "ragged"], ["looseness", "land"], ["coast"]);
const ON_ARCH = rows(["place", "looseness"], ["islands", "sizes", "land", "coast"], ["ragged"]);

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
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

export async function br16To19(k: BroadsideKit): Promise<void> {
  const { evaluate, send, sleep, check, goto, EXP } = k;
  const settle = makeSettle({ evaluate, sleep });
  const stable = makeStable(settle);
  const fits = async (label: string): Promise<Fit> => stable(FIT, label, { departed: (d) => d.ch > 0 });
  await send("Emulation.setDeviceMetricsOverride", { width: 1024, height: 768, deviceScaleFactor: 1, mobile: false });
  try {
    await goto(EXP + "#seed=1&style=antique&type=archipelago&islands=20", "broadside-counted");
    const counted = await settle(
      SEAT,
      (d) => at(COUNTED, "")(d) && d.readouts.islands === "about 20",
      "BR17 the counted seat",
    );
    const countedFit = await fits("BR16 the counted slip at rest");
    check(
      "BR17 the counted instance: the place, islands, sizes and ragged live; looseness and sea level held; coast hidden; the note is the counted one",
      counted.note === HELD_NOTES.counted && counted.readouts.ragged === "round" && counted.readouts.land === "held",
      JSON.stringify(counted),
    );

    await br18Refuses(k);
    await br19Picks(k);

    const onArch = await settle(SEAT, (d) => at(ON_ARCH, "Texas")(d), "BR17 the place-on-the-archipelago seat");
    const archFit = await fits("BR16 the slip with a place on the archipelago at rest");
    check(
      "BR17 a place on the archipelago holds the count: the place and looseness live; islands, sizes, sea level and coast held; the note is the outline's",
      onArch.note === HELD_NOTES.archExact && onArch.readouts.islands === "held" && onArch.landDisabled === "true",
      JSON.stringify(onArch),
    );
    check(
      "BR16 the Broadside fits 1024 by 768 without scrolling, counted and with a place on the archipelago",
      countedFit.sh <= countedFit.ch && archFit.sh <= archFit.ch,
      JSON.stringify({ countedFit, archFit }),
    );
    await br19Clears(k);
  } finally {
    await send("Emulation.clearDeviceMetricsOverride");
  }
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
  note: string;
  ok: (d: Seat) => boolean;
}> = [
  {
    name: "exact",
    hash: "#seed=30&style=antique&type=island&outline=" + TEXAS,
    want: EXACT,
    place: "Texas",
    note: HELD_NOTES.exact,
    ok: (d) => d.landDisabled === "true" && d.readouts.land === "held" && d.readouts.coast === "held",
  },
  {
    name: "loose",
    hash: "#seed=30&style=antique&type=island&outline=" + TEXAS + "&looseness=75",
    want: LOOSE,
    place: "Texas",
    note: HELD_NOTES.loose,
    ok: (d) => d.readouts.looseness === "looser" && d.readouts.coast !== "held",
  },
  {
    name: "archipelago",
    hash: "#seed=1&style=antique&type=archipelago",
    want: ARCH_PLAIN,
    place: "",
    note: HELD_NOTES.plain,
    ok: (d) => d.readouts.islands === "seed's choice" && d.landDisabled === null,
  },
  {
    name: "plain",
    hash: "#seed=42&style=antique",
    want: PLAIN,
    place: "",
    note: HELD_NOTES.plain,
    ok: (d) => d.landDisabled === null && d.readouts.looseness === "held",
  },
];

export async function br17Holds(k: BroadsideKit): Promise<void> {
  const { evaluate, sleep, check, goto, EXP } = k;
  const settle = makeSettle({ evaluate, sleep });
  const seen: Array<{ name: string; ok: boolean; seat: Seat }> = [];
  for (const c of CASES) {
    await goto(EXP + c.hash, "broadside-" + c.name);
    const seat = await settle(SEAT, at(c.want, c.place), `BR17 the ${c.name} seat`);
    seen.push({ name: c.name, ok: seat.note === c.note && c.ok(seat), seat });
  }
  check(
    "BR17 the Land panel holds what the world on screen cannot use and shows the rest, each held row reading held under its note",
    seen.every((s) => s.ok),
    JSON.stringify(seen),
  );
}

type Twins = { witness: number; rows: number; subs: string[]; foot: string; scrolls: boolean };
export async function br20Twins({ evaluate, send, sleep, check }: BroadsideKit): Promise<void> {
  const settle = makeSettle({ evaluate, sleep });
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
