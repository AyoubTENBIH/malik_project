import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function AnimatedNozzle({ target, nozzleTemp }) {
  const groupRef = useRef();
  const glowRef = useRef();
  const prev = useRef({ x: 0, y: 0.12, z: 0 });

  useEffect(() => {
    if (!groupRef.current || !target) return;

    gsap.to(groupRef.current.position, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration: 0.55,
      ease: "power3.out",
      overwrite: true
    });

    prev.current = { ...target };
  }, [target]);

  useEffect(() => {
    if (!glowRef.current?.material) return;
    const heat = Math.min(1, (Number(nozzleTemp) || 0) / 260);
    gsap.to(glowRef.current.material, {
      emissiveIntensity: 0.15 + heat * 1.4,
      duration: 0.8,
      ease: "sine.out"
    });
  }, [nozzleTemp]);

  const emissive =
    (Number(nozzleTemp) || 0) > 180 ? "#f97316" : "#7c3aed";

  return (
    <group ref={groupRef} position={[prev.current.x, prev.current.y, prev.current.z]}>
      <mesh castShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.14, 0.1, 0.55, 24]} />
        <meshStandardMaterial color="#3f3f46" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh ref={glowRef} castShadow position={[0, -0.02, 0]}>
        <coneGeometry args={[0.09, 0.2, 20]} />
        <meshStandardMaterial
          color="#fafafa"
          emissive={emissive}
          emissiveIntensity={0.35}
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>
      <pointLight
        intensity={0.4 + (Number(nozzleTemp) || 0) / 400}
        distance={3}
        color={emissive}
        position={[0, 0.1, 0]}
      />
    </group>
  );
}
