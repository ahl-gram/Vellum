// Issue #1155 round: the page-side JavaScript each shot runs on the real built rooms, as strings for the shot list's `script` and `probe`. No clock and no randomness: every wait is a bounded count of 100 ms ticks, so a still is reproducible from its address.

export const UNTIL = `const tick=()=>new Promise((r)=>setTimeout(r,100));
const until=async(what,f,n=300)=>{for(let i=0;i<n;i++){try{if(f())return;}catch(e){}await tick();}throw new Error("never: "+what);};
const quiet=(id)=>{const s=document.getElementById(id);return !s||s.textContent.trim()==="";};
const settledOf={
 "/explorer/":()=>!!document.querySelector("#map > svg[data-vellum-style]")&&quiet("status"),
 "/reading-room/":()=>{const a=document.querySelector(".rf-ages"),s=document.querySelector(".rf-status");return !!document.querySelector(".rf-chart svg")&&!!a&&!a.hidden&&(!s||s.textContent.trim()==="");},
 "/print-room/":()=>!!document.querySelector("#pr-preview svg")&&quiet("pr-status"),
 "/writing-room/":()=>!!document.querySelector("#wr-chart svg")&&quiet("status"),
 "/prospect/":()=>{const p=document.getElementById("pp-plate");return !!p&&!p.hidden&&p.complete&&quiet("pp-status");},
 "/ribbon/":()=>{const p=document.getElementById("rb-plate");return !!p&&!p.hidden&&p.complete&&quiet("rb-status");},
 "/explorer/portfolio/":()=>quiet("pf-status")&&(!!document.querySelector("#pf-sheet svg, #pf-sheet img, .how-plate")),
 "/seed-of-the-day/":()=>!!document.querySelector("#sheet svg")&&quiet("status"),
};
const settled=()=>(settledOf[location.pathname]??(()=>true))()&&document.fonts.status==="loaded";`;

/** One action the reader takes before the step's control is there to find, or the shot is taken. */
export type Act =
  | { readonly kind: "settle" }
  | { readonly kind: "ticks"; readonly n: number }
  | { readonly kind: "click"; readonly css: string }
  | { readonly kind: "wait"; readonly css: string }
  | { readonly kind: "set"; readonly css: string; readonly value: string; readonly release?: boolean }
  | { readonly kind: "pick"; readonly text: string; readonly name: string }
  | { readonly kind: "nearer"; readonly until: "region" | "presses"; readonly presses?: number }
  | { readonly kind: "place"; readonly name: string }
  | { readonly kind: "eval"; readonly js: string };

export const actJs = (a: Act): string => {
  switch (a.kind) {
    case "settle":
      return `await until("settled",settled);`;
    case "ticks":
      return `for(let j=0;j<${a.n};j++)await tick();`;
    case "click":
      return `{const e=document.querySelector(${JSON.stringify(a.css)});if(!e)throw new Error("no ${a.css.replace(/"/g, "'")}");e.click();for(let j=0;j<6;j++)await tick();await until("settled",settled);}`;
    case "wait":
      return `await until("the ${a.css.replace(/"/g, "'")} to come",()=>!!document.querySelector(${JSON.stringify(a.css)}),200);for(let j=0;j<4;j++)await tick();`;
    case "set":
      return `{const e=document.querySelector(${JSON.stringify(a.css)});e.value=${JSON.stringify(a.value)};e.dispatchEvent(new Event("input",{bubbles:true}));${a.release === false ? "" : `e.dispatchEvent(new Event("change",{bubbles:true}));`}for(let j=0;j<6;j++)await tick();await until("settled",settled);}`;
    case "pick":
      return `{const b=document.getElementById("place");b.focus();b.value=${JSON.stringify(a.text)};b.dispatchEvent(new Event("input",{bubbles:true}));
await until("the list offers ${a.name}",()=>{const n=document.querySelector("#place-options > li .pl-name");return !!n&&n.textContent===${JSON.stringify(a.name)};});
b.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true}));for(let j=0;j<6;j++)await tick();await until("settled",settled);b.blur();}`;
    case "nearer":
      return a.until === "region"
        ? `for(let i=0;i<14&&!document.querySelector("#map .region-inset .dog-ear");i++){document.getElementById("zoom-in").click();for(let j=0;j<10;j++)await tick();await until("settled",settled);}
await until("a region surveyed anew",()=>!!document.querySelector("#map .region-inset .dog-ear"),200);`
        : `for(let i=0;i<${a.presses ?? 1};i++){document.getElementById("zoom-in").click();for(let j=0;j<10;j++)await tick();}await until("settled",settled);`;
    case "place":
      return `{const mark=[...document.querySelectorAll("#map g.settlement")].find((g)=>(g.getAttribute("data-name")||g.textContent||"").trim()===${JSON.stringify(a.name)});
if(!mark)throw new Error("no mark for ${a.name}");const b=mark.getBoundingClientRect();
const at={clientX:b.left+b.width/2,clientY:b.top+b.height/2,bubbles:true};mark.dispatchEvent(new MouseEvent("click",at));
await until("the card for ${a.name}",()=>{const c=document.querySelector(".place-card, .pc");return !!c&&c.offsetParent!==null;},60);}`;
    case "eval":
      return a.js;
  }
};

export const script = (acts: readonly Act[], tail = ""): string =>
  `(async()=>{${UNTIL}
await until("settled",settled);
${acts.map(actJs).join("\n")}
${tail}
return true;})()`;
