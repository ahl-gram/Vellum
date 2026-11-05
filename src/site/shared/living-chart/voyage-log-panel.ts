// Issue #121 the margin log: the surveyor's dated journal, the PROLOGUE block of the fused journal (the ages driver appends the annal rows after these); the host hands its three panel elements in, and the voyage overlay reads exactly one field back, `log.summary`.
import type { LegMode } from "../../../render/voyage-route.ts";
import {
  buildVoyageLog,
  type VoyageHomecoming,
  type VoyageLog,
  type VoyageLogEntry,
  type VoyageLogPort,
} from "../../../world/voyage-log.ts";

export interface VoyageLogHost {
  readonly panel: HTMLElement;
  readonly sig: HTMLElement;
  readonly strip: HTMLElement;
}

export interface JournalLeg {
  readonly fromIdx: number;
  readonly toIdx: number;
  readonly mode: LegMode;
}

export interface RoadPressHost {
  readonly href: (seed: number, fromIdx: number, toIdx: number) => string;
  readonly park: () => void;
}

export const ROAD_TAKE = "Take this road";
export const ROAD_ASK = "Leave the voyage?";
export const ROAD_UNREACHED = "Not reached yet";

export function journalText(text: string): string {
  return text.replace(/^Year \d+\. /, "");
}

function roadPressParts(href: string) {
  const press = document.createElement("a");
  press.className = "cr-road";
  press.setAttribute("href", href);
  const label = document.createElement("span");
  label.className = "cr-road-label";
  label.textContent = ROAD_TAKE;
  const note = document.createElement("span");
  note.className = "cr-road-note";
  note.textContent = ROAD_UNREACHED;
  press.append(label, document.createTextNode(" "), note);
  return { press, label, note };
}

type Seat = {
  readonly press: HTMLAnchorElement;
  readonly label: HTMLSpanElement;
  readonly note: HTMLSpanElement;
  readonly row: HTMLLIElement;
};

function paintSeat(s: Seat): void {
  const { press, note, row } = s;
  const told = row.classList.contains("inked");
  press.setAttribute("aria-disabled", String(!told));
  note.hidden = told;
}

function createQuestion() {
  let asking: Seat | null = null;

  function close(): void {
    if (asking) asking.label.textContent = ROAD_TAKE;
    asking = null;
  }

  return {
    asks: (s: Seat): boolean => asking === s,
    open(s: Seat): void {
      const { label } = s;
      label.textContent = ROAD_ASK;
      asking = s;
    },
    close,
    closeIfUntold(): void {
      if (asking && !asking.row.classList.contains("inked")) close();
    },
    forget(): void {
      asking = null;
    },
  };
}

type Question = ReturnType<typeof createQuestion>;

function onPress(s: Seat, e: MouseEvent, q: Question, park: () => void): void {
  if (!s.row.classList.contains("inked")) {
    e.preventDefault();
    q.close();
    return;
  }
  if (q.asks(s)) {
    q.close();
    return;
  }
  e.preventDefault();
  q.close();
  park();
  q.open(s);
}

function createRoadAsk(park: () => void) {
  const q = createQuestion();
  let seats: Seat[] = [];

  function press(row: HTMLLIElement, href: string): HTMLAnchorElement {
    const s: Seat = { ...roadPressParts(href), row };
    seats.push(s);
    paintSeat(s);
    s.press.addEventListener("click", (e) => onPress(s, e, q, park));
    s.press.addEventListener("focusout", () => {
      if (q.asks(s)) q.close();
    });
    s.press.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && q.asks(s)) q.close();
    });
    return s.press;
  }

  function settle(): void {
    seats.forEach(paintSeat);
    q.closeIfUntold();
  }

  function forget(): void {
    seats = [];
    q.forget();
  }

  return { press, close: q.close, settle, forget };
}

type RoadAsk = ReturnType<typeof createRoadAsk>;

function journalRow(
  e: Readonly<VoyageLogEntry>,
  i: number,
  road: ((row: HTMLLIElement) => HTMLAnchorElement) | null,
): HTMLLIElement {
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
  } else if (road) {
    const prose = document.createElement("span");
    prose.className = "cr-prose";
    prose.textContent = body;
    text.append(prose, document.createTextNode(" "), road(li));
  } else {
    text.textContent = body;
  }
  li.append(year, text);
  return li;
}

function rowLeg(
  legs: ReadonlyArray<JournalLeg>,
  i: number,
  count: number,
  homecoming: boolean,
): JournalLeg | undefined {
  return i === 0 || (homecoming && i === count - 1) ? undefined : legs[i - 1];
}

function roadFor(
  road: Readonly<RoadPressHost> | undefined,
  ask: RoadAsk,
  seed: number,
  leg: JournalLeg | undefined,
): ((row: HTMLLIElement) => HTMLAnchorElement) | null {
  return road && leg && leg.mode === "road"
    ? (row) => ask.press(row, road.href(seed >>> 0, leg.fromIdx, leg.toIdx))
    : null;
}

export function createVoyageLogPanel(logEls: VoyageLogHost, road?: RoadPressHost) {
  const ask = createRoadAsk(road ? road.park : () => {});

  function buildLogPanel(
    logPorts: ReadonlyArray<VoyageLogPort>,
    presentYear: number,
    seed: number,
    subtitle: string,
    homecoming?: VoyageHomecoming | null,
    legs: ReadonlyArray<JournalLeg> = [],
  ): { log: VoyageLog; rows: HTMLLIElement[] } {
    const log = buildVoyageLog(logPorts, presentYear, seed >>> 0, subtitle || "", homecoming);
    logEls.sig.textContent = log.attribution;
    ask.forget();
    const count = log.entries.length;
    const rows = log.entries.map((e, i) =>
      journalRow(e, i, roadFor(road, ask, seed, rowLeg(legs, i, count, homecoming != null))),
    );
    logEls.strip.replaceChildren(...rows);
    logEls.panel.hidden = false;
    return { log, rows };
  }

  /** Brighten rows [0, arrived), dim the rest. Idempotent and order-independent, so stepping backward un-brightens correctly. */
  function revealLog(rows: HTMLLIElement[], arrived: number): void {
    for (let i = 0; i < rows.length; i++) rows[i]!.classList.toggle("inked", i < arrived);
    ask.settle();
  }

  /** Hide and empty the panel. It lives outside the chart mount, so nothing else clears it. */
  function hideLog(): void {
    ask.forget();
    logEls.panel.hidden = true;
    logEls.strip.replaceChildren();
    logEls.sig.textContent = "";
  }

  /** Issue #121 e2e read payload: the log plus revealed-row count and visibility, so a suite asserts prose and reveal without racing the rAF loop. */
  function logSnapshot(log: VoyageLog, rows: HTMLLIElement[]) {
    return {
      attribution: log.attribution,
      summary: log.summary,
      entries: log.entries.map((e) => ({ idx: e.idx, year: e.year, day: e.day, text: e.text })),
      logged: rows.filter((r) => r.classList.contains("inked")).length,
      rows: rows.length,
      visible: !logEls.panel.hidden,
    };
  }

  return { buildLogPanel, revealLog, hideLog, logSnapshot, closeAsk: ask.close };
}

export type VoyageLogPanel = ReturnType<typeof createVoyageLogPanel>;
