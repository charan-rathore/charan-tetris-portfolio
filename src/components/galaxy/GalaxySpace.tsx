"use client";

import { useEffect, useRef } from "react";
import { galaxyEdges, galaxyNodes } from "../../data/galaxy";

export function GalaxySpace({ speed, glow, orbits, paused, focus }: { speed: number; glow: number; orbits: boolean; paused: boolean; focus: string }) {
  const host = useRef<HTMLDivElement>(null);
  const config = useRef({ speed, glow, orbits, paused, focus });
  useEffect(() => { config.current = { speed, glow, orbits, paused, focus }; }, [speed, glow, orbits, paused, focus]);
  useEffect(() => {
    const root = host.current;
    if (!root || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let disposed = false, cleanup: (() => void) | undefined;
    import("three").then(async ({ Scene, PerspectiveCamera, WebGLRenderer, Group, Color, BufferGeometry, BufferAttribute, PointsMaterial, Points, LineBasicMaterial, LineLoop, LineSegments, AdditiveBlending, Vector3 }) => {
      const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
      if (disposed) return;
      let renderer: InstanceType<typeof WebGLRenderer>;
      try { renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" }); }
      catch { root.dataset.fallback = "true"; return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.setAttribute("aria-label", "3D work galaxy. Drag to orbit, two fingers to pan or zoom, scroll to zoom.");
      root.appendChild(renderer.domElement);
      const scene = new Scene();
      const camera = new PerspectiveCamera(48, 1, .1, 100);
      camera.position.set(0, 9, 16);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true; controls.dampingFactor = .075;
      controls.minDistance = 8; controls.maxDistance = 30;
      controls.maxPolarAngle = Math.PI * .78;
      controls.target.set(0, 0, 0);
      const system = new Group(); scene.add(system);
      const nodePos = (n: (typeof galaxyNodes)[number]) => new Vector3((n.x - 50) * .18, (50 - n.y) * .11, Math.sin(n.x * .23 + n.y * .15) * 2.1);
      const resources: { dispose: () => void }[] = [];
      const orbitGroups: InstanceType<typeof LineLoop>[] = [];
      for (const radius of [3.2, 6.1, 8.7]) {
        const vertices: number[] = [];
        for (let i = 0; i < 120; i++) { const a = i / 120 * Math.PI * 2; vertices.push(Math.cos(a) * radius, Math.sin(a) * radius * .58, Math.sin(a * 2) * .65); }
        const geo = new BufferGeometry(); geo.setAttribute("position", new BufferAttribute(new Float32Array(vertices), 3));
        const mat = new LineBasicMaterial({ color: 0x58cde8, transparent: true, opacity: .3 });
        const loop = new LineLoop(geo, mat); system.add(loop); orbitGroups.push(loop); resources.push(geo,mat);
      }
      const edgeVertices: number[] = [];
      for (const [a,b] of galaxyEdges) { const p = nodePos(galaxyNodes.find(n=>n.id===a)!), q=nodePos(galaxyNodes.find(n=>n.id===b)!); edgeVertices.push(...p.toArray(),...q.toArray()); }
      const edgeGeo = new BufferGeometry(); edgeGeo.setAttribute("position",new BufferAttribute(new Float32Array(edgeVertices),3));
      const edgeMat = new LineBasicMaterial({color:0x71cce5,transparent:true,opacity:.25});
      system.add(new LineSegments(edgeGeo,edgeMat));resources.push(edgeGeo,edgeMat);
      const dots = 1050, points = new Float32Array(dots * 3), colors = new Float32Array(dots * 3);
      for (let i=0;i<dots;i++) { const a=i*2.39996,r=Math.sqrt(i/dots)*9.5,z=Math.sin(a*.72)*1.8;
        points[i*3]=Math.cos(a)*r;points[i*3+1]=Math.sin(a)*r*.65;points[i*3+2]=z+(Math.sin(i*17.23)*.5);
        const c=new Color(i%11===0?0xffd166:i%7===0?0xb968ff:0x76dffa);
        colors[i*3]=c.r;colors[i*3+1]=c.g;colors[i*3+2]=c.b;
      }
      const dotGeo=new BufferGeometry();dotGeo.setAttribute("position",new BufferAttribute(points,3));dotGeo.setAttribute("color",new BufferAttribute(colors,3));
      const dotMat=new PointsMaterial({size:.055,vertexColors:true,transparent:true,opacity:.85,depthWrite:false,blending:AdditiveBlending});
      const cloud=new Points(dotGeo,dotMat);system.add(cloud);resources.push(dotGeo,dotMat);
      const markers: { node: (typeof galaxyNodes)[number]; material: InstanceType<typeof PointsMaterial> }[] = [];
      for (const n of galaxyNodes) {
        const geo=new BufferGeometry();geo.setAttribute("position",new BufferAttribute(new Float32Array(nodePos(n).toArray()),3));
        const mat=new PointsMaterial({size:.35,color:n.color,transparent:true,opacity:.95,depthWrite:false,blending:AdditiveBlending});
        system.add(new Points(geo,mat));markers.push({node:n,material:mat});resources.push(geo,mat);
      }
      const resize=()=>{const w=root.clientWidth,h=root.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.render(scene,camera);};
      const ro=new ResizeObserver(resize);ro.observe(root);resize();
      let frame=0,last=0,elapsed=0,visible=true;
      const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;},{rootMargin:"100px"});intersection.observe(root);
      const loop=(now:number)=>{
        frame=requestAnimationFrame(loop);
        if(!visible||document.hidden||now-last<33)return;
        const dt=Math.min(now-last||33,100);last=now;
        const c=config.current;
        if(!c.paused)elapsed+=dt*c.speed;
        cloud.rotation.z=elapsed*.000035;
        orbitGroups.forEach((line,i)=>{line.visible=c.orbits;line.rotation.z=elapsed*.000035*(i%2?-1:1);});
        dotMat.opacity=Math.min(1,.32+c.glow*.16);
        markers.forEach(({node,material})=>{material.opacity=node.id===c.focus?1:.72;material.size=node.id===c.focus?.52:.35;});
        controls.update();renderer.render(scene,camera);
      };
      frame=requestAnimationFrame(loop);
      cleanup=()=>{cancelAnimationFrame(frame);intersection.disconnect();ro.disconnect();controls.dispose();resources.forEach(r=>r.dispose());renderer.dispose();renderer.domElement.remove();};
    }).catch(()=>{root.dataset.fallback="true";});
    return ()=>{disposed=true;cleanup?.();};
  }, []);
  return <div className="galaxy-space" ref={host} aria-label="Movable 3D project galaxy" />;
}
