"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/** A tetromino bridge: separate inputs lock into a shared connection. */
export function BridgeScene({ color }: { color: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); }
    catch { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
    camera.position.set(9, 9, 15); camera.lookAt(0, 0, 0);
    scene.add(new THREE.AmbientLight(0xffffff, 2));
    const light = new THREE.DirectionalLight(0xffffff, 4); light.position.set(3, 8, 5); scene.add(light);
    const root = new THREE.Group(); scene.add(root);
    const geometry = new THREE.BoxGeometry(.92, .92, .92);
    const material = new THREE.MeshStandardMaterial({ color, roughness: .35, metalness: .32 });
    const dim = new THREE.MeshStandardMaterial({ color: "#243449", roughness: .6, metalness: .2 });
    const positions = [[-4,0],[-3,0],[-3,1],[-2,1],[-1,1],[0,1],[0,2],[1,1],[2,1],[3,1],[3,0],[4,0]];
    const blocks = positions.map(([x,y], i) => { const m = new THREE.Mesh(geometry, i < 4 || i > 7 ? dim : material); m.position.set(x,y-1,0); root.add(m); return m; });
    const grid = new THREE.GridHelper(14, 14, 0x36526b, 0x172333); grid.position.y = -1.55; scene.add(grid);
    const resize = () => { const {width,height} = el.getBoundingClientRect(); renderer.setSize(width,height); camera.aspect = width/Math.max(height,1); camera.updateProjectionMatrix(); };
    const observer = new ResizeObserver(resize); observer.observe(el); resize();
    let visible = true, frame = 0, previous = 0;
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }); visibility.observe(el);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const began = performance.now();
    const render = (now: number) => {
      frame = requestAnimationFrame(render);
      if (!visible || document.hidden || now - previous < 32) return;
      previous = now;
      const elapsed = (now-began)/1000;
      blocks.forEach((b,i) => { const fall = reduced.matches ? 0 : Math.max(0, 1 - Math.max(0, elapsed - i*.07)/.75); b.position.y = positions[i][1]-1 + fall*fall*7; });
      root.rotation.y = reduced.matches ? -.12 : -.12 + Math.sin(elapsed*.35)*.08;
      renderer.render(scene,camera);
    };
    frame = requestAnimationFrame(render);
    const lost = (event: Event) => { event.preventDefault(); el.dataset.failed = "true"; cancelAnimationFrame(frame); };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); visibility.disconnect(); renderer.domElement.removeEventListener("webglcontextlost",lost); geometry.dispose(); material.dispose(); dim.dispose(); grid.geometry.dispose(); (grid.material as THREE.Material).dispose(); renderer.dispose(); renderer.domElement.remove(); };
  }, [color]);
  return <div className="bridge-render" ref={host} aria-hidden="true" />;
}
