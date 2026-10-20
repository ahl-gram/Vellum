import fs from "node:fs";import net from "node:net";
import zlib from "node:zlib";
const R="/Users/ahl/CodeProjects/Vellum";const O=R+"/out/844-plate-read";
const {findBrowser}=await import(R+"/src/cli/raster.ts");const {cleanup,start}=await import(R+"/e2e/harness.ts");
const all=JSON.parse(fs.readFileSync(R+"/out/844/pages/all-shots.json","utf8"));
const seen=new Map();for(const s of all){const k=s.url+"|"+s.width+"|"+s.height+"|"+!!s.full;if(!seen.has(k))seen.set(k,s);}
const fp=()=>new Promise(r=>{const s=net.createServer();s.listen(0,"127.0.0.1",()=>{const p=s.address().port;s.close(()=>r(p))})});
const PORT=await fp(),DPORT=await fp();
const ctx=await start({browser:findBrowser(),SITE:R,OUT:R+"/out",PORT,DPORT,PAGE:"about:blank",results:[],consoleErrors:[],http4xx:[],skippedGroups:[],skippedChecks:[]});
const extra=[{url:"/out/844/pages/small.html",width:3336,height:900,full:true,out:"x/sheet-small-sizes.png"}];
const rows=[];
const PROBE=`(()=>{let maxR=0,who="";for(const e of document.querySelectorAll("body *")){const b=e.getBoundingClientRect();if(b.width>0&&b.right>maxR){maxR=b.right;who=e.tagName+"."+String(e.className).slice(0,20)}}return {scrollWidth:document.documentElement.scrollWidth,bodyScrollWidth:document.body.scrollWidth,clientWidth:document.documentElement.clientWidth,maxRight:Math.round(maxR),who,scrollHeight:document.documentElement.scrollHeight,imgsBroken:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).length}})()`;
for(const s of [...extra,...seen.values()]){
  await ctx.send("Emulation.setDeviceMetricsOverride",{width:s.width,height:s.height,deviceScaleFactor:1,mobile:false});
  await ctx.send("Page.navigate",{url:"about:blank"});
  await ctx.send("Page.navigate",{url:`http://127.0.0.1:${PORT}${s.url}`});
  await ctx.sleep(700);
  const p=await ctx.evaluate(PROBE);
  rows.push({url:s.url.replace("/out/844/pages/",""),shotW:s.width,out:s.out.split("/").pop(),...p});
}
fs.writeFileSync(O+"/sheet-widths.json",JSON.stringify(rows,null,1));cleanup();process.exit(0);
