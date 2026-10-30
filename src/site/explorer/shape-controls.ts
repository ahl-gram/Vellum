// The Land panel's shape and count controls (Issue #854): DOM-bound at module scope by design, never imported from a unit test.
import { $ } from "../shared/by-id.ts";
import type { IsleSize } from "../../terrain/lobes.ts";
import { typeSel } from "./elements.ts";
import {
  ISLANDS_SEEDS_CHOICE,
  islandsWord,
  looseWord,
  nextChoice,
  raggedWord,
  seatOf,
  slidersOf,
  type ShapeEdit,
} from "./land-rows.ts";
import { fillTrack, fillTracks, refuses, seatLand } from "./land-seat.ts";
import { showPlace } from "./place-picker.ts";
import { chooseShape, shapeChoice } from "./shape-choice.ts";

const looseness = $<HTMLInputElement>("looseness");
const islands = $<HTMLInputElement>("islands");
const ragged = $<HTMLInputElement>("ragged");
const equal = $<HTMLInputElement>("isle-equal");
const varied = $<HTMLInputElement>("isle-varied");
const loosenessReadout = $("looseness-readout");
const islandsReadout = $("islands-readout");
const raggedReadout = $("ragged-readout");
const ledger = looseness.closest<HTMLElement>(".ledger") as HTMLElement;

interface Slider {
  readonly el: HTMLInputElement;
  readonly readout: HTMLElement;
  readonly kind: "looseness" | "islands" | "raggedness";
  readonly word: (v: number) => string;
}

const SLIDERS: readonly Slider[] = [
  { el: looseness, readout: loosenessReadout, kind: "looseness", word: (v) => looseWord(v / 100) },
  { el: islands, readout: islandsReadout, kind: "islands", word: islandsWord },
  { el: ragged, readout: raggedReadout, kind: "raggedness", word: (v) => raggedWord(v / 100) },
];

function say({ el, readout, word }: Slider): void {
  const text = word(Number(el.value));
  readout.replaceChildren(text);
  el.setAttribute("aria-valuetext", text);
}

export function wireShapeControls(draw: () => void): void {
  const edit = (e: ShapeEdit): void => {
    chooseShape(nextChoice(shapeChoice(), e));
    draw();
  };
  for (const slider of SLIDERS) {
    slider.el.addEventListener("input", () => {
      if (refuses(slider.el)) return;
      say(slider);
      fillTrack(slider.el);
      if (slider.kind === "islands")
        islands.classList.toggle("untouched", Number(islands.value) === ISLANDS_SEEDS_CHOICE);
    });
    slider.el.addEventListener("change", () => {
      if (refuses(slider.el)) return;
      edit({ kind: slider.kind, slider: Number(slider.el.value) });
    });
  }
  for (const radio of [equal, varied]) {
    radio.addEventListener("change", () => {
      if (refuses(radio)) return;
      edit({ kind: "size", size: radio.value as IsleSize });
    });
  }
  ledger.addEventListener("input", (e) => {
    if (e.target instanceof HTMLInputElement && e.target.type === "range") fillTrack(e.target);
  });
}

export function refreshLand(): void {
  const choice = shapeChoice();
  const s = slidersOf(choice);
  looseness.value = String(s.looseness);
  islands.value = String(s.islands);
  ragged.value = String(s.raggedness);
  equal.checked = s.size === "equal";
  varied.checked = s.size === "varied";
  islands.classList.toggle("untouched", choice.islands === undefined);
  for (const slider of SLIDERS) say(slider);
  showPlace(choice.outline);
  seatLand(seatOf(typeSel.value, choice));
  fillTracks();
}
