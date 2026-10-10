// The Hunt's stage as the browser built it, before any guess (Issue #779 part 2g): the skeleton around the chart's own sheet; its dress and its press are in dress.ts and gestures.ts.
import { makeStep } from "../../support/step.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { hg7Stage } from "./dress.ts";
import { hg5Bound } from "./gestures.ts";

type Skeleton = {
  parent: string | null;
  vp: string[];
  map: string[];
  attrs: (string | null)[];
  caption: number;
  folio: (string | boolean | null)[] | null;
};
const SKELETON: Payload<Skeleton> = `(() => { const vp = document.getElementById("map-viewport"), folio = document.querySelector(".corner.bl.folio"), first = folio && folio.querySelector("p");
  const kids = (e) => [...e.children].map((c) => c.tagName + (c.id ? "#" + c.id : "") + (c.className ? "." + c.className : ""));
  return { parent: vp.parentElement && vp.parentElement.className, vp: kids(vp), map: kids(document.getElementById("map")),
    attrs: [vp.getAttribute("tabindex"), vp.getAttribute("role")], caption: document.querySelectorAll("#caption").length,
    folio: folio && [!!folio.closest(".stage"), !!(vp.compareDocumentPosition(folio) & Node.DOCUMENT_POSITION_FOLLOWING), !!first && first.classList.contains("folio-title"), first && first.id] }; })()`;

async function hg6Skeleton({ evaluate, check }: SuiteContext): Promise<void> {
  const s = await evaluate(SKELETON);
  check(
    "HG6 the Hunt's skeleton before any guess: the stage holds the gesture box, the gesture box the transform target alone, the target the chart's own sheet alone; the box is a focusable application; no caption; the folio stands outside the stage after it, its first line the title (#167, #462)",
    s.parent === "stage" &&
      JSON.stringify(s.vp) === JSON.stringify(["DIV#map"]) &&
      JSON.stringify(s.map) === JSON.stringify(["DIV#sheet.sheet"]) &&
      JSON.stringify(s.attrs) === JSON.stringify(["0", "application"]) &&
      s.caption === 0 &&
      JSON.stringify(s.folio) === JSON.stringify([false, true, true, "folio-title"]),
    JSON.stringify(s),
  );
}

export async function huntRoom(ctx: SuiteContext): Promise<void> {
  const step = makeStep(ctx);
  await step("HG5", () => hg5Bound(ctx));
  await step("HG6", () => hg6Skeleton(ctx));
  await step("HG7", () => hg7Stage(ctx));
}
