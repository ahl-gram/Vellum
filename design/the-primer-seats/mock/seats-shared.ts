// Issue #1248 round: the pieces two items share, kept apart from the scripts that shoot so importing one never runs another: item 1's narrower legend presses, and item 2's trail press in each of its seats.
const j = JSON.stringify;

export const NARROW_CSS = "#lf-legend{padding-left:.8rem;padding-right:.8rem}#lf-legend .lf-legend-row{gap:.45rem}#lf-legend .lf-legend-btn{padding-left:.55rem;padding-right:.55rem}";

export const PRESS_CSS = `
.learn1248{font-family:var(--font-display);font-size:.62rem;letter-spacing:.14em;color:var(--parchment);text-decoration:none;white-space:nowrap}
.learn1248:hover,.learn1248:focus-visible{color:var(--parchment-bright)}
.learn1248::before{content:"\\261E  " / "";font-family:var(--font-serif-fallback, Georgia, serif);letter-spacing:0;opacity:.8}
.where > .learn1248{display:block;width:fit-content}
.where > .own-line1248{flex-basis:100%;margin:.55rem 0 0;display:flex}
.learn1248.glyph{font-size:.92rem;line-height:1;padding:0 .1rem}
.learn1248.glyph::before{content:"\\261E" / "";opacity:1}
.folio-learn1248{margin:.45rem 0 0;text-align:right}
.atelier .learn1248{display:inline-block;margin:.35rem 0 0}
.where > .learn1248.trim::before{line-height:0}
`;
export type Seat = "control" | "a-twin" | "a2-twin-trimmed" | "b-own-line" | "c-room-folio" | "d-glyph-after-trail" | "e-in-the-chart-panel";
export const pressJs = (seat: Seat, words: string): string => {
  const make = (cls: string, text: string): string => `const a=document.createElement("a");a.className=${j(cls)};a.href="/primer/";a.textContent=${j(text)};`;
  switch (seat) {
    case "control":
      return "";
    case "a-twin":
      return `{const fold=document.querySelector(".where > .atelier-fold");${make("learn1248", words)}fold.after(a);}`;
    case "a2-twin-trimmed":
      return `{const fold=document.querySelector(".where > .atelier-fold");${make("learn1248 trim", words)}fold.after(a);}`;
    case "b-own-line":
      return `{const w=document.querySelector(".where");${make("learn1248", words)}const d=document.createElement("div");d.className="own-line1248";d.appendChild(a);w.appendChild(d);}`;
    case "c-room-folio":
      return `{const c=document.querySelector(".corner.tr");${make("learn1248", words)}const p=document.createElement("p");p.className="folio-learn1248";p.appendChild(a);c.appendChild(p);}`;
    case "d-glyph-after-trail":
      return `{const t=document.querySelector(".where > nav.trail");${make("learn1248 glyph", "")}a.setAttribute("aria-label",${j(words)});a.title=${j(words)};t.after(a);}`;
    case "e-in-the-chart-panel":
      return `{const k=document.querySelector(".atelier .atelier-key");${make("learn1248", words)}k.after(a);const f=document.querySelector(".atelier-fold");f.open=true;}`;
  }
};


export const SPACING = `JSON.stringify((()=>{const b=(e)=>{const r=e.getBoundingClientRect();return{l:r.left,t:r.top,r:r.right,b:r.bottom,cx:(r.left+r.right)/2,cy:(r.top+r.bottom)/2,w:r.width,h:r.height};};
const press=document.querySelector(".learn1248");const atl=document.querySelector("summary.atelier-press");
const all=[...document.querySelectorAll("header.chrome a, header.chrome summary, header.chrome button, .corner.tr a, .corner.tr button, .corner.tr input, .corner.tr select")].filter((e)=>e.getClientRects().length>0&&e.getBoundingClientRect().width>0);
const boxDist=(x,y,q)=>Math.hypot(Math.max(0,q.l-x,x-q.r),Math.max(0,q.t-y,y-q.b));
const edge=(p,q)=>Math.hypot(Math.max(0,q.l-p.r,p.l-q.r),Math.max(0,q.t-p.b,p.t-q.b));
const small=(p)=>p.w<24||p.h<24;
const m=(e)=>{if(!e)return null;const p=b(e);const o=all.filter((x)=>x!==e&&!x.contains(e)&&!e.contains(x)&&!(x.closest(".atelier")&&!e.closest(".atelier"))).map((x)=>({x,q:b(x)}));
if(!o.length)return{edge:null};const name=(x)=>(x.textContent||x.getAttribute("aria-label")||"").replace(/\\s+/g," ").trim().slice(0,28);
const byEdge=o.map(({x,q})=>({n:name(x),d:edge(p,q)})).sort((u,v)=>u.d-v.d)[0];
const byCentre=o.map(({x,q})=>({n:name(x),d:Math.hypot(p.cx-q.cx,p.cy-q.cy)})).sort((u,v)=>u.d-v.d)[0];
const full=o.map(({x,q})=>{const terms=[];if(small(p))terms.push(boxDist(p.cx,p.cy,q)-12);if(small(q))terms.push(boxDist(q.cx,q.cy,p)-12);if(small(p)&&small(q))terms.push(Math.hypot(p.cx-q.cx,p.cy-q.cy)-24);return{n:name(x),m:terms.length?Math.min(...terms):99};}).sort((u,v)=>u.m-v.m)[0];
const r1=(v)=>Math.round(v*10)/10;return{edge:r1(byEdge.d),edgeTo:byEdge.n,centre:r1(byCentre.d),centreTo:byCentre.n,fullMargin:r1(full.m),fullTo:full.n,h:r1(p.h),w:r1(p.w)};};
const corner=document.querySelector(".corner.tr").getBoundingClientRect();const pr=press?press.getBoundingClientRect():null;const chrome=document.querySelector("header.chrome").getBoundingClientRect();
return{press:m(press),atelier:m(atl),toCorner:pr&&!(corner.bottom<=pr.top||pr.bottom<=corner.top)&&pr.right<=corner.left?Math.round(corner.left-pr.right):null,overCorner:pr&&!(corner.bottom<=pr.top||pr.bottom<=corner.top||pr.right<=corner.left||corner.right<=pr.left),chromeBottom:Math.round(chrome.bottom),cornerBottom:Math.round(corner.bottom),navLines:new Set([...document.querySelectorAll("nav.rooms > a, nav.rooms > span[aria-current]")].map((e)=>Math.round(e.getBoundingClientRect().top))).size};})())`;

export const ROOMS = ["/explorer/#seed=42", "/writing-room/", "/reading-room/#seed=42", "/print-room/#seed=42", "/prospect/#seed=42&i=0", "/ribbon/#seed=42&a=0", "/explorer/portfolio/", "/seed-of-the-day/", "/gallery/"] as const;
