import type { Payload } from "../types.ts";

export type CardRoll = { shown: boolean; pinned: boolean; card: [number, number, number, number] | null };
export const CARD_CARRIER = "#place-card .pc-inner";
export const CARD_ROLL: Payload<CardRoll> = `(() => { const c = document.getElementById("place-card"); const i = c && c.querySelector(".pc-inner"); const b = i ? i.getBoundingClientRect() : null; return { shown: !!c && !c.hidden, pinned: !!c && c.classList.contains("pinned"), card: b && [b.x, b.y, b.width, b.height].map((n) => +n.toFixed(2)) }; })()`;
export const rolledFrom: (before: CardRoll) => (d: CardRoll) => boolean = () => () => true;

export type Flip = { versoed: boolean; flip3d: boolean; m11: number; running: number };
export const FLIP: Payload<Flip> = `(() => { const s = document.getElementById("sheet"); const i = document.getElementById("sheet-inner"); return { versoed: s.classList.contains("versoed"), flip3d: s.classList.contains("flip3d"), m11: new DOMMatrix(getComputedStyle(i).transform).m11, running: i.getAnimations().length }; })()`;
export const flipLanded: (d: Flip) => boolean = () => true;
export const flippedBack: (d: Flip) => boolean = () => true;

export const countEvents: (types: readonly string[]) => { arm: Payload<boolean>; seen: string } = () => ({
  arm: "true",
  seen: "0",
});
