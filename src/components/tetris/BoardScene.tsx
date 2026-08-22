"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { GameEvent, TetrisGame } from "./game";
import { COLS, HIDDEN_ROWS, PIECES, VISIBLE_ROWS, pieceCells } from "./types";

const BOARD_W = COLS;
const BOARD_H = VISIBLE_ROWS;
const MAX_STACK = COLS * VISIBLE_ROWS;
const MAX_PARTICLES = 420;

const toWorldX = (x: number) => x - (BOARD_W - 1) / 2;
const toWorldY = (y: number) => (BOARD_H - 1) / 2 - (y - HIDDEN_ROWS);

type Particle = {
  alive: boolean;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  color: THREE.Color;
};

type FlashStamp = {
  cells: ReadonlyArray<readonly [number, number]>;
  color: THREE.Color;
  age: number;
};

export function canUseWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") || canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

export function BoardScene({
  game,
  onEvents,
}: {
  game: TetrisGame;
  onEvents: (events: GameEvent[]) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onEventsRef = useRef(onEvents);
  onEventsRef.current = onEvents;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 200);

    scene.add(new THREE.AmbientLight("#aab6d8", 1.1));
    const key = new THREE.DirectionalLight("#ffffff", 2.1);
    key.position.set(6, 10, 14);
    scene.add(key);
    const fill = new THREE.DirectionalLight("#4d7cff", 0.5);
    fill.position.set(-8, -6, 10);
    scene.add(fill);

    const boardGroup = new THREE.Group();
    scene.add(boardGroup);

    // Well backdrop and grid.
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(BOARD_W + 0.4, BOARD_H + 0.4),
      new THREE.MeshBasicMaterial({ color: "#07090f" }),
    );
    backdrop.position.z = -0.55;
    boardGroup.add(backdrop);

    const gridPoints: THREE.Vector3[] = [];
    for (let x = 0; x <= BOARD_W; x += 1) {
      gridPoints.push(
        new THREE.Vector3(x - BOARD_W / 2, -BOARD_H / 2, -0.5),
        new THREE.Vector3(x - BOARD_W / 2, BOARD_H / 2, -0.5),
      );
    }
    for (let y = 0; y <= BOARD_H; y += 1) {
      gridPoints.push(
        new THREE.Vector3(-BOARD_W / 2, y - BOARD_H / 2, -0.5),
        new THREE.Vector3(BOARD_W / 2, y - BOARD_H / 2, -0.5),
      );
    }
    const grid = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(gridPoints),
      new THREE.LineBasicMaterial({
        color: "#2a3350",
        transparent: true,
        opacity: 0.22,
      }),
    );
    boardGroup.add(grid);

    // Frame: left, right, bottom rails.
    const railMaterial = new THREE.MeshStandardMaterial({
      color: "#1c2233",
      roughness: 0.4,
      metalness: 0.5,
    });
    const sideGeometry = new THREE.BoxGeometry(0.34, BOARD_H + 0.9, 1.1);
    const leftRail = new THREE.Mesh(sideGeometry, railMaterial);
    leftRail.position.set(-(BOARD_W / 2 + 0.37), -0.11, 0);
    const rightRail = leftRail.clone();
    rightRail.position.x = BOARD_W / 2 + 0.37;
    const bottomRail = new THREE.Mesh(
      new THREE.BoxGeometry(BOARD_W + 1.42, 0.34, 1.1),
      railMaterial,
    );
    bottomRail.position.set(0, -(BOARD_H / 2 + 0.37), 0);
    boardGroup.add(leftRail, rightRail, bottomRail);

    // Distant drifting tetromino silhouettes for depth.
    const driftGeometry = new THREE.BoxGeometry(0.96, 0.96, 0.4);
    const driftMaterial = new THREE.MeshBasicMaterial({
      color: "#11162a",
      transparent: true,
      opacity: 0.6,
    });
    const driftCount = 9;
    const driftMesh = new THREE.InstancedMesh(
      driftGeometry,
      driftMaterial,
      driftCount * 4,
    );
    driftMesh.position.z = -7;
    scene.add(driftMesh);
    const driftPieces = Array.from({ length: driftCount }, (_, index) => {
      const names = Object.keys(PIECES) as (keyof typeof PIECES)[];
      const cells = PIECES[names[index % names.length]].rotations[0];
      return {
        cells,
        x: (Math.random() - 0.5) * 30,
        y: (Math.random() - 0.5) * 30,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.12,
        speed: 0.25 + Math.random() * 0.4,
        scale: 0.7 + Math.random() * 0.9,
      };
    });

    // Block instancing.
    const blockGeometry = new RoundedBoxGeometry(0.92, 0.92, 0.92, 2, 0.11);
    const stackMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.32,
      metalness: 0.12,
    });
    const stackMesh = new THREE.InstancedMesh(
      blockGeometry,
      stackMaterial,
      MAX_STACK,
    );
    stackMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    boardGroup.add(stackMesh);

    const activeMaterial = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      emissive: "#ffffff",
      emissiveIntensity: 0.28,
      roughness: 0.28,
      metalness: 0.1,
    });
    const activeMesh = new THREE.InstancedMesh(blockGeometry, activeMaterial, 4);
    activeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    boardGroup.add(activeMesh);

    const ghostMaterial = new THREE.MeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.14,
    });
    const ghostMesh = new THREE.InstancedMesh(blockGeometry, ghostMaterial, 4);
    ghostMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    boardGroup.add(ghostMesh);

    const flashMaterial = new THREE.MeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const flashMesh = new THREE.InstancedMesh(blockGeometry, flashMaterial, 8);
    flashMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    boardGroup.add(flashMesh);

    const particleGeometry = new THREE.BoxGeometry(0.16, 0.16, 0.16);
    const particleMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.95,
    });
    const particleMesh = new THREE.InstancedMesh(
      particleGeometry,
      particleMaterial,
      MAX_PARTICLES,
    );
    particleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    boardGroup.add(particleMesh);

    const particles: Particle[] = Array.from({ length: MAX_PARTICLES }, () => ({
      alive: false,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      life: 0,
      maxLife: 1,
      size: 1,
      color: new THREE.Color(),
    }));
    let particleCursor = 0;

    const spawnParticle = (
      x: number,
      y: number,
      color: string,
      speed: number,
    ) => {
      const particle = particles[particleCursor];
      particleCursor = (particleCursor + 1) % MAX_PARTICLES;
      particle.alive = true;
      particle.position.set(
        toWorldX(x) + (Math.random() - 0.5) * 0.7,
        toWorldY(y) + (Math.random() - 0.5) * 0.7,
        0.5 + Math.random() * 0.4,
      );
      const angle = Math.random() * Math.PI * 2;
      particle.velocity.set(
        Math.cos(angle) * speed * (0.4 + Math.random()),
        Math.abs(Math.sin(angle)) * speed * (0.6 + Math.random()),
        (Math.random() - 0.5) * speed * 0.6,
      );
      particle.maxLife = 0.45 + Math.random() * 0.5;
      particle.life = particle.maxLife;
      particle.size = 0.6 + Math.random() * 0.9;
      particle.color.set(color);
    };

    // Effect state.
    let shake = 0;
    const flashes: FlashStamp[] = [];
    const display = { x: 0, y: 0, snap: true };
    let lastPieceName: string | null = null;
    const dummy = new THREE.Object3D();
    const workColor = new THREE.Color();
    const whiteColor = new THREE.Color("#ffffff");
    const pointer = { x: 0, y: 0 };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    };
    container.addEventListener("pointermove", onPointerMove, { passive: true });

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
      const fitHeight = (BOARD_H / 2 + 1.6) / Math.tan(halfFov);
      const fitWidth =
        (BOARD_W / 2 + 1.6) / Math.tan(halfFov) / camera.aspect;
      camera.position.z = Math.max(fitHeight, fitWidth);
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const addShake = (amount: number) => {
      if (reducedMotion) return;
      shake = Math.min(shake + amount, 0.9);
    };

    const handleEvents = (events: GameEvent[]) => {
      for (const event of events) {
        if (event.type === "harddrop") {
          addShake(Math.min(0.1 + event.distance * 0.022, 0.42));
          for (const [x, y] of event.cells) {
            spawnParticle(x, y + 0.5, "#dfe6ff", 3.2);
            spawnParticle(x, y + 0.5, "#dfe6ff", 2.2);
          }
        } else if (event.type === "lock") {
          addShake(0.06);
          flashes.push({
            cells: event.cells,
            color: new THREE.Color(event.color),
            age: 0,
          });
          for (const [x, y] of event.cells) {
            if (Math.random() < 0.5) spawnParticle(x, y, event.color, 1.4);
          }
        } else if (event.type === "clear") {
          addShake(event.lines >= 4 ? 0.5 : 0.12 + event.lines * 0.05);
          const bursts = event.lines >= 4 ? 5 : 3;
          for (const row of event.rows) {
            for (let x = 0; x < COLS; x += 1) {
              const cellColor = game.board[row][x] ?? "#ffffff";
              for (let index = 0; index < bursts; index += 1) {
                spawnParticle(x, row, cellColor, event.lines >= 4 ? 5 : 3.4);
              }
            }
          }
        } else if (event.type === "gameover") {
          addShake(0.45);
        } else if (event.type === "levelup") {
          addShake(0.14);
        }
      }
    };

    let last = performance.now();
    let disposed = false;

    renderer.setAnimationLoop(() => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(now - last, 50);
      last = now;
      if (document.hidden) return;
      const dtSeconds = dt / 1000;

      game.update(dt);
      const events = game.drainEvents();
      if (events.length > 0) {
        handleEvents(events);
        onEventsRef.current(events);
      }

      // Stack blocks (including clearing-row animation).
      const clearing = game.clearingRows;
      const progress = game.clearProgress;
      let stackCount = 0;
      for (let y = HIDDEN_ROWS; y < game.board.length; y += 1) {
        for (let x = 0; x < COLS; x += 1) {
          const cell = game.board[y][x];
          if (!cell) continue;
          const isClearing = clearing.includes(y);
          let scale = 1;
          if (isClearing) {
            scale =
              progress < 0.35
                ? 1 + progress * 0.5
                : Math.max(1.18 * (1 - (progress - 0.35) / 0.65), 0.001);
          }
          dummy.position.set(toWorldX(x), toWorldY(y), 0);
          dummy.scale.setScalar(scale);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          stackMesh.setMatrixAt(stackCount, dummy.matrix);
          workColor.set(cell);
          if (isClearing) workColor.lerp(whiteColor, Math.min(progress * 2.4, 1));
          stackMesh.setColorAt(stackCount, workColor);
          stackCount += 1;
        }
      }
      stackMesh.count = stackCount;
      stackMesh.instanceMatrix.needsUpdate = true;
      if (stackMesh.instanceColor) stackMesh.instanceColor.needsUpdate = true;

      // Active piece with interpolated origin.
      const active = game.active;
      if (active && game.status === "playing") {
        if (
          lastPieceName !== active.name ||
          display.snap ||
          active.y < display.y - 2.5
        ) {
          display.x = active.x;
          display.y = active.y;
          display.snap = false;
        }
        lastPieceName = active.name;
        const lerpRate = 1 - Math.exp(-dtSeconds * 28);
        display.x += (active.x - display.x) * lerpRate;
        display.y += (active.y - display.y) * lerpRate;

        const cells = PIECES[active.name].rotations[active.rot];
        const pulse = 0.24 + Math.sin(now / 260) * 0.08;
        activeMaterial.color.set(PIECES[active.name].color);
        activeMaterial.emissive.set(PIECES[active.name].color);
        activeMaterial.emissiveIntensity = pulse;
        cells.forEach(([cx, cy], index) => {
          dummy.position.set(
            toWorldX(display.x + cx),
            toWorldY(display.y + cy),
            0,
          );
          dummy.scale.setScalar(1);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          activeMesh.setMatrixAt(index, dummy.matrix);
        });
        activeMesh.count = 4;
        activeMesh.instanceMatrix.needsUpdate = true;

        const ghostRow = game.ghostRow();
        ghostMaterial.color.set(PIECES[active.name].color);
        pieceCells({ ...active, y: ghostRow }).forEach(([x, y], index) => {
          dummy.position.set(toWorldX(x), toWorldY(y), -0.1);
          dummy.scale.setScalar(0.98);
          dummy.updateMatrix();
          ghostMesh.setMatrixAt(index, dummy.matrix);
        });
        ghostMesh.count = ghostRow > active.y ? 4 : 0;
        ghostMesh.instanceMatrix.needsUpdate = true;
      } else {
        activeMesh.count = 0;
        ghostMesh.count = 0;
        activeMesh.instanceMatrix.needsUpdate = true;
        ghostMesh.instanceMatrix.needsUpdate = true;
        display.snap = true;
      }

      // Lock flash stamps.
      let flashCount = 0;
      for (let index = flashes.length - 1; index >= 0; index -= 1) {
        const flash = flashes[index];
        flash.age += dtSeconds;
        const t = flash.age / 0.16;
        if (t >= 1) {
          flashes.splice(index, 1);
          continue;
        }
        for (const [x, y] of flash.cells) {
          if (flashCount >= 8) break;
          dummy.position.set(toWorldX(x), toWorldY(y), 0.06);
          dummy.scale.setScalar(1 + t * 0.28);
          dummy.updateMatrix();
          flashMesh.setMatrixAt(flashCount, dummy.matrix);
          flashCount += 1;
        }
        flashMaterial.opacity = 0.5 * (1 - t);
      }
      flashMesh.count = flashCount;
      flashMesh.instanceMatrix.needsUpdate = true;

      // Particles.
      let particleCount = 0;
      for (const particle of particles) {
        if (!particle.alive) continue;
        particle.life -= dtSeconds;
        if (particle.life <= 0) {
          particle.alive = false;
          continue;
        }
        particle.velocity.y -= 14 * dtSeconds;
        particle.position.addScaledVector(particle.velocity, dtSeconds);
        const lifeRatio = particle.life / particle.maxLife;
        dummy.position.copy(particle.position);
        dummy.scale.setScalar(particle.size * lifeRatio);
        dummy.rotation.set(
          particle.life * 6,
          particle.life * 5,
          particle.life * 4,
        );
        dummy.updateMatrix();
        particleMesh.setMatrixAt(particleCount, dummy.matrix);
        particleMesh.setColorAt(particleCount, particle.color);
        particleCount += 1;
      }
      particleMesh.count = particleCount;
      particleMesh.instanceMatrix.needsUpdate = true;
      if (particleMesh.instanceColor) particleMesh.instanceColor.needsUpdate = true;

      // Drifting background silhouettes.
      let driftIndex = 0;
      for (const piece of driftPieces) {
        piece.y -= piece.speed * dtSeconds;
        piece.rot += piece.spin * dtSeconds;
        if (piece.y < -17) {
          piece.y = 17;
          piece.x = (Math.random() - 0.5) * 30;
        }
        const cos = Math.cos(piece.rot);
        const sin = Math.sin(piece.rot);
        for (const [cx, cy] of piece.cells) {
          const localX = (cx - 1) * piece.scale;
          const localY = (cy - 0.5) * piece.scale;
          dummy.position.set(
            piece.x + localX * cos - localY * sin + pointer.x * 0.8,
            piece.y + localX * sin + localY * cos - pointer.y * 0.5,
            0,
          );
          dummy.scale.setScalar(piece.scale);
          dummy.rotation.set(0, 0, piece.rot);
          dummy.updateMatrix();
          driftMesh.setMatrixAt(driftIndex, dummy.matrix);
          driftIndex += 1;
        }
      }
      driftMesh.instanceMatrix.needsUpdate = true;

      // Camera: subtle tilt + shake.
      boardGroup.rotation.y +=
        (pointer.x * 0.055 - boardGroup.rotation.y) * 0.06;
      boardGroup.rotation.x +=
        (-pointer.y * 0.035 - boardGroup.rotation.x) * 0.06;
      shake *= Math.exp(-dtSeconds * 9);
      camera.position.x = (Math.random() - 0.5) * shake;
      camera.position.y = (Math.random() - 0.5) * shake;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    });

    return () => {
      disposed = true;
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      scene.traverse((node) => {
        if (node instanceof THREE.Mesh || node instanceof THREE.LineSegments) {
          node.geometry.dispose();
          const materials = Array.isArray(node.material)
            ? node.material
            : [node.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
    };
  }, [game]);

  return <canvas ref={canvasRef} aria-label="Tetris board" />;
}
