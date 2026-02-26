import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Particles from "./designs/Particles";
import Effects from "./effects/Effects";

export default function ParticleBackground() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5] }}
      dpr={1}
      gl={{ antialias: true }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
      }}
    >
      <color attach="background" args={["#0b0f1a"]} />
      <Particles />
      {/* <Effects /> */}
    </Canvas>
  );
}
