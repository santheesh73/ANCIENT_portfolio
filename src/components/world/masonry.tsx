import { useLayoutEffect, useRef, type RefObject } from "react";
import {
  CanvasTexture,
  Color,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export type Point = [number, number, number];
export type Block = { position: Point; size: Point; angle?: number; tone?: number };

export function noise(index: number) {
  const value = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function smoothNoise(x: number, y: number, frequency: number) {
  const u = x * frequency;
  const v = y * frequency;
  const left = Math.floor(u);
  const top = Math.floor(v);
  const curve = (t: number) => t * t * (3 - 2 * t);
  const blend = (a: number, b: number, t: number) => a + (b - a) * t;
  const at = (i: number, j: number) =>
    noise((i % frequency) + (j % frequency) * 113 + frequency * 17);
  return blend(
    blend(at(left, top), at(left + 1, top), curve(u - left)),
    blend(at(left, top + 1), at(left + 1, top + 1), curve(u - left)),
    curve(v - top),
  );
}

export function createMaterials() {
  const stoneCanvas = document.createElement("canvas");
  const size = 384;
  stoneCanvas.width = stoneCanvas.height = size;
  const stoneContext = stoneCanvas.getContext("2d")!;
  const albedo = stoneContext.createImageData(size, size);
  const reliefCanvas = document.createElement("canvas");
  reliefCanvas.width = reliefCanvas.height = size;
  const reliefContext = reliefCanvas.getContext("2d")!;
  const relief = reliefContext.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const broad = smoothNoise(u, v, 5);
      const grain = noise(y * size + x);
      const pores = smoothNoise(u, v, 67);
      const seam = Math.sin(v * Math.PI * 8 + broad * 7 + smoothNoise(u, v, 11) * 2);
      const oxide = smoothNoise(u, v, 14);
      const height = 105 + 36 * pores + 16 * grain + 13 * seam - (grain < 0.06 ? 31 : 0);
      const value = 128 + 32 * broad + 26 * oxide + 12 * pores + 7 * seam + 12 * grain;
      const offset = (y * size + x) * 4;
      relief.data.set([height, height, height, 255], offset);
      albedo.data.set([value + oxide * 4, value, value - oxide * 7, 255], offset);
    }
  }
  stoneContext.putImageData(albedo, 0, 0);
  reliefContext.putImageData(relief, 0, 0);
  const map = new CanvasTexture(stoneCanvas);
  map.colorSpace = SRGBColorSpace;
  const bump = new CanvasTexture(reliefCanvas);
  for (const texture of [map, bump]) {
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.anisotropy = 4;
  }

  // Green encodes microsurface roughness, so patina catches less light than the base alloy.
  const alloyCanvas = document.createElement("canvas");
  const alloySize = 128;
  alloyCanvas.width = alloyCanvas.height = alloySize;
  const alloyContext = alloyCanvas.getContext("2d")!;
  const alloyData = alloyContext.createImageData(alloySize, alloySize);
  for (let y = 0; y < alloySize; y++) {
    for (let x = 0; x < alloySize; x++) {
      const patina = Math.max(0, (smoothNoise(x / alloySize, y / alloySize, 7) - 0.46) * 1.52);
      const brushing = noise(y * 3) * 12 + noise(y * alloySize + x) * 8;
      const value = 151 + 73 * patina + brushing;
      alloyData.data.set([value, value, value, 255], (y * alloySize + x) * 4);
    }
  }
  alloyContext.putImageData(alloyData, 0, 0);
  const alloyRoughness = new CanvasTexture(alloyCanvas);

  const stone = (color: string, scale = 0.023) =>
    new MeshStandardMaterial({ color, map, bumpMap: bump, bumpScale: scale, roughness: 0.89 });
  const materials = {
    dark: stone("#8a8177"),
    sand: stone("#cbb08b"),
    edge: stone("#b49f80"),
    floor: stone("#a29a89", 0.026),
    bronze: new MeshStandardMaterial({
      color: "#997045",
      metalness: 0.82,
      roughness: 0.63,
      roughnessMap: alloyRoughness,
    }),
    trim: new MeshStandardMaterial({
      color: "#d3ab6f",
      metalness: 0.79,
      roughness: 0.5,
      roughnessMap: alloyRoughness,
    }),
    black: new MeshStandardMaterial({ color: "#292621", metalness: 0.62, roughness: 0.46 }),
    light: new MeshStandardMaterial({
      color: "#e6c697",
      emissive: "#cc9a64",
      emissiveIntensity: 0.82,
      metalness: 0.47,
      roughness: 0.39,
    }),
  };

  return {
    ...materials,
    dispose() {
      Object.values(materials).forEach((material) => material.dispose());
      map.dispose();
      bump.dispose();
      alloyRoughness.dispose();
    },
  };
}

export type Materials = ReturnType<typeof createMaterials>;

function fillInstances(
  ref: RefObject<InstancedMesh | null>,
  blocks: readonly Block[],
  axis: "x" | "y" | "z",
) {
  const mesh = ref.current;
  if (!mesh) return;
  const dummy = new Object3D();
  const color = new Color();
  blocks.forEach(({ position, size, angle = 0, tone = 1 }, index) => {
    dummy.position.set(...position);
    dummy.scale.set(...size);
    dummy.rotation.set(0, 0, 0);
    dummy.rotation[axis] = angle;
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
    mesh.setColorAt(index, color.setScalar(tone));
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();
}

const wornBlock = new RoundedBoxGeometry(1, 1, 1, 1, 0.033);

export function Blocks({
  blocks,
  material,
  axis = "y",
  bevel = false,
}: {
  blocks: Block[];
  material: MeshStandardMaterial;
  axis?: "x" | "y" | "z";
  bevel?: boolean;
}) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => fillInstances(ref, blocks, axis), [blocks, axis]);
  return (
    <instancedMesh
      key={blocks.length}
      ref={ref}
      args={[undefined, material, blocks.length]}
      castShadow
      receiveShadow
    >
      {bevel ? <primitive object={wornBlock} attach="geometry" /> : <boxGeometry />}
    </instancedMesh>
  );
}

type Column = { at: Point; height: number; radius: number };

function CylinderBatch({
  blocks,
  material,
  taper,
  segments,
  shadow = true,
}: {
  blocks: Block[];
  material: MeshStandardMaterial;
  taper: number;
  segments: number;
  shadow?: boolean;
}) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => fillInstances(ref, blocks, "y"), [blocks]);
  return (
    <instancedMesh
      ref={ref}
      args={[undefined, material, blocks.length]}
      castShadow={shadow}
      receiveShadow
    >
      <cylinderGeometry args={[taper, 1, 1, segments]} />
    </instancedMesh>
  );
}

export function Columns({
  columns,
  materials,
  pale = false,
}: {
  columns: Column[];
  materials: Materials;
  pale?: boolean;
}) {
  const material = pale ? materials.sand : materials.dark;
  const drums: Block[] = [];
  const caps: Block[] = [];
  const rims: Block[] = [];
  const flutes: Block[] = [];
  for (const {
    at: [x, y, z],
    height,
    radius,
  } of columns) {
    for (const [index, offset] of [0, 0.19, 0.42, height - 0.55, height - 0.22].entries()) {
      const edge = index === 0 || index === 4;
      const width = radius * (edge ? 1.33 : 1.23);
      (edge ? caps : rims).push({
        position: [x, y + offset, z],
        size: [width, index === 0 ? 0.26 : 0.2, width],
      });
    }
    for (let index = 0; index < 6; index++) {
      const width = radius * (0.982 - index * 0.021);
      drums.push({
        position: [x, y + 0.52 + ((height - 1) * (index + 0.5)) / 6, z],
        size: [width, (height - 1) / 6 - 0.022, width],
        tone: 0.91 + 0.17 * noise(index + y + z),
      });
    }
    for (let index = 0; index < 8; index++) {
      const angle = (index * Math.PI) / 4;
      flutes.push({
        position: [
          x + Math.cos(angle) * radius * 0.86,
          y + height / 2,
          z + Math.sin(angle) * radius * 0.86,
        ],
        size: [radius * 0.105, height - 1, radius * 0.105],
        tone: 0.84 + 0.18 * noise(index),
      });
    }
  }
  return (
    <>
      <CylinderBatch blocks={caps} material={materials.edge} taper={1} segments={16} />
      <CylinderBatch blocks={rims} material={material} taper={0.89} segments={16} />
      <CylinderBatch blocks={drums} material={material} taper={0.98} segments={16} />
      <CylinderBatch
        blocks={flutes}
        material={materials.edge}
        taper={0.58}
        segments={5}
        shadow={false}
      />
    </>
  );
}

export function Arch({
  at,
  rotation = 0,
  radius,
  spring,
  depth,
  material,
}: {
  at: Point;
  rotation?: number;
  radius: number;
  spring: number;
  depth: number;
  material: MeshStandardMaterial;
}) {
  const blocks: Block[] = Array.from({ length: 15 }, (_, index) => {
    const angle = (Math.PI * (index + 0.5)) / 15;
    return {
      position: [Math.cos(angle) * radius, spring + Math.sin(angle) * radius, 0],
      size: [0.43, radius * 0.205, depth],
      angle,
      tone: 0.79 + 0.26 * noise(index),
    };
  });
  return (
    <group position={at} rotation-y={rotation}>
      <Blocks blocks={blocks} axis="z" material={material} bevel />
    </group>
  );
}

export function tiles(width: number, rows: number, spacing: number, start: number): Block[] {
  return Array.from({ length: width * rows }, (_, index) => {
    const row = Math.floor(index / width);
    const column = index % width;
    return {
      position: [
        (column - (width - 1) / 2) * spacing + (row % 2) * spacing * 0.45,
        -0.1,
        start - row * spacing,
      ],
      size: [spacing - 0.032, 0.18, spacing - 0.036],
      tone: 0.58 + noise(index * 9) * 0.46,
    };
  });
}
