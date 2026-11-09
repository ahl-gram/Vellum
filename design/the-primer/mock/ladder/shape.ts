// Issue #1155 round: the authoring shape a contributor writes to add a step, a lesson or a room to the guide. The mock pages are rendered from these types, and the drift check walks them, so the shape is proved by use rather than described.
import type { Act } from "../drive.ts";

/** A control a step names, found the way a reader's assistive technology names it, and the words the step quotes for it. */
export interface Words {
  readonly css: string;
  /** Exactly the words in braces in the step's sentence. */
  readonly says: string;
  /** How the words are read off the control: its visible text, its accessible name, a select's option, a two-line road's verb and place, or its placeholder. */
  readonly read: "text" | "aria" | "title" | "attr" | "option" | "road" | "placeholder" | "label";
  /** The attribute an "attr" read takes, such as a chart stamp (data-vellum-map-type) or a press state (aria-pressed). */
  readonly attr?: string;
  /** "markup" when the control is in the built page's own HTML, "script" when the room's code builds it after load. */
  readonly from: "markup" | "script";
  /** "starts" where the control's words run on past what the step quotes (a place's name before its rank). */
  readonly match?: "starts" | "contains";
  /** Where the step teaches a control that is not yet to hand: "held" in a held box, or "hidden" until the reader has done the thing the step names (a hunt won, a tablet). */
  readonly state?: "held" | "hidden";
  /** Some words are a room's own on-screen constant, which a build can import rather than retype. */
  readonly constant?: string;
}

export interface Step {
  /** The anchor: stable, never reused, so a link to a step keeps working. */
  readonly id: string;
  /** What to do, in one sentence, the control's own words in braces. */
  readonly act: string;
  /** What the reader will see, traceable to the code. */
  readonly see: string;
  /** The address the step's "Try it" opens, its preconditions carried in the address wherever the grammar can carry them. */
  readonly at: string;
  readonly words: readonly Words[];
  /** What the reader has done before the control is there, for whatever the address cannot carry; the check does it too. */
  readonly first?: readonly Act[];
  /** The ruling whose post-use review may change this control, from handbook/specs/ui-design.md's provisional lists. */
  readonly provisional?: string;
  /** A play step has no wrong answer; a commission is a target to reach. */
  readonly kind?: "play" | "commission";
  /** Only where touch is the main pointer, or only with motion on. */
  readonly only?: "touch" | "motion";
}

export interface Lesson {
  readonly id: string;
  readonly title: string;
  readonly gloss: string;
  /** A line of comfort or a way back, printed under the lesson's head. */
  readonly aside?: string;
  readonly steps: readonly Step[];
}

/** One room's ladder, keyed by its route. A subroom's ladder is seated under its parent by the route tree itself (`seatOf` in `src/layouts/nav.ts`), never by a field written here. */
export interface Ladder {
  readonly route: string;
  /** What the room is, in one sentence, for a reader who has never been there. */
  readonly what: string;
  /** How a reader reaches it, for a subroom entered from another room. */
  readonly entered?: string;
  readonly lessons: readonly Lesson[];
}
