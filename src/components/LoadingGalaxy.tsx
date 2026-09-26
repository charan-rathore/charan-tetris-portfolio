"use client";

import { useEffect, useRef, useState } from "react";

const LENGTH = 11000;
const montage: HTMLImageElement[] = [];
for (const file of ["chart","collage","eye"]) {if(typeof Image!=="undefined"){const image=new Image();image.src=`/${file==="chart"?"1":file==="collage"?"2":"3"}-systris-original-${file}.webp`;montage.push(image)}}
const nebula = typeof Image !== "undefined" ? new Image() : null;
const traveler = typeof Image !== "undefined" ? new Image() : null;
if (traveler) traveler.src = "/systris-falling-figure.webp";
if (nebula) nebula.src = "/systris-galaxy-original.webp";
const random = (n: number) => { const x = Math.sin(n * 127.1 + 78.233) * 43758.5453; return x - Math.floor(x); };
const ease = (n: number) => n * n * (3 - 2 * n);
const clamp = (n: number) => Math.max(0, Math.min(1, n));

// Original, synthesized sound design. The reference has a clipped opening rhythm,
// a rising noisy rush during the long fall, and a sharp drop before the finish.
function playOriginalScore(ctx:AudioContext,offset:number){
  const now=ctx.currentTime,master=ctx.createGain(),limiter=ctx.createDynamicsCompressor();
  master.gain.value=.48;limiter.threshold.value=-17;limiter.ratio.value=10;
  master.connect(limiter).connect(ctx.destination);
  const noise=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),values=noise.getChannelData(0);
  for(let i=0;i<values.length;i++)values[i]=random(i+447)*2-1;
  const hiss=(at:number,len:number,amp:number,from:number,to:number)=>{if(at+len<=offset)return;
    const start=now+Math.max(0,at-offset),src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
    src.buffer=noise;src.loop=true;filter.type="bandpass";filter.Q.value=.6;
    filter.frequency.setValueAtTime(from,start);filter.frequency.exponentialRampToValueAtTime(to,start+len);
    gain.gain.setValueAtTime(.001,start);gain.gain.linearRampToValueAtTime(amp,start+Math.min(len*.5,.55));
    gain.gain.exponentialRampToValueAtTime(.001,start+len);src.connect(filter).connect(gain).connect(master);src.start(start);src.stop(start+len+.02);
  };
  const impact=(at:number,pitch:number,amp:number)=>{if(at+.3<=offset)return;
    const start=now+Math.max(0,at-offset),osc=ctx.createOscillator(),gain=ctx.createGain();osc.type="triangle";
    osc.frequency.setValueAtTime(pitch,start);osc.frequency.exponentialRampToValueAtTime(Math.max(30,pitch*.28),start+.22);
    gain.gain.setValueAtTime(.001,start);gain.gain.linearRampToValueAtTime(amp,start+.012);
    gain.gain.exponentialRampToValueAtTime(.001,start+.27);osc.connect(gain).connect(master);osc.start(start);osc.stop(start+.28);
    hiss(at,.10,amp*.95,900,220);
  };
  // Cut impacts are foregrounded rather than a continuous ambient pad.
  [0,.24,.49,.74,.98,1.22,1.47,1.73,2.08,2.38].forEach((t,i)=>impact(t,112+22*(i%4),.27));
  hiss(.22,1.2,.10,250,2500);hiss(1.75,1.05,.16,550,3900);
  impact(2.72,82,.38);hiss(3.42,4.05,.42,160,6200);
  // The reference's 3.5–7.4s body feels like wind and percussion accelerating,
  // then it drops into a tighter rattling tail. No sampled reference audio is used.
  for(let t=3.56;t<7.28;t+=.43)impact(t,65+random(t*20)*95,.12+.12*(t-3.5)/3.8);
  hiss(7.4,2.35,.23,4100,480);[7.45,8.13,8.58,8.92,9.38,9.72].forEach((t,i)=>impact(t,170+i*23,.16));
  hiss(9.94,1.03,.10,800,190);impact(10.08,98,.22);
}

function paint(canvas: HTMLCanvasElement, elapsed: number) {
  const w = canvas.clientWidth, h = canvas.clientHeight, dpr = Math.min(devicePixelRatio || 1, 3);
  if (!w || !h) return;
  const bw = Math.round(w*dpr), bh = Math.round(h*dpr);
  if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
  const c = canvas.getContext("2d"); if (!c) return;
  c.setTransform(dpr,0,0,dpr,0,0);
  c.fillStyle = "#030710"; c.fillRect(0,0,w,h);
  const cx = w*.5, cy = h*.49;
  const opening = clamp(elapsed/2250);
  const journey = clamp((elapsed-2050)/5650);
  const travel = ease(journey);
  const iris = 0;
  const warp = Math.min(w,h) * (.33 + travel * 1.45);
  const bg = c.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*.8);
  bg.addColorStop(0,"#030710"); bg.addColorStop(.29,"#030710"); bg.addColorStop(.68,"#030710"); bg.addColorStop(1,"#020409");
  c.fillStyle=bg;c.fillRect(0,0,w,h);
  if(nebula?.complete && nebula.naturalWidth) {
    c.save();c.globalAlpha=(1-iris)*(.3 + .7*opening)*.88;c.translate(cx,cy);c.rotate(travel*.29);
    const size=warp*2.45;c.drawImage(nebula,-size/2,-size/2,size,size);c.restore();
  }
  const core=c.createRadialGradient(cx,cy,0,cx,cy,warp*.37);
  core.addColorStop(0,`rgba(230,252,255,${(1-iris)*.83})`);
  core.addColorStop(.21,`rgba(72,214,245,${(1-iris)*.5})`);core.addColorStop(1,"transparent");
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
    const hue=["#a9e9ff","#ffd795","#77bfff","#e7b5ff"][i%4];
    c.globalAlpha=(.2+depth*.72)*(1-iris);
    c.strokeStyle=hue;c.lineWidth=Math.max(.5,size*.48);
    c.beginPath();c.moveTo(x,y);
    c.lineTo(x+Math.cos(angle)*Math.max(size,depth*travel*22),y+Math.sin(angle)*Math.max(size,depth*travel*22));c.stroke();
  }
  c.globalAlpha=1;
  // First 2.7s: editorial jump cuts include the eye, then the fall.
  // These stills are original assets. The supplied reel determines only the timing.
  const cuts=[0,230,480,720,960,1180,1460,1730,2060,2350,2700];
  const shot=cuts.findIndex((end,i)=>i>0&&elapsed<end)-1;
  if(elapsed<2700&&montage.length===3){
    const image=montage[shot<2?0:shot<5?2:1];
    if(image.complete&&image.naturalWidth){
      const sliceStart=cuts[Math.max(shot,0)],sliceEnd=cuts[Math.max(shot+1,1)];
      const t=clamp((elapsed-sliceStart)/(sliceEnd-sliceStart));
      const stripH=Math.min(h*.38,w*.67),y=cy-stripH/2;
      c.save();c.globalAlpha=1;c.fillStyle="#030710";c.fillRect(0,y,w,stripH);
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
  // End by continuing the fall into darkness; do not return to the eye.
  const fade=ease(clamp((elapsed-9050)/1950));
  if(fade>0){c.fillStyle=`rgba(1,3,9,${fade})`;c.fillRect(0,0,w,h)}
}

export function LoadingGalaxy() {
  const [phase,setPhase]=useState<"playing"|"leaving"|"done">("playing");
  const [soundEnabled,setSoundEnabled]=useState(false);
  const canvas=useRef<HTMLCanvasElement>(null);
  const audio=useRef<AudioContext|null>(null);
  const elapsedRef=useRef(0);
  useEffect(()=>{if(matchMedia("(prefers-reduced-motion: reduce)").matches) { const id=requestAnimationFrame(()=>setPhase("done")); return ()=>cancelAnimationFrame(id); }},[]);
  useEffect(()=>{
    if(phase!=="playing")return;
    const element=canvas.current;if(!element)return;
    let raf=0;const start=performance.now();
    const draw=(now:number)=>{if((window as Window & {__introFreeze?:boolean}).__introFreeze)return;const elapsed=now-start;elapsedRef.current=elapsed;paint(element,elapsed);if(elapsed<LENGTH)raf=requestAnimationFrame(draw);else setPhase("leaving")};
    raf=requestAnimationFrame(draw);
    const resize=()=>paint(element,performance.now()-start);window.addEventListener("resize",resize);
    (window as Window & {__introDraw?:(elapsed:number)=>void}).__introDraw=(elapsed)=>paint(element,elapsed);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);delete (window as Window & {__introDraw?:(elapsed:number)=>void}).__introDraw};
  },[phase]);
  useEffect(()=>{if(phase!=="leaving")return;const t=setTimeout(()=>setPhase("done"),650);return()=>clearTimeout(t)},[phase]);
  useEffect(()=>()=>{void audio.current?.close()},[]);
  if(phase==="done")return null;
  const enableSound=()=>{try{const ctx=new AudioContext();audio.current=ctx;playOriginalScore(ctx,elapsedRef.current/1000);void ctx.resume().then(()=>setSoundEnabled(true)).catch(()=>{});}catch{}};
  return <div className={`loading-galaxy space-intro ${phase==="leaving"?"is-leaving":""}`} role="dialog" aria-modal="true" aria-label="Enter the Systris portfolio">
    <canvas ref={canvas} aria-hidden="true" />
    <div className="space-caption">SYSTRIS <span>·</span> FOLLOW THE THREAD</div>
    <div className="space-actions"><button type="button" onClick={enableSound} disabled={soundEnabled}>SOUND ON ↗</button><button type="button" onClick={()=>{void audio.current?.close();setPhase("leaving")}}>SKIP INTRO ↗</button></div>
  </div>;
}
