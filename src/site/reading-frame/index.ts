// The reading frame (#219, Reading Room Sub 3): the reading presentation, one chart
// over one dated log and nothing else, maker chrome collapsed. It is the first HOST of
// the #191 engine's public API, and building it against that boundary is what proves
// the API capability-complete for a surface that is not the Explorer.
//
// ## What it is
// A layout module, framework-free, that BUILDS its own DOM and hands back a
// LivingChartHost. A page mounts it and calls createLivingChart(frame.host); it needs
// no verso sink and no draw controls. The Explorer is untouched by this sub: both of
// #219's open decisions were ratified 2026-07-27 (issue comment 5097366231) as
// "defer the Explorer watch view" and "the log flows at every width".
//
// ## Why the tree is shaped like this
//   root .rf
//     .rf-chart                <- mapEl: the baked chart svg plus the engine's overlays
//     .rf-status               <- statusEl: the one polite line, "" at rest
//     .rf-reading              <- the reading column, instrument over log
//       .rf-chronicle [hidden] <- scrubber.panel
//         .rf-instrument       <- the instrument slot: Play, the year slider, the readout
//         (the chronicle's dated log)
//       (the voyage's dated log) [hidden]
//
// The chronicle's log rides INSIDE the panel the engine hides. That nesting is
// load-bearing: exitScrub() only sets `panel.hidden`, it never empties the strip, so a
// log mounted as the panel's sibling would keep a dead world's rows on screen after the
// chronicle turned off. The Explorer nests them for the same reason.
//
// The two logs are two instances of ONE component, sitting adjacent in one slot and
// dressed by one rule. They are mutually exclusive (the engine's own invariant), so at
// most one is ever visible and the frame reads as a single log. #220's fusion collapses
// them into one instance without moving the furniture.
import { createDatedLog } from "./dated-log.ts";
import type { LivingChartHost } from "../living-chart/index.ts";

export interface ReadingFrameOpts {
  /** #192: forwarded to the chronicle's park seam, so a host with an address writer
   *  can record the rest that Play's programmatic slider writes announce no event for.
   *  A host with no address simply omits it. */
  readonly onPark?: () => void;
}

export function createReadingFrame(mount: HTMLElement, opts: ReadingFrameOpts = {}) {
  const root = document.createElement("div");
  root.className = "rf";

  const chart = document.createElement("div");
  chart.className = "rf-chart";

  // The polite status line: the engine posts the voyage's one completion summary here
  // and otherwise keeps it "", which is the settle signal a host's draw depends on.
  const status = document.createElement("p");
  status.className = "rf-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");

  const reading = document.createElement("div");
  reading.className = "rf-reading";

  // The chronicle's apparatus: its instrument and its log, hidden together.
  const chroniclePanel = document.createElement("div");
  chroniclePanel.className = "rf-chronicle";
  chroniclePanel.hidden = true;

  const instrument = document.createElement("div");
  instrument.className = "rf-instrument";

  const playBtn = document.createElement("button");
  playBtn.className = "rf-play";
  playBtn.type = "button";
  // The label swap (Play/Pause) IS the state for assistive tech; the engine owns it
  // from here, and this is only the resting label.
  playBtn.textContent = "Play";

  const range = document.createElement("input");
  range.className = "rf-range";
  range.type = "range";
  range.setAttribute("aria-label", "Chronicle year");

  // The visual year readout. aria-hidden because the slider's aria-valuetext already
  // announces the same year, and once is enough.
  const year = document.createElement("span");
  year.className = "rf-year";
  year.setAttribute("aria-hidden", "true");

  const chronicleLog = createDatedLog({ label: "The chronicle" });
  const voyageLog = createDatedLog({ label: "The surveyor's log" });
  voyageLog.panel.hidden = true;

  instrument.append(playBtn, range, year);
  chroniclePanel.append(instrument, chronicleLog.panel);
  reading.append(chroniclePanel, voyageLog.panel);
  root.append(chart, status, reading);
  mount.appendChild(root);

  const host: LivingChartHost = {
    mapEl: chart,
    statusEl: status,
    scrubber: {
      panel: chroniclePanel,
      playBtn,
      range,
      year,
      strip: chronicleLog.strip,
      onPark: opts.onPark,
    },
    voyageLog: { panel: voyageLog.panel, sig: voyageLog.sig, strip: voyageLog.strip },
  };

  /** Unmount: a page host that leaves takes its DOM with it. The engine's own
   *  destroy() is the host's to call; this frame owns only the furniture. */
  function destroy(): void {
    chronicleLog.clear();
    voyageLog.clear();
    root.remove();
  }

  return { root, host, chronicleLog, voyageLog, destroy };
}

export type ReadingFrame = ReturnType<typeof createReadingFrame>;
