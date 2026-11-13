"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useMotionValueEvent, type MotionValue } from "framer-motion";

function VaultCore({ progress }: { progress: MotionValue<number> }) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const p = useRef(0);

  useMotionValueEvent(progress, "change", (v) => {
    p.current = v;
  });

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const scroll = p.current;
    group.current.rotation.y = t * 0.28 + scroll * Math.PI * 1.5;
    group.current.rotation.x = Math.sin(t * 0.4) * 0.14 + scroll * 0.4;
    group.current.position.y = Math.sin(t * 0.9) * 0.1;
    group.current.rotation.z = state.pointer.x * 0.22;
    group.current.position.x = state.pointer.x * 0.4;
    group.current.position.z = state.pointer.y * -0.25;
    if (mat.current) {
      mat.current.emissiveIntensity = 0.4 + scroll * 0.6 + Math.sin(t * 2.2) * 0.06;
    }
  });

  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
        <mesh castShadow>
          <boxGeometry args={[2.5, 1.5, 0.1]} />
          <meshPhysicalMaterial
            ref={mat}
            color="#0a3d4a"
            metalness={0.6}
            roughness={0.16}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive="#00d1b2"
            emissiveIntensity={0.45}
          />
        </mesh>
        <mesh position={[1.1, 0, 0.06]}>
          <cylinderGeometry args={[0.13, 0.13, 0.14, 24]} />
          <meshStandardMaterial color="#021018" />
        </mesh>
        <mesh position={[0, -0.38, 0.06]}>
          <boxGeometry args={[1.9, 0.07, 0.03]} />
          <meshStandardMaterial color="#c8ff3d" emissive="#c8ff3d" emissiveIntensity={1.4} />
        </mesh>
      </Float>

      <Float speed={2.1} floatIntensity={0.7} rotationIntensity={0.5}>
        <mesh position={[-1.7, 0.95, -0.45]} scale={0.58}>
          <icosahedronGeometry args={[0.55, 1]} />
          <MeshDistortMaterial
            color="#0091fd"
            emissive="#83dcff"
            emissiveIntensity={0.7}
            distort={0.4}
            speed={2.4}
            roughness={0.18}
          />
        </mesh>
      </Float>

      <Float speed={1.7} floatIntensity={0.55}>
        <mesh position={[1.75, -0.9, -0.35]} scale={0.42}>
          <torusGeometry args={[0.55, 0.14, 16, 48]} />
          <meshStandardMaterial
            color="#c8ff3d"
            emissive="#c8ff3d"
            emissiveIntensity={0.8}
            metalness={0.45}
          />
        </mesh>
      </Float>
    </group>
  );
}

function Dust() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(360);
    for (let i = 0; i < 120; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 9;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    ref.current.rotation.x = state.pointer.y * 0.12;
  });

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.028} color="#83dcff" transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

export function Scene3D({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="scene3d">
      <Canvas
        camera={{ position: [0, 0, 5.4], fov: 40 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 3, 5]} intensity={1.35} color="#83dcff" />
        <directionalLight position={[-3, -2, 2]} intensity={0.6} color="#c8ff3d" />
        <VaultCore progress={progress} />
        <Dust />
      </Canvas>
    </div>
  );
}
