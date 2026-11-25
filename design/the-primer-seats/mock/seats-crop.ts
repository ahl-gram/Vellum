// Issue #1248 round: a still and its twice-size crop of one element, in two passes through the shared camera, since a clip is fixed in the shot list before the script that scrolls to the element runs: the first pass scrolls the element to the middle of the window and reads where it stands on the page, the second clips there at twice the size.
import { script } from "./drive.ts";
import { probeOf, shoot, type Shot } from "./seats-shoot.ts";

export type CropItem = { readonly url: string; readonly w: number; readonly h: number; readonly js: string; readonly target: string; readonly pad: number; readonly full: string; readonly crop: string; readonly probe?: string; readonly minW?: number };
type Spot = { x: number; y: number; width: number; height: number; extra: unknown };

const spotProbe = (target: string, pad: number, minW: number, extra: string): string =>
  `JSON.stringify((()=>{const e=document.querySelector(${JSON.stringify(target)});if(!e)throw new Error("no ${target.replace(/"/g, "'")}");const r=e.getBoundingClientRect();const w=Math.max(r.width+2*${pad},${minW});const x=Math.max(0,Math.round(r.left+r.width/2-w/2+scrollX));return{x,y:Math.max(0,Math.round(r.top-${pad}+scrollY)),width:Math.round(Math.min(w,innerWidth-x)),height:Math.round(r.height+2*${pad}),extra:${extra}};})())`;
const scrollTo = (target: string): string => `{const e=document.querySelector(${JSON.stringify(target)});e.scrollIntoView({block:"center"});for(let k=0;k<6;k++)await tick();}`;

export function shootWithCrops(name: string, items: readonly CropItem[]): Array<{ item: CropItem; extra: unknown }> {
  const first: Shot[] = items.map((it) => ({ url: it.url, width: it.w, height: it.h, mobile: false, out: it.full, waitMs: 400, script: script([{ kind: "eval", js: it.js + scrollTo(it.target) }]), scriptWaitMs: 300, probe: spotProbe(it.target, it.pad, it.minW ?? 0, it.probe ?? "null") }));
  const spots = shoot(`${name}-full`, first).map((r) => probeOf<Spot>(r));
  const second: Shot[] = items.map((it, i) => {
    const s = spots[i]!;
    return { url: it.url, width: it.w, height: it.h, mobile: false, out: it.crop, waitMs: 400, script: script([{ kind: "eval", js: it.js + scrollTo(it.target) }]), scriptWaitMs: 300, clip: { x: s.x, y: s.y, width: s.width, height: s.height, scale: 2 } };
  });
  shoot(`${name}-crops`, second);
  return items.map((item, i) => ({ item, extra: spots[i]!.extra }));
}
