// The one dated log: the shared row idiom (a tabular year in .cr-year beside its prose in .cr-text, brightening as its moment arrives) as ONE component; `inked` is the arrived-class. It builds its elements, owns no ids, and never touches panel.hidden: the engine drives hidden on the panels the frame hands it, and a second hand on that switch is the bug.
// The frame's one instance is ENGINE-driven (the fused journal writes the rows directly), so on that path `rows` stays empty, reveal() is inert and snapshot() reports zero BY DESIGN; wiring this component over engine-written rows would detach the nodes voyage.ts holds in `logRows`. Do not "fix" it.

/** One dated row; a HistoricalEvent's {year, text} and a VoyageLogEntry's {year, text} both reduce to this. */
export interface DatedRow {
  readonly year: number;
  readonly text: string;
}

export interface DatedLogOpts {
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
  panel.setAttribute("role", "region");
  panel.setAttribute("aria-label", opts.label);

  const sig = document.createElement("p");
  sig.className = "rf-log-sig";

  const strip = document.createElement("ol");
  strip.className = "rf-log-strip";

  panel.append(sig, strip);

  let rows: HTMLLIElement[] = [];

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

  function reveal(arrived: number): void {
    for (let i = 0; i < rows.length; i++) rows[i].classList.toggle("inked", i < arrived);
  }

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
