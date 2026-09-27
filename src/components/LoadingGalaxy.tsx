"use client";

import { useEffect, useRef, useState } from "react";

const LENGTH = 10250;
const montage: HTMLImageElement[] = [];
for (const file of ["chart","collage","eye"]) {if(typeof Image!=="undefined"){const image=new Image();image.src=`/${file==="chart"?"1":file==="collage"?"2":"3"}-systris-original-${file}.webp`;montage.push(image)}}
const nebula = typeof Image !== "undefined" ? new Image() : null;
const traveler = typeof Image !== "undefined" ? new Image() : null;
if (traveler) traveler.src = "/systris-falling-figure.webp";
if (nebula) nebula.src = "/systris-galaxy-original.webp";
const random = (n: number) => { const x = Math.sin(n * 127.1 + 78.233) * 43758.5453; return x - Math.floor(x); };
const ease = (n: number) => n * n * (3 - 2 * n);
const clamp = (n: number) => Math.max(0, Math.min(1, n));

function paint(canvas: HTMLCanvasElement, elapsed: number) {
  const w = canvas.clientWidth, h = canvas.clientHeight, dpr = Math.min(devicePixelRatio || 1, 3);
  if (!w || !h) return;
  const bw = Math.round(w*dpr), bh = Math.round(h*dpr);
  if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
  const c = canvas.getContext("2d"); if (!c) return;
  c.setTransform(dpr,0,0,dpr,0,0);
  c.fillStyle = "#000000"; c.fillRect(0,0,w,h);
  const cx = w*.5, cy = h*.49;
  const opening = clamp(elapsed/2250);
  const journey = clamp((elapsed-2050)/5650);
  const travel = ease(journey);
  const iris = 0;
  const warp = Math.min(w,h) * (.33 + travel * 1.45);
  const bg = c.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*.8);
  bg.addColorStop(0,"#000000"); bg.addColorStop(.29,"#000000"); bg.addColorStop(.68,"#000000"); bg.addColorStop(1,"#000000");
  c.fillStyle=bg;c.fillRect(0,0,w,h);
  if(nebula?.complete && nebula.naturalWidth) {
    c.save();c.globalAlpha=(1-iris)*(.12 + .35*opening);c.translate(cx,cy);c.rotate(travel*.29);
    const size=warp*2.45;c.drawImage(nebula,-size/2,-size/2,size,size);c.restore();
  }
  const core=c.createRadialGradient(cx,cy,0,cx,cy,warp*.37);
  core.addColorStop(0,`rgba(205,235,210,${(1-iris)*.52})`);
  core.addColorStop(.21,`rgba(96,182,118,${(1-iris)*.26})`);core.addColorStop(1,"transparent");
  c.fillStyle=core;c.fillRect(cx-warp*.4,cy-warp*.4,warp*.8,warp*.8);
  // Every point is redrawn from a fixed seed and a depth value, so the fall is
  // perspective motion rather than scaling a low-resolution still.
  for (let i=0;i<1300;i++) {
    const angle=random(i*3+11)*Math.PI*2;
    const depth=(random(i*3+12)+travel*2.4)%1;
    const radius=(.025 + Math.pow(depth,2.25)*1.15)*Math.max(w,h);
    const stretch=1+depth*(.3+travel*3.3);
    const x=cx+Math.cos(angle)*radius*stretch;
    const y=cy+Math.sin(angle)*radius*stretch*.9;
    if (x<-20||x>w+20||y<-20||y>h+20) continue;
    const size=(.35+depth*2.3)*(w<600?.85:1);
    const hue=["#e4e2d9","#b5cbb6","#d5d2c8","#c4e6c8"][i%4];
    c.globalAlpha=(.2+depth*.72)*(1-iris);
    c.strokeStyle=hue;c.lineWidth=Math.max(.5,size*.48);
    c.beginPath();c.moveTo(x,y);
    c.lineTo(x+Math.cos(angle)*Math.max(size,depth*travel*22),y+Math.sin(angle)*Math.max(size,depth*travel*22));c.stroke();
  }
  c.globalAlpha=1;
  // First 2.7s: editorial jump cuts include the eye, then the fall.
  // These stills are original assets. The supplied reel determines only the timing.
  const cuts=[0,300,780,1120,1450,2080,2400,2700];
  const shot=cuts.findIndex((end,i)=>i>0&&elapsed<end)-1;
  if(elapsed<2700&&montage.length===3){
    const image=montage[shot<2?0:shot<4?2:1];
    if(image.complete&&image.naturalWidth){
      const sliceStart=cuts[Math.max(shot,0)],sliceEnd=cuts[Math.max(shot+1,1)];
      const t=clamp((elapsed-sliceStart)/(sliceEnd-sliceStart));
      const stripH=Math.min(h*.38,w*.67),y=cy-stripH/2;
      c.save();c.globalAlpha=1;c.fillStyle="#000000";c.fillRect(0,y,w,stripH);
      c.beginPath();c.rect(0,y,w,stripH);c.clip();
      const zoom=1.02+t*.17, iw=Math.max(w*zoom,stripH*image.naturalWidth/image.naturalHeight),ih=iw*image.naturalHeight/image.naturalWidth;
      const pan=(shot%3-1)*w*.065;c.drawImage(image,cx-iw/2+pan,y+stripH/2-ih/2,iw,ih);
      if(shot===1||shot===5){c.fillStyle="rgba(255,245,231,.24)";c.fillRect(0,y,w,stripH)}
      if(shot===7){c.fillStyle="rgba(16,26,44,.3)";for(let j=0;j<5;j++)c.fillRect(j*w/5,y,w/15,stripH)}
      c.restore();
    }
  }
  // A rendered original figure carries the fall; size, parallax, roll and
  // acceleration are drawn anew every frame against a live particle field.
  if (journey>0 && journey<1 && traveler?.complete && traveler.naturalWidth) {
    const fall=ease(journey), entry=clamp((elapsed-2050)/520);
    const height=Math.min(h*.53,w*.87)*(1-fall*.76);
    const width=height*traveler.naturalWidth/traveler.naturalHeight;
    const fx=cx+w*(.1-.16*fall)+Math.sin(journey*10)*w*.018;
    const fy=cy+h*(.035+.19*fall);
    c.save();c.translate(fx,fy);c.rotate(-.12+fall*.62+Math.sin(journey*12)*.07);
    c.globalAlpha=entry*(1-ease(clamp((journey-.84)/.16)));
    c.filter="brightness(1.28) contrast(1.05)";c.drawImage(traveler,-width/2,-height/2,width,height);
    c.restore();
  }
  // Editorial moments follow the soundtrack's stronger entrances at 3.5s,
  // 5.3s and 7.4s. Product language is Systris's, not reference-video copy.
  const phrase=(start:number,end:number,text:string,align:"left"|"right")=>{
    const inTime=clamp((elapsed-start)/180),outTime=clamp((end-elapsed)/240);
    if(!inTime||!outTime)return;
    c.save();c.globalAlpha=ease(inTime)*ease(outTime);
    const fontSize=Math.min(w*.12,h*.089,94);const x=align==="left"?w*.055:w*.945;
    const y=align==="left"?h*.25:h*.76;
    c.textAlign=align;c.font=`900 ${fontSize}px Arial, sans-serif`;
    c.fillStyle="#b9fce8";c.fillText(text,x,y,w*.9);
    c.fillStyle="#52dfa8";c.fillRect(align==="left"?x:x-w*.18,y+13,w*.18,3);
    c.restore();
  };
  phrase(3500,4720,"FOLLOW", "left");
  phrase(4820,5660,"THE THREAD", "left");
  if(elapsed>5750&&elapsed<7410){
    const enter=ease(clamp((elapsed-5750)/270)),leave=ease(clamp((7410-elapsed)/230));
    c.save();c.globalAlpha=enter*leave;
    const px=w*.59,py=h*.12,pw=Math.min(w*.36,370),ph=Math.min(h*.25,180);
    c.translate(px,py);c.rotate(-.12);c.transform(1,-.1,0,1,0,0);
    c.fillStyle="rgba(4,22,25,.83)";c.fillRect(0,0,pw,ph);
    c.strokeStyle="#56e8b1";c.lineWidth=2;c.strokeRect(0,0,pw,ph);
    c.textAlign="left";c.fillStyle="#6fe9bc";
    c.font=`700 ${Math.max(9,Math.min(15,w*.022))}px Arial, sans-serif`;
    c.fillText("SYSTRIS / FIELD NOTES",12,Math.min(26,ph*.25),pw-24);
    c.fillStyle="#e9fff7";c.font=`800 ${Math.max(13,Math.min(27,w*.052))}px Arial, sans-serif`;
    c.fillText("IDEAS IN MOTION",12,ph*.61,pw-24);
    c.fillStyle="#4de4ab";c.fillRect(12,ph*.78,pw*.68,3);
    c.restore();
  }
  phrase(7530,8920,"BUILD WHAT'S NEXT", "right");
  // End by continuing the fall into darkness; do not return to the eye.
  const fade=ease(clamp((elapsed-9400)/2300));
  if(fade>0){c.fillStyle=`rgba(1,3,9,${fade*.78})`;c.fillRect(0,0,w,h)}
  // The last musical accent opens a cyan aperture at the galaxy core. The
  // matching aperture reveals the live portfolio instead of cutting to it.
  const portal=clamp((elapsed-9770)/480);
  if(portal>0){
    const radius=Math.min(w,h)*(.035+portal*.18);
    const glow=c.createRadialGradient(cx,cy,0,cx,cy,radius*2.1);
    glow.addColorStop(0,`rgba(187,255,241,${portal*.88})`);
    glow.addColorStop(.25,`rgba(61,238,186,${portal*.36})`);
    glow.addColorStop(1,"transparent");
    c.fillStyle=glow;c.fillRect(cx-radius*2.1,cy-radius*2.1,radius*4.2,radius*4.2);
    c.strokeStyle=`rgba(101,255,208,${portal*.75})`;c.lineWidth=2;
    c.beginPath();c.arc(cx,cy,radius,0,Math.PI*2);c.stroke();
  }
}

export function LoadingGalaxy() {
  const [phase,setPhase]=useState<"playing"|"leaving"|"done">("playing");
  const [soundEnabled,setSoundEnabled]=useState(false);
  const [needsGesture,setNeedsGesture]=useState(false);
  const canvas=useRef<HTMLCanvasElement>(null);
  const audio=useRef<HTMLAudioElement|null>(null);
  const elapsedRef=useRef(0);
  useEffect(()=>{if(matchMedia("(prefers-reduced-motion: reduce)").matches) { const id=requestAnimationFrame(()=>setPhase("done")); return ()=>cancelAnimationFrame(id); }},[]);
  useEffect(()=>{
    if(phase!=="playing")return;
    const track=new Audio("/systris-reference-intro-audio.m4a");
    track.preload="auto";audio.current=track;
    // Try unmuted playback immediately. Browsers that deny autoplay need a
    // real gesture; the first pointer/key action anywhere retries playback.
    const startSound=()=>{
      if(track.paused){track.currentTime=Math.min(elapsedRef.current/1000,10.98);
        void track.play().then(()=>{setSoundEnabled(true);setNeedsGesture(false)}).catch(()=>setNeedsGesture(true));}
    };
    const onGesture=()=>startSound();
    window.addEventListener("pointerdown",onGesture);
    window.addEventListener("keydown",onGesture);
    startSound();
    return()=>{window.removeEventListener("pointerdown",onGesture);window.removeEventListener("keydown",onGesture);track.pause();if(audio.current===track)audio.current=null};
  },[phase]);
  useEffect(()=>{
    if(phase!=="playing")return;
    const element=canvas.current;if(!element)return;
    let raf=0;const start=performance.now();
    const draw=(now:number)=>{if((window as Window & {__introFreeze?:boolean}).__introFreeze)return;
      // Once music plays, its clock owns the cut timing. Before a gesture,
      // run the silent visual clock and seek to it when audio becomes available.
      const elapsed=audio.current&&!audio.current.paused ? audio.current.currentTime*1000 : now-start;
      elapsedRef.current=elapsed;paint(element,elapsed);
      if(elapsed<LENGTH)raf=requestAnimationFrame(draw);else setPhase("leaving")};
    raf=requestAnimationFrame(draw);
    const resize=()=>paint(element,elapsedRef.current);window.addEventListener("resize",resize);
    (window as Window & {__introDraw?:(elapsed:number)=>void}).__introDraw=(elapsed)=>paint(element,elapsed);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);delete (window as Window & {__introDraw?:(elapsed:number)=>void}).__introDraw};
  },[phase]);
  useEffect(()=>{
    // The hero is already mounted behind the reel. Sharpen it under the
    // expanding portal as the final 750ms of the real soundtrack plays.
    const root=document.documentElement;
    if(phase==="playing")root.classList.add("intro-active");
    if(phase==="leaving"){
      root.classList.remove("intro-active");root.classList.add("intro-landed");
      const t=setTimeout(()=>setPhase("done"),1150);
      return()=>clearTimeout(t);
    }
    if(phase==="done")root.classList.remove("intro-active","intro-landed");
    return()=>{root.classList.remove("intro-active","intro-landed")};
  },[phase]);
  useEffect(()=>()=>{audio.current?.pause();audio.current=null;document.documentElement.classList.remove("intro-active","intro-landed")},[]);
  if(phase==="done")return null;
  const enableSound=()=>{
    const track=audio.current;if(!track||phase!=="playing")return;
    track.currentTime=Math.min(elapsedRef.current/1000,10.98);
    void track.play().then(()=>{setSoundEnabled(true);setNeedsGesture(false)}).catch(()=>setNeedsGesture(true));
  };
  return <div className={`loading-galaxy space-intro ${phase==="leaving"?"is-leaving":""}`} role="dialog" aria-modal="true" aria-label="Enter the Systris portfolio">
    <canvas ref={canvas} aria-hidden="true" />
    <div className="space-handoff-ring" aria-hidden="true" />
    <div className="space-caption">SYSTRIS <span>·</span> FOLLOW THE THREAD</div>
    <div className="space-actions">{!soundEnabled && <button type="button" onClick={enableSound}>{needsGesture ? "TAP FOR SOUND ↗" : "SOUND STARTING ↗"}</button>}<button type="button" onClick={()=>{audio.current?.pause();setPhase("leaving")}}>SKIP INTRO ↗</button></div>
  </div>;
}
