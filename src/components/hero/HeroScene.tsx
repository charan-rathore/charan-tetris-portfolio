"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { canUseWebGL } from "@/lib/webgl";
import { PIECE_COLORS } from "../tetris/types";

const GLYPHS: Record<string, string[]> = {
  C: [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  N: ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
};

const WORD = "CHARAN";
const GLYPH_ROWS = 7;
const GLYPH_COLS = 5;
const GAP = 1;
const WORD_Y_OFFSET = 3.4;

type Cluster = {
  color: THREE.Color;
  delay: number;
  offset: number;
  velocity: number;
  landed: boolean;
  squash: number;
  glow: number;
};

type HeroCell = {
  targetX: number;
  targetY: number;
  cluster: Cluster;
};

type Dust = {
  alive: boolean;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
};

function buildCells(): { cells: HeroCell[]; clusters: Cluster[]; cols: number } {
  const totalCols = WORD.length * GLYPH_COLS + (WORD.length - 1) * GAP;
  const positions: { x: number; y: number }[] = [];
  WORD.split("").forEach((letter, letterIndex) => {
    const glyph = GLYPHS[letter];
    const baseCol = letterIndex * (GLYPH_COLS + GAP);
    for (let col = 0; col < GLYPH_COLS; col += 1) {
      for (let row = 0; row < GLYPH_ROWS; row += 1) {
        if (glyph[row][col] === "#") positions.push({ x: baseCol + col, y: row });
      }
    }
  });

  const palette = Object.values(PIECE_COLORS);
  const clusters: Cluster[] = [];
  const cells: HeroCell[] = [];
  positions.forEach((position, index) => {
    if (index % 4 === 0) {
      clusters.push({
        color: new THREE.Color(
          palette[Math.floor(Math.random() * palette.length)],
        ),
        delay: 250 + clusters.length * 85 + Math.random() * 320,
        offset: 17 + Math.random() * 7,
        velocity: 0,
        landed: false,
        squash: 0,
        glow: 0,
      });
    }
    const cluster = clusters[clusters.length - 1];
    cells.push({
      targetX: position.x - (totalCols - 1) / 2,
      targetY: (GLYPH_ROWS - 1) / 2 - position.y + WORD_Y_OFFSET,
      cluster,
    });
  });
  return { cells, clusters, cols: totalCols };
}

export function HeroScene({
  onUnavailable,
}: {
  onUnavailable?: () => void;
} = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onUnavailableRef = useRef(onUnavailable);

  useEffect(() => {
    onUnavailableRef.current = onUnavailable;
  }, [onUnavailable]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    if (!canUseWebGL()) {
      onUnavailableRef.current?.();
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      onUnavailableRef.current?.();
      return;
    }
    if (!renderer.getContext()) {
      renderer.dispose();
      onUnavailableRef.current?.();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 300);

    scene.add(new THREE.AmbientLight("#aab6d8", 1.15));
    const keyLight = new THREE.DirectionalLight("#ffffff", 2.2);
    keyLight.position.set(8, 14, 18);
    scene.add(keyLight);
    const rim = new THREE.DirectionalLight("#4d7cff", 0.7);
    rim.position.set(-10, -4, 8);
    scene.add(rim);

    const group = new THREE.Group();
    scene.add(group);

    const { cells, clusters, cols } = buildCells();
    if (reducedMotion) {
      clusters.forEach((cluster) => {
        cluster.offset = 0;
        cluster.landed = true;
      });
    }

    const blockGeometry = new RoundedBoxGeometry(0.9, 0.9, 0.9, 2, 0.1);
    const blockMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.3,
      metalness: 0.15,
    });
    const blocks = new THREE.InstancedMesh(
      blockGeometry,
      blockMaterial,
      cells.length,
    );
    blocks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.add(blocks);

    // Far silhouettes — quiet atmosphere.
    const farMaterial = new THREE.MeshBasicMaterial({
      color: "#101628",
      transparent: true,
      opacity: 0.5,
    });
    const farCount = 12;
    const farMesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.94, 0.94, 0.35),
      farMaterial,
      farCount * 4,
    );
    farMesh.position.z = -14;
    scene.add(farMesh);

    // Mid “systems” layer — colorful pieces that fall, fail, and recover.
    const midMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.35,
      metalness: 0.2,
      transparent: true,
      opacity: 0.55,
    });
    const midCount = 12;
    const midMesh = new THREE.InstancedMesh(
      blockGeometry,
      midMaterial,
      midCount * 4,
    );
    midMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    midMesh.position.z = -5.5;
    scene.add(midMesh);

    const tetrominoShapes: [number, number][][] = [
      [[0, 0], [1, 0], [2, 0], [3, 0]],
      [[0, 0], [1, 0], [0, 1], [1, 1]],
      [[1, 0], [0, 1], [1, 1], [2, 1]],
      [[0, 0], [0, 1], [1, 1], [2, 1]],
      [[1, 0], [2, 0], [0, 1], [1, 1]],
      [[0, 0], [1, 0], [2, 0], [2, 1]],
      [[0, 1], [1, 1], [2, 1], [0, 0]],
    ];
    const palette = Object.values(PIECE_COLORS).map((hex) => new THREE.Color(hex));

    type DriftPiece = {
      cells: [number, number][];
      x: number;
      y: number;
      z: number;
      rot: number;
      spin: number;
      speed: number;
      scale: number;
      color: THREE.Color;
      retries: number;
      failAt: number;
      recovering: number;
      lane: number;
    };

    const spawnDrift = (index: number, far: boolean): DriftPiece => {
      const lane = index % 2 === 0 ? -1 : 1;
      // Keep pieces in side corridors so CHARAN stays readable.
      const nameClearance = cols / 2 + (far ? 5.5 : 4.2);
      const sidePad = nameClearance + Math.random() * (far ? 14 : 7);
      return {
        cells: tetrominoShapes[index % tetrominoShapes.length],
        x: lane * sidePad,
        y: (Math.random() - 0.15) * (far ? 36 : 30),
        z: far ? 0 : -0.4 - Math.random() * 1.4,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * (far ? 0.12 : 0.1),
        speed: (far ? 0.28 : 0.42) + Math.random() * 0.4,
        scale: (far ? 0.7 : 0.55) + Math.random() * (far ? 1.0 : 0.55),
        color: palette[index % palette.length].clone(),
        retries: 0,
        failAt: 5 + Math.random() * 10,
        recovering: 0,
        lane,
      };
    };

    const farDrifts = Array.from({ length: farCount }, (_, i) => spawnDrift(i, true));
    const midDrifts = Array.from({ length: midCount }, (_, i) => spawnDrift(i + 3, false));

    // Upper “sky well” — uses empty space above CHARAN without crossing the name.
    const skyCount = 10;
    const skyMesh = new THREE.InstancedMesh(
      blockGeometry,
      new THREE.MeshStandardMaterial({
        roughness: 0.32,
        metalness: 0.15,
        transparent: true,
        opacity: 0.72,
      }),
      skyCount * 4,
    );
    skyMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    skyMesh.position.z = -3.8;
    scene.add(skyMesh);
    const skyFloor = WORD_Y_OFFSET + GLYPH_ROWS / 2 + 2.8;
    const skyDrifts = Array.from({ length: skyCount }, (_, index) => ({
      cells: tetrominoShapes[index % tetrominoShapes.length],
      x: (Math.random() - 0.5) * (cols * 0.9),
      y: skyFloor + 2 + Math.random() * 10,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.08,
      speed: 0.35 + Math.random() * 0.35,
      scale: 0.45 + Math.random() * 0.45,
      color: palette[index % palette.length].clone(),
    }));

    // Side rails — further out, quieter framing (not competing with the word).
    const railCells: { x: number; y: number; color: THREE.Color }[] = [];
    for (let side = -1; side <= 1; side += 2) {
      for (let row = 0; row < 9; row += 1) {
        if (row % 3 === 1) continue;
        for (let col = 0; col < 2; col += 1) {
          railCells.push({
            x: side * (cols / 2 + 5.8 + col * 1.05),
            y: WORD_Y_OFFSET + 3.6 - row * 1.05,
            color: palette[(row + col + (side > 0 ? 3 : 0)) % palette.length].clone(),
          });
        }
      }
    }
    const railMesh = new THREE.InstancedMesh(
      blockGeometry,
      new THREE.MeshStandardMaterial({
        roughness: 0.3,
        metalness: 0.16,
        transparent: true,
        opacity: 0.42,
      }),
      railCells.length,
    );
    railMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    railMesh.position.z = -2.2;
    scene.add(railMesh);

    const dustGeometry = new THREE.BoxGeometry(0.14, 0.14, 0.14);
    const dustMaterial = new THREE.MeshBasicMaterial({
      color: "#9aa6cf",
      transparent: true,
      opacity: 0.85,
    });
    const MAX_DUST = 240;
    const dustMesh = new THREE.InstancedMesh(dustGeometry, dustMaterial, MAX_DUST);
    dustMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.add(dustMesh);
    const dust: Dust[] = Array.from({ length: MAX_DUST }, () => ({
      alive: false,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      life: 0,
      maxLife: 1,
    }));
    let dustCursor = 0;
    const spawnDust = (x: number, y: number) => {
      for (let index = 0; index < 3; index += 1) {
        const grain = dust[dustCursor];
        dustCursor = (dustCursor + 1) % MAX_DUST;
        grain.alive = true;
        grain.position.set(x + (Math.random() - 0.5) * 0.8, y - 0.4, 0.6);
        grain.velocity.set(
          (Math.random() - 0.5) * 3.4,
          Math.random() * 2.6 + 0.6,
          (Math.random() - 0.5) * 2,
        );
        grain.maxLife = 0.4 + Math.random() * 0.4;
        grain.life = grain.maxLife;
      }
    };

    const dummy = new THREE.Object3D();
    const workColor = new THREE.Color();
    const white = new THREE.Color("#ffffff");
    const pointer = { x: 0, y: 0 };
    let elapsed = 0;
    let running = true;
    let disposed = false;

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const onContextLost = (event: Event) => {
      event.preventDefault();
      disposed = true;
      renderer.setAnimationLoop(null);
      onUnavailableRef.current?.();
    };
    canvas.addEventListener("webglcontextlost", onContextLost, { passive: false });

    const replay = () => {
      if (reducedMotion) return;
      if (!clusters.every((cluster) => cluster.landed)) return;
      elapsed = 0;
      clusters.forEach((cluster, index) => {
        cluster.offset = 17 + Math.random() * 7;
        cluster.velocity = 0;
        cluster.landed = false;
        cluster.squash = 0;
        cluster.glow = 0;
        cluster.delay = 100 + index * 70 + Math.random() * 280;
      });
    };
    canvas.addEventListener("pointerdown", replay);

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
      const halfWidth = cols / 2 + 4;
      const fitWidth = halfWidth / Math.tan(halfFov) / camera.aspect;
      const fitHeight = (GLYPH_ROWS / 2 + 8) / Math.tan(halfFov);
      camera.position.z = Math.max(fitWidth, fitHeight, 24);
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const visibility = new IntersectionObserver(
      (entries) => {
        running = entries[0].isIntersecting;
      },
      { threshold: 0.05 },
    );
    visibility.observe(container);

    let last = performance.now();
    renderer.setAnimationLoop(() => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      if (!running || document.hidden) return;
      elapsed += dt * 1000;

      // Cluster physics.
      for (const cluster of clusters) {
        if (!cluster.landed) {
          if (elapsed > cluster.delay) {
            cluster.velocity += 52 * dt;
            cluster.offset -= cluster.velocity * dt;
            if (cluster.offset <= 0) {
              cluster.offset = 0;
              cluster.landed = true;
              cluster.squash = 1;
            }
          }
        } else {
          cluster.squash *= Math.exp(-dt * 9);
          cluster.glow *= Math.exp(-dt * 4);
          if (Math.random() < dt * 0.06) cluster.glow = 1;
        }
      }

      // Blocks.
      cells.forEach((cell, index) => {
        const { cluster } = cell;
        const y = cell.targetY + cluster.offset;
        const squash = cluster.squash;
        const waiting = !cluster.landed && elapsed <= cluster.delay;
        dummy.position.set(cell.targetX, y - squash * 0.18, 0);
        if (waiting) {
          dummy.scale.setScalar(0.0001);
        } else {
          dummy.scale.set(1 + squash * 0.22, 1 - squash * 0.3, 1 + squash * 0.22);
        }
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        blocks.setMatrixAt(index, dummy.matrix);
        workColor.copy(cluster.color);
        if (cluster.glow > 0.02) workColor.lerp(white, cluster.glow * 0.55);
        blocks.setColorAt(index, workColor);
        if (cluster.landed && squash > 0.96) {
          spawnDust(cell.targetX, cell.targetY);
        }
      });
      blocks.instanceMatrix.needsUpdate = true;
      if (blocks.instanceColor) blocks.instanceColor.needsUpdate = true;

      // Dust.
      let dustCount = 0;
      for (const grain of dust) {
        if (!grain.alive) continue;
        grain.life -= dt;
        if (grain.life <= 0) {
          grain.alive = false;
          continue;
        }
        grain.velocity.y -= 10 * dt;
        grain.position.addScaledVector(grain.velocity, dt);
        dummy.position.copy(grain.position);
        dummy.scale.setScalar(grain.life / grain.maxLife);
        dummy.rotation.set(grain.life * 5, grain.life * 4, 0);
        dummy.updateMatrix();
        dustMesh.setMatrixAt(dustCount, dummy.matrix);
        dustCount += 1;
      }
      dustMesh.count = dustCount;
      dustMesh.instanceMatrix.needsUpdate = true;

      // Far drift silhouettes.
      let farIndex = 0;
      for (const piece of farDrifts) {
        piece.y -= piece.speed * dt;
        piece.rot += piece.spin * dt;
        if (piece.y < -22) {
          piece.y = 22;
          piece.x = piece.lane * (10 + Math.random() * 16);
        }
        const cos = Math.cos(piece.rot);
        const sin = Math.sin(piece.rot);
        for (const [cx, cy] of piece.cells) {
          const lx = (cx - 1) * piece.scale;
          const ly = (cy - 0.5) * piece.scale;
          dummy.position.set(
            piece.x + lx * cos - ly * sin + pointer.x * 1.2,
            piece.y + lx * sin + ly * cos - pointer.y * 0.8,
            0,
          );
          dummy.scale.setScalar(piece.scale);
          dummy.rotation.set(0, 0, piece.rot);
          dummy.updateMatrix();
          farMesh.setMatrixAt(farIndex, dummy.matrix);
          farIndex += 1;
        }
      }
      farMesh.count = farIndex;
      farMesh.instanceMatrix.needsUpdate = true;

      // Mid systems layer — side corridors only (never over the word).
      let midIndex = 0;
      const nameClearance = cols / 2 + 4.2;
      for (const piece of midDrifts) {
        if (piece.recovering > 0) {
          piece.recovering -= dt;
          piece.rot += piece.spin * 2.4 * dt;
        } else {
          piece.y -= piece.speed * dt;
          piece.rot += piece.spin * dt;
          piece.failAt -= dt;
          if (piece.failAt <= 0) {
            piece.recovering = 0.4 + Math.random() * 0.35;
            piece.retries += 1;
            piece.failAt = 6 + Math.random() * 9;
            piece.spin *= -1;
          }
        }
        // Soft clamp: bounce back if a recovery nudge drifts toward the name.
        if (Math.abs(piece.x) < nameClearance) {
          piece.x = Math.sign(piece.x || piece.lane) * (nameClearance + 0.6);
        }
        if (piece.y < -18) {
          piece.y = 18 + Math.random() * 4;
          piece.x =
            piece.lane * (nameClearance + Math.random() * 7);
          piece.color.copy(palette[Math.floor(Math.random() * palette.length)]);
        }
        const cos = Math.cos(piece.rot);
        const sin = Math.sin(piece.rot);
        const pulse = piece.recovering > 0 ? 1.05 : 1;
        for (const [cx, cy] of piece.cells) {
          const lx = (cx - 1) * piece.scale;
          const ly = (cy - 0.5) * piece.scale;
          dummy.position.set(
            piece.x + lx * cos - ly * sin + pointer.x * 1.2,
            piece.y + lx * sin + ly * cos - pointer.y * 0.7,
            piece.z,
          );
          dummy.scale.setScalar(piece.scale * pulse);
          dummy.rotation.set(0, 0, piece.rot);
          dummy.updateMatrix();
          midMesh.setMatrixAt(midIndex, dummy.matrix);
          midMesh.setColorAt(midIndex, piece.color);
          midIndex += 1;
        }
      }
      midMesh.count = midIndex;
      midMesh.instanceMatrix.needsUpdate = true;
      if (midMesh.instanceColor) midMesh.instanceColor.needsUpdate = true;

      // Sky belt above CHARAN — fills empty headroom, stops above the word.
      let skyIndex = 0;
      for (const piece of skyDrifts) {
        piece.y -= piece.speed * dt;
        piece.rot += piece.spin * dt;
        if (piece.y < skyFloor) {
          piece.y = skyFloor + 8 + Math.random() * 6;
          piece.x = (Math.random() - 0.5) * (cols * 0.9);
          piece.color.copy(palette[Math.floor(Math.random() * palette.length)]);
        }
        const cos = Math.cos(piece.rot);
        const sin = Math.sin(piece.rot);
        for (const [cx, cy] of piece.cells) {
          const lx = (cx - 1) * piece.scale;
          const ly = (cy - 0.5) * piece.scale;
          dummy.position.set(
            piece.x + lx * cos - ly * sin + pointer.x * 0.8,
            piece.y + lx * sin + ly * cos,
            0,
          );
          dummy.scale.setScalar(piece.scale);
          dummy.rotation.set(0, 0, piece.rot * 0.35);
          dummy.updateMatrix();
          skyMesh.setMatrixAt(skyIndex, dummy.matrix);
          skyMesh.setColorAt(skyIndex, piece.color);
          skyIndex += 1;
        }
      }
      skyMesh.count = skyIndex;
      skyMesh.instanceMatrix.needsUpdate = true;
      if (skyMesh.instanceColor) skyMesh.instanceColor.needsUpdate = true;

      // Side rails framing the empty space around CHARAN.
      railCells.forEach((cell, index) => {
        const bob = Math.sin(elapsed * 0.002 + index * 0.45) * 0.08;
        dummy.position.set(
          cell.x + pointer.x * 0.35,
          cell.y + bob - pointer.y * 0.2,
          0,
        );
        dummy.scale.setScalar(0.92);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        railMesh.setMatrixAt(index, dummy.matrix);
        railMesh.setColorAt(index, cell.color);
      });
      railMesh.instanceMatrix.needsUpdate = true;
      if (railMesh.instanceColor) railMesh.instanceColor.needsUpdate = true;

      // Parallax.
      group.rotation.y += (pointer.x * 0.06 - group.rotation.y) * 0.05;
      group.rotation.x += (-pointer.y * 0.04 - group.rotation.x) * 0.05;
      camera.position.x += (pointer.x * 1.4 - camera.position.x) * 0.04;
      camera.position.y += (-pointer.y * 0.9 - camera.position.y) * 0.04;
      camera.lookAt(0, WORD_Y_OFFSET * 0.4, 0);

      renderer.render(scene, camera);
    });

    return () => {
      disposed = true;
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      visibility.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", replay);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      scene.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.geometry.dispose();
          const materials = Array.isArray(node.material)
            ? node.material
            : [node.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />;
}
