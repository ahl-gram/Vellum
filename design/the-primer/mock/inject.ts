// Issue #1155 round: what each direction lays over the real built page, as page-side JavaScript for a shot's script. Every rule is scoped to an element this round adds, so nothing of the page's own is restyled except where a direction says it hides or moves something.
import { closing, indexHtml, NAME, PRIMER_CSS, roomCount, sheetHtml, stepCount, TAGLINE, type PageOpts } from "./primer.ts";
import { actHtml } from "./primer.ts";
import type { Step } from "./ladder/shape.ts";

const j = JSON.stringify;

export type NavSeat = "none" | "ninth" | "child";

/** The head cluster as a direction would seat the guide: a ninth item on the top line, or a child under Questions & Answers named by the trail. */
export const navJs = (seat: NavSeat, label: string, here: boolean, trailName?: string): string => {
  if (seat === "none") return "";
  const ninth = `{const nav=document.querySelector("nav.rooms");const cur=nav.querySelector("[aria-current]");
${here ? `if(cur){const a=document.createElement("a");a.href=cur.textContent==="Q & A"?"/faq/":"#";a.textContent=cur.textContent;cur.replaceWith(a);}` : ""}
const items=[...nav.children];const before=items.find((e)=>e.textContent==="Q & A");
const sep=document.createElement("span");sep.className="sep";sep.setAttribute("aria-hidden","true");sep.textContent="·";
const it=${here ? `document.createElement("span")` : `document.createElement("a")`};${here ? `it.setAttribute("aria-current","page");` : `it.href="/primer/";`}it.textContent=${j(label)};
nav.insertBefore(it,before);nav.insertBefore(sep,before);}`;
  const child = `{const nav=document.querySelector("nav.rooms");const cur=nav.querySelector("[aria-current]");if(cur){const a=document.createElement("a");a.href="/faq/";a.textContent=cur.textContent;cur.replaceWith(a);}
const trail=document.querySelector("nav.trail");if(trail){trail.innerHTML='<a href="/">Vellum</a><span class="way" aria-hidden="true">›</span><wbr><a href="/faq/">Questions &amp; Answers</a><span class="way" aria-hidden="true">›</span><wbr><span aria-current="page">'+${j(label)}+'</span>';}}`;
  const trailNinth = here ? `{const trail=document.querySelector("nav.trail");if(trail){trail.innerHTML='<a href="/">Vellum</a><span class="way" aria-hidden="true">›</span><wbr><span class="here">'+${j(trailName ?? label)}+'</span>';}}` : "";
  return seat === "ninth" ? ninth + trailNinth : child;
};

export const relayJs = `window.dispatchEvent(new Event("resize"));for(let k=0;k<6;k++)await tick();window.dispatchEvent(new Event("resize"));for(let k=0;k<4;k++)await tick();`;

export const styleJs = (id: string, css: string): string =>
  `{let st=document.getElementById(${j(id)});if(!st){st=document.createElement("style");st.id=${j(id)};document.head.appendChild(st);}st.textContent=${j(css)};}`;

export interface PrimerPage extends PageOpts {
  readonly seat: NavSeat;
  readonly label?: string;
  readonly scrollTo?: string;
  readonly extraCss?: string;
  readonly top?: string;
}

/** Direction A (and D, and E's page): the guide laid over the built FAQ, its own document-room shell. */
export const primerJs = (o: PrimerPage): string => `
document.title=${j(`${NAME} · Vellum`)};
${styleJs("primer1155", PRIMER_CSS + (o.extraCss ?? ""))}
{const f=document.querySelector(".corner.tr");f.querySelector(".room-name").textContent=${j(NAME)};f.querySelector(".room-tagline").textContent=${j(TAGLINE)};const d=f.querySelector(".dateline");if(d)d.textContent=${j(`${stepCount()} steps in ${roomCount()} rooms`)};f.setAttribute("aria-label",${j(NAME)});}
{const ix=document.querySelector("#index ol.index");ix.innerHTML=${j(indexHtml())};const w=document.querySelector("#index .card-where");if(w)w.textContent="the room you are reading is inked";
const first=ix.querySelector("li[data-sec]");if(first)first.classList.add("ink");}
{const s=document.querySelector("main .sheet");s.innerHTML=${j((o.top ?? "") + sheetHtml(o))};}
${navJs(o.seat, o.label ?? "Primer", true, NAME)}
${relayJs}
for(let k=0;k<6;k++)await tick();
${o.scrollTo ? `{const e=document.getElementById(${j(o.scrollTo)});const band=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--band-h"))*parseFloat(getComputedStyle(document.documentElement).fontSize);window.scrollTo(0,e.getBoundingClientRect().top+scrollY-band-18);for(let k=0;k<6;k++)await tick();}` : ""}
`;

export const closingOnly = closing;

/** The ring a step lays on the control it names, and the manicule pointing at it, for C and D. */
export const RING_CSS = `
.ring1155{position:fixed;pointer-events:none;z-index:60;border-radius:6px;box-shadow:0 0 0 3px var(--control-gold),0 0 0 5px var(--ink-dark),0 0 0 11px rgb(from var(--control-gold) r g b / .35)}
.hand1155{position:fixed;z-index:61;pointer-events:none;font-family:var(--font-serif-fallback);font-size:2.1rem;line-height:1;color:var(--parchment-bright);text-shadow:0 1px 0 var(--chart-ink),0 0 6px rgb(from var(--chart-ink) r g b / .8)}
.strip1155{position:fixed;z-index:62;box-sizing:border-box;width:22rem;background:var(--parchment-panel);border:1px solid var(--ink-dark);outline:3px double var(--line-tan);outline-offset:3px;border-radius:4px;padding:.7rem .95rem .75rem;color:var(--ink-dark);box-shadow:var(--sheet-shadow);font-family:var(--font-body)}
.strip1155 .s-verb{margin:0;font-family:var(--font-flourish);font-style:italic;font-size:.88rem;color:var(--ink-brown)}
.strip1155 .s-head{margin:.05rem 0 .35rem;font-family:var(--font-display);font-size:.95rem;letter-spacing:.08em}
.strip1155 .s-act{margin:0;font-weight:600;font-size:1.04rem;line-height:1.4}
.strip1155 .s-see{margin:.25rem 0 .55rem;font-family:var(--font-flourish);font-style:italic;color:var(--ink-brown);font-size:.94rem;line-height:1.35}
.strip1155 .s-row{display:flex;gap:.5rem;align-items:center;justify-content:space-between;flex-wrap:wrap}
.strip1155 .s-row a,.strip1155 .s-row button{font-family:var(--font-display);font-size:.74rem;letter-spacing:.08em;color:var(--ink-dark);background:var(--control-cream);border:1px solid var(--ink-faded);border-radius:3px;padding:.18rem .55rem;text-decoration:none;cursor:pointer}
.strip1155 .s-row .go{background:var(--control-gold);border-color:var(--ink-dark)}
.strip1155 .s-row .dim{color:var(--ink-dark);background:var(--parchment-deep)}
.strip1155 .s-dots{display:flex;gap:.28rem;margin:0 0 .45rem}
.strip1155 .s-dots i{width:.62rem;height:.62rem;border-radius:50%;border:1px solid var(--ink-brown);display:block}
.strip1155 .s-dots i.on{background:var(--iron-red);border-color:var(--iron-red)}
.strip1155 .s-dots i.now{background:var(--control-gold);border-color:var(--ink-dark);box-shadow:0 0 0 2px rgb(from var(--control-gold) r g b / .6)}
.strip1155.done{border-color:var(--iron-red)}
.strip1155 .s-done{display:inline-flex;align-items:center;gap:.4rem;font-family:var(--font-display);letter-spacing:.08em;font-size:.82rem;color:var(--iron-red)}
.strip1155 .s-done b{display:grid;place-items:center;width:1.5rem;height:1.5rem;border-radius:50%;background:radial-gradient(circle at 35% 30%,#a2392a,var(--iron-red) 70%);color:var(--parchment-bright);font-weight:400;font-size:.8rem}
.strip1155 .ch{font-weight:400;white-space:nowrap;font-size:.95em;padding:0 .32em .04em;border-radius:3px;border:1px solid var(--ink-faded);background:var(--control-cream)}
.strip1155 .ch.opt::after{content:" \\25BE";font-size:.75em;color:var(--ink-brown)}
.strip1155 .ch.word{border:none;background:none;padding:0;font-variant-caps:small-caps;border-bottom:1px dotted var(--ink-brown);border-radius:0}
.strip1155 .ch.road{background:var(--control-gold);border-color:var(--ink-dark)}
.strip1155 .ch.road i{font-family:var(--font-flourish)}
.strip1155 .ch.road b{font-family:var(--font-display);font-weight:400;font-size:.86em;letter-spacing:.07em}
.learn1155{font-family:var(--font-display);font-size:.62rem;letter-spacing:.14em;color:var(--parchment);text-decoration:none}
.learn1155::before{content:"\\261E  ";font-family:var(--font-serif-fallback);font-size:.95rem;letter-spacing:0}
`;

export interface StripOpts {
  readonly verb: string;
  readonly head: string;
  readonly step: Step;
  readonly dots: { readonly total: number; readonly done: number };
  readonly left: readonly string[];
  readonly right: readonly string[];
  readonly done?: { readonly next: string };
  /** Where the strip stands: beside the ringed control on its left, or at a fixed seat. */
  readonly seat: { readonly css?: string; readonly side?: "left" | "below"; readonly x?: number; readonly y?: number };
}

const stripHtml = (o: StripOpts): string => {
  const dots = Array.from({ length: o.dots.total }, (_, i) => `<i class="${i < o.dots.done ? "on" : i === o.dots.done && !o.done ? "now" : i === o.dots.done ? "on" : ""}"></i>`).join("");
  const right = o.done ? [`<span class="s-done"><b>${o.dots.done + 1}</b>done</span>`, `<a class="go" href="#">${o.done.next}</a>`] : o.right;
  return `<p class="s-verb">${o.verb}</p><p class="s-head">${o.head}</p><div class="s-dots">${dots}</div><p class="s-act">${actHtml(o.step)}</p><p class="s-see">${o.step.see}</p><div class="s-row"><span>${o.left.join(" ")}</span><span>${right.join(" ")}</span></div>`;
};

/** C and D: ring the control the step names where it stands in the live room, point the manicule at it, and seat the strip. */
export const ringJs = (ringCss: string | null, strip: StripOpts | null, extra = ""): string => `
${styleJs("ring1155css", RING_CSS)}
${extra}
${relayJs}
{const old=document.querySelectorAll(".ring1155,.hand1155,.strip1155");old.forEach((e)=>e.remove());
${ringCss ? `const t=document.querySelector(${j(ringCss)});if(!t)throw new Error("no ${ringCss.replace(/"/g, "'")} to ring");const own=t.getBoundingClientRect();const kids=[...t.children].map((c)=>c.getBoundingClientRect()).filter((r)=>r.width>0);const b=own.width>0||kids.length===0?own:{left:Math.min(...kids.map((r)=>r.left)),top:Math.min(...kids.map((r)=>r.top)),right:Math.max(...kids.map((r)=>r.right)),bottom:Math.max(...kids.map((r)=>r.bottom)),get width(){return this.right-this.left;},get height(){return this.bottom-this.top;}};const pad=6;window.__ring1155=b;
const ring=document.createElement("div");ring.className="ring1155";Object.assign(ring.style,{left:(b.left-pad)+"px",top:(b.top-pad)+"px",width:(b.width+2*pad)+"px",height:(b.height+2*pad)+"px"});document.body.appendChild(ring);
const hand=document.createElement("div");hand.className="hand1155";hand.textContent="☞";hand.setAttribute("aria-hidden","true");Object.assign(hand.style,{left:(b.left-pad-44)+"px",top:(b.top+b.height/2-20)+"px"});document.body.appendChild(hand);` : ""}
${strip ? `const s=document.createElement("aside");s.className="strip1155${strip.done ? " done" : ""}";s.setAttribute("aria-label","the step in hand");s.innerHTML=${j(stripHtml(strip))};document.body.appendChild(s);
${strip.seat.css ? `const a=document.querySelector(${j(strip.seat.css)}).getBoundingClientRect();const w=s.getBoundingClientRect();
${strip.seat.side === "below" ? `s.style.left=Math.max(12,Math.min(innerWidth-w.width-12,a.left))+"px";s.style.top=(a.bottom+18)+"px";` : `const v=window.__ring1155||a;s.style.left=Math.max(12,a.left-w.width-26)+"px";s.style.top=Math.max(12,Math.min(innerHeight-w.height-12,v.top+v.height/2-w.height/2))+"px";`}` : `s.style.left=${j(`${strip.seat.x ?? 24}px`)};s.style.top=${j(`${strip.seat.y ?? 160}px`)};`}` : ""}}
for(let k=0;k<4;k++)await tick();
`;

/** C's way in: a press on the trail's line, beside the chart of the atelier's, in every room. */
export const learnPressJs = (words: string): string =>
  `${styleJs("ring1155css", RING_CSS)}{const where=document.querySelector(".where");if(where&&!where.querySelector(".learn1155")){const a=document.createElement("a");a.className="learn1155";a.href="#";a.textContent=${j(words)};where.appendChild(a);}}`;
