export const ROOM = "The Primer";
export const TAGLINE = "every room, one small step at a time";
export const DESCRIPTION =
  "Learn every room of Vellum one small step at a time: each step opens its room already set for it, so you may begin anywhere.";
export const WHERE = "the room you are reading is inked";
export const TRY = "Try it";
export const OPENS = (room: string): string => `opens ${room} at this step`;
export const OF = (room: string): string => `a room of ${room}`;
export const ENTERED = (how: string): string => `You come to it ${how}.`;
export const UNFOLD = "open these steps";
export const NEXT = "Turn the page to";
export const SEALED = "done, kept in this browser";
export const LEDE = "Each step is one small thing to do, and each comes easy once the one before it is done.";
export const CLOSING_VERB = "Lean on these";
export const CLOSING_HEAD = "When the steps are done";
export const CLOSING_WHERE = "for a quicker answer, any time";
export const WIPE = "Wipe the slate";
export const TRAIL_PRESS = "learn this room";
export const CHART_TITLE = "A Chart of the Lessons";
export const CHART_LABEL = "The chart of lessons";
export const CHART_KEY =
  "Every room that teaches, and how far you have come: a red mark is a step you have done, the red road is the way you have come; the lit room is the one you are reading, and the hand points at your next step.";
export const datelineOf = (steps: number, rooms: number): string =>
  `${steps} steps in ${rooms} ${rooms === 1 ? "room" : "rooms"}`;
