// Issue #1248 round, item 4: the probe that reads a step's slip against the Explorer as it stands. Beside the share of the chart's box, it counts what the islands step asks the reader to watch: the chart's land, sampled every few px across the part of the chart a reader can see (in the window, and under no corner, the Broadside or the head cluster), each sample tested against the fill of the land layer's own paths (`isPointInFill` in each path's own coordinates), and the place marks.
export const HAND_PROBE = `JSON.stringify((()=>{const R=(e)=>{if(!e)return null;const b=e.getBoundingClientRect();return b.width>0?{l:b.left,t:b.top,r:b.right,b:b.bottom}:null;};
const ov=(a,b)=>!a||!b?0:Math.max(0,Math.min(a.r,b.r)-Math.max(a.l,b.l))*Math.max(0,Math.min(a.b,b.b)-Math.max(a.t,b.t));const area=(a)=>a?(a.r-a.l)*(a.b-a.t):0;
const inside=(x,y,b)=>!!b&&x>=b.l&&x<=b.r&&y>=b.t&&y<=b.b;
const svg=document.querySelector("#map > svg[data-vellum-style]");const sheet=R(svg);const slip=R(document.querySelector(".slip1248"))||R(document.querySelector(".strip1155"));
const cover=[R(document.getElementById("broadside")),R(document.querySelector("header.chrome")),R(document.querySelector(".corner.tr")),R(document.querySelector(".corner.bl")),R(document.querySelector(".corner.br")),R(document.querySelector(".legend"))].filter(Boolean);
const land=[...svg.querySelectorAll("#layer-land path")].map((p)=>({p,m:p.getScreenCTM().inverse(),b:R(p)})).filter((x)=>x.b);
const pt=svg.createSVGPoint();const STEP=6;let seen=0,under=0;
const vis={l:Math.max(0,sheet.l),t:Math.max(0,sheet.t),r:Math.min(innerWidth,sheet.r),b:Math.min(innerHeight,sheet.b)};
for(let y=vis.t+STEP/2;y<vis.b;y+=STEP)for(let x=vis.l+STEP/2;x<vis.r;x+=STEP){if(cover.some((c)=>inside(x,y,c)))continue;
let isLand=false;for(const L of land){if(!inside(x,y,L.b))continue;const q=new DOMPoint(x,y).matrixTransform(L.m);pt.x=q.x;pt.y=q.y;if(L.p.isPointInFill(pt)){isLand=true;break;}}
if(!isLand)continue;seen++;if(slip&&inside(x,y,slip))under++;}
const marks=[...svg.querySelectorAll("g.settlement")].map(R).filter(Boolean).map((b)=>({x:(b.l+b.r)/2,y:(b.t+b.b)/2})).filter((c)=>inside(c.x,c.y,vis)&&!cover.some((k)=>inside(c.x,c.y,k)));
const marksUnder=slip?marks.filter((c)=>inside(c.x,c.y,slip)).length:0;
const ring=R(document.querySelector(".ring1155"));const bs=document.querySelector("#broadside .slip-body")||document.querySelector("#broadside");
const r1=(v)=>Math.round(v*10)/10;
return{chartBox:sheet&&{w:Math.round(sheet.r-sheet.l),h:Math.round(sheet.b-sheet.t)},visibleChart:Math.round(area(vis)),slip:slip&&{l:Math.round(slip.l),t:Math.round(slip.t),r:Math.round(slip.r),b:Math.round(slip.b)},overChartBox:sheet&&slip?r1(100*ov(slip,sheet)/area(sheet)):0,overVisibleChart:slip?r1(100*ov(slip,vis)/area(vis)):0,landSeen:seen,landUnder:under,landUnderShare:seen?r1(100*under/seen):0,marks:marks.length,marksUnder,
overRing:ov(slip,ring),overBroadside:ov(slip,R(document.getElementById("broadside"))),overGlass:ov(slip,R(document.querySelector(".corner.br"))),overLegend:ov(slip,R(document.querySelector(".legend"))),overFolio:ov(slip,R(document.querySelector(".corner.bl"))),inWindow:!!slip&&slip.l>=0&&slip.t>=0&&slip.r<=innerWidth&&slip.b<=innerHeight,
broadsideScrolls:bs?bs.scrollHeight>bs.clientHeight+1:null,islands:(document.getElementById("islands")||{}).value??null};})())`;
