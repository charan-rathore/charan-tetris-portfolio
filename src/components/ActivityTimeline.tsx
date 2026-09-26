"use client";
import { useEffect, useRef, useState } from "react";
import timeline from "../data/activity-timeline.json";
import "./activity-timeline.css";
const events=timeline.events;
const duration=23000;
const first=new Date(events[0].date+"T00:00:00Z").getTime(),last=new Date(events[events.length-1].date+"T00:00:00Z").getTime();
const daysSince=(d:string)=>Math.floor((Date.parse(timeline.asOf+"T00:00:00Z")-Date.parse(d+"T00:00:00Z"))/86400000);
export function ActivityTimeline(){
 const canvas=useRef<HTMLCanvasElement>(null),[playing,setPlaying]=useState(false),[selected,setSelected]=useState<number|null>(null),[replay,setReplay]=useState(0);
 useEffect(()=>{
  const c=canvas.current,ctx=c?.getContext("2d");if(!c||!ctx)return;let frame=0,start=0,visible=false,done=false;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease=(x:number)=>1-Math.pow(1-x,3);
  const draw=(progress:number)=>{const w=c.clientWidth,h=c.clientHeight,dpr=Math.min(devicePixelRatio,1.5);if(!w||!h)return;
   if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr)}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle="#0d0a0f";ctx.fillRect(0,0,w,h);
   const grid=Math.max(10,w/94);ctx.fillStyle="#4e475a55";for(let x=0;x<w;x+=grid)for(let y=0;y<h;y+=grid)ctx.fillRect(Math.round(x),Math.round(y),1.5,1.5);
   const pad=40,base=h*.53,brush=ctx;ctx.strokeStyle="#77667a88";ctx.setLineDash([2,5]);ctx.strokeRect(pad,base-3,w-pad*2,7);ctx.setLineDash([]);
   const cutoff=progress===1?Date.parse(timeline.asOf+"T00:00:00Z"):first+(last-first)*progress,selectedDate=new Date(cutoff);const label=selectedDate.toLocaleString("en-US",{month:"short",year:"numeric",timeZone:"UTC"});
   const drawn=events.filter(e=>Date.parse(e.date+"T00:00:00Z")<=cutoff);const latest=drawn.filter(e=>e.kind==='merged'||e.kind==='merged_fix').at(-1);
   ctx.fillStyle="#e5e0e8";ctx.font=`bold ${Math.max(12,w*.018)}px monospace`;ctx.fillText(label,pad,35);ctx.textAlign="right";ctx.fillText(`${latest?Math.floor((cutoff-Date.parse(latest.date+"T00:00:00Z"))/86400000):"-"} DAYS SINCE LAST MERGE`,w-pad,35);ctx.textAlign="left";
   const shown=progress===1?events:drawn;const windowStart=progress===1?first:Math.max(first,cutoff-100*86400000);const windowEnd=progress===1?last:Math.max(first+100*86400000,cutoff+20*86400000);
   const grouped=new Map<string,{merged:number;fix:number;events:number[]}>();shown.forEach((e,i)=>{const group=grouped.get(e.date)??{merged:0,fix:0,events:[]};group.events.push(i);if(e.kind==="merged_fix")group.fix++;else group.merged++;grouped.set(e.date,group)});
   [...grouped].forEach(([dateStr,group])=>{const date=Date.parse(dateStr+"T00:00:00Z");if(date<windowStart)return;const x=pad+(date-windowStart)/(windowEnd-windowStart)*(w-pad*2);if(x<pad||x>w-pad)return;
    const fix=group.fix>0; if(group.merged)colorBar(x,Math.min(90,25+group.merged*9),"#3ecf8e",false);if(group.fix)colorBar(x,-Math.min(80,25+group.fix*8),"#f0716a",false);
    const age=(cutoff-date)/86400000;if(progress<1&&age>=0&&age<4){const r=ease(Math.min(1,age/4))*Math.min(70,h*.2),alpha=1-age/4;ctx.globalAlpha=alpha;ctx.fillStyle=fix?"#f0716a":"#3ecf8e";for(let k=0;k<80;k++){const a=k*2.39996,rr=r*((k%7)/7+.35);const xx=Math.round((x+Math.cos(a)*rr)/grid)*grid,yy=Math.round((base+Math.sin(a)*rr)/grid)*grid;ctx.fillRect(xx,yy,2.5,2.5)}ctx.globalAlpha=1}
    function colorBar(px:number,bh:number,color:string,active:boolean){brush.fillStyle=color;brush.globalAlpha=active?1:.87;const blocks=6;for(let b=0;b<blocks;b++){const yy=bh>0?base-(b+1)*bh/blocks:base+b*(-bh)/blocks;brush.fillRect(px-3,yy,7,Math.abs(bh)/blocks-2)}brush.globalAlpha=1}
   });
   ctx.font=`${Math.max(10,w*.013)}px monospace`;ctx.fillStyle="#3ecf8e";ctx.fillRect(pad,h-29,7,7);ctx.fillStyle="#93a0a0";ctx.fillText("MERGED PR",pad+12,h-20);ctx.fillStyle="#f0716a";ctx.fillRect(pad+122,h-29,7,7);ctx.fillStyle="#93a0a0";ctx.fillText("FIX/TEST PR",pad+134,h-20);
   if(progress===1){ctx.textAlign="right";ctx.fillStyle="#cde8e0";ctx.font=`bold ${Math.max(11,w*.016)}px monospace`;ctx.fillText(`${events.length} PUBLIC MERGED PRS`,w-pad,h-20);ctx.textAlign="left"}
  };
  const tick=(now:number)=>{if(!visible)return;if(!start)start=now;const progress=reduced?1:Math.min(1,(now-start)/duration);draw(progress);if(progress<1)frame=requestAnimationFrame(tick);else{done=true;setPlaying(false)}};
  const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible&&!done){start=0;frame=requestAnimationFrame(tick);setPlaying(true)}else if(!visible)cancelAnimationFrame(frame)},{rootMargin:"40px"});observer.observe(c);
  if(reduced)draw(1);
  return()=>{observer.disconnect();cancelAnimationFrame(frame)};
 },[replay,selected]);
 const inspect=(e:React.MouseEvent<HTMLCanvasElement>)=>{const x=(e.clientX-e.currentTarget.getBoundingClientRect().left)/e.currentTarget.clientWidth;const index=Math.round(x*(events.length-1));setSelected(Math.max(0,Math.min(events.length-1,index)))};
 const lastMerge=events.filter(e=>e.kind==='merged'||e.kind==='merged_fix').at(-1);
 return <section className="activity-timeline"><div className="activity-timeline-head"><span>GITHUB / MERGED PR TIMELINE</span><button onClick={()=>{setReplay(n=>n+1);setPlaying(true)}} disabled={playing}>↻ REPLAY</button></div><canvas ref={canvas} onClick={inspect} aria-label={`Timeline of ${events.length} public merged pull requests by Charan through ${timeline.asOf}`} role="img" /><p>{selected!==null?<a href={events[selected].url} target="_blank" rel="noreferrer">{events[selected].date} · {events[selected].repo} · {events[selected].title} ↗</a>:`${events.length} public merged PRs. Last merged ${lastMerge?.date} (${lastMerge?daysSince(lastMerge.date):"?"} day ago). Red marks merged PRs classified as fixes or tests by their title, not failed builds.`}</p><small>Source: <a href="https://github.com/pulls?q=is%3Apr+author%3Acharan-rathore+is%3Amerged" target="_blank" rel="noreferrer">GitHub public merged PR search</a>, checked {timeline.asOf}. This is a dated snapshot; pushes and CI results are not included, and the colors do not assert CI status.</small></section>
}
