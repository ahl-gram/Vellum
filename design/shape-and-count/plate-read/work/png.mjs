import zlib from "node:zlib";
export function decode(buf){
  let p=8,w,h,ct,idat=[];
  while(p<buf.length){const len=buf.readUInt32BE(p),type=buf.toString("ascii",p+4,p+8),d=buf.subarray(p+8,p+8+len);
    if(type==="IHDR"){w=d.readUInt32BE(0);h=d.readUInt32BE(4);ct=d[9];if(d[8]!==8||d[12]!==0)throw new Error("fmt");}
    if(type==="IDAT")idat.push(d); p+=12+len;}
  const bpp=ct===6?4:3, raw=zlib.inflateSync(Buffer.concat(idat)), stride=w*bpp, out=Buffer.alloc(h*stride);
  for(let y=0;y<h;y++){const f=raw[y*(stride+1)];const row=raw.subarray(y*(stride+1)+1,(y+1)*(stride+1));
    for(let x=0;x<stride;x++){const a=x>=bpp?out[y*stride+x-bpp]:0,b=y?out[(y-1)*stride+x]:0,c=(x>=bpp&&y)?out[(y-1)*stride+x-bpp]:0;
      let v=row[x]; if(f===1)v+=a;else if(f===2)v+=b;else if(f===3)v+=(a+b)>>1;else if(f===4){const pp=a+b-c,pa=Math.abs(pp-a),pb=Math.abs(pp-b),pc=Math.abs(pp-c);v+=(pa<=pb&&pa<=pc)?a:(pb<=pc?b:c);}
      out[y*stride+x]=v&255;}}
  return {w,h,bpp,data:out};
}
const lin=(c)=>{c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4)};
export const lum=([r,g,b])=>0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b);
export const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)};
// ground = modal colour; ink = pixel of greatest contrast vs ground; also ink at the 99th percentile of contrast among non-ground pixels
export function sample(img){
  const {w,h,bpp,data}=img; const counts=new Map();
  for(let i=0;i<w*h;i++){const k=data[i*bpp]<<16|data[i*bpp+1]<<8|data[i*bpp+2];counts.set(k,(counts.get(k)||0)+1);}
  let best=0,bk=0;for(const[k,c]of counts)if(c>best){best=c;bk=k;}
  const g=[bk>>16,(bk>>8)&255,bk&255]; let max=0,mk=null; const rs=[];
  for(let i=0;i<w*h;i++){const c=[data[i*bpp],data[i*bpp+1],data[i*bpp+2]];const r=ratio(c,g);if(r>max){max=r;mk=c;} if(r>1.15)rs.push(r);}
  rs.sort((a,b)=>a-b);
  return {ground:g,groundShare:+(best/(w*h)).toFixed(2),inkExtreme:mk,ratioExtreme:+max.toFixed(2),ratioP95:rs.length?+rs[Math.floor(rs.length*0.95)].toFixed(2):null,nInk:rs.length};
}
export const hex=(c)=>"#"+c.map(v=>v.toString(16).padStart(2,"0")).join("");
