import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Sparkles, Float } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import { LuxuryTree } from './LuxuryTree';
import { GestureController } from './GestureController';
import { UI } from './UI'; // UI 组件包含上传按钮

export default function App() {
  return (
    <div className="w-full h-screen bg-[#05100a] overflow-hidden">
      <UI />
      <GestureController />
      
      <Canvas shadows camera={{ position: [0, 0, 25], fov: 35 }}>
        <color attach="background" args={['#05100a']} />
        <fog attach="fog" args={['#05100a', 10, 40]} />

        {/* 豪华灯光配置 */}
        <ambientLight intensity={0.5} color="#ffeebb" />
        <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} intensity={200} castShadow color="#ffd700" />
        <pointLight position={[-10, 5, -10]} intensity={50} color="#00ff88" />

        <Suspense fallback={null}>
          <Environment preset="city" /> {/* 提供反射 */}
          
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <LuxuryTree />
          </Float>

          {/* 增加奢华氛围的粒子 */}
          <Sparkles count={300} scale={20} size={4} speed={0.4} opacity={0.5} color="#FFD700" />
        </Suspense>

        {/* 电影级后期处理 */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.5} // 只让高亮的金色发光
            mipmapBlur 
            intensity={1.5} 
            radius={0.6}
          />
          <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

        <OrbitControls makeDefault enablePan={false} maxPolarAngle={Math.PI / 1.5} />
      </Canvas>
    </div>
  );
}