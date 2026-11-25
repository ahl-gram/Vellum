// Issue #1248 round, item 1: the page-side JavaScript that lays the Primer's station over the real built home page, as the build would seat it. The pip is How It Works's own markup cloned and moored at Poalo (a land diamond), and it takes Poalo's town dot as every station takes its own (`unclaimedDots` in `src/site/home/stations.ts`); the fifth legend press is a clone of the row's own press; the card is a clone of the four stations' card (`#lf-card-explorer`) with its road in their form. Every word is a stand-in for the sitting (N10).
import { homeStage } from "../../../src/site/home/stage-data.ts";

const j = JSON.stringify;
const poalo = homeStage().dots.find((d) => d.name === "Poalo");
if (poalo === undefined) throw new Error("seed 42 no longer places Poalo");
export const POALO = poalo;

export type Words = { readonly verb: string; readonly name: string; readonly legendName: string; readonly where: string; readonly prose: string; readonly road: string };
export const STAND_IN: Words = {
  verb: "Learn one",
  name: "The Primer",
  legendName: "The Primer",
  where: "at Poalo, a harbour of the Ratoa Atolls",
  prose: "Every room, one small step at a time. Each step opens its room already set for it, and the room points at the control to touch.",
  road: "Enter the room →",
};

export const styleJs = (id: string, css: string): string =>
  `{let st=document.getElementById(${j(id)});if(!st){st=document.createElement("style");st.id=${j(id)};document.head.appendChild(st);}st.textContent=${j(css)};}`;

export const relayJs = `window.dispatchEvent(new Event("resize"));for(let k=0;k<6;k++)await tick();window.dispatchEvent(new Event("resize"));for(let k=0;k<4;k++)await tick();`;

export const pipJs = (w: Words): string => `{const how=document.querySelector('.lf-station[data-station="how"]');const pip=how.cloneNode(true);pip.dataset.station="primer";pip.dataset.nx=${j(String(POALO.nx))};pip.dataset.ny=${j(String(POALO.ny))};
pip.style.left=${j(`${(POALO.nx * 100).toFixed(2)}%`)};pip.style.top=${j(`${(POALO.ny * 100).toFixed(2)}%`)};pip.classList.remove("at-sea");pip.setAttribute("aria-label",${j(`${w.name}. ${w.verb}.`)});
pip.querySelector(".lf-station-name").textContent=${j(w.name)};pip.querySelector(".lf-station-verb").textContent=${j(w.verb)};how.parentNode.insertBefore(pip,how);
const dot=[...document.querySelectorAll(".lf-dot")].find((d)=>d.querySelector(".lf-name")?.textContent===${j(POALO.name)});if(!dot)throw new Error("no town dot for Poalo");dot.remove();}`;

export const fifthPressJs = (w: Words): string => `{const row=document.querySelector("#lf-legend .lf-legend-row");const b=row.querySelector(".lf-legend-btn").cloneNode(true);b.dataset.station="primer";b.querySelector(".lf-legend-verb").textContent=${j(w.verb)};b.querySelector(".lf-legend-room").textContent=${j(w.legendName)};row.appendChild(b);}`;

export const cardJs = (w: Words): string => `{const ex=document.getElementById("lf-card-explorer");const c=ex.cloneNode(true);c.id="lf-card-primer";c.hidden=true;c.querySelector(".lf-card-verb").textContent=${j(w.verb)};c.querySelector(".lf-card-title").textContent=${j(w.name)};c.querySelector(".lf-card-where").textContent=${j(w.where)};c.querySelector(".lf-card-prose").textContent=${j(w.prose)};const go=c.querySelector(".lf-card-enter");go.href="/primer/";go.textContent=${j(w.road)};ex.parentNode.insertBefore(c,document.getElementById("lf-card-how"));}`;

/** Open a station's card the way a reader does: a press on a bound station control, so the chart flies to the mooring and the card is seated by the page's own code. The Primer's clone carries no listener, so a bound legend press is lent its id for the one press and given it back. */
export const openJs = (id: string): string => `{const lend=document.querySelector('#lf-legend .lf-legend-btn[data-station="explorer"]');lend.dataset.station=${j(id)};lend.click();lend.dataset.station="explorer";for(let k=0;k<14;k++)await tick();}`;

export const moveGalleryJs = (nx: number, ny: number): string => `{const g=document.querySelector('.lf-station[data-station="gallery"]');g.dataset.nx=${j(String(nx))};g.dataset.ny=${j(String(ny))};g.style.left=${j(`${(nx * 100).toFixed(2)}%`)};g.style.top=${j(`${(ny * 100).toFixed(2)}%`)};}`;

/** The row seated left of centre, its right edge a gap clear of the Gallery's slip, measured on the page after layout. */
export const rowClearOfGalleryJs = (gap: number): string => `{const row=document.getElementById("lf-legend");const s=document.querySelector('.lf-station[data-station="gallery"] .lf-station-slip').getBoundingClientRect();const r=row.getBoundingClientRect();const over=r.right-(s.left-${gap});if(over>0){row.style.setProperty("translate",(-over)+"px 0");}}`;

export const PROBE = `JSON.stringify((()=>{const r=(e)=>{if(!e)return null;const b=e.getBoundingClientRect();return{l:b.left,t:b.top,r:b.right,b:b.bottom};};
const ov=(a,b)=>!a||!b?0:Math.round(Math.max(0,Math.min(a.r,b.r)-Math.max(a.l,b.l))*Math.max(0,Math.min(a.b,b.b)-Math.max(a.t,b.t)));
const stations=[...document.querySelectorAll(".lf-station")].map((s)=>({id:s.dataset.station,glyph:r(s.querySelector(".lf-station-glyph")),slip:r(s.querySelector(".lf-station-slip"))}));
const row=r(document.getElementById("lf-legend"));const presses=[...document.querySelectorAll("#lf-legend .lf-legend-btn")].map((b)=>({id:b.dataset.station,box:r(b)}));
const vis=[...document.querySelectorAll(".corner.br button")].map(r).filter((b)=>b.r>b.l);const glass=vis.length?{l:Math.min(...vis.map((b)=>b.l)),t:Math.min(...vis.map((b)=>b.t)),r:Math.max(...vis.map((b)=>b.r)),b:Math.max(...vis.map((b)=>b.b))}:null;
const ce=document.getElementById("lf-coords");let coords=null;if(ce&&ce.firstChild){const g=document.createRange();g.selectNodeContents(ce);const q=g.getBoundingClientRect();if(q.width>0)coords={l:q.left,t:q.top,r:q.right,b:q.bottom};}
const seed=r(document.getElementById("seed-form")),notice=r(document.querySelector(".notice-stamp")),chrome=r(document.querySelector("header.chrome"));
const over=(box)=>Object.fromEntries(stations.map((s)=>[s.id,ov(box,s.slip)+ov(box,s.glyph)]));
const pip=stations.find((s)=>s.id==="primer");const gal=stations.find((s)=>s.id==="gallery");
const gap=(a,b)=>{const dx=Math.max(0,b.l-a.r,a.l-b.r),dy=Math.max(0,b.t-a.b,a.t-b.b);return Math.round(Math.hypot(dx,dy)*10)/10;};
const near=(s)=>!s?null:Math.min(...stations.filter((o)=>o!==s).map((o)=>gap(s.glyph,o.glyph)));
const inWin=(b)=>!!b&&b.l>=0&&b.t>=0&&b.r<=innerWidth&&b.b<=innerHeight;
const rnd=(b)=>b&&{l:Math.round(b.l),t:Math.round(b.t),r:Math.round(b.r),b:Math.round(b.b)};
const card=document.querySelector(".lf-card:not([hidden])");const cb=r(card);
return{w:innerWidth,row:rnd(row),rowW:row?Math.round(row.r-row.l):null,rowLines:new Set(presses.map((p)=>Math.round(p.box.t))).size,rowToGlass:glass&&row?Math.round(glass.l-row.r):null,rowOver:over(row),pressOver:Object.fromEntries(presses.map((p)=>[p.id,over(p.box)])),rowOverCoords:ov(row,coords),coords:rnd(coords),rowOverNotice:ov(row,notice),
gallerySlipOverGlass:gal?ov(gal.slip,glass)+ov(gal.glyph,glass):null,galleryOffWindow:gal?Math.round(Math.max(0,gal.slip.r-innerWidth,gal.slip.b-innerHeight,-gal.slip.l)):null,galleryOverRow:gal?ov(gal.slip,row)+ov(gal.glyph,row):null,galleryNearest:near(gal),gallerySlip:rnd(gal&&gal.slip),
pip:pip?{inWindow:inWin(pip.glyph)&&inWin(pip.slip),nearest:near(pip),slipOverOthers:stations.filter((o)=>o!==pip).reduce((n,o)=>n+ov(pip.slip,o.slip)+ov(pip.slip,o.glyph)+ov(pip.glyph,o.slip),0),overGlass:ov(pip.slip,glass)+ov(pip.glyph,glass),overSeed:ov(pip.slip,seed)+ov(pip.glyph,seed),overNotice:ov(pip.slip,notice)+ov(pip.glyph,notice),overChrome:ov(pip.slip,chrome)+ov(pip.glyph,chrome),overRow:ov(pip.slip,row)+ov(pip.glyph,row)}:null,
glass:rnd(glass),card:card?{id:card.id,inWindow:inWin(cb),overGlass:ov(cb,glass),overSeed:ov(cb,seed),box:rnd(cb)}:null};})())`;
