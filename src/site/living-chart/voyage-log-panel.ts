// #121 the margin log: the surveyor's dated journal, the PROLOGUE block of the fused journal (the ages driver appends the annal rows after these); the host hands its three panel elements in, and the voyage overlay reads exactly one field back, `log.summary`.
import {
  buildVoyageLog,
  type VoyageHomecoming,
  type VoyageLog,
  type VoyageLogPort,
} from "../../world/voyage-log.ts";

export interface VoyageLogHost {
  panel: HTMLElement;
  sig: HTMLElement;
  strip: HTMLElement;
}

export function journalText(text: string): string {
  return text.replace(/^Year \d+\. /, "");
}

export function createVoyageLogPanel(host: VoyageLogHost) {
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
      li.className = "prologue";
      const year = document.createElement("span");
      year.className = "cr-year";
      year.textContent = `day ${e.day}`;
      const text = document.createElement("span");
      text.className = "cr-text";
      const body = journalText(e.text);
      if (i === 0 && body.length > 0) {
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
