import { AdditiveBlending, BackSide, Color, DoubleSide, PlaneGeometry } from "three";
import { bayDepths } from "./route";
import { Armillary } from "./armillary";
import { Arch, Blocks, Columns, noise, tiles, type Block, type Materials } from "./masonry";

const seeds = Array.from({ length: 14 }, (_, index) => (index * Math.PI) / 7);
const chamberColumns = seeds
  .filter((angle) => Math.abs(Math.sin(angle)) <= 0.88)
  .map((angle) => ({
    at: [Math.cos(angle) * 9.1, 0, Math.sin(angle) * 9.1] as [number, number, number],
    height: 9.6,
    radius: 0.52,
  }));
const observatoryColumns = Array.from({ length: 16 }, (_, index) => {
  const angle = (index * Math.PI) / 8;
  return {
    at: [Math.cos(angle) * 5.51, 0.9, Math.sin(angle) * 5.51] as [number, number, number],
    height: 6.48,
    radius: 0.45,
  };
});
const chamberTiles = tiles(21, 23, 1.35, 15);
const hallTiles = tiles(13, 39, 1.22, 10);
const exteriorTiles = tiles(19, 21, 1.65, 19);
const wall: Block[] = Array.from({ length: 12 * 65 }, (_, index): Block => {
  const course = Math.floor(index / 65);
  const angle = (((index % 65) + 0.5 * (course % 2)) * Math.PI * 2) / 65;
  return {
    position: [Math.cos(angle) * 11.4, 0.45 + course * 0.85, Math.sin(angle) * 11.4],
    size: [0.92, 0.825, 1.09],
    angle: -angle,
    tone: 0.54 + 0.46 * noise(index),
  };
}).filter(
  ({ position: [x, y, z] }) =>
    !((z > 9 && Math.abs(x - 3.6) < 3.4 && y < 7.8) || (z < -9 && Math.abs(x) < 3.25 && y < 7.6)),
);
const roof: Block[] = Array.from({ length: 5 * 38 }, (_, index) => {
  const course = Math.floor(index / 38);
  const angle = ((index % 38) * Math.PI) / 19;
  const radius = 3.7 + course * 1.76;
  return {
    position: [Math.cos(angle) * radius, 11.6 - course * 0.31, Math.sin(angle) * radius],
    size: [1.84, 0.57, radius * 0.17 + 0.12],
    angle: -angle,
    tone: 0.56 + noise(index + 73) * 0.52,
  };
});
const hallWall: Block[] = Array.from({ length: 2 * 10 * 24 }, (_, index): Block => {
  const band = Math.floor(index / 24);
  const course = band % 10;
  const side = band < 10 ? -1 : 1;
  return {
    position: [side * 7.2, 0.45 + course * 0.83, 6 - (index % 24) * 1.95 + (course % 2) * 0.95],
    size: [1, 0.805, 1.91],
    tone: 0.72 + noise(index) * 0.33,
  };
}).filter(
  ({ position }) =>
    !(
      position[0] < 0 &&
      position[1] > 2.6 &&
      position[1] < 6.9 &&
      Math.abs((position[2] + 40) % 7) < 2.4
    ),
);
const ruin: Block[] = Array.from({ length: 82 }, (_, index) => {
  const offset = 5.8 + noise(index * 19) * 14;
  const z = 17 - noise(index * 23) * 54;
  return {
    position: [index % 2 ? offset : -offset, 0.11 + noise(index + 73) * 0.5, z],
    size: [
      0.65 + noise(index * 31) * 2.5,
      0.35 + noise(index * 19) * 1.2,
      0.37 + noise(index * 22) * 1.65,
    ],
    angle: noise(index) * 6.28,
    tone: 0.61 + noise(index + 53) * 0.55,
  };
});
const vertex =
  "varying vec2 p; void main(){ p=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }";

function Shafts({
  amber = true,
  at = [0, 5.4, 0],
  tilt = 0,
}: {
  amber?: boolean;
  at?: [number, number, number];
  tilt?: number;
}) {
  return (
    <group position={at} rotation-z={tilt}>
      {[0, 1, 2].map((index) => (
        <mesh key={index}>
          <cylinderGeometry args={[1.55 + index * 0.16, 3.4 + index * 0.38, 12, 48, 1, true]} />
          <shaderMaterial
            vertexShader={vertex}
            fragmentShader={`
        varying vec2 p; uniform vec3 tint; uniform float strength;
        void main(){
          float streaks = .78+.11*sin(p.x*83.+sin(p.x*33.)*2.)+.055*sin(p.x*181.);
          float edge = pow(max(sin(p.x * 18.8496)*.5+.5,.08),1.6);
          float a = smoothstep(0.,.28,p.y)*(1.-smoothstep(.7,1.,p.y));
          gl_FragColor=vec4(tint,a*strength*(streaks+edge*.2));
        }`}
            uniforms={{
              tint: { value: new Color(amber ? "#ffcb86" : "#eddbc5") },
              strength: { value: index === 0 ? 0.067 : 0.026 },
            }}
            transparent
            depthWrite={false}
            side={DoubleSide}
            blending={AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

function Dust({ count = 110 }: { count?: number }) {
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index++) {
    positions.set(
      [(noise(index * 23) - 0.5) * 6, noise(index * 71) * 11, (noise(index * 17) - 0.5) * 5],
      index * 3,
    );
  }
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#e6c68c" transparent opacity={0.45} size={0.024} depthWrite={false} />
    </points>
  );
}

function Plinth({ materials, size = 1 }: { materials: Materials; size?: number }) {
  return (
    <group scale={size}>
      {[
        [3.1, 0.31, 0.14],
        [2.84, 0.22, 0.4],
        [2.53, 0.32, 0.64],
        [2.12, 0.24, 0.88],
        [1.29, 0.15, 1.03],
      ].map(([radius, height, y], index) => (
        <mesh
          key={radius}
          position-y={y}
          material={index % 2 ? materials.edge : materials.dark}
          receiveShadow
          castShadow
        >
          <cylinderGeometry args={[radius, radius * 1.034, height, 48]} />
        </mesh>
      ))}
      {[1.37, 2.06, 2.33].map((radius) => (
        <mesh key={radius} rotation-x={-Math.PI / 2} position-y={1.005} material={materials.bronze}>
          <torusGeometry args={[radius, 0.018, 6, 64]} />
        </mesh>
      ))}
    </group>
  );
}

export function Chamber({
  materials,
  stage,
  moving,
  compact,
}: {
  materials: Materials;
  stage: number;
  moving: boolean;
  compact: boolean;
}) {
  return (
    <>
      <pointLight position={[0, 8, 0]} color="#ffd49a" intensity={173} distance={20} />
      <Blocks blocks={chamberTiles} material={materials.floor} />
      <Blocks blocks={wall} material={materials.dark} />
      <Blocks blocks={roof} material={materials.dark} />
      <Columns columns={chamberColumns} materials={materials} />
      {seeds.map((angle, index) => {
        if (Math.abs(Math.sin(angle)) > 0.88) return null;
        const x = Math.cos(angle) * 9.1;
        const z = Math.sin(angle) * 9.1;
        return (
          <group key={angle}>
            <Arch
              at={[x, 0, z]}
              rotation={-angle + Math.PI / 2}
              radius={1.07}
              spring={7.14}
              depth={0.46}
              material={materials.edge}
            />
            {index % 2 === 0 && (
              <mesh
                position={[x * 1.1, 5.8, z * 1.1]}
                rotation-y={-angle}
                material={materials.edge}
              >
                <boxGeometry args={[0.4, 0.11, 1.4]} />
              </mesh>
            )}
          </group>
        );
      })}
      {[2.72, 2.91, 3.13, 8.8, 9.5].map((radius, index) => (
        <mesh
          key={radius}
          position-y={index < 3 ? 11.35 : 9.52}
          rotation-x={Math.PI / 2}
          material={index % 2 ? materials.edge : materials.dark}
        >
          <torusGeometry args={[radius, index < 3 ? 0.11 : 0.19, 9, 96]} />
        </mesh>
      ))}
      <mesh position={[0, 12, 0]} rotation-x={Math.PI / 2}>
        <circleGeometry args={[2.71, 64]} />
        <meshBasicMaterial color="#ffe3b2" side={DoubleSide} />
      </mesh>
      <Plinth materials={materials} />
      <Armillary materials={materials} stage={stage} moving={moving} />
      <Shafts />
      <Dust count={compact ? 48 : 145} />
    </>
  );
}

export function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[255, 32, 16]} />
      <shaderMaterial
        side={BackSide}
        vertexShader={`
    varying vec3 v; void main(){ v=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }
  `}
        fragmentShader={`
    varying vec3 v;
    float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    float noise(vec2 p) {
      vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
      return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);
    }
    float clouds(vec2 p) {
      return noise(p)*.54+noise(p*2.1+7.)*.26+noise(p*4.3+12.)*.14+noise(p*9.1)*.06;
    }
    void main() {
      vec3 d=normalize(v); vec3 sun=normalize(vec3(-.62,.22,-.66));
      float h=max(0.,d.y); float glow=pow(max(dot(d,sun),0.),9.);
      float disc=smoothstep(.99967,.99981,dot(d,sun));
      vec3 color=mix(vec3(.34,.44,.43),vec3(.034,.15,.17),smoothstep(0.,.69,h));
      color += vec3(.35,.22,.105)*glow + vec3(.90,.61,.35)*disc;
      vec2 sky=vec2(atan(d.z,d.x)*3.8,d.y*22.);
      float cloud=clouds(sky+vec2(clouds(sky*.71)*1.9,0.));
      float layer=smoothstep(.42,.73,cloud)*smoothstep(.015,.105,h)*(1.-smoothstep(.30,.75,h));
      vec3 litCloud=mix(vec3(.51,.53,.51),vec3(.72,.61,.47),clamp(glow+cloud*.42,0.,1.));
      color=mix(color,litCloud,layer*.64);
      gl_FragColor=vec4(color,1.);
    }
  `}
      />
    </mesh>
  );
}

function terrainShape() {
  const geometry = new PlaneGeometry(170, 74, 112, 52);
  geometry.rotateX(-Math.PI / 2);
  const vertices = geometry.attributes.position;
  for (let index = 0; index < vertices.count; index++) {
    const x = vertices.getX(index);
    const z = vertices.getZ(index);
    const range = Math.pow(Math.max(0, Math.sin(x * 0.069 + Math.sin(x * 0.027) * 2)), 1.52);
    const ridge = Math.exp(-Math.pow((z + 10 + Math.sin(x * 0.052) * 9) / 13, 2));
    const foothill = Math.exp(-Math.pow((z - 16 + Math.cos(x * 0.14) * 7) / 9, 2));
    const broadCuts =
      Math.sin(x * 0.44 + z * 0.33 + Math.sin(z * 0.13) * 2) * Math.cos(z * 0.27 - x * 0.16);
    const gullies = Math.sin(x * 0.96 + z * 0.72 + Math.sin(x * 0.23) * 1.7) * 0.24;
    const detail = broadCuts + gullies;
    vertices.setY(
      index,
      -1 + ridge * (5 + range * 10 + detail * 2.2) + foothill * (2 + range * 4 + detail),
    );
  }
  geometry.computeVertexNormals();
  return geometry;
}

const terrain = terrainShape();

export function Observatory({ materials, moving }: { materials: Materials; moving: boolean }) {
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.2} material={materials.dark} receiveShadow>
        <planeGeometry args={[230, 230]} />
      </mesh>
      <mesh geometry={terrain} position={[113, 0, -106]} material={materials.dark} dispose={null} />
      <Blocks blocks={exteriorTiles} material={materials.floor} />
      <Blocks blocks={ruin} material={materials.sand} bevel />
      <group position-z={-9}>
        {[6.95, 6.59, 6.21, 5.86].map((radius, index) => (
          <mesh
            key={radius}
            position-y={index * 0.25}
            material={index % 2 ? materials.edge : materials.sand}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[radius, radius + 0.1, 0.28, 72]} />
          </mesh>
        ))}
        <Columns columns={observatoryColumns} materials={materials} pale />
        {Array.from({ length: 16 }, (_, index) => {
          const angle = (index * Math.PI) / 8;
          const angleBetween = angle + Math.PI / 16;
          return (
            <group key={angle}>
              <Arch
                at={[Math.cos(angleBetween) * 5.4, 0.82, Math.sin(angleBetween) * 5.4]}
                radius={1.03}
                spring={5.21}
                depth={0.64}
                rotation={-angleBetween + Math.PI / 2}
                material={materials.sand}
              />
            </group>
          );
        })}
        {[7.23, 7.45, 7.74, 8.01].map((y, index) => (
          <mesh key={y} position-y={y} material={index % 2 ? materials.edge : materials.sand}>
            <cylinderGeometry args={[index === 3 ? 5.43 : 5.91, 5.92, 0.29, 64, 1, true]} />
          </mesh>
        ))}
        <Blocks
          material={materials.sand}
          blocks={Array.from({ length: 3 * 38 }, (_, index) => {
            const course = Math.floor(index / 38);
            const angle = ((index + 0.5 * course) * Math.PI) / 19;
            return {
              position: [
                Math.cos(angle) * (5.27 - course * 0.27),
                8.23 + course * 0.37,
                Math.sin(angle) * (5.27 - course * 0.27),
              ],
              size: [0.8, 0.38, 0.9],
              angle: -angle,
              tone: 0.73 + noise(index) * 0.34,
            };
          })}
        />
        <Plinth materials={materials} size={0.72} />
        <Armillary materials={materials} position={[0, 3.56, 0]} scale={0.85} moving={moving} />
      </group>
    </>
  );
}

const bayRows = [2, ...bayDepths, -35.2, -39.8];

const hallColumns = bayRows.flatMap((z) =>
  [-5.27, 5.27].map((x) => ({
    at: [x, 0, z] as [number, number, number],
    height: 6.93,
    radius: 0.56,
  })),
);
export function Hall({ materials, compact }: { materials: Materials; compact: boolean }) {
  return (
    <>
      <Blocks blocks={hallTiles} material={materials.floor} />
      <Blocks blocks={hallWall} material={materials.sand} />
      <Columns columns={hallColumns} materials={materials} pale />
      {bayRows.map((z, index) => (
        <group key={z}>
          <Arch
            at={[0, 0, z]}
            radius={5.26}
            spring={5.87}
            depth={index % 2 ? 0.65 : 0.44}
            material={materials.edge}
          />
          <mesh position={[0, 11.27, z - 2.25]} material={materials.dark} receiveShadow>
            <boxGeometry args={[15, 0.64, 4.6]} />
          </mesh>
          <mesh position={[5.27, 6.85, z - 2.3]} material={materials.sand}>
            <boxGeometry args={[1.17, 0.57, 4.61]} />
          </mesh>
          <mesh position={[-5.27, 6.85, z - 2.3]} material={materials.sand}>
            <boxGeometry args={[1.17, 0.57, 4.61]} />
          </mesh>
          {z < 0 && (
            <group position={[3.05, 0, z + 0.42]}>
              <Plinth materials={materials} size={0.44} />
            </group>
          )}
        </group>
      ))}
      {!compact && (
        <>
          <Shafts at={[-4.7, 4, -6]} tilt={-0.65} />
          <Shafts at={[-4.7, 4, -20]} tilt={-0.65} />
        </>
      )}
    </>
  );
}

export function FinalGate({ materials }: { materials: Materials }) {
  return (
    <>
      <Columns
        columns={[-3.59, 3.59].map((x) => ({ at: [x, 0, 0], height: 4.55, radius: 0.61 }))}
        materials={materials}
        pale
      />
      <Arch at={[0, 0, 0]} radius={3.6} spring={4.4} depth={1.4} material={materials.sand} />
      <mesh
        geometry={terrain}
        position={[0, -0.45, -45]}
        material={materials.dark}
        dispose={null}
      />
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, -0.21, -6]}
        material={materials.sand}
        receiveShadow
      >
        <planeGeometry args={[60, 44]} />
      </mesh>
      <mesh position={[0, 0.25, 1]} material={materials.edge}>
        <cylinderGeometry args={[1.17, 1.3, 0.5, 40]} />
      </mesh>
    </>
  );
}
