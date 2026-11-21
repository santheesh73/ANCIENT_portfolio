import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, type Group } from "three";
import { Blocks, type Block, type Materials, type Point } from "./masonry";

const axes: Point[] = [
  [0.22, -0.25, 0.3],
  [1.22, 0.28, -0.6],
  [0.38, 1.38, 0.45],
  [1.26, 0.78, 0.22],
];
const radii = [2.63, 2.34, 1.95, 1.63];

function CircleBand({
  radius,
  width,
  materials,
}: {
  radius: number;
  width: number;
  materials: Materials;
}) {
  const marks: Block[] = Array.from({ length: 80 }, (_, index) => {
    const angle = (index * Math.PI * 2) / 80;
    return {
      position: [Math.cos(angle) * radius, Math.sin(angle) * radius, width / 2 + 0.016],
      size: [index % 5 === 0 ? 0.115 : 0.056, 0.025, 0.025],
      angle,
    };
  });
  return (
    <>
      <mesh rotation-x={Math.PI / 2} material={materials.bronze} castShadow>
        <cylinderGeometry args={[radius + 0.08, radius + 0.08, width, 96, 1, true]} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} material={materials.black}>
        <cylinderGeometry args={[radius - 0.08, radius - 0.08, width, 96, 1, true]} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position-z={(side * width) / 2}>
          <mesh material={materials.bronze}>
            <ringGeometry args={[radius - 0.09, radius + 0.083, 96]} />
          </mesh>
          <mesh material={materials.trim}>
            <torusGeometry args={[radius + 0.07, 0.025, 6, 96]} />
          </mesh>
          <mesh material={materials.trim}>
            <torusGeometry args={[radius - 0.074, 0.014, 5, 96]} />
          </mesh>
        </group>
      ))}
      <Blocks blocks={marks} axis="z" material={materials.trim} />
      {[0, Math.PI].map((angle) => (
        <mesh
          key={angle}
          position={[radius * Math.cos(angle), 0, 0]}
          rotation-z={Math.PI / 2}
          material={materials.bronze}
        >
          <cylinderGeometry args={[0.19, 0.24, 0.37, 10]} />
        </mesh>
      ))}
    </>
  );
}

export function Armillary({
  materials,
  position = [0, 4.05, 0],
  scale = 1,
  stage = 1,
  moving = true,
}: {
  materials: Materials;
  position?: Point;
  scale?: number;
  stage?: number;
  moving?: boolean;
}) {
  const ringRefs = useRef<(Group | null)[]>([]);
  const inner = useRef<Group>(null);
  const elapsed = useRef(0);
  const priorStage = useRef(-1);
  useFrame((_, delta) => {
    if (!moving && priorStage.current === stage) return;
    priorStage.current = stage;
    if (moving) elapsed.current += Math.min(delta, 0.15);
    const time = elapsed.current;
    ringRefs.current.forEach((ring, index) => {
      if (!ring) return;
      const [x, y, z] = axes[index];
      const phase = index * 0.43;
      const aligned = stage >= 2;
      const targetX = aligned
        ? x * 0.38 + phase
        : x + Math.sin(time * 0.19 + phase) * (0.19 + 0.07 * stage);
      const targetY = stage === 3 ? phase : y + Math.sin(time * 0.23 + phase) * 0.38;
      ring.rotation.x = moving ? MathUtils.damp(ring.rotation.x, targetX, 3, delta) : targetX;
      ring.rotation.y = moving ? MathUtils.damp(ring.rotation.y, targetY, 3, delta) : targetY;
      ring.rotation.z = z + time * (0.026 + index * 0.011) * (index % 2 ? -1 : 1);
    });
    if (inner.current)
      inner.current.rotation.y =
        stage === 3
          ? moving
            ? MathUtils.damp(inner.current.rotation.y, 0, 2, delta)
            : 0
          : time * 0.42;
  });
  return (
    <group position={position} scale={scale}>
      <group rotation-z={-0.32}>
        <mesh material={materials.black}>
          <cylinderGeometry args={[0.095, 0.095, 6.12, 12]} />
        </mesh>
        {[-2.87, 2.87].map((y) => (
          <mesh key={y} position-y={y} material={materials.trim}>
            <sphereGeometry args={[0.21, 16, 12]} />
          </mesh>
        ))}
      </group>
      {radii.map((radius, index) => (
        <group
          key={radius}
          ref={(mesh) => {
            ringRefs.current[index] = mesh;
          }}
          rotation={axes[index]}
        >
          <CircleBand radius={radius} width={index === 0 ? 0.32 : 0.22} materials={materials} />
        </group>
      ))}
      <group ref={inner}>
        <mesh material={materials.light}>
          <icosahedronGeometry args={[0.49, 1]} />
        </mesh>
        <mesh material={materials.bronze} rotation={[0.6, 0.5, 0.6]}>
          <torusGeometry args={[0.65, 0.09, 9, 36]} />
        </mesh>
        <mesh material={materials.trim} rotation={[0.6, 0.5, 1.9]}>
          <torusGeometry args={[0.71, 0.045, 8, 36]} />
        </mesh>
      </group>
    </group>
  );
}
