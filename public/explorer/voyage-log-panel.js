// #121 The margin log: the surveyor's dated journal beside the chart. A scrollable,
// chronicle-strip-style HTML panel (a SIBLING of #map, not part of the SVG overlay) whose
// entries brighten as the voyage sweep reaches each port. Extracted from voyage.js (#189):
// the panel is HTML DOM, the rest of voyage.js is the animated SVG survey, and they share
// only DATA. What crosses this boundary is finished data in and finished data out:
//   buildLogPanel(logPorts, ...) -> { log, rows }   (build the log, render the strip)
//   revealLog(rows, arrived)                          (brighten the reached rows)
//   hideLog()                                         (empty + hide the panel)
//   logSnapshot(log, rows) -> {...}                   (the e2e read hook's payload)
// No overlay internals (plan / routing / geometry / marks / rAF / verso) reach this file,
// and none of these panel element refs reach the overlay. The overlay reads exactly one
// field back, `log.summary` (for its #status announcement); the log is shared data, so that
// is expected, not leakage.
import { buildVoyageLog } from "./engine/world/voyage-log.js";

const logPanel = document.getElementById("voyage-log");
const logSig = document.getElementById("voyage-log-sig");
const logStrip = document.getElementById("voyage-log-strip");

/**
 * Build the log from the arrival ports and render the margin panel: every port a row up
 * front (dimmed), the surveyor's signature above. Mirrors living-chart buildStrip so a
 * snap or a reduced-motion jump can brighten them all at once. The dated year rides its
 * own tabular column like the chronicle strip; the row text drops the redundant "Year N."
 * lead the entry already carries.
 *
 * The richer, seed-forked prose lives in the engine (world/voyage-log.js); the plan's own
 * `port.logLine` is the pure Sub-1 line and is not displayed.
 * @param {Array<{idx:number,name:string,kind:string,founded:number,arrivalMode:string|null}>} logPorts
 * @param {number} presentYear
 * @param {number} seed
 * @param {string} subtitle the surveyor attribution line
 * @returns {{log:object, rows:HTMLLIElement[]}} the built log and its rows (the session
 *   brightens the rows per arrival)
 */
export function buildLogPanel(logPorts, presentYear, seed, subtitle) {
  const log = buildVoyageLog(logPorts, presentYear, (seed >>> 0), subtitle || "");
  logSig.textContent = log.attribution;
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
  logStrip.replaceChildren(...rows);
  logPanel.hidden = false;
  return { log, rows };
}

/**
 * Brighten the rows the survey has reached (rows [0, arrived)), dim the rest. Idempotent
 * and order-independent, so stepping backward via the e2e hook un-brightens correctly.
 * @param {HTMLLIElement[]} rows
 * @param {number} arrived how many ports the mark has reached
 */
export function revealLog(rows, arrived) {
  for (let i = 0; i < rows.length; i++) rows[i].classList.toggle("logged", i < arrived);
}

/** Hide and empty the panel. The panel lives outside #map, so nothing else clears it. */
export function hideLog() {
  logPanel.hidden = true;
  logStrip.replaceChildren();
  logSig.textContent = "";
}

/**
 * #121 e2e read payload: the margin log (attribution, summary, entries) plus how many rows
 * are currently revealed and whether the panel is shown, so a suite can assert the mode-
 * aware prose and the reveal-per-arrival without racing the rAF loop.
 * @param {object} log the built log
 * @param {HTMLLIElement[]} rows
 */
export function logSnapshot(log, rows) {
  return {
    attribution: log.attribution,
    summary: log.summary,
    entries: log.entries.map((e) => ({ idx: e.idx, year: e.year, text: e.text })),
    logged: rows.filter((r) => r.classList.contains("logged")).length,
    rows: rows.length,
    visible: !logPanel.hidden,
  };
}
