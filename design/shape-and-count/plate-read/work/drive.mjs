import fs from "node:fs";
import net from "node:net";
import {decode,sample,hex} from "./png.mjs";
const R="/Users/ahl/CodeProjects/Vellum";
const O=R+"/out/844-plate-read";
const {findBrowser}=await import(R+"/src/cli/raster.ts");
const {cleanup,start}=await import(R+"/e2e/harness.ts");
const src=JSON.parse(fs.readFileSync(R+"/out/844/explorer/explorer-shots.json","utf8"));
const scriptOf=(key)=>src.find(s=>s.out.endsWith(`explorer-${key}-1024.png`)).script;
const SC={a:scriptOf("a-plain"),b:scriptOf("b-shaped"),c:scriptOf("c-counted"),d:scriptOf("d-counted-continent")};
const HASH={a:"seed=30&type=island",b:"seed=30&type=island",c:"seed=1&type=archipelago",d:"seed=5&type=continent",today:"seed=5&type=continent"};
const fp=()=>new Promise(r=>{const s=net.createServer();s.listen(0,"127.0.0.1",()=>{const p=s.address().port;s.close(()=>r(p))})});
const PORT=await fp(),DPORT=await fp();
const ctx=await start({browser:findBrowser(),SITE:R+"/.claude/worktrees/design-844/dist",OUT:R+"/out",PORT,DPORT,PAGE:"about:blank",results:[],consoleErrors:[],http4xx:[],skippedGroups:[],skippedChecks:[]});
const out={};
async function open(state,w,h,{mobile=false,seed=null}={}){
  await ctx.send("Emulation.setDeviceMetricsOverride",{width:w,height:h,deviceScaleFactor:1,mobile});
  await ctx.send("Page.navigate",{url:"about:blank"});
  const hash=seed?`seed=${seed.s}&type=${seed.t}`:HASH[state];
  await ctx.send("Page.navigate",{url:`http://127.0.0.1:${PORT}/explorer/#${hash}`});
  await ctx.sleep(6000);
  if(SC[state]){await ctx.evaluate(SC[state],true);await ctx.sleep(900);}
}
const snap=async(file,clip)=>{const p=await ctx.send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false,...(clip?{clip}:{})});const b=Buffer.from(p.data,"base64");fs.writeFileSync(file,b);return b;};
const RECT=`(sel,i)=>{const e=document.querySelectorAll(sel)[i||0];if(!e)return null;e.scrollIntoView({block:"nearest"});const w=document.createTreeWalker(e,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.textContent.trim()?1:3});const t=w.nextNode();let b;if(t){const r=document.createRange();r.selectNodeContents(t);b=r.getBoundingClientRect();}else b=e.getBoundingClientRect();const cs=getComputedStyle(e);return {text:t?t.textContent.trim():"",x:b.left,y:b.top,w:b.width,h:b.height,color:cs.color,fs:cs.fontSize,op:cs.opacity};}`;
const rect=(sel,i)=>ctx.evaluate(`(${RECT})(${JSON.stringify(sel)},${i||0})`);
fs.mkdirSync(O+"/shots/contrast",{recursive:true});
// ---- 1 contrast
const TARGETS={
 a:[["label-shape","label[for=shape]"],["label-islands","label[for=isles]"],["label-sealevel","label[for=land]"],["word-sizes",".l-word"],["seal-alike",".seal",0],["end-few-islands",".land-end-min"],["end-many-islands",".land-end-max"],["readout-seeds-choice","#isles-readout"],["thumb-untouched","#isles",0,"thumb"],["today-end-landrange-0","#land ~ .land-end, .l-ctl .land-end",0],["select-shape-text","#shape"]],
 c:[["stood-note",".stood-note"],["held-land","#land-readout"],["held-coast","#coast-readout"],["end-few-stood",".stood .land-end-min"],["end-many-stood",".stood .land-end-max"],["readout-about-20","#isles-readout"],["thumb-islands-touched","#isles",0,"thumb"]],
 d:[["islands-note","#isles-note"],["stood-note",".stood-note"],["held-land","#land-readout"]],
};
out.contrast=[];
for(const w of [1024,1440]){
 for(const st of ["a","c","d"]){
  await open(st,w,900);
  // discover land-end words
  out["landEnds_"+st+"_"+w]=await ctx.evaluate(`[...document.querySelectorAll(".land-end")].map(e=>[e.textContent.trim(),e.className,getComputedStyle(e).color,getComputedStyle(e).fontSize,getComputedStyle(e).opacity,e.closest(".stood")?"stood":"panel"])`);
  for(const [name,sel,i,kind] of TARGETS[st]){
    const r=await rect(sel,i||0); if(!r){out.contrast.push({w,st,name,missing:true});continue;}
    let clip;
    if(kind==="thumb"){const b=await ctx.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});e.scrollIntoView({block:"nearest"});const b=e.getBoundingClientRect();return [b.left,b.top,b.width,b.height,e.value,e.min,e.max]})()`);
      const frac=(b[4]-b[5])/(b[6]-b[5]); const cx=b[0]+8+frac*(b[2]-16); clip={x:Math.floor(cx-12),y:Math.floor(b[1]),width:24,height:Math.ceil(b[3]),scale:3};}
    else clip={x:Math.floor(r.x)-2,y:Math.floor(r.y)-2,width:Math.ceil(r.w)+4,height:Math.ceil(r.h)+4,scale:3};
    const file=`${O}/shots/contrast/${st}-${w}-${name}.png`;
    // re-read rect after scroll (done in rect()), clip uses post-scroll coordinates
    const buf=await snap(file,clip); const s=sample(decode(buf));
    out.contrast.push({w,st,name,sel,text:r.text,color:r.color,fs:r.fs,opacity:r.op,ground:hex(s.ground),groundShare:s.groundShare,inkExtreme:hex(s.inkExtreme),ratioExtreme:s.ratioExtreme,ratioP95:s.ratioP95,nInk:s.nInk,file});
  }
 }
}
// ---- 2,3 tab overlap and scroll
const GEO=`(()=>{const slip=document.getElementById("broadside");const sb=slip.querySelector(".slip-body");const t=document.getElementById("chart-drawer-tab");const a=slip.getBoundingClientRect(),b=t.getBoundingClientRect();const ox=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left)),oy=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));const mx=(Math.max(a.left,b.left)+Math.min(a.right,b.right))/2,my=(Math.max(a.top,b.top)+Math.min(a.bottom,b.bottom))/2;const top=ox>0&&oy>0?document.elementFromPoint(mx,my):null;return {slip:[a.left,a.top,a.right,a.bottom].map(Math.round),tab:[b.left,b.top,b.right,b.bottom].map(Math.round),overlapX:+ox.toFixed(1),overlapY:+oy.toFixed(1),topAtOverlap:top?top.tagName+"#"+top.id+"."+String(top.className).slice(0,30):null,bodyScroll:[sb.scrollHeight,sb.clientHeight],bodyOverflow:getComputedStyle(sb).overflowY,slipH:a.height,innerH:innerHeight,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,panels:[...document.querySelectorAll(".broadside .panel")].map(p=>Math.round(p.getBoundingClientRect().height))}})()`;
out.geo=[];
for(const h of [900,768]){
 for(const st of ["today","a","c","d"]){
  await open(st,1024,h);
  const g=await ctx.evaluate(GEO); out.geo.push({h,st,...g});
  await snap(`${O}/shots/geo-${st}-1024x${h}.png`);
  const tb=g.tab; await snap(`${O}/shots/tabcrop-${st}-1024x${h}.png`,{x:tb[0]-120,y:Math.max(0,tb[1]-120),width:1024-(tb[0]-120),height:Math.min(h,tb[3]+30)-Math.max(0,tb[1]-120),scale:2});
 }
}
// ---- 4: 640
out.w640=[];
for(const st of ["today","a","d"]){
 await open(st,640,900);
 const g=await ctx.evaluate(GEO); const sx=await ctx.evaluate(`({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,innerWidth,maxScroll:document.documentElement.scrollWidth-innerWidth})`);
 await snap(`${O}/shots/w640-desk-${st}-scroll0.png`);
 await ctx.evaluate(`window.scrollTo(document.documentElement.scrollWidth,0)`); await ctx.sleep(500);
 const sx2=await ctx.evaluate(`({scrollX:Math.round(scrollX),slipLeft:Math.round(document.getElementById("broadside").getBoundingClientRect().left+scrollX)})`);
 await snap(`${O}/shots/w640-desk-${st}-scrollright.png`);
 out.w640.push({st,mode:"desktop-window",g,sx,sx2});
}
for(const st of ["today","d"]){
 await open(st,640,900,{mobile:true});
 const m=await ctx.evaluate(`({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,innerWidth,vv:visualViewport.scale,slip:(()=>{const b=document.getElementById("broadside").getBoundingClientRect();return [b.left,b.top,b.width,b.height].map(Math.round)})(),notice:!!document.querySelector(".desk-notice, [class*=desk-notice]")})`);
 await snap(`${O}/shots/w640-mobile-${st}.png`);
 out.w640.push({st,mode:"mobile-640x900",m});
}
// ---- 7 folio
const FOLIO=`(()=>{let best=null;for(const e of document.querySelectorAll("body *")){if(e.children.length===0||true){const t=e.textContent;if(/Chart\\s*\\u2116/.test(t)&&(!best||t.length<best.textContent.length&&best.contains(e)))best=e;}}
 const el=best;const cs=getComputedStyle(el);const r=document.createRange();const tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n,lines=[];while(n=tw.nextNode()){const rr=document.createRange();rr.selectNodeContents(n);for(const q of rr.getClientRects())lines.push([n.textContent.slice(0,40),Math.round(q.left),Math.round(q.top),Math.round(q.width),Math.round(q.height)]);}
 const b=el.getBoundingClientRect();let p=el;const chain=[];for(let i=0;i<4&&p;i++,p=p.parentElement){const c=getComputedStyle(p),pb=p.getBoundingClientRect();chain.push([p.tagName+"."+String(p.className).slice(0,30),Math.round(pb.left),Math.round(pb.top),Math.round(pb.width),Math.round(pb.height),c.maxWidth,c.whiteSpace,c.position,c.display]);}
 return {tag:el.tagName+"."+el.className,text:el.textContent.trim(),rect:[b.left,b.top,b.width,b.height].map(Math.round),font:cs.fontSize+" "+cs.fontFamily.slice(0,30),ls:cs.letterSpacing,ws:cs.whiteSpace,textWrap:cs.textWrap,fragments:lines,chain,slip:(()=>{const s=document.getElementById("broadside").getBoundingClientRect();return [s.left,s.top].map(Math.round)})()}})()`;
out.folio=[];
for(const [w,h,s,t] of [[1024,900,5,"continent"],[1024,768,5,"continent"],[1280,800,5,"continent"],[1440,900,5,"continent"],[1024,900,30,"island"],[1024,900,1,"archipelago"],[1024,900,2,"continent"],[1024,900,42,"continent"]]){
 await open(null,w,h,{seed:{s,t}}); await ctx.sleep(500);
 const f=await ctx.evaluate(FOLIO); out.folio.push({w,h,s,t,...f});
 if(s===5&&w===1024&&h===900){await snap(`${O}/shots/folio-live-seed5-1024.png`);const b=f.rect;await snap(`${O}/shots/folio-live-seed5-1024-crop2x.png`,{x:Math.max(0,b[0]-20),y:Math.max(0,b[1]-30),width:520,height:b[3]+120,scale:2});}
}
out.consoleErrors=ctx.consoleErrors; out.http4xx=ctx.http4xx;
fs.writeFileSync(O+"/measurements.json",JSON.stringify(out,null,1));
cleanup(); process.exit(0);
