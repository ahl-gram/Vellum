// The reading frame (#219): the reading presentation, one chart over one dated log and
// nothing else, maker chrome collapsed. A framework-free layout module that BUILDS its
// own DOM and hands back a LivingChartHost (both of #219's open decisions ratified
// 2026-07-27, issue comment 5097366231). The journal rides INSIDE the panel the engine
// hides; that nesting is load-bearing: the engine's teardown hides the panel without
// emptying the strip, so a log mounted as the panel's sibling would keep a dead world's
// rows on screen. #220 collapsed the frame's two dated-log instances into this ONE
// document, one arrived-class (`inked`), one dressing rule.
import { createDatedLog } from "./dated-log.ts";
import type { LivingChartHost, ScrubberRefs } from "../living-chart/index.ts";

export interface ReadingFrameOpts {
  /** #192: forwarded to the chronicle's park seam, so a host with an address writer can record the rest Play's programmatic slider writes announce no event for. Optional. */
  readonly onPark?: () => void;
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

  const log = createDatedLog({ label: "The ages" });

  instrument.append(playBtn, range, year);
  agesPanel.append(instrument, log.panel);
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
    },
  };

  /** Unmount: a page host that leaves takes its DOM with it; the engine's own destroy() is the host's to call. */
  function destroy(): void {
    log.clear();
    root.remove();
  }

  // The host's furniture mount (#318): only ever append SIBLINGS of the panel here; anything nested inside the panel inherits the engine's hidden teardowns.
  return { root, host, log, reading, destroy };
}

export type ReadingFrame = ReturnType<typeof createReadingFrame>;
