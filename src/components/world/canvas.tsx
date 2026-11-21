"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CatmullRomCurve3, MathUtils, PMREMGenerator, Vector3 } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { Artifact } from "./artifacts";
import { Atmosphere, Chamber, FinalGate, Hall, Observatory } from "./architecture";
import { Frontier } from "./frontier";
import { CreatorHall, PrecisionHall, KnowledgeLibrary, ScholarTerrace } from "./expansion";
import { createMaterials } from "./masonry";
import { bayDepths, chamberZ, courtyardExtension, gateZ, hallZ, route, type SceneId } from "./route";

type SceneProps = {
  stage: number;
  checkpoint: SceneId;
  motion: boolean;
  progress: RefObject<number>;
  ready: (ready: boolean) => void;
  failed: () => void;
  throttled?: boolean;
};

const railPoses = route.flatMap((shot) => [shot, ...(shot.via ?? [])]);
const positions = route.map((shot) => railPoses.indexOf(shot));
const path = (key: "eye" | "look") =>
  new CatmullRomCurve3(railPoses.map((pose) => new Vector3(...pose[key])));
const cameraRail = path("eye");
const gazeRail = path("look");

function Scene({ stage, checkpoint, motion, progress, ready, failed, throttled }: SceneProps) {
  const { get, size, invalidate } = useThree();
  const compact = size.width < 740;
  const [materials] = useState(createMaterials);
  const current = useRef(0);
  const intro = useRef(0);
  const eye = useRef(new Vector3());
  const target = useRef(new Vector3());
  const rendered = useRef(false);

  useEffect(() => () => materials.dispose(), [materials]);
  useEffect(() => {
    const { scene, gl } = get();
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const environment = generator.fromScene(room, 0.07);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.68;
    room.dispose();
    generator.dispose();
    const lost = (event: Event) => {
      event.preventDefault();
      rendered.current = false;
      failed();
    };
    const restored = () => {
      gl.shadowMap.needsUpdate = true;
      invalidate();
    };
    gl.domElement.addEventListener("webglcontextlost", lost);
    gl.domElement.addEventListener("webglcontextrestored", restored);
    return () => {
      gl.domElement.removeEventListener("webglcontextlost", lost);
      gl.domElement.removeEventListener("webglcontextrestored", restored);
      scene.environment = null;
      environment.dispose();
    };
  }, [get, invalidate, failed]);

  useEffect(() => {
    const { gl } = get();
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    invalidate();
  }, [get, invalidate]);

  useEffect(() => {
    invalidate();
    if (!throttled || !motion) return;
    const timer = window.setInterval(invalidate, 55);
    return () => window.clearInterval(timer);
  }, [throttled, motion, stage, checkpoint, invalidate]);

  useFrame(({ camera, pointer, gl }, delta) => {
    const stop = progress.current;
    if (motion && stop < 0.18) intro.current += Math.min(delta, 0.1);
    const opening = 0.33 * (1 - Math.exp(-intro.current * 0.29)) * Math.max(0, 1 - stop * 2.2);
    const desired = stop + opening;
    current.current =
      !rendered.current || !motion ? desired : MathUtils.damp(current.current, desired, 4.9, delta);
    const index = Math.min(route.length - 2, Math.floor(current.current));
    const fraction = MathUtils.clamp(current.current - index, 0, 1);
    const from = route[index];
    const to = route[index + 1];
    const blend = MathUtils.smoothstep(fraction, 0, 1);
    const position =
      MathUtils.lerp(positions[index], positions[index + 1], fraction) / (railPoses.length - 1);
    cameraRail.getPoint(position, eye.current);
    gazeRail.getPoint(position, target.current);
    if (motion && !compact) {
      eye.current.x += pointer.x * 0.18;
      target.current.y -= pointer.y * 0.11;
    }
    const shortGate =
      compact && to.shortGate ? blend * (1 - MathUtils.smoothstep(size.height, 550, 730)) : 0;
    if (compact) {
      eye.current.z += shortGate * 1.7;
      target.current.x += MathUtils.lerp(from.mobileAim?.[0] ?? 0, to.mobileAim?.[0] ?? 0, blend);
      target.current.y +=
        MathUtils.lerp(from.mobileAim?.[1] ?? 0, to.mobileAim?.[1] ?? 0, blend) -
        0.42 -
        shortGate * 2.5;
    }
    camera.position.copy(eye.current);
    camera.lookAt(target.current);
    if ("fov" in camera) {
      camera.fov =
        (compact ? 53 : 42) +
        MathUtils.lerp(from.wide ? 10 : 0, to.wide ? 10 : 0, blend) +
        shortGate * 10;
      camera.updateProjectionMatrix();
    }

    if (!rendered.current && !gl.getContext().isContextLost()) {
      rendered.current = true;
      ready(true);
    }
  });

  return (
    <>
      <Atmosphere />
      <fog attach="fog" args={["#7b7762", 26, 108]} />
      <hemisphereLight args={["#bdcbd1", "#75624f", 1.62]} />
      <directionalLight
        position={[-22, 25, 5]}
        color="#ffe0b4"
        intensity={2.5}
        castShadow={!compact}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-31}
        shadow-camera-right={31}
        shadow-camera-top={40}
        shadow-camera-bottom={-43}
        shadow-camera-far={96}
        shadow-normalBias={0.024}
        shadow-bias={-0.00025}
      />
      <Frontier materials={materials} moving={motion} />
      <group position-x={-7.2}>
        <Observatory materials={materials} moving={motion} />
      </group>
      <CreatorHall materials={materials} compact={compact} />
      <group position-z={-courtyardExtension}>
        <group position-z={chamberZ}>
          <Chamber materials={materials} moving={motion} stage={stage} compact={compact} />
        </group>
        <PrecisionHall materials={materials} compact={compact} progress={progress} />
        <group position-z={hallZ}>
          <Hall materials={materials} compact={compact} />
          {bayDepths.map((z, index) => (
            <Artifact
              key={z}
              position={[3.05, 1.96, z + 0.38]}
              index={index}
              materials={materials}
              moving={motion}
            />
          ))}
        </group>
        <KnowledgeLibrary materials={materials} compact={compact} />
        <ScholarTerrace materials={materials} compact={compact} moving={motion} />
        <group position-z={gateZ}>
          <FinalGate materials={materials} />
          <Artifact index={1} position={[0, 2.7, 1.1]} materials={materials} moving={motion} />
        </group>
      </group>
    </>
  );
}

export default function WorldCanvas(props: SceneProps) {
  const [visible, setVisible] = useState(true);
  const [software, setSoftware] = useState(false);
  const eventSource = useRef<HTMLElement>(null);
  useEffect(() => {
    const check = () => setVisible(!document.hidden);
    check();
    document.addEventListener("visibilitychange", check);
    return () => document.removeEventListener("visibilitychange", check);
  }, []);
  return (
    <div
      className="world-canvas"
      ref={(node) => {
        if (node) eventSource.current = node.parentElement?.parentElement ?? node;
      }}
    >
      <Canvas
        eventSource={eventSource}
        eventPrefix="client"
        dpr={software ? 0.85 : [1, 1.25]}
        shadows
        frameloop={visible && props.motion && !software ? "always" : "demand"}
        camera={{ near: 0.15, far: 420, fov: 42 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          const context = gl.getContext();
          const debug = context.getExtension("WEBGL_debug_renderer_info");
          const renderer = debug ? context.getParameter(debug.UNMASKED_RENDERER_WEBGL) : "";
          setSoftware(/SwiftShader|llvmpipe|Software Rasterizer/i.test(String(renderer)));
        }}
        fallback={<span />}
      >
        <Scene {...props} motion={visible && props.motion} throttled={software} />
      </Canvas>
    </div>
  );
}
