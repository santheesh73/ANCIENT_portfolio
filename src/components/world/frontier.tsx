import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, type Group, type ShaderMaterial } from "three";
import { Arch, Blocks, noise, type Block, type Materials } from "./masonry";

const road: Block[] = Array.from({ length: 170 }, (_, i) => {
  const row = Math.floor(i / 5),
    column = i % 5;
  return {
    position: [(column - 2) * 1.85 + 3.65 + Math.sin(row * 0.12) * 0.53, -0.1, 30 - row * 1.53],
    size: [1.82, 0.17, 1.5],
    angle: (noise(i) - 0.5) * 0.016,
    tone: 0.56 + noise(i * 3) * 0.29,
  };
});
const connector: Block[] = Array.from({ length: 75 }, (_, i) => {
  const row = Math.floor(i / 5),
    column = i % 5;
  return {
    position: [(column - 2) * 1.82, -0.115, -78 - row * 0.62],
    size: [1.79, 0.2, 0.61],
    tone: 0.48 + noise(i * 17) * 0.35,
  };
});

// The uprights project about 1.1 units from the arch centerline.
// The hanging cloth moves at most 0.48 units back toward the stone.
const pennantStandOff = 1.84;

function Pennant({ x, archZ, moving }: { x: number; archZ: number; moving: boolean }) {
  const flag = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ time: { value: x } }), [x]);
  useFrame(({ clock }) => {
    if (moving && flag.current) flag.current.uniforms.time.value = clock.elapsedTime + x;
  });
  return (
    <group position={[x, 5.59, archZ + pennantStandOff]}>
      {[-0.36, 0.36].map((side) => (
        <mesh key={side} position={[side, 0, -0.41]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.055, 0.055, 0.86, 8]} />
          <meshStandardMaterial color="#342c26" metalness={0.55} roughness={0.52} />
        </mesh>
      ))}
      <mesh rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.046, 0.046, 2.2, 8]} />
        <meshStandardMaterial color="#342c26" metalness={0.55} roughness={0.52} />
      </mesh>
      <mesh position-y={-1.56}>
        <planeGeometry args={[1.61, 3.15, 12, 18]} />
        <shaderMaterial
          ref={flag}
          side={DoubleSide}
          uniforms={uniforms}
          vertexShader={`varying vec2 tex; varying float fold; uniform float time;
        void main(){
          tex=uv; vec3 p=position; float free=1.-uv.y;
          float wave=uv.x*6.+uv.y*4.9+time*1.5;
          float gust=uv.x*2.4-uv.y*6.8+time*.78;
          float wrinkles=uv.x*15.+uv.y*3.-time*1.32;
          p.z+=(sin(wave)*.23+sin(gust)*.18+sin(wrinkles)*.045)*free;
          p.x+=sin(gust)*.12*free;
          fold=(cos(wave)*.82+cos(gust)*.28+cos(wrinkles)*.35)*free;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
        }`}
          fragmentShader={`varying vec2 tex; varying float fold;
        void main(){
          vec2 p=tex;
          float hem=.21*(1.-abs(p.x*2.-1.));
          float fray=sin(p.x*93.)*.002+sin(p.x*203.)*.0016;
          if(p.y<hem+fray) discard;
          float border=smoothstep(.878,.898,abs(p.x*2.-1.));
          vec2 d=(p-vec2(.5,.57))*vec2(1.,1.75);
          float sun=1.-smoothstep(.145,.169,length(d));
          float spokes=smoothstep(.80,.85,abs(cos(atan(d.y,d.x)*4.)))*smoothstep(.175,.187,length(d))*(1.-smoothstep(.27,.285,length(d)));
          float weave=sin(p.x*460.)*sin(p.y*610.)*.028;
          float faded=sin(p.x*13.+p.y*2.)*sin(p.y*9.)*.045;
          float cloth=.83+fold*.19+weave+faded;
          vec3 red=vec3(.32,.075,.043), gold=vec3(.72,.49,.23);
          gl_FragColor=vec4(mix(red,gold,max(border,max(sun,spokes)))*cloth,1.);
        }`}
        />
      </mesh>
    </group>
  );
}

export function Frontier({ materials, moving }: { materials: Materials; moving: boolean }) {
  const drifting = useRef<Group>(null);
  const particles = useMemo(
    () =>
      Float32Array.from({ length: 270 }, (_, index) => {
        const n = Math.floor(index / 3);
        return index % 3 === 0
          ? (noise(n * 67) - 0.5) * 35
          : index % 3 === 1
            ? 0.5 + noise(n * 17) * 8
            : 30 - noise(n * 3) * 75;
      }),
    [],
  );
  useFrame(({ clock }) => {
    if (moving && drifting.current)
      drifting.current.position.x = Math.sin(clock.elapsedTime * 0.2) * 1.9;
  });
  return (
    <>
      <Blocks blocks={road} material={materials.sand} />
      <Blocks blocks={connector} material={materials.floor} />
      {[
        { x: 3.7, z: 7, r: 4.8, broken: true },
        { x: 3.6, z: -20.2, r: 3.05, broken: false },
        { x: 0, z: -79.5, r: 2.75, broken: false },
      ].map(({ x, z, r, broken }) => {
        const uprights: Block[] = Array.from({ length: 16 }, (_, i) => {
          const side = i < 8 ? -1 : 1,
            course = i % 8;
          return {
            position: [x + side * (r + 0.33), 0.42 + course * 0.71, z],
            size: [1.65 - (course > 0.14 ? course * 0.055 : 0), 0.68, 2.15],
            angle: (noise(i) - 0.5) * 0.055,
            tone: 0.62 + noise(i * 19) * 0.3,
          };
        });
        return (
          <group key={z}>
            <Blocks blocks={uprights} material={materials.sand} bevel />
            <Arch at={[x, 0, z]} radius={r} spring={5.1} depth={1.9} material={materials.edge} />
            {broken && (
              <>
                <Pennant x={x - r - 0.33} archZ={z} moving={moving} />
                <Pennant x={x + r + 0.33} archZ={z} moving={moving} />
              </>
            )}
          </group>
        );
      })}
      <group ref={drifting}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[particles, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.048}
            color="#ffdaa4"
            transparent
            opacity={0.54}
            depthWrite={false}
          />
        </points>
      </group>
    </>
  );
}
