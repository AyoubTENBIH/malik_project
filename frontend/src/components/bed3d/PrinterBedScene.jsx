import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import AnimatedNozzle from "./AnimatedNozzle";
import {
  BED_SIZE,
  MM,
  marlinToScene,
  bedHeatColor
} from "../../utils/printerBed";

function HeatedBed({ bedTemp, bedTarget }) {
  const meshRef = useRef();
  const heatTarget = useRef(new THREE.Color("#3f3f46"));
  const { x: bx, y: by } = BED_SIZE;
  const w = bx * MM;
  const d = by * MM;

  useFrame(() => {
    const mat = meshRef.current?.material;
    if (!mat) return;
    const c = bedHeatColor(bedTemp, bedTarget);
    heatTarget.current.setRGB(c.r, c.g, c.b);
    mat.color.lerp(heatTarget.current, 0.08);
  });

  return (
    <group position={[w / 2, 0, -d / 2]}>
      <mesh ref={meshRef} receiveShadow castShadow>
        <boxGeometry args={[w, 0.14, d]} />
        <meshStandardMaterial color="#3f3f46" metalness={0.35} roughness={0.45} />
      </mesh>
      <Grid
        position={[0, 0.08, 0]}
        args={[w, d]}
        cellSize={MM * 10}
        cellThickness={0.35}
        sectionSize={MM * 50}
        sectionThickness={0.8}
        fadeDistance={28}
        fadeStrength={1.2}
        cellColor="#6b7280"
        sectionColor="#a78bfa"
        infiniteGrid={false}
      />
    </group>
  );
}

function PrinterFrame() {
  const { x: bx, y: by, z: bz } = BED_SIZE;
  const w = bx * MM;
  const d = by * MM;
  const h = bz * MM;
  const cx = w / 2;
  const cz = -d / 2;

  const railMat = (
    <meshStandardMaterial color="#18181b" metalness={0.7} roughness={0.35} />
  );

  return (
    <group>
      {[
        [0, h / 2, 0],
        [w, h / 2, 0],
        [0, h / 2, -d],
        [w, h / 2, -d]
      ].map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <boxGeometry args={[0.12, h, 0.12]} />
          {railMat}
        </mesh>
      ))}
      <mesh position={[cx, h - 0.08, cz]} castShadow>
        <boxGeometry args={[w + 0.2, 0.1, 0.1]} />
        {railMat}
      </mesh>
      <mesh position={[cx, h - 0.2, cz]}>
        <boxGeometry args={[0.08, 0.08, d + 0.15]} />
        {railMat}
      </mesh>
    </group>
  );
}

function SceneContent({ target, trail, bedTemp, bedTarget, nozzleTemp }) {
  const center = useMemo(
    () => [(BED_SIZE.x * MM) / 2, 1.2, -(BED_SIZE.y * MM) / 2],
    []
  );

  return (
    <>
      <color attach="background" args={["#0c0c0f"]} />
      <fog attach="fog" args={["#0c0c0f", 18, 42]} />

      <ambientLight intensity={0.55} />
      <hemisphereLight
        intensity={0.45}
        color="#e0e7ff"
        groundColor="#1c1917"
      />
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.15}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-6, 8, -4]} intensity={0.4} color="#818cf8" />
      <pointLight position={[center[0], 4, center[2]]} intensity={0.35} color="#a78bfa" />

      <HeatedBed bedTemp={bedTemp} bedTarget={bedTarget} />
      <PrinterFrame />

      {trail.length > 1 ? (
        <Line
          points={trail.map(p => [p.x, p.y, p.z])}
          color="#a78bfa"
          lineWidth={1.5}
          transparent
          opacity={0.55}
        />
      ) : null}

      <AnimatedNozzle target={target} nozzleTemp={nozzleTemp} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[center[0], 0.01, center[2]]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial opacity={0.25} />
      </mesh>

      <OrbitControls
        makeDefault
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={6}
        maxDistance={22}
        target={center}
        enablePan
      />
    </>
  );
}

export default function PrinterBedScene({
  posX,
  posY,
  posZ,
  bedTemp,
  bedTarget,
  nozzleTemp,
  trailReadings = []
}) {
  const target = useMemo(
    () => marlinToScene(posX, posY, posZ),
    [posX, posY, posZ]
  );

  const trail = useMemo(
    () =>
      trailReadings
        .filter(r => r.posX != null || r.posY != null || r.posZ != null)
        .slice(-40)
        .map(r => marlinToScene(r.posX, r.posY, r.posZ)),
    [trailReadings]
  );

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      style={{ width: "100%", height: "100%", display: "block" }}
      camera={{ position: [9, 8, 11], fov: 42, near: 0.1, far: 80 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      }}
      onCreated={({ gl }) => {
        gl.setClearColor("#0c0c0f");
      }}
    >
      <SceneContent
        target={target}
        trail={trail}
        bedTemp={bedTemp}
        bedTarget={bedTarget}
        nozzleTemp={nozzleTemp}
      />
    </Canvas>
  );
}
