import { EffectComposer, Bloom } from "@react-three/postprocessing"

export default function Effects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={1.5}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        radius={0.7}
      />
    </EffectComposer>
  )
}