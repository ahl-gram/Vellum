// The reading frame (#219): the reading presentation, one chart over one dated log and
// nothing else, maker chrome collapsed. A framework-free layout module that BUILDS its
// own DOM and hands back a LivingChartHost (both of #219's open decisions ratified
// 2026-07-27, issue comment 5097366231). The journal rides INSIDE the panel the engine
// hides; that nesting is load-bearing: the engine's teardown hides the panel without
// emptying the strip, so a log mounted as the panel's sibling would keep a dead world's
// rows on screen. #220 collapsed the frame's two dated-log instances into this ONE
// document, one arrived-class (`inked`), one dressing rule.
import { createDatedLog } from "./dated-log.ts";
import { DEFAULT_PACE, PACES, type Pace } from "../living-chart/pace.ts";
import type { LivingChartHost, ScrubberRefs, ToldEntry } from "../living-chart/index.ts";

export interface ReadingFrameOpts {
  /** #192: forwarded to the chronicle's park seam, so a host with an address writer can record the rest Play's programmatic slider writes announce no event for. Optional. */
  readonly onPark?: () => void;
  /** #402/#442: forwarded to the instrument's one told signal, so a host can decorate the entry the story is on. Optional. */
  readonly onAgesTold?: (told: ToldEntry | null) => void;
}

export function createReadingFrame(mount: HTMLElement, opts: ReadingFrameOpts = {}) {
  const root = document.createElement("div");
  root.className = "rf";

  const chart = document.createElement("div");
  // living-chart is the #302 host contract: the shared /living-chart.css keys the engine's ink-in dressing on this mount class, never on a host element id.
  chart.className = "rf-chart living-chart";

  // The polite status line: "" at rest, the settle signal a host's draw depends on.
  const status = document.createElement("p");
  status.className = "rf-status status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");

  const reading = document.createElement("div");
  reading.className = "rf-reading";

  // The instrument's apparatus (#220): the bar and the one journal, hidden together.
  const agesPanel = document.createElement("div");
  agesPanel.className = "rf-ages";
  agesPanel.hidden = true;

  const instrument = document.createElement("div");
  instrument.className = "rf-instrument";

  const playBtn = document.createElement("button");
  playBtn.className = "rf-play";
  playBtn.type = "button";
  // The label swap IS the state for assistive tech; the engine owns it from here, this is only the resting label.
  playBtn.textContent = "Play";

  const range = document.createElement("input");
  range.className = "rf-range ages-range";
  range.type = "range";
  range.setAttribute("aria-label", "The ages");

  // aria-hidden: the bar's aria-valuetext already announces the same text, and once is enough.
  const year = document.createElement("span");
  year.className = "rf-year";
  year.setAttribute("aria-hidden", "true");

  // #442: the bar and the live row travel together in one wrapper; where the wrapper stands is the host's (a bottom strip since #463), and the arrival unfurl transforms .rf-instrument, never the wrapper.
  const strip = document.createElement("div");
  strip.className = "rf-instrument-strip";

  // aria-hidden: this MIRRORS a journal row that is itself in the document below, and the bar's readout already announces the position; a live region here would read the story twice.
  const told = document.createElement("p");
  told.className = "rf-told";
  told.hidden = true;
  told.setAttribute("aria-hidden", "true");
  const toldGutter = document.createElement("span");
  toldGutter.className = "cr-year";
  const toldText = document.createElement("span");
  toldText.className = "cr-text";
  told.append(toldGutter, toldText);

  const log = createDatedLog({ label: "The ages" });

  // #493 (#462 ruling 6, "the readout and pace at the right"): three presses, the chosen one aria-pressed; the room wires them, the engine never sees them.
  const pace = document.createElement("div");
  pace.className = "rf-pace";
  pace.setAttribute("role", "group");
  pace.setAttribute("aria-label", "The pace");
  const paceButtons = new Map<Pace, HTMLButtonElement>(PACES.map((k) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.pace = String(k);
    b.textContent = `${k}\u00d7`;
    b.setAttribute("aria-pressed", String(k === DEFAULT_PACE));
    return [k, b];
  }));
  pace.append(...paceButtons.values());

  instrument.append(playBtn, range, year, pace);
  strip.append(instrument, told);
  agesPanel.append(strip, log.panel);
  reading.append(agesPanel);
  root.append(chart, status, reading);
  mount.appendChild(root);

  // #319 made LivingChartHost.scrubber optional; this frame ALWAYS builds one and says so in its own type, so the room's frame.host.scrubber reads need no narrowing.
  const host: LivingChartHost & { scrubber: ScrubberRefs } = {
    mapEl: chart,
    statusEl: status,
    scrubber: {
      panel: agesPanel,
      playBtn,
      range,
      year,
      sig: log.sig,
      strip: log.strip,
      onPark: opts.onPark,
      onAgesTold: opts.onAgesTold,
    },
  };

  /** #442: the live row is a MIRROR of the row the story is on, never a second writer over the journal; it renders from the told payload and touches no li the engine owns. */
  function setTold(t: ToldEntry | null): void {
    if (t === null) {
      told.hidden = true;
      toldGutter.textContent = "";
      toldText.textContent = "";
      return;
    }
    // The journal dresses the surveyor's prologue rows in his own hand; the mirror carries the same class so a mirrored row reads in the voice its source is written in.
    told.classList.toggle("prologue", t.chamber === "survey");
    toldGutter.textContent = t.chamber === "survey" ? `day ${t.day}` : String(t.year);
    toldText.textContent = t.text;
    told.hidden = false;
  }

  /** Unmount: a page host that leaves takes its DOM with it; the engine's own destroy() is the host's to call. */
  function destroy(): void {
    log.clear();
    root.remove();
  }

  // The reading column (#318): furniture appended here stands through the engine's hidden teardowns; a host that seats its parts elsewhere (#463) leaves it empty.
  /** Moves the press to `k`; the engine holds the pace itself (setPace), this is the strip's face of it. */
  function markPace(k: Pace): void {
    for (const [p, b] of paceButtons) b.setAttribute("aria-pressed", String(p === k));
  }

  return { root, host, log, reading, strip, told, paceButtons, setTold, markPace, destroy };
}

export type ReadingFrame = ReturnType<typeof createReadingFrame>;
