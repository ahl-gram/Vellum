// The one dated log (#219): the shared row idiom (a right-aligned tabular year in
// .cr-year beside its prose in .cr-text, resting dim and brightening as its moment
// arrives) as ONE component; `inked` is the arrived-class. Host-agnostic: it BUILDS its
// elements, owns no ids, and deliberately does NOT touch panel.hidden, because the
// engine's builders already drive hidden on the panels the frame hands them and a
// component that also set it would be a second hand on the same switch.
//
// TWO paths fill a strip, and render/reveal/snapshot are only ONE of them (this tripped
// two independent reviewers): the frame's one instance is ENGINE-driven (#220's fused
// journal writes the prologue and annal rows directly), so on that path this component's
// `rows` stays empty by design, reveal() is inert, and snapshot() reports zero. Not a
// gap: the engine owns the read hooks for its own path (lc.voyageLog / lc.agesState),
// and wiring this component over engine-written rows would put two hands on one switch
// and detach the very nodes voyage.ts still holds in `logRows`. Do not "fix" it.

/** One dated row; a HistoricalEvent's {year, text} and a VoyageLogEntry's {year, text} both reduce to this. */
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
  // A named landmark a screen reader can jump to, matching the Explorer's margin log.
  panel.setAttribute("role", "region");
  panel.setAttribute("aria-label", opts.label);

  const sig = document.createElement("p");
  sig.className = "rf-log-sig";

  const strip = document.createElement("ol");
  strip.className = "rf-log-strip";

  panel.append(sig, strip);

  let rows: HTMLLIElement[] = [];

  /** Render the log: attribution above, one dimmed row per entry, every row up front so a snap or reduced-motion jump can brighten all at once. Prose lands via textContent, never innerHTML. */
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

  /** Brighten rows [0, arrived) and dim the rest. Idempotent and order-independent, so a driver stepping BACKWARD un-brightens correctly rather than accumulating state. */
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
