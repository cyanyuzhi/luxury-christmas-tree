import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';
import { easing } from 'maath';
import { useTreeStore } from './store';

// 奢华的金色材质
const GoldMaterial = new THREE.MeshStandardMaterial({
  color: "#FFD700",
  roughness: 0.1,
  metalness: 1,
  emissive: "#553300",
  emissiveIntensity: 0.2
});

// 祖母绿材质
const EmeraldMaterial = new THREE.MeshPhysicalMaterial({
  color: "#004030",
  roughness: 0.2,
  metalness: 0.6,
  clearcoat: 1,
  clearcoatRoughness: 0.1
});

const TreeParticles = () => {
  const mode = useTreeStore((s) => s.mode);
  const particlesCount = 1500;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // 计算树的形态 (圆锥螺旋) 和 散开形态 (球形爆炸)
  const { treePositions, explodedPositions } = useMemo(() => {
    const tPos = new Float32Array(particlesCount * 3);
    const ePos = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount; i++) {
      // Tree Shape: Spiral Cone
      const theta = i * 0.5;
      const y = (i / particlesCount) * 15; // Height
      const radius = (15 - y) * 0.4;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      
      tPos[i * 3] = x;
      tPos[i * 3 + 1] = y - 7; // Center y
      tPos[i * 3 + 2] = z;

      // Exploded Shape: Random Sphere
      const r = 15 * Math.cbrt(Math.random());
      const phi = Math.acos(2 * Math.random() - 1);
      const theta2 = 2 * Math.PI * Math.random();
      
      ePos[i * 3] = r * Math.sin(phi) * Math.cos(theta2);
      ePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta2);
      ePos[i * 3 + 2] = r * Math.cos(phi);
    }
    return { treePositions: tPos, explodedPositions: ePos };
  }, []);

  const dummy = new THREE.Object3D();

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    for (let i = 0; i < particlesCount; i++) {
      const ix = i * 3;
      const targetX = mode === 'tree' ? treePositions[ix] : explodedPositions[ix];
      const targetY = mode === 'tree' ? treePositions[ix + 1] : explodedPositions[ix + 1];
      const targetZ = mode === 'tree' ? treePositions[ix + 2] : explodedPositions[ix + 2];

      // 使用 maath 进行平滑插值，制造“呼吸感”和奢华的迟滞感
      // 我们实际上应该存储当前位置，这里简化为直接在 Matrix 更新
      // 真实项目中建议使用 buffer attribute 动画
      
      // 这里为了演示简便，假设有一个 currentPositions 数组在 useRef 中维护
      // ... (省略复杂的 buffer 每一帧更新逻辑，概念是 Lerp 当前值 -> 目标值)
      
      dummy.position.set(targetX, targetY, targetZ);
      
      // 让粒子自转，闪闪发光
      dummy.rotation.x += delta * 0.2;
      dummy.rotation.y += delta * 0.5;
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particlesCount]}>
      <dodecahedronGeometry args={[0.2, 0]} />
      {/* 混合材质效果，或者使用 MeshLamportMaterial */}
      <primitive object={GoldMaterial} />
    </instancedMesh>
  );
};

// 照片组件
const Polaroid = ({ url, position, index }: { url: string, position: number[], index: number }) => {
  const texture = useTexture(url);
  const groupRef = useRef<THREE.Group>(null);
  const mode = useTreeStore(s => s.mode);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // 目标位置
    let targetPos = new THREE.Vector3(...position);
    let targetRot = new THREE.Euler(0, index * 0.5, 0);
    let targetScale = 1;

    if (mode === 'exploded') {
       // 散开时，照片飞到相机面前展示
       // 这里简单处理为随机散开并放大
       targetPos.multiplyScalar(2.5); 
       targetScale = 1.5;
       // 如果是特定的“幸运照片”，可以移动到 (0,0,2)
    }

    easing.damp3(groupRef.current.position, targetPos, 0.4, delta);
    easing.dampE(groupRef.current.rotation, targetRot, 0.4, delta);
    easing.damp(groupRef.current.scale, "x", targetScale, 0.4, delta);
    easing.damp(groupRef.current.scale, "y", targetScale, 0.4, delta);
    easing.damp(groupRef.current.scale, "z", targetScale, 0.4, delta);
  });

  return (
    <group ref={groupRef}>
      {/* 拍立得边框 */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.2, 1.5]} />
        <meshStandardMaterial color="#FFF" roughness={0.9} />
      </mesh>
      {/* 照片内容 */}
      <mesh position={[0, 0.1, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      {/* 金色回形针/挂绳 */}
      <mesh position={[0, 0.8, 0]}>
        <torusGeometry args={[0.1, 0.02, 16, 32]} />
        <primitive object={GoldMaterial} />
      </mesh>
    </group>
  );
};

export const LuxuryTree = () => {
  const photos = useTreeStore(s => s.photos);
  return (
    <group>
      <TreeParticles />
      {photos.map((photo, i) => (
        <Polaroid key={photo.id} {...photo} index={i} />
      ))}
    </group>
  );
};