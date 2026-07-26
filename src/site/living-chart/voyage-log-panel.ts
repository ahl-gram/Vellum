// #121 The margin log: the surveyor's dated journal beside the chart. A scrollable,
// chronicle-strip-style HTML panel (a SIBLING of the chart mount, not part of the SVG
// overlay) whose entries brighten as the voyage sweep reaches each port. Extracted from
// src/site/living-chart/voyage.ts (#189), made host-agnostic in #191: the host hands its
// three panel elements in, nothing is looked up by id. The panel is HTML DOM, the voyage
// engine is the animated SVG survey, and they share only DATA: buildLogPanel(logPorts, ...)
// -> { log, rows } (build the log, render the strip) revealLog(rows, arrived) (brighten the
// reached rows) hideLog() (empty + hide the panel) logSnapshot(log, rows) -> {...} (the e2e
// read hook's payload) No overlay internals (plan / routing / geometry / marks / rAF) reach
// this file, and none of these panel element refs reach the overlay. The overlay reads
// exactly one field back, `log.summary` (for its status announcement); the log is shared
// data, so that is expected, not leakage.
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

export function createVoyageLogPanel(host: VoyageLogHost) {
  /**
   * Build the log from the arrival ports and render the margin panel: every port a row
   * up front (dimmed), the surveyor's signature above. Mirrors the chronicle's
   * buildStrip so a snap or a reduced-motion jump can brighten them all at once. The
   * dated year rides its own tabular column like the chronicle strip; the row text
   * drops the redundant "Year N." lead the entry already carries.
   *
   * #275: `homecoming` is the CLOSING leg (last port back to the capital), which earns
   * the log's final row, so rows = ports + 1 on a round trip. Pass null for a survey
   * with no closing leg. The extra row is why revealLog is positional: its entry shares
   * the capital's idx with row 0.
   *
   * The richer, seed-forked prose lives in the engine (world/voyage-log.ts); the plan's
   * own `port.logLine` is the pure Sub-1 line and is not displayed.
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
    const rows = log.entries.map((e) => {
      const li = document.createElement("li");
      const year = document.createElement("span");
      year.className = "cr-year";
      year.textContent = String(e.year);
      const text = document.createElement("span");
      text.className = "cr-text";
      text.textContent = e.text.replace(/^Year \d+\. /, "");
      li.append(year, text);
      return li;
    });
    host.strip.replaceChildren(...rows);
    host.panel.hidden = false;
    return { log, rows };
  }

  /**
   * Brighten the rows the survey has reached (rows [0, arrived)), dim the rest.
   * Idempotent and order-independent, so stepping backward via the e2e hook
   * un-brightens correctly. `arrived` is frameAt's count: the departure, one per
   * arrival, and on a round trip the homecoming last.
   */
  function revealLog(rows: HTMLLIElement[], arrived: number): void {
    for (let i = 0; i < rows.length; i++) rows[i].classList.toggle("logged", i < arrived);
  }

  /** Hide and empty the panel. It lives outside the chart mount, so nothing else clears it. */
  function hideLog(): void {
    host.panel.hidden = true;
    host.strip.replaceChildren();
    host.sig.textContent = "";
  }

  /**
   * #121 e2e read payload: the margin log (attribution, summary, entries) plus how many
   * rows are currently revealed and whether the panel is shown, so a suite can assert
   * the mode-aware prose and the reveal-per-arrival without racing the rAF loop.
   */
  function logSnapshot(log: VoyageLog, rows: HTMLLIElement[]) {
    return {
      attribution: log.attribution,
      summary: log.summary,
      entries: log.entries.map((e) => ({ idx: e.idx, year: e.year, text: e.text })),
      logged: rows.filter((r) => r.classList.contains("logged")).length,
      rows: rows.length,
      visible: !host.panel.hidden,
    };
  }

  return { buildLogPanel, revealLog, hideLog, logSnapshot };
}

export type VoyageLogPanel = ReturnType<typeof createVoyageLogPanel>;
