/** The shell's own bundle (#483 Landfall Sub 6c): the one script every shelled page carries, so the phone drawer keeps the same manners on a room as on home. The layout's checkbox burger opens it with no script at all; this adds Escape, the tap on the scrim, the inert page behind it, and the close on the way out of the narrow range. */
import { bindDrawer } from "./drawer.ts";
import { NARROW, wiringFor } from "./wiring.ts";

const reveal = document.querySelector(".rooms-reveal");
if (reveal instanceof HTMLInputElement) {
  const wiring = wiringFor(document.body.classList.contains("room"));
  const scrim = document.querySelector(wiring.scrim);
  if (scrim !== null) {
    bindDrawer(reveal, document, {
      scrim,
      inert: [...document.querySelectorAll<HTMLElement>(wiring.inert)],
      narrow: window.matchMedia(NARROW),
      closesOnScroll: wiring.closesOnScroll,
    });
  }
}
