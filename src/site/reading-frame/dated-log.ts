// The one dated log (#219, Reading Room Sub 3). Both living-chart subsystems already
// write the same visual idiom into two different panels: a row is a right-aligned
// tabular year in `.cr-year` beside its prose in `.cr-text`, resting at 0.4 opacity
// and brightening as its moment arrives (the chronicle's `.past`, the voyage's
// `.logged`). This module is that idiom as ONE component, which is the slot #220's
// fused journal needs to exist before it can read as one journal.
//
// Host-agnostic like the engine it sits beside: it BUILDS its elements rather than
// looking any up, owns no ids, and imports nothing from a page. It deliberately does
// NOT touch `panel.hidden`: visibility belongs to whoever mounted it, because the
// engine's own builders already drive `hidden` on the panels the frame hands them
// (voyage-log-panel.ts's buildLogPanel/hideLog, chronicle.ts's applyScrub/exitScrub).
// A component that also set it would be a second hand on the same switch.
//
// ## Two paths fill a strip, and render/reveal/snapshot are only one of them
// This tripped two independent reviewers, so it is written down at the line that
// breaks. A strip can be filled EITHER by this component (render/reveal/snapshot,
// which is the path #220's fused journal will use and the path the harness exercises)
// OR by the engine writing into the element the frame handed it, which is what happens
// today for both of the frame's instances. On the engine-driven path this component's
// `rows` stays empty by design, so reveal() is inert and snapshot() reports zero. That
// is not a gap to close: the engine already owns the read hooks for its own path
// (`lc.voyageLog()` and `lc.scrubState()`, per the capability map in
// living-chart/index.ts), and its rows carry `past` / `logged` rather than `inked`.
// Wiring this component over engine-written rows would put two hands on one switch and
// would detach the very nodes voyage.ts still holds in `logRows`. Do not "fix" it.
//
// The component's own arrived-class is `inked`, from the metaphor both existing
// panels are commented with: an entry inked into the ledger as its year arrives.

/** One dated row. Both existing shapes reduce to this: a HistoricalEvent's
 *  {year, text} and a VoyageLogEntry's {year, text}. */
export interface DatedRow {
  readonly year: number;
  readonly text: string;
}

export interface DatedLogOpts {
  /** The region's accessible name ("The surveyor's log"). */
  readonly label: string;
}

/** The e2e/read payload, mirroring voyage-log-panel.ts's logSnapshot shape. */
export interface DatedLogSnapshot {
  readonly rows: number;
  readonly inked: number;
  readonly attribution: string;
}

export function createDatedLog(opts: DatedLogOpts) {
  const panel = document.createElement("div");
  panel.className = "rf-log";
  // A landmark a screen reader can jump to, named: the Explorer gives the margin log
  // exactly this treatment, and the chronicle strip gains it here.
  panel.setAttribute("role", "region");
  panel.setAttribute("aria-label", opts.label);

  const sig = document.createElement("p");
  sig.className = "rf-log-sig";

  const strip = document.createElement("ol");
  strip.className = "rf-log-strip";

  panel.append(sig, strip);

  let rows: HTMLLIElement[] = [];

  /**
   * Render the log: the attribution line above, one dimmed row per entry below.
   * Every row up front (like both engine builders), so a snap or a reduced-motion
   * jump can brighten them all at once. Prose is written with textContent, never
   * innerHTML: entry text is plain text from the generator, and it stays that way.
   */
  function render(dated: ReadonlyArray<DatedRow>, attribution = ""): HTMLLIElement[] {
    sig.textContent = attribution;
    rows = dated.map((r) => {
      const li = document.createElement("li");
      const year = document.createElement("span");
      year.className = "cr-year";
      year.textContent = String(r.year);
      const text = document.createElement("span");
      text.className = "cr-text";
      text.textContent = r.text;
      li.append(year, text);
      return li;
    });
    strip.replaceChildren(...rows);
    return rows;
  }

  /**
   * Brighten rows [0, arrived) and dim the rest. Idempotent and order-independent,
   * so a driver stepping BACKWARD (a scrub dragged left, an e2e hook walking the
   * sweep) un-brightens correctly rather than accumulating state.
   */
  function reveal(arrived: number): void {
    for (let i = 0; i < rows.length; i++) rows[i].classList.toggle("inked", i < arrived);
  }

  /** Empty the log. Visibility stays the host's call, so `hidden` is not touched. */
  function clear(): void {
    rows = [];
    strip.replaceChildren();
    sig.textContent = "";
  }

  function snapshot(): DatedLogSnapshot {
    return {
      rows: rows.length,
      inked: rows.filter((r) => r.classList.contains("inked")).length,
      attribution: sig.textContent ?? "",
    };
  }

  return { panel, sig, strip, render, reveal, clear, snapshot };
}

export type DatedLog = ReturnType<typeof createDatedLog>;
