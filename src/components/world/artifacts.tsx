import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, Vector3, type Group } from "three";
import { Armillary } from "./armillary";
import type { Materials, Point } from "./masonry";

function MetalPath({
  points,
  materials,
  light = false,
}: {
  points: Point[];
  materials: Materials;
  light?: boolean;
}) {
  const path = new CatmullRomCurve3(
    points.map((point) => new Vector3(...point)),
    false,
    "centripetal",
  );
  return (
    <mesh material={light ? materials.light : materials.bronze}>
      <tubeGeometry args={[path, 18, light ? 0.029 : 0.052, 6, false]} />
    </mesh>
  );
}

function Shape({ index, materials }: { index: number; materials: Materials }) {
  if (index === 0)
    return (
      <>
        {[0.48, 0.81, 1.16].map((radius, ring) => (
          <mesh key={radius} rotation={[0.26 * ring, 0.1 * ring, 0]} material={materials.trim}>
            <torusGeometry args={[radius, 0.044, 8, 48]} />
          </mesh>
        ))}
        {[-1, 0, 1].map((z) => (
          <MetalPath
            key={z}
            points={[
              [-1.4, z * 0.68, z * 0.2],
              [-0.83, z * 0.55, z * 0.4],
              [0, 0, 0],
              [1.3, 0, 0],
            ]}
            materials={materials}
            light
          />
        ))}
        <mesh material={materials.light}>
          <sphereGeometry args={[0.23, 16, 12]} />
        </mesh>
      </>
    );
  if (index === 1)
    return <Armillary materials={materials} position={[0, 0, 0]} scale={0.45} moving={false} />;
  if (index === 2)
    return (
      <>
        <mesh material={materials.light}>
          <octahedronGeometry args={[0.72]} />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[1.31, 0]} />
          <meshStandardMaterial color="#dfbb82" metalness={0.74} roughness={0.31} wireframe />
        </mesh>
        <mesh rotation-x={Math.PI / 2} material={materials.bronze}>
          <torusGeometry args={[1.21, 0.037, 8, 64]} />
        </mesh>
      </>
    );
  if (index === 3)
    return (
      <>
        {[0, 1, 2, 3].map((level) => (
          <group
            key={level}
            position={[0.16 * level - 0.25, 0.17 * level - 0.21, -0.37 * level + 0.5]}
            rotation={[0.06 * level, 0.15 * level, -0.06 * level]}
          >
            <mesh material={materials.bronze}>
              <boxGeometry args={[1.45, 1.68, 0.085]} />
            </mesh>
            {[0, 1, 2, 3].map((line) => (
              <mesh
                key={line}
                position={[-0.14 * line, 0.46 - line * 0.24, 0.053]}
                material={materials.trim}
              >
                <boxGeometry args={[1.06 - line * 0.18, 0.029, 0.032]} />
              </mesh>
            ))}
          </group>
        ))}
        <MetalPath
          points={[
            [-0.95, -0.52, 0.6],
            [-0.83, 0.55, 0.94],
            [0.48, 0.64, 0.65],
            [1.05, -0.12, -0.3],
          ]}
          materials={materials}
          light
        />
      </>
    );
  if (index === 4)
    return (
      <>
        {([-1, 0, 1] as const).map((side) => (
          <group
            key={side}
            position={[side * 0.73, side === 0 ? 0.55 : -0.36, 0]}
            rotation={[side * 0.7, side * 0.4, side * 0.3]}
          >
            <mesh material={materials.bronze}>
              <torusGeometry args={[0.49, 0.087, 9, 40]} />
            </mesh>
            <mesh material={materials.trim}>
              <icosahedronGeometry args={[0.24, 0]} />
            </mesh>
            <MetalPath
              points={[
                [0, 0, 0],
                [0.15, -0.23, 0.34],
                [-side * 0.39, -0.25, 0.72],
              ]}
              materials={materials}
              light
            />
          </group>
        ))}
      </>
    );
  if (index === 5)
    return (
      <>
        {[0, 1, 2, 3, 4].map((node) => (
          <group
            key={node}
            position={[((node % 3) - 1) * 0.74, ((node % 2) - 0.5) * 1.06, (node - 2) * 0.27]}
          >
            <mesh material={materials.trim}>
              <boxGeometry args={[0.35, 0.39, 0.35]} />
            </mesh>
            <MetalPath
              points={[
                [0, 0, 0],
                [0.23, 0.14, 0.18],
                [(1 - (node % 3)) * 0.74, (0.5 - (node % 2)) * 1.06, (2 - node) * 0.27],
              ]}
              materials={materials}
              light
            />
          </group>
        ))}
      </>
    );
  return (
    <>
      {Array.from({ length: 9 }, (_, cell) => (
        <mesh
          key={cell}
          position={[
            ((cell % 3) - 1) * 0.52,
            (Math.floor(cell / 3) - 1) * 0.56,
            Math.sin(cell) * 0.34,
          ]}
          rotation-y={cell * 0.14}
          material={cell % 2 ? materials.trim : materials.bronze}
        >
          <boxGeometry args={[0.46, 0.48, 0.12]} />
        </mesh>
      ))}
      <MetalPath
        points={[
          [-1, -0.98, -0.4],
          [-1, 0.98, -0.4],
          [1, 0.98, -0.4],
          [1, -0.98, -0.4],
          [-1, -0.98, -0.4],
        ]}
        materials={materials}
        light
      />
    </>
  );
}

export function Artifact({
  index,
  position,
  materials,
  moving,
}: {
  index: number;
  position: Point;
  materials: Materials;
  moving: boolean;
}) {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!group.current || !moving) return;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.48;
    group.current.position.y = Math.sin(clock.elapsedTime * 0.74) * 0.1;
  });
  return (
    <group position={position}>
      <group ref={group}>
        <Shape index={index} materials={materials} />
      </group>
    </group>
  );
}
