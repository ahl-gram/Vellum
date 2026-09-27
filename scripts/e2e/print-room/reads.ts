import type { Payload } from "../types.ts";

export type Matter = { ratio: number; aspect: number; pageHidden: boolean; turnedHidden: boolean; proofHidden: boolean; on: string | undefined; here: string | undefined; line: string; head: string; places: number; measureEmpty: boolean; scrollY: number; fits: number; innerW: number; noX: boolean; label: string | null };
type AtlasFit = { scrollW: number; clientW: number; plates: number; maxRight: number; atlasPadL: string };
export type Warning = { disp: string; pos: string; w: number; hidden: boolean };

export const ATLAS_FIT: Payload<AtlasFit> = `(()=>{const d=document.documentElement;const a=document.querySelector("#pr-atlas");const i=[...document.querySelectorAll("#pr-atlas figure img")];
    return{scrollW:d.scrollWidth,clientW:d.clientWidth,plates:i.length,maxRight:i.length?Math.round(Math.max(...i.map((el)=>el.getBoundingClientRect().right))):-1,atlasPadL:a?getComputedStyle(a).paddingLeft:"absent"};})()`;
