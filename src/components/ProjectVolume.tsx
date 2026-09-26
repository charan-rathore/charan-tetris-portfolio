"use client";

import { useEffect, useRef } from "react";

/** A deterministic, lightweight point-cloud sculpture for each project. */
export function ProjectVolume({ index, label, paused }: { index: number; label: string; paused: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = host.current;
    if (!root || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let removed = false;
    let visible = false;
    let initialized = false;
    let start: (() => void) | undefined;
    let stop: (() => void) | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !initialized) { initialized = true; initialize(); }
      if (visible) start?.();
      else stop?.();
    }, { rootMargin: "160px" });
    observer.observe(root);
    const initialize = () => import("three").then(({ AdditiveBlending, BufferAttribute, BufferGeometry, Color, Group, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, PlaneGeometry, DoubleSide, PerspectiveCamera, Points, PointsMaterial, Scene, WebGLRenderer }) => {
      if (removed) return;
      let renderer: InstanceType<typeof WebGLRenderer>;
      try { renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" }); }
      catch { root.dataset.fallback = "true"; return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      root.appendChild(renderer.domElement);
      const scene = new Scene();
      scene.background = new Color(0x020407);
      const camera = new PerspectiveCamera(46, 1, .1, 100);
      camera.position.set(0, 0, 10);
      const sculpture = new Group();
      scene.add(sculpture);
      const colors = [0x52e6ff,0xb978ff,0xffd166,0x68e5ab,0xf69ab0,0x8dbaf8,0xffad7e];
      const accent = new Color(colors[index % colors.length]);
      const count = innerWidth <= 600 ? 650 : 1200;
      const positions = new Float32Array(count * 3);
      const pointColors = new Float32Array(count * 3);
      const rand = (n: number) => { const x = Math.sin(n * 127.1 + index * 41.7) * 43758.5453; return x - Math.floor(x); };
      // Seven editorial reconstructions: each subject gets its own silhouette, with the same
      // layered particles / depth / moving observation language. Not measured 4D data.
      const shape = (t: number): [number, number, number] => {
        switch (index) {
          case 0: { // RAG: passages stream through a retrieval aperture toward an answer
            const lane = Math.floor(t * 5), u = (t * 5) % 1;
            return [(u - .5) * 6.5, (lane - 2) * .72 + Math.sin(u * 8 + lane) * .2, Math.sin(u * 5 + lane) * .48];
          }
          case 1: { // memoRABLE: six source-linked memory planes
            const plane = Math.floor(t * 6), u = (t * 6) % 1;
            return [(plane % 3 - 1) * 2.1 + (u - .5) * 1.45, (Math.floor(plane / 3) - .5) * 1.6 + Math.sin(u * 8) * .13, (u - .5) * 1.3 + plane * .14];
          }
          case 2: { // ThermoSense: forecast and measured-temperature waves
            const u = (t * 4) % 1, band = Math.floor(t * 4);
            return [(u - .5) * 7.5, Math.sin(u * 12 + band * .34) * (.55 + band * .14) + (band - 1.5) * .55, (band - 1.5) * .58];
          }
          case 3: { // Project management: a spatial task board
            const card = Math.floor(t * 12), u = (t * 12) % 1;
            return [(card % 4 - 1.5) * 1.85 + (u - .5) * 1.1, (Math.floor(card / 4) - 1) * 1.18 + Math.sin(u * 14) * .15, (card % 3 - 1) * .55];
          }
          case 4: { // Finance: branching signal / confidence trajectories
            const arm = Math.floor(t * 5), u = (t * 5) % 1;
            return [(u - .5) * 7, Math.sin(u * 8 + arm) * (.32 + arm * .12) + (arm - 2) * .18, Math.cos(u * 11 + arm) * .65];
          }
          case 5: { // Drone conservation: quadrotor scan over a field
            const part = Math.floor(t * 5), u = (t * 5) % 1, angle = part * Math.PI / 2;
            return part === 4 ? [(u - .5) * 7, Math.sin(u * 16) * .27 - 1.8, Math.sin(u * 24) * .27] : [Math.cos(angle) * (.4 + 2.3 * u), Math.sin(angle) * (.4 + 1.7 * u), Math.sin(u * 8) * .22 + .4];
          }
          default: { // CAD: threaded bolt and dimensional rings
            const u = t * 17 * Math.PI * 2, radius = .6 + Math.sin(u * .32) * .13;
            return [(t - .5) * 7, Math.cos(u) * radius, Math.sin(u) * radius];
          }
        }
      };
      for (let i = 0; i < count; i++) {
        const t = i / count, [x,y,z] = shape(t);
        positions[i * 3] = x + (rand(i + 29) - .5) * .42;
        positions[i * 3 + 1] = y + (rand(i + 31) - .5) * .42;
        const slice = Math.floor(rand(i + 13) * (innerWidth <= 600 ? 10 : 24));
        positions[i * 3 + 2] = z + (slice / (innerWidth <= 600 ? 10 : 24) - .5) * 2.4 + (rand(i + 47) - .5) * .24;
        const c = accent.clone().lerp(new Color(0xe2f7ff), rand(i + 59) * .65);
        pointColors[i * 3] = c.r; pointColors[i * 3 + 1] = c.g; pointColors[i * 3 + 2] = c.b;
      }
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new BufferAttribute(positions, 3));
      geometry.setAttribute("color", new BufferAttribute(pointColors, 3));
      const material = new PointsMaterial({ size: .085, vertexColors: true, transparent: true, opacity: 1, depthWrite: false, blending: AdditiveBlending, sizeAttenuation: true });
      sculpture.add(new Points(geometry, material));
      const strands: { geometry: InstanceType<typeof BufferGeometry>; material: InstanceType<typeof LineBasicMaterial> }[] = [];
      // Ghost frames track earlier slices along the local time/depth axis.
      for(let ghost=0;ghost<(innerWidth<=600?8:18);ghost++){
        const path:number[]=[];
        for(let j=0;j<=54;j++){
          const [x,y,z]=shape((j/54+ghost*.025)%1);
          path.push(x+(ghost-9)*.075,y+Math.sin(ghost*.6)*.025,z+(ghost-9)*.11);
        }
        const g=new BufferGeometry();g.setAttribute("position",new BufferAttribute(new Float32Array(path),3));
        const m=new LineBasicMaterial({color:accent,transparent:true,opacity:.035+ghost*.003});
        sculpture.add(new Line(g,m));strands.push({geometry:g,material:m});
      }
      for (let arm = 0; arm < 4; arm++) {
        const path: number[] = [];
        for (let j = 0; j <= 100; j++) {
          const [x,y,z] = shape((j / 100 + arm * .247) % 1);
          path.push(x,y,z);
        }
        const lineGeo = new BufferGeometry();lineGeo.setAttribute("position",new BufferAttribute(new Float32Array(path),3));
        const lineMat = new LineBasicMaterial({color:accent,transparent:true,opacity:.26});
        sculpture.add(new Line(lineGeo,lineMat));strands.push({geometry:lineGeo,material:lineMat});
      }
      // A translucent image/time slice crosses the frozen subject trail. A few pale
      // perspective rays converge toward a virtual camera point, as in a reconstruction view.
      const planeGeo = new PlaneGeometry(1.95, 3.8);
      const planeMat = new MeshBasicMaterial({color:accent,transparent:true,opacity:.12,side:DoubleSide,depthWrite:false});
      const timePlane = new Mesh(planeGeo,planeMat); timePlane.rotation.y=.19;scene.add(timePlane);
      const rays:number[]=[];
      for(let k=0;k<6;k++){const x=-2.8+k*1.12;rays.push(0,-3.4,4.2,x,.9,-.3)}
      const rayGeo=new BufferGeometry();rayGeo.setAttribute("position",new BufferAttribute(new Float32Array(rays),3));
      const rayMat=new LineBasicMaterial({color:0xc9e6ed,transparent:true,opacity:.09});scene.add(new Line(rayGeo,rayMat));
      const resize = () => {
        const w = root.clientWidth, h = root.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h; camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      };
      const ro = new ResizeObserver(resize); ro.observe(root); resize();
      let frame = 0, last = 0, elapsed = 0;
      const animate = (now: number) => {
        frame = requestAnimationFrame(animate);
        if (document.hidden || paused || now - last < 33) return;
        elapsed += Math.min(now - last || 33, 100);
        last = now;
        const cycle=(elapsed % 6600)/6600;
        timePlane.position.set(-3.45+cycle*6.9,0,.5);
        planeMat.opacity=.08+.12*Math.sin(cycle*Math.PI);
        sculpture.rotation.y = Math.sin(elapsed*.00018)*.11;
        sculpture.rotation.z = Math.sin(elapsed * .00013) * .12;
        renderer.render(scene, camera);
      };
      start = () => { if (!frame) frame = requestAnimationFrame(animate); };
      stop = () => { cancelAnimationFrame(frame); frame = 0; };
      if (visible) start();
      cleanup = () => { cancelAnimationFrame(frame); ro.disconnect(); geometry.dispose(); material.dispose(); planeGeo.dispose(); planeMat.dispose();rayGeo.dispose();rayMat.dispose(); strands.forEach(s=>{s.geometry.dispose();s.material.dispose();}); renderer.dispose(); renderer.domElement.remove(); };
    }).catch(() => { root.dataset.fallback = "true"; });
    let cleanup: (() => void) | undefined;
    return () => { removed = true; observer.disconnect(); cleanup?.(); };
  }, [index, paused]);
  return <div ref={host} className="project-volume" role="img" aria-label={`Animated volumetric point-cloud artwork for ${label}`} />;
}
