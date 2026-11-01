// The Writing Room's conductor (Issue #393): a sentence is founded on the main thread, the shared render worker draws the chart, and the link is written only for a sentence that founded.
import type { Founding } from "../../world/founding/found.ts";
import { FOUNDING_VERSION, MAX_SENTENCE_CODE_POINTS } from "../../world/founding/lexicon.ts";
import { displayText } from "../../world/founding/normalize.ts";
import { isFormId, type OutlineId } from "../../world/outline-ids.ts";
import { nameOf, type NameRow } from "../explorer/place-match.ts";
import { createNameLoader } from "../explorer/place-names.ts";
import { initWorker, runJob } from "../explorer/worker-client.ts";
import { $ } from "../shared/by-id.ts";
import { errorText } from "../shared/error-text.ts";
import { bindZoomRoom } from "../shared/zoom-room.ts";
import { accountOf, MAP_WORDS, refusalWords } from "./account.ts";
import { readWritten, writtenHash } from "./address.ts";
import { createFounder, lettered, opensOnPlate, recipeOverrides, type RoomReason } from "./founding.ts";
import { renderAccount } from "./view.ts";

type RoomState = {
  readonly n: number;
  readonly seed: number | null;
  readonly refusal: RoomReason | null;
  readonly plate: boolean;
  readonly lettered: boolean;
};

declare global {
  interface Window {
    __vellumWritingRoom?: () => RoomState;
  }
}

const EXAMPLE = "a cold archipelago of black pines, iron harbors, and a drowned kingdom";
type Held = { readonly founding: Founding; readonly plate: boolean };

const { room } = bindZoomRoom({
  frame: document.querySelector<HTMLElement>(".stage")!,
  sheet: $("sheet"),
  viewport: $("map-viewport"),
  target: $("map"),
});
const founder = createFounder(createNameLoader((url) => fetch(url)));
const line = $<HTMLTextAreaElement>("wr-line");
let held: Held | null = null;
let refusal: RoomReason | null = null;
let settled = 0;
let turn = 0;

const lengthOf = (input: string): number => Array.from(displayText(input)).length;

function placeName(id: OutlineId): string {
  if (isFormId(id)) return `a ${id}`;
  return nameOf((founder.installed() ?? []) as ReadonlyArray<NameRow>, id) ?? id;
}

async function draw(f: Founding, plate: boolean): Promise<boolean> {
  const mine = ++turn;
  $("status").textContent = "Founding the world…";
  try {
    const res = await runJob({
      kind: "draw",
      seed: f.seed,
      overrides: recipeOverrides(f),
      render: { style: "antique", legend: true, ...(plate ? { theme: "vegetation" as const } : {}) },
    });
    if (mine !== turn) return false;
    $("map").innerHTML = res.svg;
    $("folio-title").textContent = res.title;
    $("folio-sub").textContent = res.subtitle;
    $("folio-coords").textContent = `Chart № ${f.seed} · ${MAP_WORDS[res.mapType]}, ${res.band}`;
    $("wr-plate-verb").textContent = plate ? "Lift" : "Lay on";
    $("status").textContent = "";
    room.layout();
    held = { founding: f, plate };
    settled++;
    return true;
  } catch (err) {
    if (mine === turn) $("status").textContent = "The ink would not take: " + errorText(err);
    return false;
  }
}

async function attempt(input: string, version: number, write: boolean): Promise<void> {
  const result = await founder.found(input, version);
  if (!result.ok) {
    refusal = result.reason;
    $("wr-refusal").textContent = refusalWords(result.reason, lengthOf(input));
    settled++;
    return;
  }
  refusal = null;
  $("wr-refusal").textContent = "";
  renderAccount($("wr-account"), accountOf(result, placeName));
  const drawn = await draw(result, opensOnPlate(result));
  if (drawn && write) history.replaceState(null, "", writtenHash(result.sentence, result.version));
}

function readHash(): void {
  const written = readWritten(location.hash);
  line.value = written?.sentence ?? EXAMPLE;
  updateCount();
  void attempt(line.value, written?.version ?? FOUNDING_VERSION, false);
}

function updateCount(): void {
  $("wr-count").textContent = `${lengthOf(line.value)} of ${MAX_SENTENCE_CODE_POINTS}`;
}

$("wr-form").addEventListener("submit", (e) => {
  e.preventDefault();
  void attempt(line.value, FOUNDING_VERSION, true);
});
line.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || e.shiftKey || e.isComposing) return;
  e.preventDefault();
  $<HTMLFormElement>("wr-form").requestSubmit();
});
line.addEventListener("input", updateCount);
$("wr-plate").addEventListener("click", () => {
  if (held !== null) void draw(held.founding, !held.plate);
});
addEventListener("hashchange", readHash);

window.__vellumWritingRoom = () => ({
  n: settled,
  seed: held?.founding.seed ?? null,
  refusal,
  plate: held?.plate ?? false,
  lettered: held !== null && lettered(held.founding),
});

void initWorker().then(() => {
  readHash();
  room.layout();
});
