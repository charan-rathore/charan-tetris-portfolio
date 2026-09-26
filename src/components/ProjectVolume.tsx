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
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !initialized) { initialized = true; initialize(); }
      if (visible) start?.();
    }, { rootMargin: "160px" });
    observer.observe(root);
    const initialize = () => import("three").then(({ AdditiveBlending, BufferAttribute, BufferGeometry, Color, Group, Line, LineBasicMaterial, PerspectiveCamera, Points, PointsMaterial, Scene, WebGLRenderer }) => {
      if (removed) return;
      let renderer: InstanceType<typeof WebGLRenderer>;
      try { renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" }); }
      catch { root.dataset.fallback = "true"; return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      root.appendChild(renderer.domElement);
      const scene = new Scene();
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
      for (let i = 0; i < count; i++) {
        const t = i / count;
        const a = t * Math.PI * (index % 2 ? 13 : 16) + rand(i + 3) * .26;
        const radius = .6 + 2.9 * Math.sqrt(t) + (rand(i + 17) - .5) * .85;
        const ribbon = Math.sin(a * (index % 3 + 2)) * .34;
        const arm = i % 4;
        const armAngle = a * .25 + arm * Math.PI / 2;
        positions[i * 3] = Math.cos(armAngle) * radius + (rand(i + 29) - .5) * .32;
        positions[i * 3 + 1] = Math.sin(armAngle) * radius * .62 + ribbon + (rand(i + 31) - .5) * .26;
        positions[i * 3 + 2] = Math.sin(a * .48) * 1.4 + (rand(i + 47) - .5) * 1.2;
        const c = accent.clone().lerp(new Color(0xe2f7ff), rand(i + 59) * .65);
        pointColors[i * 3] = c.r; pointColors[i * 3 + 1] = c.g; pointColors[i * 3 + 2] = c.b;
      }
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new BufferAttribute(positions, 3));
      geometry.setAttribute("color", new BufferAttribute(pointColors, 3));
      const material = new PointsMaterial({ size: .085, vertexColors: true, transparent: true, opacity: 1, depthWrite: false, blending: AdditiveBlending, sizeAttenuation: true });
      sculpture.add(new Points(geometry, material));
      const strands: { geometry: InstanceType<typeof BufferGeometry>; material: InstanceType<typeof LineBasicMaterial> }[] = [];
      for (let arm = 0; arm < 4; arm++) {
        const path: number[] = [];
        for (let j = 0; j <= 100; j++) {
          const t = j / 100, a = t * Math.PI * (index % 2 ? 13 : 16) + arm * Math.PI / 2;
          const radius = .6 + 2.9 * Math.sqrt(t);
          path.push(Math.cos(a * .25) * radius, Math.sin(a * .25) * radius * .62 + Math.sin(a * (index % 3 + 2)) * .34, Math.sin(a * .48) * 1.4);
        }
        const lineGeo = new BufferGeometry();lineGeo.setAttribute("position",new BufferAttribute(new Float32Array(path),3));
        const lineMat = new LineBasicMaterial({color:accent,transparent:true,opacity:.26});
        sculpture.add(new Line(lineGeo,lineMat));strands.push({geometry:lineGeo,material:lineMat});
      }
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
        if (!visible || document.hidden || paused || now - last < 33) return;
        elapsed += Math.min(now - last || 33, 100);
        last = now;
        sculpture.rotation.y = elapsed * .00012;
        sculpture.rotation.z = Math.sin(elapsed * .00013) * .12;
        renderer.render(scene, camera);
      };
      start = () => { if (!frame) frame = requestAnimationFrame(animate); };
      if (visible) start();
      cleanup = () => { cancelAnimationFrame(frame); ro.disconnect(); geometry.dispose(); material.dispose(); strands.forEach(s=>{s.geometry.dispose();s.material.dispose();}); renderer.dispose(); renderer.domElement.remove(); };
    }).catch(() => { root.dataset.fallback = "true"; });
    let cleanup: (() => void) | undefined;
    return () => { removed = true; observer.disconnect(); cleanup?.(); };
  }, [index, paused]);
  return <div ref={host} className="project-volume" role="img" aria-label={`Animated volumetric point-cloud artwork for ${label}`} />;
}
