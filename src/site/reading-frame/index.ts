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
//     .rf-chart            <- mapEl: the baked chart svg plus the engine's overlays
//     .rf-status           <- statusEl: the one polite line, "" at rest
//     .rf-reading          <- the reading column, instrument over journal
//       .rf-ages [hidden]  <- scrubber.panel, the whole fused instrument (#220)
//         .rf-instrument   <- Play, the one bar, the readout
//         (the ONE dated log: the surveyor's prologue, then the chronicler's annals)
//       (host furniture may follow, as the panel's SIBLING: the room's #318 colophon
//        mounts here via the exposed `reading`, below the panel and outside every
//        panel.hidden teardown the engine drives)
//
// The journal rides INSIDE the panel the engine hides. That nesting is load-bearing:
// the engine's teardown hides the panel without emptying the strip, so a log mounted
// as the panel's sibling would keep a dead world's rows on screen after the
// instrument turned off. The Explorer nests them for the same reason.
//
// #220 collapsed the frame's two dated-log instances into this ONE, exactly as #219
// anticipated: one document, one arrived-class (`inked`), one dressing rule. The
// engine writes the prologue and annal rows into the component's elements directly
// (the engine-driven path in dated-log.ts); render/reveal/snapshot stay the
// host-driven path for a page filling a strip itself.
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
  // living-chart is the #302 host contract: the shared /living-chart.css keys the
  // engine's ink-in dressing on this mount class, never on a host element id.
  chart.className = "rf-chart living-chart";

  // The polite status line: the engine posts the voyage's one completion summary here
  // and otherwise keeps it "", which is the settle signal a host's draw depends on.
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
  // The label swap (Play/Pause) IS the state for assistive tech; the engine owns it
  // from here, and this is only the resting label.
  playBtn.textContent = "Play";

  const range = document.createElement("input");
  range.className = "rf-range ages-range";
  range.type = "range";
  range.setAttribute("aria-label", "The ages");

  // The visual readout (a word in the survey half, the year in the ages half).
  // aria-hidden because the bar's aria-valuetext already announces the same text,
  // and once is enough.
  const year = document.createElement("span");
  year.className = "rf-year";
  year.setAttribute("aria-hidden", "true");

  const log = createDatedLog({ label: "The ages" });

  instrument.append(playBtn, range, year);
  agesPanel.append(instrument, log.panel);
  reading.append(agesPanel);
  root.append(chart, status, reading);
  mount.appendChild(root);

  const host: LivingChartHost = {
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

  /** Unmount: a page host that leaves takes its DOM with it. The engine's own
   *  destroy() is the host's to call; this frame owns only the furniture. */
  function destroy(): void {
    log.clear();
    root.remove();
  }

  // `reading` is the host's furniture mount (#318): a page may append its own
  // elements below the instrument panel. Only ever append SIBLINGS of the panel
  // here; anything nested inside the panel inherits the engine's hidden teardowns.
  return { root, host, log, reading, destroy };
}

export type ReadingFrame = ReturnType<typeof createReadingFrame>;
