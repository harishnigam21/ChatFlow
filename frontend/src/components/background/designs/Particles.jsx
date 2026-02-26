import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Particles() {
  const ref = useRef();
  const count = window.innerWidth < 768 ? 800 : 1500;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    const { mouse } = state;
    ref.current.rotation.y += 0.0005;

    const positions = ref.current.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const dx = positions[i3] - mouse.x * 5;
      const dy = positions[i3 + 1] - mouse.y * 5;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 1.5) {
        positions[i3] += dx * 0.02;
        positions[i3 + 1] += dy * 0.02;
      }
    }

    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#8ab4ff"
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </points>
  );
}
