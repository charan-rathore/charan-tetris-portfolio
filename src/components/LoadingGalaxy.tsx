"use client";

import { useEffect, useRef, useState } from "react";

const LENGTH = 7600;
const nebula = typeof Image !== "undefined" ? new Image() : null;
if (nebula) nebula.src = "/systris-galaxy-original.webp";
const random = (n: number) => { const x = Math.sin(n * 127.1 + 78.233) * 43758.5453; return x - Math.floor(x); };
const ease = (n: number) => n * n * (3 - 2 * n);
const clamp = (n: number) => Math.max(0, Math.min(1, n));

function sound(ctx: AudioContext) {
  const output = ctx.createGain(); output.gain.value = .29; output.connect(ctx.destination);
  const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = random(i + 1) * 2 - 1;
  const at = ctx.currentTime;
  function rush(start: number, length: number, from: number, to: number, peak: number) {
    const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true;
    const filter = ctx.createBiquadFilter(); filter.type = "lowpass";
    filter.frequency.setValueAtTime(from, at + start);
    filter.frequency.exponentialRampToValueAtTime(to, at + start + length);
    const gain = ctx.createGain(); gain.gain.setValueAtTime(.001, at + start);
    gain.gain.exponentialRampToValueAtTime(peak, at + start + length * .52);
    gain.gain.exponentialRampToValueAtTime(.001, at + start + length);
    src.connect(filter).connect(gain).connect(output); src.start(at + start); src.stop(at + start + length + .03);
  }
  rush(.15, 3.5, 150, 4200, .22); rush(3.3, 2.7, 260, 6800, .28); rush(5.5, 1.5, 2400, 120, .17);
  for (const [freq, start, length, volume] of [[44,.1,7.1,.16],[82,2.5,3.8,.055],[190,5.7,1.5,.075]] as const) {
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = "sine"; osc.frequency.setValueAtTime(freq, at + start);
    osc.frequency.exponentialRampToValueAtTime(freq * .62, at + start + length);
    gain.gain.setValueAtTime(.001, at + start);
    gain.gain.exponentialRampToValueAtTime(volume, at + start + .45);
    gain.gain.exponentialRampToValueAtTime(.001, at + start + length);
    osc.connect(gain).connect(output); osc.start(at + start); osc.stop(at + start + length + .02);
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
  const p = clamp(elapsed/LENGTH), cx = w*.5, cy = h*.49;
  const travel = p < .76 ? ease(p/.76) : 1;
  const iris = ease(clamp((p-.64)/.27));
  const warp = Math.min(w,h) * (.33 + travel * 1.45);
  const bg = c.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*.8);
  bg.addColorStop(0,"#030710"); bg.addColorStop(.29,"#030710"); bg.addColorStop(.68,"#030710"); bg.addColorStop(1,"#020409");
  c.fillStyle=bg;c.fillRect(0,0,w,h);
  if(nebula?.complete && nebula.naturalWidth) {
    c.save();c.globalAlpha=(1-iris)*.88;c.translate(cx,cy);c.rotate(travel*.29);
    const size=warp*2.45;c.drawImage(nebula,-size/2,-size/2,size,size);c.restore();
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
  // A small original line-art traveler falls away from the viewer as the
  // galaxy comes forward. Silhouette is drawn with paths, never video pixels.
  if (p < .62) {
    const fall=ease(p/.62), scale=(w<600?1:.85)*(1-fall*.7);
    const fx=cx+w*(.19-.14*fall),fy=cy-h*(.17-.19*fall);
    c.save();c.translate(fx,fy);c.rotate(-.27+fall*.7);c.scale(scale,scale);
    c.lineCap="round";c.lineJoin="round";c.shadowBlur=0;
    c.fillStyle=`rgba(3,10,21,${1-fall*.8})`;
    c.strokeStyle=`rgba(174,233,244,${(1-fall)*.88})`;c.lineWidth=1.6;
    // Small drifting human silhouette: face shield, jacket, reaching arms.
    c.beginPath();c.ellipse(0,-28,8,10,-.15,0,Math.PI*2);c.fill();c.stroke();
    c.beginPath();c.moveTo(-12,-16);c.quadraticCurveTo(0,-23,11,-15);c.lineTo(12,11);
    c.quadraticCurveTo(5,21,-11,13);c.closePath();c.fill();c.stroke();
    c.beginPath();c.moveTo(-10,-12);c.lineTo(-25,-5);c.lineTo(-34,14);c.lineTo(-31,18);
    c.lineTo(-19,3);c.lineTo(-12,2);c.moveTo(10,-11);c.lineTo(25,-1);
    c.lineTo(35,14);c.lineTo(30,17);c.lineTo(17,6);c.lineTo(11,3);c.stroke();
    c.lineWidth=5;c.strokeStyle=`rgba(5,16,30,${1-fall*.8})`;
    c.beginPath();c.moveTo(-6,14);c.lineTo(-18,35);c.lineTo(-28,50);
    c.moveTo(7,14);c.lineTo(17,36);c.lineTo(29,51);c.stroke();
    c.lineWidth=1.3;c.strokeStyle=`rgba(174,233,244,${(1-fall)*.72})`;
    c.beginPath();c.moveTo(-6,14);c.lineTo(-18,35);c.lineTo(-28,50);
    c.moveTo(7,14);c.lineTo(17,36);c.lineTo(29,51);c.stroke();
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
    c.globalAlpha=iris;c.fillStyle="#00040a";c.beginPath();c.arc(cx,cy,r*(.18+ease(clamp((p-.83)/.17))*.92),0,Math.PI*2);c.fill();
    c.globalAlpha=1;
  }
}

export function LoadingGalaxy() {
  const [phase,setPhase]=useState<"gate"|"playing"|"leaving"|"done">("gate");
  const canvas=useRef<HTMLCanvasElement>(null);
  const audio=useRef<AudioContext|null>(null);
  useEffect(()=>{if(matchMedia("(prefers-reduced-motion: reduce)").matches) { const id=requestAnimationFrame(()=>setPhase("done")); return ()=>cancelAnimationFrame(id); }},[]);
  useEffect(()=>{
    if(phase!=="playing")return;
    const element=canvas.current;if(!element)return;
    let raf=0;const start=performance.now();
    const draw=(now:number)=>{if((window as Window & {__introFreeze?:boolean}).__introFreeze)return;const elapsed=now-start;paint(element,elapsed);if(elapsed<LENGTH)raf=requestAnimationFrame(draw);else setPhase("leaving")};
    raf=requestAnimationFrame(draw);
    const resize=()=>paint(element,performance.now()-start);window.addEventListener("resize",resize);
    (window as Window & {__introDraw?:(elapsed:number)=>void}).__introDraw=(elapsed)=>paint(element,elapsed);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);delete (window as Window & {__introDraw?:(elapsed:number)=>void}).__introDraw};
  },[phase]);
  useEffect(()=>{if(phase!=="leaving")return;const t=setTimeout(()=>setPhase("done"),650);return()=>clearTimeout(t)},[phase]);
  useEffect(()=>()=>{void audio.current?.close()},[]);
  if(phase==="done")return null;
  const begin=()=>{try {const context=new AudioContext();audio.current=context; sound(context);void context.resume().catch(()=>{});}catch{}setPhase("playing")};
  return <div className={`loading-galaxy space-intro ${phase==="leaving"?"is-leaving":""}`} role="dialog" aria-modal="true" aria-label="Enter the Systris portfolio">
    <canvas ref={canvas} aria-hidden="true" />
    {phase==="gate"?<div className="space-gate"><span>SYSTRIS / THE WORK GALAXY</span><strong>Fall into the work.</strong><p>A brief journey through space, with sound.</p><button type="button" onClick={begin}>TAP TO ENTER ↗</button><button className="space-gate-skip" type="button" onClick={()=>setPhase("done")}>SKIP INTRO</button></div>:<><div className="space-caption">SYSTRIS <span>·</span> FOLLOW THE THREAD</div><button className="loading-skip" type="button" onClick={()=>{void audio.current?.close();audio.current=null;setPhase("leaving")}}>SKIP INTRO ↗</button></>}
  </div>;
}
