// #442 the story's ONE live signal: what the instrument is telling right now, a survey
// day row or a chronicle annal. One message and never two channels, because a stage that
// had to reconcile a year against a port could paint a stale one over a live one, which
// is the class #402's lockstep-with-lastRes rule exists to prevent.
export type ToldEntry =
  | {
      readonly chamber: "survey";
      /** The row's position in the journal; a scrub BACK resolves through it to the same plate a forward sweep held. */
      readonly row: number;
      readonly index: number;
      readonly day: number;
      readonly text: string;
    }
  | { readonly chamber: "ages"; readonly year: number; readonly text: string };
