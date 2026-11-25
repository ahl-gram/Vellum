// Issue #1248 round, after the sitting: the ruled directions as one build would lay them together (Alex, 2026-11-09, Issue #1155 comment 6754142680), as page-side JavaScript. Home: the slimmer presses, the Gallery moored anew and the Reading Room's label lifted, with the ruled words. Every room: the ninth nav item and the trail press on a line of its own; the Print Room's corner wrapping only where it must; the Explorer's slim step note under the press.
import { EXPLORER } from "./ladder/explorer.ts";
import { navJs, ringJs } from "./inject.ts";
import { actHtml } from "./primer.ts";
import { cardJs, fifthPressJs, moveGalleryJs, pipJs, relayJs, STAND_IN, styleJs, type Words } from "./seats-home-js.ts";
import { NARROW_CSS, PRESS_CSS, pressJs } from "./seats-shared.ts";
import { SLIP_CSS } from "./seats-slip.ts";

const j = JSON.stringify;
export const RULED: Words = { ...STAND_IN, verb: "Start here", prose: "New to the atelier? Learn its rooms one small step at a time: each step opens its room already set, and a hand points at what to press." };
export const GALLERY_AT = { nx: 0.76, ny: 0.53 } as const;
const READING_ABOVE = '.lf-station[data-station="reading-room"] .lf-station-slip{top:auto;bottom:calc(50% + 13px)}';
export const homeJs = (): string => pipJs(RULED) + fifthPressJs(RULED) + cardJs(RULED) + styleJs("seats1248", NARROW_CSS + READING_ABOVE) + moveGalleryJs(GALLERY_AT.nx, GALLERY_AT.ny) + relayJs;

export const WRAP_WHERE_IT_MUST = ".corner.tr .folio-controls{flex-wrap:wrap;row-gap:.5rem}.corner.tr .folio-controls #pr-seed{flex:1 1 95px;min-width:0;width:auto;box-sizing:border-box}.corner.tr .folio-controls #pr-style{flex:1 1 112px;min-width:0;width:auto}.corner.tr .folio-controls #pr-draw{flex:0 0 auto}";
export const roomsJs = (wrap: boolean, extraCss = ""): string => styleJs("learn1248css", PRESS_CSS + (wrap ? WRAP_WHERE_IT_MUST : "") + extraCss) + navJs("ninth", "Primer", false) + pressJs("b-own-line", "learn this room") + relayJs;

const dotsOf = (n: number, done: number): string => `<span class="d">${Array.from({ length: n }, (_, i) => `<i class="${i < done ? "on" : i === done ? "now" : ""}"></i>`).join("")}</span>`;
const islands = EXPLORER.lessons.find((l) => l.id === "land")!.steps[1]!;
const anew = EXPLORER.lessons.find((l) => l.id === "glass")!.steps.find((s) => s.id === "anew")!;
const slim = (head: string, act: string, dots: string, back: string): string => `<p class="h"><span class="v">From The Primer</span><span class="t">${head}</span>${dots}</p><p class="a">${act}</p><div class="r"><a href="${back}">Back to The Primer</a><a href="#" class="dim">Next step</a></div>`;
export const NOTE = {
  islands: { html: slim("The Land, step 2 of 6", actHtml(islands), dotsOf(6, 1), "/primer/#explorer-land"), ring: "[data-row=islands]" },
  anew: { html: slim("The Surveyor's Glass, step 3", actHtml(anew), dotsOf(7, 2), "/primer/#explorer-glass"), ring: "#zoom-in" },
} as const;
export const noteJs = (n: { html: string; ring: string }): string =>
  styleJs("slip1248css", SLIP_CSS) + `{const s=document.createElement("aside");s.className="slip1248 head-seat slim";s.setAttribute("aria-label","the step in hand");s.innerHTML=${j(n.html)};const h=document.querySelector("header.chrome");h.appendChild(s);s.style.maxWidth=Math.min(620,document.getElementById("broadside").getBoundingClientRect().left-h.getBoundingClientRect().left-24)+"px";}` + relayJs + ringJs(n.ring, null);
export const DONE_ISLANDS = `{const e=document.getElementById("islands");e.value="20";e.dispatchEvent(new Event("input",{bubbles:true}));e.dispatchEvent(new Event("change",{bubbles:true}));for(let k=0;k<8;k++)await tick();await until("settled",settled);}`;
export const ARM_SLIDE = `{document.getElementById("zoom-in").dispatchEvent(new PointerEvent("pointerdown",{bubbles:true,pointerType:"mouse"}));for(let k=0;k<2;k++)await tick();}`;

/** Home, every station against every other piece. */
export const HOME_PROBE = `JSON.stringify((()=>{const r=(e)=>{if(!e)return null;const b=e.getBoundingClientRect();return b.width>0?{l:b.left,t:b.top,r:b.right,b:b.bottom}:null;};
const ov=(a,b)=>!a||!b?0:Math.round(Math.max(0,Math.min(a.r,b.r)-Math.max(a.l,b.l))*Math.max(0,Math.min(a.b,b.b)-Math.max(a.t,b.t)));
const st=[...document.querySelectorAll(".lf-station")].map((s)=>({id:s.dataset.station,g:r(s.querySelector(".lf-station-glyph")),s:r(s.querySelector(".lf-station-slip"))}));
const row=r(document.getElementById("lf-legend"));const vis=[...document.querySelectorAll(".corner.br button")].map(r).filter(Boolean);const glass=vis.length?{l:Math.min(...vis.map((b)=>b.l)),t:Math.min(...vis.map((b)=>b.t)),r:Math.max(...vis.map((b)=>b.r)),b:Math.max(...vis.map((b)=>b.b))}:null;
const more=r(document.querySelector(".lf-more"));const seed=r(document.getElementById("seed-form")),notice=r(document.querySelector(".notice-stamp")),chrome=r(document.querySelector("header.chrome"));
const ce=document.getElementById("lf-coords");let coords=null;if(ce&&ce.firstChild){const g=document.createRange();g.selectNodeContents(ce);const q=g.getBoundingClientRect();if(q.width>0)coords={l:q.left,t:q.top,r:q.right,b:q.bottom};}
const dots=[...document.querySelectorAll(".lf-dot")].map((d)=>({n:d.querySelector(".lf-name")?.textContent||"",p:r(d.querySelector(".lf-pip")),m:r(d.querySelector(".lf-name"))}));
const both=(x,b)=>ov(x.s,b)+ov(x.g,b);
const rows=st.map((x)=>{const others=st.filter((o)=>o!==x);const past=Math.round(Math.max(0,...[x.s,x.g].map((b)=>Math.max(b.r-innerWidth,b.b-innerHeight,-b.l,-b.t))));
return{id:x.id,underRow:both(x,row),underGlass:both(x,glass),pastEdge:past,overStations:others.reduce((n,o)=>n+ov(x.s,o.s)+ov(x.s,o.g)+ov(x.g,o.s),0),overDots:dots.filter((d)=>ov(x.s,d.p)+ov(x.s,d.m)>0).map((d)=>d.n),overMore:both(x,more),overSeed:both(x,seed),overNotice:both(x,notice),overChrome:both(x,chrome),overCoords:both(x,coords),slip:x.s&&{l:Math.round(x.s.l),t:Math.round(x.s.t),r:Math.round(x.s.r),b:Math.round(x.s.b)}};});
const gap=(a,b)=>Math.round(Math.hypot(Math.max(0,b.l-a.r,a.l-b.r),Math.max(0,b.t-a.b,a.t-b.b))*10)/10;
const rr=st.find((x)=>x.id==="reading-room");const near=rr?st.filter((o)=>o!==rr).map((o)=>({id:o.id,d:Math.min(gap(rr.s,o.s),gap(rr.s,o.g))})).sort((a,b)=>a.d-b.d)[0]:null;
const nearDot=rr?dots.map((d)=>({n:d.n,d:Math.min(d.p?gap(rr.s,d.p):999,d.m?gap(rr.s,d.m):999)})).sort((a,b)=>a.d-b.d)[0]:null;
const card=document.querySelector(".lf-card:not([hidden])");const cb=r(card);
return{rowW:row?Math.round(row.r-row.l):null,rowLines:new Set([...document.querySelectorAll("#lf-legend .lf-legend-btn")].map((b)=>Math.round(b.getBoundingClientRect().top))).size,rowToGlass:glass&&row?Math.round(glass.l-row.r):null,rowOverCoords:ov(row,coords),stations:rows,rrNearestStation:near,rrNearestDot:nearDot,rrToRow:rr&&row?Math.round(row.t-rr.s.b):null,card:card?{id:card.id,inWindow:!!cb&&cb.l>=0&&cb.t>=0&&cb.r<=innerWidth&&cb.b<=innerHeight,overGlass:ov(cb,glass),overSeed:ov(cb,seed)}:null};})())`;

/** Any room: the head cluster against the corner, each of its lines against everything below it (the extent of each line's own text, not its box, so a short line under a long nav, or a block whose box runs the cluster's width, is read as the words it shows), the chart's drawn size, and whether the sheet has been floored under the chrome. */
export const ROOM_PROBE = `JSON.stringify((()=>{const R=(e)=>{if(!e)return null;const b=e.getBoundingClientRect();return b.width>0&&b.height>0?{l:b.left,t:b.top,r:b.right,b:b.bottom}:null;};
const ov=(a,b)=>!a||!b?0:Math.round(Math.max(0,Math.min(a.r,b.r)-Math.max(a.l,b.l))*Math.max(0,Math.min(a.b,b.b)-Math.max(a.t,b.t)));
const chrome=R(document.querySelector("header.chrome"));const corner=R(document.querySelector(".corner.tr"));
const chartEl=document.querySelector("#map > svg[data-vellum-style], #pr-preview svg, #rb-plate, #pp-plate, #wr-chart svg, .rf-chart svg, #sheet svg, #pf-sheet svg, #pf-sheet img, .how-plate, main figure img");const chart=R(chartEl);
const FURN={"the corner":".corner.tr","the chart folio":".corner.bl","the Glass":".corner.br","the slip":".slip","the press row":".legend","the chart":"#map > svg[data-vellum-style], #pr-preview svg, #rb-plate, #pp-plate, #wr-chart svg, .rf-chart svg, #sheet svg, #pf-sheet, .how-plate","the first plate":"main figure","the strip":".rf-strip, .strip"};
const ink=(e)=>{if(e.classList.contains("slip1248"))return R(e);const g=document.createRange();g.selectNodeContents(e);const q=g.getBoundingClientRect();return q.width>0?{l:q.left,t:q.top,r:q.right,b:q.bottom}:null;};const pieces=[...document.querySelectorAll("header.chrome > .wordmark, header.chrome > .tagline, header.chrome > nav.rooms, header.chrome .where > nav.trail, header.chrome .where > .atelier-fold > summary, header.chrome .where > .also, header.chrome .where > .learn1248, header.chrome .own-line1248 > a, header.chrome > .atelier-fold > summary, header.chrome > .slip1248")].map((e)=>({n:e.matches("nav.rooms")?"the nav":e.matches("nav.trail")?"the trail":e.matches(".also")?"the alias line":e.matches(".learn1248")?"the press":e.matches(".slip1248")?"the step note":e.matches("summary")?"the chart of the atelier press":e.matches(".tagline")?"the motto":"the wordmark",b:ink(e)})).filter((x)=>x.b);const below=[];const over={};for(const [name,sel] of Object.entries(FURN)){for(const e of document.querySelectorAll(sel)){const b=R(e);if(!b)continue;for(const p of pieces){const a=ov(p.b,b);if(a>0)over[p.n+" over "+name]=(over[p.n+" over "+name]||0)+a;if(b.t>=p.b.b-0.5&&b.l<p.b.r&&b.r>p.b.l)below.push({name:name+" under "+p.n,gap:Math.round(b.t-p.b.b)});}}}
below.sort((a,b)=>a.gap-b.gap);
const corners=[...document.querySelectorAll(".corner.tr .folio-controls > *")].filter((e)=>e.getBoundingClientRect().width>0);
const cut=corners.filter((e)=>{const s=getComputedStyle(e);if(e.tagName==="SELECT"){const k=e.cloneNode(false);const o=document.createElement("option");o.textContent=e.options[e.selectedIndex].textContent;k.appendChild(o);k.style.cssText="position:absolute;visibility:hidden;width:auto;left:0;top:0";k.removeAttribute("id");e.parentNode.appendChild(k);const need=k.getBoundingClientRect().width;k.remove();return e.getBoundingClientRect().width+0.5<need;}if(e.tagName==="INPUT"){const c=document.createElement("canvas").getContext("2d");c.font=s.fontStyle+" "+s.fontWeight+" "+s.fontSize+" "+s.fontFamily;return c.measureText(e.value).width>e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)+0.5;}const g=document.createRange();g.selectNodeContents(e);return g.getBoundingClientRect().width>e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)+0.5;}).map((e)=>e.id||e.className);
const navInk=ink(document.querySelector("header.chrome > nav.rooms"));const slipBox=R(document.querySelector(".slip"));return{navRight:navInk?Math.round(navInk.r):null,navFoot:navInk?Math.round(navInk.b):null,slipBox:slipBox&&{l:Math.round(slipBox.l),t:Math.round(slipBox.t)},chrome:chrome&&{b:Math.round(chrome.b),r:Math.round(chrome.r)},gapToCorner:chrome&&corner?Math.round((corner.l-chrome.r)*10)/10:null,corner:corner&&{w:Math.round(corner.r-corner.l),h:Math.round(corner.b-corner.t),b:Math.round(corner.b)},controlRows:new Set(corners.map((e)=>Math.round(e.getBoundingClientRect().top))).size,cut,chart:chart&&{w:Math.round(chart.r-chart.l),h:Math.round(chart.b-chart.t),t:Math.round(chart.t)},floored:document.body.classList.contains("stage-under"),overChrome:over,nearestBelow:below[0]||null,legendLines:new Set([...document.querySelectorAll(".legend .legend-row > a, .legend .legend-row > button, .legend-row > a, .legend-row > button")].filter((e)=>e.getBoundingClientRect().width>0).map((e)=>Math.round(e.getBoundingClientRect().top))).size,navLines:new Set([...document.querySelectorAll("nav.rooms > a, nav.rooms > span[aria-current]")].map((e)=>Math.round(e.getBoundingClientRect().top))).size,scrollW:document.documentElement.scrollWidth};})())`;

/** The Explorer at depth: the step note and the press against the window. */
export const DEPTH_PROBE = `JSON.stringify((()=>{const w=(e)=>{if(!e)return null;const b=e.getBoundingClientRect();return{t:Math.round(b.top),b:Math.round(b.bottom),whole:b.top>=0&&b.bottom<=innerHeight&&b.left>=0&&b.right<=innerWidth};};const h=document.querySelector("header.chrome");return{note:w(document.querySelector(".slip1248")),press:w(document.querySelector(".learn1248")),head:getComputedStyle(h).translate,region:!!document.querySelector("#map .region-inset .dog-ear")};})())`;

/** Two ways the top row could keep `--chrome-x` beside a ninth item at 1024, and the Gallery's first row given back the line the press takes. */
export const DOTS_TIGHT = "nav.rooms .sep{margin:0 .3em}";
export const NAV_TIGHT = "nav.rooms{letter-spacing:.1em}nav.rooms .sep{margin:0 .22em}";
export const FLOOR_LOWER = ":root{--folio-w:18.8rem}";
export const GALLERY_RESERVE = "@media screen{body:has(.trail) main{padding-top:calc(var(--band-h) + 1.2rem + var(--trail-line) + var(--trail-gap) + 1.5rem)}}";
