/** The shell's own bundle: the one script every shelled page carries. It lays out the top row (Issue #762), shows the desk notice (Issue #761) on a phone that shrank the page, and shuts the chart of the atelier on Escape, a click elsewhere, focus leaving it or leaving the page (Issue #671). */
import { bindAtelier } from "./atelier.ts";
import { bindNotice } from "./desk-notice.ts";
import { bindTopRow } from "./top-row.ts";

bindTopRow();
bindAtelier(document);

const notice = document.querySelector<HTMLElement>(".desk-notice");
if (notice !== null && window.visualViewport !== null) {
  bindNotice(
    { classList: notice.classList, style: notice.style, button: notice.querySelector("button") },
    window.visualViewport,
    window.innerHeight,
    () => localStorage,
  );
}
