import fs from "node:fs";import net from "node:net";
const R="/Users/ahl/CodeProjects/Vellum";const O=R+"/out/844-plate-read";
const {findBrowser}=await import(R+"/src/cli/raster.ts");const {cleanup,start}=await import(R+"/e2e/harness.ts");
const fp=()=>new Promise(r=>{const s=net.createServer();s.listen(0,"127.0.0.1",()=>{const p=s.address().port;s.close(()=>r(p))})});
const PORT=await fp(),DPORT=await fp();
const ctx=await start({browser:findBrowser(),SITE:R,OUT:R+"/out",PORT,DPORT,PAGE:"about:blank",results:[],consoleErrors:[],http4xx:[],skippedGroups:[],skippedChecks:[]});
await ctx.send("Emulation.setDeviceMetricsOverride",{width:3336,height:900,deviceScaleFactor:1,mobile:false});
await ctx.send("Page.navigate",{url:`http://127.0.0.1:${PORT}/out/844/pages/small.html`});await ctx.sleep(1500);
const g=await ctx.evaluate(`(()=>({imgs:[...document.images].map(i=>{const b=i.getBoundingClientRect();return [Math.round(b.left),Math.round(b.top+scrollY),Math.round(b.width),Math.round(b.height),i.getAttribute("src").split("/").pop(),i.naturalWidth]}),caps:[...document.querySelectorAll("figcaption")].slice(0,1).map(c=>{const s=getComputedStyle(c);return [s.fontSize,s.color,s.backgroundColor]}),h2:getComputedStyle(document.querySelector("h2")).fontSize,fig0:(()=>{const c=[...document.querySelectorAll("figcaption")].map(c=>{const r=c.getBoundingClientRect();return [Math.round(r.height),c.scrollHeight>c.clientHeight]});return c})()}))()`);
fs.writeFileSync(O+"/small-geometry.json",JSON.stringify(g,null,1));
const shot=async(f,x,y,w,h,s)=>{const p=await ctx.send("Page.captureScreenshot",{format:"png",captureBeyondViewport:true,clip:{x,y,width:w,height:h,scale:s}});fs.writeFileSync(`${O}/shots/${f}`,Buffer.from(p.data,"base64"));};
const rows=[0,6,12].map(i=>g.imgs[i]);
// 1:1 crops: first three plates of each row at native size
await shot("small-537-row-1to1-first3.png",0,rows[0][1]-4,1700,rows[0][3]+60,1);
await shot("small-382-row-1to1-first3.png",0,rows[1][1]-4,1250,rows[1][3]+60,1);
await shot("small-170-row-1to1-all.png",0,rows[2][1]-4,1100,rows[2][3]+60,1);
await shot("small-170-row-3x-first2.png",0,rows[2][1]-4,370,rows[2][3]+60,3);
fs.writeFileSync(O+"/small-note.txt","ok");cleanup();process.exit(0);
