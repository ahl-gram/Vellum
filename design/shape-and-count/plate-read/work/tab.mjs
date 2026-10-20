import fs from "node:fs";import net from "node:net";
const R="/Users/ahl/CodeProjects/Vellum";const O=R+"/out/844-plate-read";
const {findBrowser}=await import(R+"/src/cli/raster.ts");const {cleanup,start}=await import(R+"/e2e/harness.ts");
const src=JSON.parse(fs.readFileSync(R+"/out/844/explorer/explorer-shots.json","utf8"));
const sd=src.find(s=>s.out.endsWith("explorer-d-counted-continent-1024.png")).script;
const fp=()=>new Promise(r=>{const s=net.createServer();s.listen(0,"127.0.0.1",()=>{const p=s.address().port;s.close(()=>r(p))})});
const PORT=await fp(),DPORT=await fp();
const ctx=await start({browser:findBrowser(),SITE:R+"/.claude/worktrees/design-844/dist",OUT:R+"/out",PORT,DPORT,PAGE:"about:blank",results:[],consoleErrors:[],http4xx:[],skippedGroups:[],skippedChecks:[]});
const res=[];
for(const [h,seat] of [[900,false],[900,true],[768,false],[768,true]]){
 await ctx.send("Emulation.setDeviceMetricsOverride",{width:1024,height:h,deviceScaleFactor:1,mobile:false});
 await ctx.send("Page.navigate",{url:"about:blank"});await ctx.send("Page.navigate",{url:`http://127.0.0.1:${PORT}/explorer/#seed=5&type=continent`});await ctx.sleep(6000);
 if(seat){await ctx.evaluate(sd,true);await ctx.sleep(900);}
 res.push({h,seat,...await ctx.evaluate(`(()=>{const t=document.getElementById("chart-drawer-tab");const r=document.createRange();r.selectNodeContents(t);const rs=[...r.getClientRects()].map(q=>[q.left,q.top,q.right,q.bottom].map(Math.round));const s=document.getElementById("broadside").getBoundingClientRect();const tb=t.getBoundingClientRect();const lab=[...t.querySelectorAll("*")].map(e=>[e.tagName+"."+e.className,...[e.getBoundingClientRect()].map(q=>[q.left,q.top,q.right,q.bottom].map(Math.round))]);return {slipRight:s.right,slipBottom:s.bottom,tab:[tb.left,tb.top,tb.right,tb.bottom],tabText:rs,kids:lab,tabW:tb.width,coverPx:Math.max(0,s.right-tb.left),textLeft:Math.min(...rs.map(q=>q[0])),textTopMin:Math.min(...rs.map(q=>q[1])),textBottomMax:Math.max(...rs.map(q=>q[3])),zTab:getComputedStyle(t).zIndex,zSlip:getComputedStyle(document.getElementById("broadside")).zIndex,tabText1:t.textContent.trim()}})()`)});
}
fs.writeFileSync(O+"/tab-measure.json",JSON.stringify(res,null,1));cleanup();process.exit(0);
