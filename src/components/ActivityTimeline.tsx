"use client";
import { useEffect, useRef, useState } from "react";
import timeline from "../data/activity-timeline.json";
import "./activity-timeline.css";

type Event = (typeof timeline.events)[number];
const september = (events: Event[]) => events.filter(event => event.date.startsWith("2026-09-"));
const duration = 54000;
const ms = (d: string) => Date.parse(`${d}T00:00:00Z`);

const month = (date: number) => new Date(date).toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const ease = (x: number) => 1 - (1 - x) ** 3;

type Point = { x: number; y: number; index: number };
export function ActivityTimeline() {
  const [events, setEvents] = useState<Event[]>(september(timeline.events));
  const [checkedAt, setCheckedAt] = useState(timeline.asOf);
  const [stale, setStale] = useState(true);
  const [ready, setReady] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const points = useRef<Point[]>([]);
  const [replay, setReplay] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    const refresh = () => fetch("/api/activity-timeline").then(r => r.ok ? r.json() : Promise.reject()).then((result: {events:Event[];checkedAt:string;stale:boolean}) => {
      if (active && Array.isArray(result.events)) {const next=september(result.events);setEvents(prev => JSON.stringify(prev) === JSON.stringify(next) ? prev : next);setCheckedAt(result.checkedAt);setStale(result.stale);setReady(true)}
    }).catch(() => {if (active) {setStale(true);setReady(true)}});
    refresh(); const timer = setInterval(refresh, 60_000);
    return () => {active = false;clearInterval(timer)};
  }, []);
  useEffect(() => {
    if (!ready || !events.length) return;
    const c = canvas.current, ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    let frame = 0, start = 0, pausedAt = 0, visible = false, done = false;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const endTime = ms(events[events.length-1].date);
    const draw = (progress: number) => {
      const w = c.clientWidth, h = c.clientHeight, dpr = Math.min(devicePixelRatio, 4);
      if (!w || !h) return;
      if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
        c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#0d0a0f"; ctx.fillRect(0, 0, w, h);
      const scrub = clamp(progress/.87,0,1);
      const cursor = 1 + scrub*(events.length-1);
      const arrive = (i:number)=>clamp((cursor-i)*1.2,0,1);
      // Keep every drawing at a fixed pixel origin; shaking the whole canvas blurs the combine.
      const unit = Math.max(7, w / 140), pad = Math.max(18, w * .04), base = h * .585;
      const left = pad, right = w - pad;
      // The close grid is a visual texture. Event position follows event order, not elapsed time.
      ctx.strokeStyle = "rgba(123,99,119,.16)"; ctx.lineWidth = 1;
      const plotTop=h*.32, plotBottom=h*.83;
      ctx.beginPath(); for (let x = left; x < right; x += unit) { ctx.moveTo(x + .5, plotTop); ctx.lineTo(x + .5, plotBottom) }
      for (let y = plotTop; y < plotBottom; y += unit) { ctx.moveTo(left, y + .5); ctx.lineTo(right, y + .5) } ctx.stroke();
      const vignette = ctx.createRadialGradient(w / 2, base, w * .12, w / 2, base, w * .69);
      vignette.addColorStop(0, "#100d1300"); vignette.addColorStop(1, "#03020599");
      ctx.fillStyle = vignette; ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "#e4e1e5"; ctx.textAlign = "left";
      ctx.font = `${Math.max(16, w * .023)}px Arial, sans-serif`;
      if (progress < .87) ctx.fillText("GitHub activity, one merge at a time", left, h * .105);
      const dateIndex=Math.max(0,Math.floor(cursor-1));
      const dateFrac=clamp(cursor-1-dateIndex,0,1);
      const currentDate=progress>=.87?endTime:ms(events[dateIndex].date)+(ms(events[Math.min(dateIndex+1,events.length-1)].date)-ms(events[dateIndex].date))*dateFrac;
      if (progress < .87) {
        ctx.font = `700 ${Math.max(19, w * .032)}px Arial, sans-serif`;
        ctx.fillText(month(currentDate), left, h*.205);
        ctx.font = `${Math.max(10, w * .012)}px Arial, sans-serif`;
        ctx.fillStyle = "#aaa1a9";
        ctx.fillText("PUBLIC MERGED PULL REQUESTS", left, h*.265);
      }
      ctx.save();ctx.beginPath();ctx.rect(left,plotTop,right-left,plotBottom-plotTop);ctx.clip();
      ctx.fillStyle = "#9d899a"; ctx.fillRect(left, base - 1, right - left, 2);
      for (let x = left; x < right; x += unit * 2) { ctx.fillStyle = "#c9b5c9"; ctx.fillRect(x, base - 2, 2, 4) }
      const finale = ease(clamp((progress - .87) / .13, 0, 1));
      const pitch = Math.min(w * .058, 55), endX = w * .70;
      const dayCounts = new Map<string, number>();
      for (const event of events) dayCounts.set(event.date, (dayCounts.get(event.date) ?? 0) + 1);
      const finalPitch = (right - left - 12) / Math.max(1,events.length - 1);
      const activeDates=[...new Set(events.map(e=>e.date))].sort();
      const finalePoints = new Map<string, { x: number; green: number; red: number }>();
      points.current = [];
      events.forEach((e, i) => {
        if (i >= cursor && progress < .87) return;
        const xScrub = endX + (i - cursor + 1) * pitch;
        const xFinal = left+12+(activeDates.indexOf(e.date)+.5)*(right-left-24)/activeDates.length;
        const dayBucket = finalePoints.get(e.date) ?? {x:xFinal,green:0,red:0};
        if (e.kind === "merged_fix") dayBucket.red++; else dayBucket.green++;
        finalePoints.set(e.date,dayBucket);
        const x = xScrub * (1 - finale) + xFinal * finale;
        if (x < left - 15 || x > right + 15) return;
        const fix = e.kind === "merged_fix", color = fix ? "#f0716a" : "#3ecf8e";
        const sameDay = dayCounts.get(e.date) ?? 1;
        const height = h * Math.min(.175,.075 + Math.log2(1 + sameDay)*.034 + (i%4)*.007);
        const count = Math.max(5, Math.floor(height / unit));
        const block = Math.max(2, Math.min(unit * .78, finalPitch * .47, 10));
        const birth=cursor-i;
        const arrival=progress>=.87 ? 1 : arrive(i);
        ctx.globalAlpha = (1-finale)*arrival;
        ctx.fillStyle = color; ctx.shadowBlur = 0;
        for (let n = 0; n < count; n++) {
          const y = fix ? base + unit * (.75 + n) : base - unit * (1.3 + n);
          if (n/count < arrival) ctx.fillRect(Math.round(x / unit) * unit - block / 2, y, block, Math.max(3, unit * .69));
        }
        ctx.shadowBlur = 0; ctx.globalAlpha = 1; points.current.push({ x, y: base, index: i });
        if (birth >= 0 && birth < 1.4 && progress < .87 && !reduced) {
          const age=birth/1.4, radius=unit*1.2+ease(age)*h*.23;
          const alpha=Math.sin(Math.PI*Math.min(1,age*1.18))*(1-age*.35);
          ctx.globalAlpha=alpha*.76;ctx.fillStyle=color;
          ctx.shadowBlur=0;
          // The wave starts at the bar's baseline and propagates out through the grid.
          for(let k=0;k<210;k++){
            const a=k*2.399963,scatter=unit*(.25+((k*17)%11)/15);
            const r=radius+Math.sin(k*17.31+age*24)*scatter;
            const px=Math.round((x+Math.cos(a)*r)/unit)*unit;
            const py=Math.round((base+Math.sin(a)*r)/unit)*unit;
            ctx.fillRect(px,py,Math.max(2,unit*.33),Math.max(2,unit*.33));
          }
          ctx.globalAlpha=alpha*.17;
          ctx.strokeStyle=color;ctx.lineWidth=1.5;
          ctx.beginPath();ctx.ellipse(x,base,radius,radius*.75,0,0,Math.PI*2);ctx.stroke();
          ctx.globalAlpha=1;ctx.shadowBlur=0;
        }
      });
      if (finale > 0) {
        ctx.globalAlpha = finale;
        for (const bucket of finalePoints.values()) {
          const x = Math.round(bucket.x), block = Math.max(2,Math.min(unit*.72,w*.012));
          for (const [kind,amount] of [["green",bucket.green],["red",bucket.red]] as const) {
            if (!amount) continue;
            const color=kind === "green" ? "#3ecf8e" : "#f0716a";
            ctx.fillStyle=color;ctx.shadowBlur=0;
            const height=Math.min(h*.18,h*(.07+Math.log2(amount+1)*.045));
            const count=Math.max(4,Math.round(height/unit));
            for(let j=0;j<count;j++)ctx.fillRect(Math.round(x-block/2),Math.round(kind==="green"?base-(j+1)*unit:base+(j+.4)*unit),Math.max(2,Math.round(block)),Math.max(2,Math.round(unit*.7)));
          }
        }
        ctx.shadowBlur=0;
        ctx.textAlign="left";ctx.globalAlpha=1;
      }
      ctx.restore();
      ctx.font = `${Math.max(10, w * .011)}px Arial, sans-serif`; ctx.textAlign = "left";
      ctx.fillStyle = "#3ecf8e"; ctx.fillRect(left, h * .925, 9, 9);
      ctx.fillStyle = "#c9c1c7"; ctx.fillText("MERGED PR", left + 16, h * .925 + 9);
      ctx.fillStyle = "#f0716a"; ctx.fillRect(left + Math.min(130, w * .32), h * .925, 9, 9);
      ctx.fillStyle = "#c9c1c7"; ctx.fillText("FIX / TEST PR", left + Math.min(130, w * .32) + 16, h * .925 + 9);
      if (progress >= .88) {
        const opacity = ease(clamp((progress-.88)/.08,0,1));ctx.globalAlpha = opacity;
        const repoCount=new Set(events.map(e=>e.repo)).size;
        ctx.textAlign="left";ctx.fillStyle="#e4e0e5";
        ctx.font=`600 ${Math.max(16,w*.034)}px Arial, sans-serif`;
        ctx.fillText("September, at a glance",left,h*.105);
        ctx.font=`700 ${Math.max(27,w*.075)}px Arial, sans-serif`;
        ctx.fillText(String(events.length),left,h*.215);
        ctx.font=`${Math.max(10,w*.012)}px Arial, sans-serif`;ctx.fillStyle="#aaa1a9";
        ctx.fillText("PUBLIC MERGED PRS",left+Math.max(45,w*.13),h*.185);
        ctx.fillText(`${activeDates.length} ACTIVE DAYS  ·  ${repoCount} REPOS`,left+Math.max(45,w*.13),h*.235);
        ctx.globalAlpha=1;
      }

    };
    (window as Window & {__activityDraw?: (progress:number)=>void}).__activityDraw = draw;
    const tick = (now: number) => {
      if ((window as Window & {__activityManual?: boolean}).__activityManual) return;
      if (!visible) return;
      if (!start) start = now - pausedAt;
      const progress = reduced ? 1 : Math.min(1, (now - start) / duration);
      draw(progress);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else { done = true; setPlaying(false) }
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        visible = true;
        if (!done) { start = 0; frame = requestAnimationFrame(tick); setPlaying(true) }
      } else {
        visible = false; if (start) pausedAt = performance.now() - start;
        cancelAnimationFrame(frame);
      }
    }, { rootMargin: "40px" });
    observer.observe(c); if (reduced) draw(1);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); delete (window as Window & {__activityDraw?: (progress:number)=>void}).__activityDraw };
  }, [replay, events, ready]);
  const inspect = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect(), x = e.clientX - bounds.left;
    const nearest = points.current.reduce<Point | null>((p, q) => !p || Math.abs(q.x - x) < Math.abs(p.x - x) ? q : p, null);
    if (nearest) setSelected(nearest.index);
  };
  return <section className="activity-timeline">
    {!ready && <p className="activity-timeline-loading">Checking current public GitHub activity...</p>}
    <canvas ref={canvas} onClick={inspect} aria-label={`Animated event-order view of ${events.length} public merged pull requests in September 2026`} role="img" />
    <div className="activity-timeline-foot"><span>SEPTEMBER 2026 · REPLAY THE MERGES</span><button type="button" onClick={() => { setSelected(null); setReplay(n => n + 1) }} disabled={playing}>↻ REPLAY</button></div>
    {selected !== null && <p><a href={events[selected].url} target="_blank" rel="noreferrer">{events[selected].date} · {events[selected].repo} · {events[selected].title} ↗</a></p>}
    <small>Source: <a href="https://github.com/pulls?q=is%3Apr+author%3Acharan-rathore+is%3Amerged+merged%3A2026-09-01..2026-09-30" target="_blank" rel="noreferrer">GitHub public merged PRs in September 2026</a>, checked {new Date(checkedAt).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"})}{stale ? " (last known result; live check unavailable)" : ""}. Blocks follow event order, not a date-spaced scale. Red means a merged PR classified as a fix or test by its title. Pushes and CI results are not included.</small>
  </section>;
}
