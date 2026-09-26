"use client";

import { useEffect, useRef, useState } from "react";

const LENGTH = 11000;
const montage: HTMLImageElement[] = [];
for (const file of ["chart","collage","eye"]) {if(typeof Image!=="undefined"){const image=new Image();image.src=`/systris-original-${file}.webp`;montage.push(image)}}
const nebula = typeof Image !== "undefined" ? new Image() : null;
const traveler = typeof Image !== "undefined" ? new Image() : null;
if (traveler) traveler.src = "/systris-falling-figure.webp";
if (nebula) nebula.src = "/systris-galaxy-original.webp";
const random = (n: number) => { const x = Math.sin(n * 127.1 + 78.233) * 43758.5453; return x - Math.floor(x); };
const ease = (n: number) => n * n * (3 - 2 * n);
const clamp = (n: number) => Math.max(0, Math.min(1, n));

// Synthesized score: clipped transients on each visual cut, low sub-bass swell
// through the fall, filtered hiss and a stepped rise into the closing eye.
function playOriginalScore(ctx:AudioContext,offset:number){
  const now=ctx.currentTime,master=ctx.createGain();master.gain.value=.26;master.connect(ctx.destination);
  const noise=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),values=noise.getChannelData(0);
  for(let i=0;i<values.length;i++)values[i]=random(i+447)*2-1;
  const rush=(at:number,len:number,volume:number,freq:number)=>{if(at+len<=offset)return;
    const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=noise;source.loop=true;filter.type="bandpass";
    filter.frequency.value=freq;filter.Q.value=.7;const start=now+Math.max(0,at-offset);
    gain.gain.setValueAtTime(.001,start);gain.gain.linearRampToValueAtTime(volume,start+Math.max(.01,len*.22));gain.gain.exponentialRampToValueAtTime(.001,start+Math.max(.04,len));
    source.connect(filter).connect(gain).connect(master);source.start(start);source.stop(start+len+.02);
  };
  for(const t of [0,.23,.48,.72,.96,1.18,1.46,1.73,2.06,2.35,7,7.43,7.88,8.19,8.52,8.83,9.2,9.61,10,10.45])rush(t,.12,.24,400+random(t*100)*2300);
  rush(2.5,4.8,.20,1200);rush(6.9,3.8,.17,2700);
  for(const [at,len,pitch,amp] of [[2.7,4.5,52,.20],[7,3.9,83,.16],[10.35,.5,180,.13]] as const){if(at+len<=offset)continue;
    const start=now+Math.max(0,at-offset),osc=ctx.createOscillator(),gain=ctx.createGain();osc.type="sine";osc.frequency.setValueAtTime(pitch,start);
    osc.frequency.exponentialRampToValueAtTime(pitch*.68,start+len);gain.gain.setValueAtTime(.001,start);gain.gain.linearRampToValueAtTime(amp,start+Math.min(.45,len*.3));gain.gain.exponentialRampToValueAtTime(.001,start+len);
    osc.connect(gain).connect(master);osc.start(start);osc.stop(start+len+.02);
  }
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
  const iris = ease(clamp((elapsed-7650)/3000));
  const warp = Math.min(w,h) * (.33 + travel * 1.45);
  const bg = c.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*.8);
  bg.addColorStop(0,"#030710"); bg.addColorStop(.29,"#030710"); bg.addColorStop(.68,"#030710"); bg.addColorStop(1,"#020409");
  c.fillStyle=bg;c.fillRect(0,0,w,h);
  if(nebula?.complete && nebula.naturalWidth) {
    c.save();c.globalAlpha=(1-iris)*(.3 + .7*opening)*.88;c.translate(cx,cy);c.rotate(travel*.29);
    const size=warp*2.45;c.drawImage(nebula,-size/2,-size/2,size,size);c.restore();
  }
  // First 2.7s: rapid editorial jump cuts, then the fall, then an eye coda.
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
  if(elapsed>=7000&&montage[2]?.complete&&montage[2].naturalWidth){
    const pulses=[7000,7430,7880,8190,8520,8830,9200,9610,10000,10450,10800];
    const index=Math.max(0,pulses.findIndex((end,i)=>i>0&&elapsed<end)-1);
    const img=montage[2],stripH=Math.min(h*.38,w*.67),y=cy-stripH/2;
    const colors=["#ffd6bd","#74ffae","#ffd76a","#ff81e1","#e8efff","#9be5ff"];
    c.save();c.beginPath();c.rect(0,y,w,stripH);c.clip();
    c.fillStyle="#030710";c.fillRect(0,y,w,stripH);
    const scale=1.04+index*.075,iw=Math.max(w*scale,stripH*img.naturalWidth/img.naturalHeight),ih=iw*img.naturalHeight/img.naturalWidth;
    c.drawImage(img,cx-iw/2+(index%2?22:-22),y+stripH/2-ih/2,iw,ih);
    c.globalCompositeOperation="screen";c.fillStyle=colors[index%colors.length];c.globalAlpha=.19+index%3*.08;c.fillRect(0,y,w,stripH);
    if(index>5){c.globalAlpha=.17;c.fillStyle="#fff";for(let j=0;j<8;j++)c.fillRect((j*67+index*19)%w,y,2,stripH)}
    c.restore();
  }
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
  const core=c.createRadialGradient(cx,cy,0,cx,cy,warp*.37);
  core.addColorStop(0,`rgba(230,252,255,${(1-iris)*.83})`);
  core.addColorStop(.21,`rgba(72,214,245,${(1-iris)*.5})`);core.addColorStop(1,"transparent");
  c.fillStyle=core;c.fillRect(cx-warp*.4,cy-warp*.4,warp*.8,warp*.8);
  // Aperture becomes a graphic iris, then closes to a pupil and hands off to the page.
  if(iris>0) {
    const r=Math.max(w,h)*(.16+iris*.53), eye=c.createRadialGradient(cx,cy,r*.08,cx,cy,r);
    eye.addColorStop(0,"#00050a");eye.addColorStop(.16,"#00050a");
    eye.addColorStop(.28,"#0b7e98");eye.addColorStop(.43,"#62d4d8");
    eye.addColorStop(.65,"#173c67");eye.addColorStop(.95,"#020612");
    c.globalAlpha=iris;c.fillStyle=eye;c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.fill();
    c.strokeStyle="#e0f7ff";
    for(let k=0;k<90;k++) {const a=k*2.39996, inner=r*(.2+random(k+999)*.14),outer=r*(.47+random(k+888)*.27);
      c.globalAlpha=iris*.25;c.lineWidth=Math.max(.4,r*.002);c.beginPath();c.moveTo(cx+Math.cos(a)*inner,cy+Math.sin(a)*inner);c.lineTo(cx+Math.cos(a+.07)*outer,cy+Math.sin(a+.07)*outer);c.stroke(); }
    c.globalAlpha=iris;c.fillStyle="#00040a";c.beginPath();c.arc(cx,cy,r*(.18+ease(clamp((elapsed-9800)/1100))*.92),0,Math.PI*2);c.fill();
    c.globalAlpha=1;
  }
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
