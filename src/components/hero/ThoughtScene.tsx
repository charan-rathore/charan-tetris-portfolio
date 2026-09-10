"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { demoBoard, planDrop } from "../tetris/project-demo";
import { collapseRows, fullRows, mergePiece } from "../tetris/engine";
import {
  COLS,
  ROWS,
  PIECES,
  pieceCells,
  type PieceName,
} from "../tetris/types";

export type ThoughtProgress = {
  score: number;
  lines: number;
  placed: number;
  next: PieceName;
};

/** A real, legally placed Tetris sequence rendered as a small 3D thinking desk. */
export function ThoughtScene({
  drop,
  paused,
  onProgress,
}: {
  drop: number;
  paused: boolean;
  onProgress: (value: ThoughtProgress) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const control = useRef({ drop, paused });
  useEffect(() => {
    control.current = { drop, paused };
  }, [drop, paused]);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    const aim = new THREE.Vector3(0, 0, 0);
    camera.position.set(15, 23, 20);
    camera.lookAt(aim);
    scene.add(new THREE.AmbientLight(0xb2c9f8, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 4);
    key.position.set(-8, 14, 6);
    scene.add(key);
    const glow = new THREE.PointLight(0x00e0ff, 22, 25);
    glow.position.set(0, 4, 1);
    scene.add(glow);
    const floorGeometry = new THREE.BoxGeometry(11, 0.3, 23);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x0b1729,
      metalness: 0.5,
      roughness: 0.5,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.3;
    scene.add(floor);
    const edgeGeometry = new THREE.EdgesGeometry(floorGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x527096 });
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    edges.position.copy(floor.position);
    scene.add(edges);
    const gridGeometry = new THREE.BufferGeometry();
    const gridPoints: number[] = [];
    for (let x = 0; x <= COLS; x++)
      gridPoints.push(x - 5, -0.12, -11, x - 5, -0.12, 11);
    for (let y = 0; y <= ROWS; y++)
      gridPoints.push(-5, -0.12, y - 11, 5, -0.12, y - 11);
    gridGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(gridPoints, 3),
    );
    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x284259,
      transparent: true,
      opacity: 0.7,
    });
    scene.add(new THREE.LineSegments(gridGeometry, gridMaterial));
    const cubeGeometry = new THREE.BoxGeometry(0.9, 0.65, 0.9);
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.28,
      metalness: 0.25,
    });
    const cubes = new THREE.InstancedMesh(
      cubeGeometry,
      cubeMaterial,
      ROWS * COLS + 8,
    );
    cubes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    cubes.frustumCulled = false;
    scene.add(cubes);
    const ghostMaterial = new THREE.MeshBasicMaterial({
      color: 0x00e0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const ghosts = Array.from({ length: 4 }, () => {
      const mesh = new THREE.Mesh(cubeGeometry, ghostMaterial);
      scene.add(mesh);
      return mesh;
    });
    const cursor = new THREE.Object3D();
    const color = new THREE.Color();
    const sequence: PieceName[] = [
      "I",
      "T",
      "L",
      "S",
      "J",
      "O",
      "Z",
      "I",
      "T",
      "L",
      "O",
      "I",
    ];
    let board = demoBoard(0),
      index = 0,
      score = 0,
      lines = 0,
      placed = 0;
    let target = planDrop(board, sequence[0]);
    let elapsed = 0,
      last = 0,
      drawn = 0,
      frame = 0,
      visible = false,
      seenDrop = control.current.drop;
    let pointerX = 0,
      pointerY = 0,
      failed = false;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const step = 1550;
    const report = () =>
      onProgress({
        score,
        lines,
        placed,
        next: sequence[(index + 1) % sequence.length],
      });
    const lock = () => {
      if (!target) {
        board = demoBoard(placed % 7);
        index = 0;
        target = planDrop(board, "I");
        return;
      }
      board = mergePiece(board, target, PIECES[target.name].color);
      const rows = fullRows(board);
      board = collapseRows(board, rows);
      score += (rows.length === 4 ? 800 : rows.length * 100) + target.y * 2;
      lines += rows.length;
      placed++;
      index++;
      if (index >= sequence.length) {
        board = demoBoard(Math.floor(placed / sequence.length));
        index = 0;
      }
      target = planDrop(board, sequence[index]);
      elapsed = 0;
      report();
    };
    const paint = (
      x: number,
      y: number,
      tint: string,
      instance: number,
      height = 0,
    ) => {
      cursor.position.set(x - 4.5, 0.35 + height, y - 10.5);
      cursor.updateMatrix();
      cubes.setMatrixAt(instance, cursor.matrix);
      cubes.setColorAt(instance, color.set(tint));
    };
    const draw = () => {
      let count = 0;
      board.forEach((row, y) =>
        row.forEach((tint, x) => {
          if (tint) paint(x, y, tint, count++);
        }),
      );
      if (target) {
        pieceCells(target).forEach(([x, y], i) => {
          ghosts[i].position.set(x - 4.5, 0.35, y - 10.5);
        });
        const phase = Math.min(elapsed / step, 1),
          fall = Math.min(1, Math.max(0, (phase - 0.25) / 0.65));
        const moving = {
          ...target,
          x: phase < 0.25 ? 3 + (target.x - 3) * (phase / 0.25) : target.x,
          y: target.y * (fall * fall),
        };
        pieceCells(moving).forEach(([x, y]) =>
          paint(x, y, PIECES[target!.name].color, count++, 0.08),
        );
      }
      cubes.count = count;
      cubes.instanceMatrix.needsUpdate = true;
      if (cubes.instanceColor) cubes.instanceColor.needsUpdate = true;
      camera.position.lerp(
        new THREE.Vector3(15 + pointerX * 2, 23 + pointerY, 20),
        0.06,
      );
      camera.lookAt(aim);
      renderer.render(scene, camera);
    };
    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      draw();
    };
    const size = new ResizeObserver(resize);
    size.observe(el);
    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        last = 0;
      },
      { threshold: 0.15 },
    );
    visibility.observe(el);
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || reduced.matches) return;
      const r = el.getBoundingClientRect();
      pointerX = (event.clientX - r.left) / r.width - 0.5;
      pointerY = (event.clientY - r.top) / r.height - 0.5;
    };
    const leave = () => {
      pointerX = 0;
      pointerY = 0;
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    const loop = (now: number) => {
      if (failed) return;
      frame = requestAnimationFrame(loop);
      if (!visible || document.hidden) {
        last = now;
        return;
      }
      const dt = last ? Math.min(now - last, 60) : 0;
      last = now;
      const requested = seenDrop !== control.current.drop;
      if (requested) {
        seenDrop = control.current.drop;
        lock();
      }
      if (!control.current.paused && !reduced.matches) {
        elapsed += dt;
        if (elapsed >= step) lock();
      }
      if (
        now - drawn >= 32 &&
        ((!control.current.paused && !reduced.matches) || requested)
      ) {
        drawn = now;
        draw();
      }
    };
    const lost = (event: Event) => {
      event.preventDefault();
      failed = true;
      el.dataset.failed = "true";
      cancelAnimationFrame(frame);
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    resize();
    report();
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      size.disconnect();
      visibility.disconnect();
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      cubeGeometry.dispose();
      cubeMaterial.dispose();
      ghostMaterial.dispose();
      floorGeometry.dispose();
      floorMaterial.dispose();
      edgeGeometry.dispose();
      edgeMaterial.dispose();
      gridGeometry.dispose();
      gridMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onProgress]);
  return <div ref={host} className="thought-scene" aria-hidden="true" />;
}
