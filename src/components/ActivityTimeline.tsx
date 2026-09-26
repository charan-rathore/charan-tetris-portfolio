"use client";
import { useEffect, useRef, useState } from "react";
import timeline from "../data/activity-timeline.json";
import "./activity-timeline.css";

type Event = (typeof timeline.events)[number];
const september = (events: Event[]) => events.filter(event => event.date.startsWith("2026-09-"));
const duration = 22000;
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const dates = Array.from({length:30},(_,i)=>`2026-09-${String(i+1).padStart(2,"0")}`);
type Point = {x:number;y:number;index:number};
export function ActivityTimeline() {
  const [events,setEvents]=useState<Event[]>(september(timeline.events));
  const [checkedAt,setCheckedAt]=useState(timeline.asOf);
  const [stale,setStale]=useState(true);
  const [ready,setReady]=useState(false);
  const canvas=useRef<HTMLCanvasElement>(null);
  const points=useRef<Point[]>([]);
  const [replay,setReplay]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [selected,setSelected]=useState<number|null>(null);
  useEffect(()=>{
    let active=true;
    const refresh=()=>fetch("/api/activity-timeline").then(r=>r.ok?r.json():Promise.reject()).then((result:{events:Event[];checkedAt:string;stale:boolean})=>{
      if(active&&Array.isArray(result.events)){const next=september(result.events);setEvents(prev=>JSON.stringify(prev)===JSON.stringify(next)?prev:next);setCheckedAt(result.checkedAt);setStale(result.stale);setReady(true)}
    }).catch(()=>{if(active){setStale(true);setReady(true)}});
    refresh();const timer=setInterval(refresh,60_000);return()=>{active=false;clearInterval(timer)};
  },[]);
  useEffect(()=>{
    if(!ready)return;
    const c=canvas.current,ctx=c?.getContext("2d");if(!c||!ctx)return;
    let frame=0,start=0,pausedAt=0,visible=false,done=false;
    const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
    const draw=(progress:number)=>{
      const w=c.clientWidth,h=c.clientHeight,dpr=Math.min(devicePixelRatio||1,4);if(!w||!h)return;
      if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr)}
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle="#0d0a0f";ctx.fillRect(0,0,w,h);
      const left=18,right=w-18,mobile=w<620,summary=progress>=.84;
      ctx.textAlign="left";ctx.fillStyle="#f4eaf0";
      ctx.font=`600 ${mobile?18:24}px Arial, sans-serif`;
      ctx.fillText(summary?"September, at a glance":"September 2026 · public merges",left,mobile?32:43);
      const arrivals=Math.max(0,Math.min(events.length,Math.floor(events.length*clamp(progress/.84))));
      const visibleEvents=summary?events:events.slice(0,arrivals);
      const activeDays=new Set(visibleEvents.map(e=>e.date)).size;
      const repoCount=new Set(visibleEvents.map(e=>e.repo)).size;
      ctx.font=`${mobile?11:13}px Arial, sans-serif`;ctx.fillStyle="#bdb3c0";
      ctx.fillText(`${visibleEvents.length} merged PRs    ·    ${activeDays} active days    ·    ${repoCount} repos`,left,mobile?53:69);
      const top=mobile?83:108,base=mobile?244:Math.round(h*.68),plotWidth=right-left;
      const buckets=dates.map(date=>visibleEvents.map((e,i)=>({...e,index:summary?i:events.indexOf(e)})).filter(e=>e.date===date));
      const cell=plotWidth/30,block=Math.max(3,Math.min(cell-2,8));
      ctx.strokeStyle="#443745";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,base+.5);ctx.lineTo(right,base+.5);ctx.stroke();
      points.current=[];
      buckets.forEach((bucket,i)=>{
        const x=left+cell*(i+.5);
        ctx.fillStyle=i%5===0?"#493949":"#302832";
        ctx.fillRect(Math.round(x),top,1,base-top+45);
        bucket.forEach((e,j)=>{
          const fix=e.kind==="merged_fix";
          ctx.fillStyle=fix?"#f0716a":"#3ecf8e";
          const y=fix?base+8+j*9:base-12-j*9;
          ctx.fillRect(Math.round(x-block/2),y,block,6);
          points.current.push({x,y,index:e.index});
        });
        if(i%5===0||i===29){ctx.fillStyle="#a99ba9";ctx.textAlign="center";ctx.font="10px Arial, sans-serif";ctx.fillText(String(i+1),x,base+69)}
      });
      ctx.textAlign="left";ctx.fillStyle="#a99ba9";ctx.font="10px Arial, sans-serif";
      ctx.fillText("SEP",left,base+49);
      ctx.fillStyle="#3ecf8e";ctx.fillRect(left,base+91,8,8);ctx.fillStyle="#dfd4df";ctx.fillText("MERGED",left+14,base+99);
      ctx.fillStyle="#f0716a";ctx.fillRect(left+105,base+91,8,8);ctx.fillStyle="#dfd4df";ctx.fillText("FIX / TEST",left+119,base+99);
      if(summary){
        const ranked=[...new Set(events.map(e=>e.repo))].map(repo=>[repo,events.filter(e=>e.repo===repo).length] as const).sort((a,b)=>b[1]-a[1]);
        const labelY=base+128;ctx.fillStyle="#bdb3c0";ctx.font="10px Arial, sans-serif";
        ctx.fillText("MOST ACTIVE REPOSITORIES",left,labelY);
        ranked.slice(0,mobile?2:3).forEach(([repo,count],i)=>{
          ctx.fillStyle="#f4eaf0";ctx.font=`${mobile?12:14}px Arial, sans-serif`;
          ctx.fillText(`${repo.split("/").at(-1)?.slice(0,mobile?22:32)}  ·  ${count}`,left,labelY+22+i*21);
        });
      }
    };
    (window as Window & {__activityDraw?:(progress:number)=>void}).__activityDraw=draw;
    const tick=(now:number)=>{if((window as Window & {__activityManual?:boolean}).__activityManual)return;if(!visible)return;
      if(!start)start=now-pausedAt;const progress=reduced?1:Math.min(1,(now-start)/duration);draw(progress);
      if(progress<1)frame=requestAnimationFrame(tick);else{done=true;setPlaying(false)};
    };
    const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){visible=true;if(!done){start=0;frame=requestAnimationFrame(tick);setPlaying(true)}}else{visible=false;if(start)pausedAt=performance.now()-start;cancelAnimationFrame(frame)}},{rootMargin:"40px"});
    observer.observe(c);if(reduced)draw(1);
    return()=>{observer.disconnect();cancelAnimationFrame(frame);delete (window as Window & {__activityDraw?:(progress:number)=>void}).__activityDraw};
  },[replay,events,ready]);
  const inspect=(e:React.MouseEvent<HTMLCanvasElement>)=>{
    const bounds=e.currentTarget.getBoundingClientRect(),x=e.clientX-bounds.left,y=e.clientY-bounds.top;
    const nearest=points.current.reduce<Point|null>((p,q)=>!p||Math.hypot(q.x-x,q.y-y)<Math.hypot(p.x-x,p.y-y)?q:p,null);
    if(nearest&&Math.hypot(nearest.x-x,nearest.y-y)<22)setSelected(nearest.index);
  };
  return <section className="activity-timeline">
    {!ready&&<p className="activity-timeline-loading">Checking current public GitHub activity...</p>}
    <canvas ref={canvas} onClick={inspect} aria-label={`September 2026 activity: ${events.length} public merged pull requests, shown by day`} role="img" />
    <div className="activity-timeline-foot"><span>SEPTEMBER 2026 · MERGE TIMELINE</span><button type="button" onClick={()=>{setSelected(null);setReplay(n=>n+1)}} disabled={playing}>↻ REPLAY</button></div>
    {selected!==null&&events[selected]&&<p><a href={events[selected].url} target="_blank" rel="noreferrer">{events[selected].date} · {events[selected].repo} · {events[selected].title} ↗</a></p>}
    <small>Source: <a href="https://github.com/pulls?q=is%3Apr+author%3Acharan-rathore+is%3Amerged+merged%3A2026-09-01..2026-09-30" target="_blank" rel="noreferrer">GitHub public merged PRs for September 2026</a>, checked {new Date(checkedAt).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"})}{stale?" (last known result; live check unavailable)":""}. Green means a merged PR; red means a merged PR classified as a fix or test by its title. Pushes and CI results are not included.</small>
  </section>;
}
