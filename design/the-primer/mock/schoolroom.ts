// Issue #1155 round, direction B: a working room on the Explorer's own engine where the slip is the lesson. Drawn over the real Explorer: the Broadside's head is renamed and every row the reader has not reached is withheld, so the one row left showing is the real one, wired, in its own panel, and the chart it redraws is the engine's. The row is not moved: `seatLand` in `src/site/explorer/land-seat.ts` lays every row back into its panel on every draw and throws on a row it cannot find there, which a first draft of this mock found (measure/notes on B). The Glass, the Press and the Drawer are withheld until their own lessons.
import { navJs, relayJs, styleJs } from "./inject.ts";
import { actHtml } from "./primer.ts";
import { EXPLORER } from "./ladder/explorer.ts";

const j = JSON.stringify;
const land = EXPLORER.lessons.find((l) => l.id === "land")!;
const step = land.steps[0]!;
const next = land.steps[1]!;

const CSS = `
.lesson1155{padding:.2rem 0 .4rem;color:var(--ink-dark)}
.lesson1155 .l-prog{display:flex;align-items:center;gap:.5rem;font-family:var(--font-display);font-size:.72rem;letter-spacing:.1em;color:var(--ink-brown);margin:0 0 .5rem}
.lesson1155 .l-dots{display:flex;gap:.22rem}
.lesson1155 .l-dots i{width:.55rem;height:.55rem;border-radius:50%;border:1px solid var(--ink-brown);display:block}
.lesson1155 .l-dots i.on{background:var(--iron-red);border-color:var(--iron-red)}
.lesson1155 .l-dots i.now{background:var(--control-gold);border-color:var(--ink-dark)}
.lesson1155 .l-dots b{width:.6rem}
.lesson1155 h3{font-family:var(--font-display);font-weight:400;font-size:1.05rem;letter-spacing:.09em;margin:.2rem 0 .1rem;border-bottom:1px solid var(--ink-dark);padding-bottom:.2rem}
.lesson1155 h3 i{font-family:var(--font-flourish);letter-spacing:0;color:var(--ink-brown);font-size:.9rem}
.lesson1155 .l-act{font-size:1.18rem;font-weight:600;line-height:1.38;margin:.7rem 0 .3rem}
.lesson1155 .l-see{font-family:var(--font-flourish);font-style:italic;color:var(--ink-brown);margin:0 0 .7rem;line-height:1.35}
.lesson1155 .l-host{border:1px dashed var(--line-tan);border-radius:4px;padding:.5rem .6rem;background:rgb(from var(--parchment-bright) r g b / .7)}
.lesson1155 .l-host .ledger{display:block}
.lesson1155 .l-come{font-family:var(--font-flourish);font-style:italic;font-size:.88rem;color:var(--ink-brown);margin:.5rem 0 .2rem}
.lesson1155 .l-presses{display:flex;justify-content:space-between;align-items:center;margin-top:.8rem}
.lesson1155 .l-presses button,.lesson1155 .l-presses a{font-family:var(--font-display);font-size:.76rem;letter-spacing:.08em;color:var(--ink-dark);background:var(--control-cream);border:1px solid var(--ink-faded);border-radius:3px;padding:.22rem .65rem;text-decoration:none}
.lesson1155 .l-presses .go{background:var(--control-gold);border-color:var(--ink-dark)}
.lesson1155 .l-presses .dim{color:var(--ink-dark);background:var(--parchment-deep)}
.lesson1155 .l-done{display:inline-flex;align-items:center;gap:.4rem;font-family:var(--font-display);font-size:.8rem;letter-spacing:.08em;color:var(--iron-red)}
.lesson1155 .l-done b{display:grid;place-items:center;width:1.5rem;height:1.5rem;border-radius:50%;background:radial-gradient(circle at 35% 30%,#a2392a,var(--iron-red) 70%);color:var(--parchment-bright);font-weight:400}
.lesson1155 .ch{font-weight:400;white-space:nowrap;font-size:.95em;padding:0 .32em .04em;border-radius:3px;border:1px solid var(--ink-faded);background:var(--control-cream)}
.lesson1155 .ch.opt::after{content:" \\25BE";font-size:.75em;color:var(--ink-brown)}
.lesson1155 .ch.word{border:none;background:none;padding:0;font-variant-caps:small-caps;border-bottom:1px dotted var(--ink-brown);border-radius:0}
.withheld1155{visibility:hidden!important}
#broadside.teach1155 .broadside > .panel:not(:first-child),#broadside.teach1155 .imprint,#broadside.teach1155 .held{display:none!important}
#broadside.teach1155 .l-row:not([data-row=type]){display:none!important}
#broadside.teach1155.more1155 .l-row[data-row=islands]:not([hidden]){display:contents!important}
#broadside.teach1155 .broadside > .panel:first-child{border:1px dashed var(--line-tan);border-radius:4px;padding:.4rem .6rem;background:rgb(from var(--parchment-bright) r g b / .7)}
`;

const dots = (done: number, now: boolean): string =>
  `<span class="l-dots">${[3, 6, 4, 6, 7, 4, 3, 4].map((n, li) => Array.from({ length: n }, (_, i) => `<i class="${li === 0 || (li === 1 && i < done) ? "on" : li === 1 && i === done && now ? "now" : ""}"></i>`).join("") + (li < 7 ? "<b></b>" : "")).join("")}</span>`;

export const schoolroomJs = (): string => `
${styleJs("school1155", CSS)}
{const f=document.querySelector(".corner.tr");f.querySelector(".room-name").textContent="The Schoolroom";f.querySelector(".room-tagline").textContent="every control, learned on a live chart";}
{const s=document.getElementById("broadside");s.querySelector(".card-verb").textContent="Learn one";s.querySelector(".card-title").textContent="The Schoolroom";s.querySelector(".card-where").textContent="one control at a time, on a live chart";
const mark=s.querySelector(".slip-head a.fn");if(mark)mark.remove();
const bs=s.querySelector(".broadside");const l=document.createElement("div");l.className="lesson1155";
l.innerHTML=${j(`<p class="l-prog">${dots(0, true)}</p><h3><i>ii</i> The Land <i>step 1 of 6</i></h3><p class="l-act">${actHtml(step)}</p><p class="l-see">${step.see}</p><p class="l-come" id="come1155">The rows you have not learned yet wait in the Broadside; each comes to hand with its step.</p><div class="l-presses"><a href="/explorer/">Leave for the Explorer</a><span id="go1155"><button class="dim" type="button">Skip</button> <button class="dim" type="button">Next step</button></span></div>`)};
bs.parentNode.insertBefore(l,bs);s.classList.add("teach1155");const come=l.querySelector("#come1155");const lrow=l.querySelector(".l-presses");bs.after(come);come.after(lrow);}
for(const sel of [".legend",".corner.br","#chart-drawer-tab"]){const e=document.querySelector(sel);if(e)e.classList.add("withheld1155");}
${navJs("ninth", "Schoolroom", true)}
{const trail=document.querySelector("nav.trail");if(trail)trail.innerHTML='<a href="/">Vellum</a><span class="way" aria-hidden="true">›</span><wbr><span class="here">The Schoolroom</span>';}
${relayJs}
`;

export const schoolroomDoneJs = (): string => `
{const t=document.getElementById("type");t.value="archipelago";t.dispatchEvent(new Event("change",{bubbles:true}));for(let k=0;k<8;k++)await tick();await until("redrawn",()=>{const s=document.querySelector("#map > svg[data-vellum-style]");return !!s&&s.getAttribute("data-vellum-map-type")==="archipelago"&&document.getElementById("status").textContent==="";});
const l=document.querySelector(".lesson1155");l.querySelector(".l-prog").innerHTML=${j(dots(1, false))};
document.getElementById("go1155").innerHTML=${j(`<span class="l-done"><b>4</b>done</span> <button class="go" type="button">Next, ${next.words[0]!.says} ›</button>`)};
document.getElementById("broadside").classList.add("more1155");
document.getElementById("come1155").textContent="A new row has come to hand with it: islands, for the next step.";}
${relayJs}
`;
