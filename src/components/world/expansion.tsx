import { useRef, type ReactNode, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, type Group } from "three";
import { Armillary } from "./armillary";
import {
  Arch,
  Blocks,
  Columns,
  noise,
  tiles,
  type Block,
  type Materials,
  type Point,
} from "./masonry";
import { courtyardExtension, route } from "./route";

type RoomProps = { materials: Materials; compact: boolean };
const precisionIndex = route.findIndex((scene) => scene.id === "precision-hall");
const libraryCenter = -138;
const terraceCenter = -159;

function Detail({ z, children }: { z: number; children: ReactNode }) {
  const group = useRef<Group>(null);
  useFrame(({ camera }) => {
    if (group.current) group.current.visible = Math.abs(camera.position.z - z) < 34;
  });
  return <group ref={group}>{children}</group>;
}

function wallCourses(x: number, front: number, length: number, courses: number): Block[] {
  const blocks: Block[] = [];
  for (let course = 0; course < courses; course++) {
    for (let offset = 0; offset < length; offset += 1.65) {
      blocks.push({
        position: [x, 0.41 + course * 0.8, front - offset - (course % 2) * 0.8],
        size: [0.72, 0.775, 1.63],
        tone: 0.67 + noise(course * 27 + offset + x) * 0.28,
      });
    }
  }
  return blocks;
}

const creatorFloor = tiles(11, 15, 1.14, -19).map((tile) => ({
  ...tile,
  position: [tile.position[0] + 3.6, -0.115, tile.position[2]] as Point,
}));
const courtyardFloor = tiles(7, 8, 1.14, -35.95).map((tile) => ({
  ...tile,
  position: [tile.position[0] + 3.6, -0.125, tile.position[2]] as Point,
}));
const creatorWalls = [...wallCourses(-3.1, -20, 14, 11), ...wallCourses(10.2, -20, 14, 11)];
const creatorCeiling: Block[] = [-1, 1].flatMap((side) =>
  [
    { z: -23.4, depth: 5.98 },
    { z: -30.82, depth: 8.02 },
  ].map(({ z, depth }): Block => ({
    position: [3.6 + side * 4.14, 7.95, z],
    size: [4.3, 0.62, depth],
    tone: 0.84,
  })),
);
const creatorBayDepths = [-21.5, -27.4, -33.6];
const creatorColumns = creatorBayDepths.flatMap((z) =>
  [-1.8, 9].map((x) => ({ at: [x, 0, z] as Point, height: 6.8, radius: 0.49 })),
);
const chartBurins: Block[] = Array.from({ length: 22 }, (_, i) => ({
  position: [((i % 11) - 5) * 0.16, i < 11 ? -0.43 : 0.43, 0.025],
  size: [0.085, 0.025 + (i % 3) * 0.04, 0.017],
  tone: 0.6 + noise(i) * 0.35,
}));

function StudyChart({
  materials,
  at,
  rotation = 0,
}: {
  materials: Materials;
  at: Point;
  rotation?: number;
}) {
  return (
    <group position={at} rotation-y={rotation}>
      <mesh material={materials.dark} castShadow receiveShadow>
        <boxGeometry args={[2.5, 1.64, 0.19]} />
      </mesh>
      <group position-z={0.104}>
        <Blocks blocks={chartBurins} material={materials.trim} />
        {[0.22, 0.43, 0.6].map((radius) => (
          <mesh key={radius} material={materials.bronze}>
            <torusGeometry args={[radius, 0.014, 6, 42]} />
          </mesh>
        ))}
        {[-0.66, 0, 0.66].map((angle) => (
          <mesh key={angle} rotation-z={angle} material={materials.trim}>
            <boxGeometry args={[2.06, 0.017, 0.02]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function CreatorHall({ materials, compact }: RoomProps) {
  return (
    <group>
      <Blocks blocks={creatorFloor} material={materials.floor} />
      <Blocks blocks={courtyardFloor} material={materials.floor} />
      <Blocks blocks={creatorWalls} material={materials.sand} />
      <Blocks blocks={creatorCeiling} material={materials.dark} />
      <Columns columns={creatorColumns} materials={materials} pale />
      {creatorBayDepths.map((z) => (
        <Arch
          key={z}
          at={[3.6, 0, z]}
          radius={5.4}
          spring={5.4}
          depth={1.1}
          material={materials.edge}
        />
      ))}
      <Detail z={-30}>
        <pointLight
          position={[5.8, 7.3, -30]}
          color="#ffd49f"
          intensity={135}
          distance={16}
          decay={2}
        />
        <pointLight position={[3.4, 4, -23]} color="#b0d5de" intensity={36} distance={11} />
        <group position={[6.77, 0, -30.02]}>
          <mesh position-y={0.75} material={materials.dark} receiveShadow>
            <boxGeometry args={[2.55, 1.45, 1.52]} />
          </mesh>
          <mesh position-y={1.5} material={materials.edge} receiveShadow>
            <boxGeometry args={[2.9, 0.27, 1.78]} />
          </mesh>
          <group position={[0, 1.58, -0.04]} rotation-x={-0.84}>
            <StudyChart at={[0, 0.34, 0]} materials={materials} />
          </group>
        </group>
        <StudyChart at={[8.98, 3.4, -32]} rotation={-Math.PI / 2} materials={materials} />
        {!compact && (
          <StudyChart at={[-1.73, 3.6, -30.2]} rotation={Math.PI / 2} materials={materials} />
        )}
      </Detail>
    </group>
  );
}

const precisionFloor = tiles(13, 16, 1.18, -62.4).map((tile) => ({
  ...tile,
  position: [tile.position[0], -0.113, tile.position[2]] as Point,
}));
const precisionPiers = [-1, 1].flatMap((side) =>
  [-64, -69, -74, -78].map((z) => ({
    at: [side * 5.88, 0, z] as Point,
    height: 6.25,
    radius: 0.48,
  })),
);
const precisionWalls = [...wallCourses(-7.05, -63, 15, 8), ...wallCourses(7.05, -63, 15, 8)];
const instrumentSpots: Point[] = [
  [2.78, 0, -67.65],
  [4.73, 0, -69.55],
  [4.63, 0, -72.55],
  [2.84, 0, -74.6],
  [-2.67, 0, -73.26],
  [-3.06, 0, -69.15],
];

function PrecisionInstruments({
  materials,
  progress,
  indexOffset,
}: {
  materials: Materials;
  progress: RefObject<number>;
  indexOffset: number;
}) {
  const rigs = useRef<Array<Group | null>>([]);
  useFrame(({ camera }, delta) => {
    if (Math.abs(camera.position.z + 71 + courtyardExtension) > 19) return;
    const local = Math.max(0, progress.current - indexOffset);
    for (let index = 0; index < rigs.current.length; index++) {
      const rig = rigs.current[index];
      if (!rig) continue;
      const phase = MathUtils.smoothstep(local, index / 7, (index + 1.15) / 7);
      rig.rotation.z = MathUtils.damp(
        rig.rotation.z,
        phase * (Math.PI * 0.54 + index * 0.12),
        5,
        delta,
      );
      rig.position.y = MathUtils.damp(rig.position.y, 1.45 + phase * 0.23, 5, delta);
      rig.rotation.x = MathUtils.damp(rig.rotation.x, phase * 0.44, 5, delta);
    }
  });
  return instrumentSpots.map(([x, y, z], index) => (
    <group position={[x, y, z]} key={z}>
      <mesh position-y={0.37} material={materials.dark} receiveShadow>
        <cylinderGeometry args={[0.74, 0.83, 0.71, 20]} />
      </mesh>
      <mesh position-y={0.8} material={materials.edge}>
        <cylinderGeometry args={[0.83, 0.8, 0.19, 24]} />
      </mesh>
      <group
        position-y={1.45}
        ref={(node) => {
          rigs.current[index] = node;
        }}
        rotation-y={index * 0.24}
      >
        <mesh material={materials.bronze}>
          <torusGeometry args={[0.54, 0.062, 8, 32]} />
        </mesh>
        <mesh material={materials.trim} rotation-z={index * 0.24}>
          <boxGeometry args={[1.12, 0.065, 0.093]} />
        </mesh>
        <mesh material={materials.bronze} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.42 + index * 0.025, 0.041, 6, 30]} />
        </mesh>
        <mesh material={materials.light}>
          <octahedronGeometry args={[0.147]} />
        </mesh>
        <mesh material={materials.trim} position-x={0.46}>
          <sphereGeometry args={[0.077, 10, 8]} />
        </mesh>
      </group>
    </group>
  ));
}

export function PrecisionHall({
  materials,
  progress,
}: RoomProps & { progress: RefObject<number> }) {
  return (
    <>
      <Blocks blocks={precisionFloor} material={materials.floor} />
      <Blocks blocks={precisionWalls} material={materials.dark} />
      <Columns columns={precisionPiers} materials={materials} />
      {[-64, -73, -78].map((z) => (
        <Arch
          key={z}
          at={[0, 0, z]}
          radius={5.72}
          spring={5.1}
          depth={1.21}
          material={materials.edge}
        />
      ))}
      <mesh position={[0.15, 0.01, -71.1]} material={materials.dark} receiveShadow>
        <cylinderGeometry args={[5.35, 5.41, 0.18, 56]} />
      </mesh>
      {[3.27, 4.61, 5.08].map((radius) => (
        <mesh
          key={radius}
          position={[0.15, 0.113, -71.1]}
          rotation-x={Math.PI / 2}
          material={materials.bronze}
        >
          <torusGeometry args={[radius, 0.016, 6, 64]} />
        </mesh>
      ))}
      <Detail z={-71 - courtyardExtension}>
        <pointLight
          position={[0.5, 6.8, -70.2]}
          color="#ffd39b"
          intensity={126}
          distance={17}
          decay={2}
        />
        <pointLight position={[3, 3.6, -67]} color="#b4d5e1" intensity={36} distance={12} />
        <PrecisionInstruments
          materials={materials}
          progress={progress}
          indexOffset={precisionIndex}
        />
      </Detail>
    </>
  );
}

const libraryFloor = tiles(13, 23, 1.14, -128).map((tile) => ({
  ...tile,
  position: [tile.position[0], -0.118, tile.position[2]] as Point,
}));
const libraryWalls = [...wallCourses(-7.1, -130, 21, 10), ...wallCourses(7.1, -130, 21, 10)];
const shelfUnits = [-1, 1].flatMap((side) =>
  [-132, -137.5, -143].map((z) => ({ x: side * 5.8, z })),
);
const libraryCeiling: Block[] = [-131.5, -136.5, -141.5, -146.5].flatMap((z) =>
  [-4.25, 4.25].map((x): Block => ({ position: [x, 9.3, z], size: [5.15, 0.5, 4.84], tone: 0.72 })),
);
const libraryColumns = [-130, -135.1, -140.6, -146.1, -150].flatMap((z) =>
  [-5.9, 5.9].map((x) => ({ at: [x, 0, z] as Point, height: 8.2, radius: 0.58 })),
);
const shelfBlocks: Block[] = shelfUnits.flatMap(({ x, z }) =>
  [1.1, 2.6, 4.1, 5.6, 7.1].map((y) => ({
    position: [x, y, z] as Point,
    size: [1.75, 0.22, 4.82] as Point,
    tone: 0.84,
  })),
);
const archiveVolumes: Block[] = shelfUnits.flatMap(({ x, z }, index) =>
  Array.from({ length: 29 }, (_, i) => {
    const shelf = Math.floor(i / 8);
    const h = 0.42 + noise(i + index * 43) * 0.49;
    return {
      position: [
        x - Math.sign(x) * 0.43,
        1.22 + shelf * 1.5 + h / 2,
        z + ((i % 8) - 3.5) * 0.48,
      ] as Point,
      size: [0.49, h, 0.25 + noise(i * 19) * 0.2] as Point,
      tone: 0.51 + noise(i * 42 + index) * 0.48,
    };
  }),
);

function SkillInstallation({
  materials,
  index,
  at,
}: {
  materials: Materials;
  index: number;
  at: Point;
}) {
  return (
    <group position={at}>
      <mesh position-y={0.52} material={materials.edge} receiveShadow>
        <boxGeometry args={[1.55, 1.03, 1.23]} />
      </mesh>
      <group position-y={1.39}>
        {index === 0 && <StudyChart at={[0, 0.24, 0]} materials={materials} />}
        {index === 1 && (
          <>
            <mesh material={materials.bronze}>
              <boxGeometry args={[1.37, 0.82, 0.21]} />
            </mesh>
            <Blocks
              blocks={[-0.43, 0, 0.43].map((x) => ({
                position: [x, 0, 0.13],
                size: [0.24, 0.53, 0.085],
              }))}
              material={materials.trim}
            />
          </>
        )}
        {index === 2 && (
          <>
            <mesh material={materials.trim} rotation-z={Math.PI / 2}>
              <cylinderGeometry args={[0.062, 0.062, 1.65, 10]} />
            </mesh>
            {[-0.53, 0.53].map((x) => (
              <mesh key={x} position-x={x} material={materials.bronze}>
                <torusGeometry args={[0.36, 0.09, 8, 30]} />
              </mesh>
            ))}
          </>
        )}
        {index === 3 && (
          <group position-y={0.27}>
            <mesh material={materials.light}>
              <icosahedronGeometry args={[0.44, 0]} />
            </mesh>
            <mesh material={materials.bronze} rotation-x={0.9}>
              <torusGeometry args={[0.67, 0.04, 8, 34]} />
            </mesh>
          </group>
        )}
        {index === 4 && (
          <Blocks
            blocks={[-0.45, 0, 0.45].flatMap((x) =>
              [-0.16, 0.16, 0.48].map((y) => ({ position: [x, y, 0], size: [0.38, 0.25, 0.58] })),
            )}
            material={materials.bronze}
          />
        )}
        {index === 5 && (
          <>
            <mesh material={materials.bronze}>
              <boxGeometry args={[1.36, 0.15, 0.97]} />
            </mesh>
            <mesh position={[0.05, 0.26, 0]} rotation-z={Math.PI / 2} material={materials.trim}>
              <cylinderGeometry args={[0.09, 0.09, 1, 10]} />
            </mesh>
            <mesh position={[0.45, 0.26, 0]} material={materials.bronze}>
              <torusGeometry args={[0.25, 0.035, 8, 26]} />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}

export function KnowledgeLibrary({ materials }: RoomProps) {
  return (
    <>
      <Blocks blocks={libraryFloor} material={materials.floor} />
      <Blocks blocks={libraryWalls} material={materials.dark} />
      <Blocks blocks={libraryCeiling} material={materials.dark} />
      <Columns columns={libraryColumns} materials={materials} pale />
      <Blocks material={materials.dark} blocks={shelfBlocks} />
      <Blocks material={materials.sand} blocks={archiveVolumes} />
      {[-130, -135.1, -140.6, -146.1, -150].map((z) => (
        <Arch
          key={z}
          at={[0, 0, z]}
          radius={5.7}
          spring={7.2}
          depth={1.42}
          material={materials.edge}
        />
      ))}
      <Detail z={libraryCenter - courtyardExtension}>
        <pointLight
          position={[0.8, 6.5, -135.5]}
          color="#ffd5a1"
          intensity={142}
          distance={17}
          decay={2}
        />
        <pointLight position={[-4.3, 4.5, -143.2]} color="#ffc597" intensity={50} distance={12} />
        {shelfUnits.map(({ x, z }, index) => (
          <SkillInstallation
            key={index}
            materials={materials}
            index={index}
            at={[Math.sign(x) * 3.32, 0, z + 0.68]}
          />
        ))}
      </Detail>
    </>
  );
}

const terraceStairs: Block[] = Array.from({ length: 12 }, (_, i) => {
  const lift = i < 6 ? (i + 1) * 0.18 : (12 - i) * 0.18;
  return {
    position: [0, lift / 2, -150.2 - i * 1.72],
    size: [10.4, lift, 1.7],
    tone: 0.72 + noise(i) * 0.22,
  };
});
const terraceRails: Block[] = Array.from({ length: 32 }, (_, i) => {
  const side = i < 16 ? -1 : 1;
  return {
    position: [side * 5.45, 1.22, -149.8 - (i % 16) * 1.49],
    size: [0.66, 0.68, 1.42],
    tone: 0.68 + noise(i * 27) * 0.25,
  };
});

export function ScholarTerrace({ materials, moving }: RoomProps & { moving: boolean }) {
  const mount = useRef<Group>(null);
  useFrame(({ camera }, delta) => {
    if (
      !mount.current ||
      !moving ||
      Math.abs(camera.position.z - terraceCenter + courtyardExtension) > 21
    ) return;
    mount.current.rotation.y = MathUtils.damp(mount.current.rotation.y, 0.59, 0.46, delta);
    mount.current.rotation.z = MathUtils.damp(mount.current.rotation.z, -0.03, 0.44, delta);
  });
  return (
    <>
      <Blocks blocks={terraceStairs} material={materials.floor} bevel />
      <Blocks blocks={terraceRails} material={materials.sand} bevel />
      <Detail z={terraceCenter - courtyardExtension}>
        <mesh position={[2.85, 0.69, -160.6]} material={materials.dark} receiveShadow>
          <cylinderGeometry args={[1.81, 2.12, 1.35, 48]} />
        </mesh>
        <mesh position={[2.85, 1.38, -160.6]} material={materials.edge}>
          <cylinderGeometry args={[1.94, 1.87, 0.19, 48]} />
        </mesh>
        <group position={[2.85, 3.32, -160.6]} rotation={[0, -0.48, -0.26]} ref={mount}>
          <mesh material={materials.bronze} rotation={[Math.PI / 2.3, 0, 0]}>
            <torusGeometry args={[2.01, 0.075, 12, 64]} />
          </mesh>
          <Armillary
            materials={materials}
            position={[0, 0, 0]}
            scale={0.64}
            stage={3}
            moving={moving}
          />
        </group>
      </Detail>
    </>
  );
}
