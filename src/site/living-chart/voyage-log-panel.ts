// #121 the margin log: the surveyor's dated journal beside the chart, and since #220 the
// PROLOGUE block of the fused journal (host elements are the instrument panel's sig and
// strip; the ages driver appends the annal rows after these). Host-agnostic since #191:
// the host hands its three panel elements in, nothing is looked up by id. The panel is
// HTML DOM, the voyage engine is the animated SVG survey, and they share only DATA; the
// overlay reads exactly one field back, `log.summary`.
import {
  buildVoyageLog,
  type VoyageHomecoming,
  type VoyageLog,
  type VoyageLogPort,
} from "../../world/voyage-log.ts";

export interface VoyageLogHost {
  /** The panel wrapper (the Explorer's #voyage-log). */
  panel: HTMLElement;
  /** The surveyor's signature line above the strip. */
  sig: HTMLElement;
  /** The <ol> the dated rows render into. */
  strip: HTMLElement;
}

/** #312: the day rows drop the "Year N. " opener, since the survey's one year lives in the attribution line. Shared so the live row's mirror cannot drift from the journal's own text. */
export function journalText(text: string): string {
  return text.replace(/^Year \d+\. /, "");
}

export function createVoyageLogPanel(host: VoyageLogHost) {
  /**
   * Build the log and render the margin panel: every port a row up front (dimmed), the
   * signature above, so a snap or reduced-motion jump can brighten them all at once.
   * #275: `homecoming` is the CLOSING leg, earning the final row, so rows = ports + 1 on
   * a round trip; the extra row is why revealLog is positional (its entry shares the
   * capital's idx with row 0). The seed-forked prose lives in world/voyage-log.ts.
   */
  function buildLogPanel(
    logPorts: ReadonlyArray<VoyageLogPort>,
    presentYear: number,
    seed: number,
    subtitle: string,
    homecoming: VoyageHomecoming | null = null,
  ): { log: VoyageLog; rows: HTMLLIElement[] } {
    const log = buildVoyageLog(logPorts, presentYear, (seed >>> 0), subtitle || "", homecoming);
    host.sig.textContent = log.attribution;
    const rows = log.entries.map((e, i) => {
      const li = document.createElement("li");
      // #220: the fused journal's PROLOGUE block; the class carries the voice distinction the Overture framing owes the reader.
      li.className = "prologue";
      const year = document.createElement("span");
      year.className = "cr-year";
      // #312: the gutter counts the days of the voyage; the survey's one year lives in the attribution line alone (the Overture framing, amended 2026-07-28).
      year.textContent = `day ${e.day}`;
      const text = document.createElement("span");
      text.className = "cr-text";
      const body = journalText(e.text);
      if (i === 0 && body.length > 0) {
        // #312: the surveyor's hand opens with an initial (the manuscript dressing).
        const dc = document.createElement("span");
        dc.className = "cr-dc";
        dc.textContent = body[0]!;
        text.append(dc, document.createTextNode(body.slice(1)));
      } else {
        text.textContent = body;
      }
      li.append(year, text);
      return li;
    });
    host.strip.replaceChildren(...rows);
    host.panel.hidden = false;
    return { log, rows };
  }

  /** Brighten rows [0, arrived), dim the rest. Idempotent and order-independent, so stepping backward un-brightens correctly. */
  function revealLog(rows: HTMLLIElement[], arrived: number): void {
    // #220 collapsed the three arrived-classes (`past`, `logged`, `inked`) onto `inked` alone.
    for (let i = 0; i < rows.length; i++) rows[i].classList.toggle("inked", i < arrived);
  }

  /** Hide and empty the panel. It lives outside the chart mount, so nothing else clears it. */
  function hideLog(): void {
    host.panel.hidden = true;
    host.strip.replaceChildren();
    host.sig.textContent = "";
  }

  /** #121 e2e read payload: the log plus revealed-row count and visibility, so a suite asserts prose and reveal without racing the rAF loop. */
  function logSnapshot(log: VoyageLog, rows: HTMLLIElement[]) {
    return {
      attribution: log.attribution,
      summary: log.summary,
      entries: log.entries.map((e) => ({ idx: e.idx, year: e.year, day: e.day, text: e.text })),
      logged: rows.filter((r) => r.classList.contains("inked")).length,
      rows: rows.length,
      visible: !host.panel.hidden,
    };
  }

  return { buildLogPanel, revealLog, hideLog, logSnapshot };
}

export type VoyageLogPanel = ReturnType<typeof createVoyageLogPanel>;
