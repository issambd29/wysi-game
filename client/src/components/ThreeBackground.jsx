import { useRef, useMemo, useState, useEffect, Component } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function ForestGround({ isMobile }) {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    const segsX = isMobile ? 60 : 120;
    const segsY = isMobile ? 45 : 90;
    const geo = new THREE.PlaneGeometry(80, 60, segsX, segsY);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const height =
        Math.sin(x * 0.12) * Math.cos(y * 0.15) * 1.5 +
        Math.sin(x * 0.3 + y * 0.25) * 0.6 +
        Math.sin(x * 0.6) * Math.cos(y * 0.5) * 0.25 +
        Math.sin(x * 1.2 + y * 0.9) * 0.08 +
        (Math.random() - 0.5) * 0.06;
      pos.setZ(i, height);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      fogColor: { value: new THREE.Color(0.008, 0.03, 0.015) },
      fogNear: { value: 6 },
      fogFar: { value: 35 },
      moonDir: { value: new THREE.Vector3(0.4, 0.8, 0.3) },
    },
    vertexShader: `
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying float vFog;
      uniform float fogNear;
      uniform float fogFar;
      uniform float time;
      void main() {
        vec3 pos = position;
        pos.z += sin(pos.x * 2.0 + time * 0.8) * cos(pos.y * 1.5 + time * 0.6) * 0.04;
        vPosition = pos;
        vNormal = normal;
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPos = worldPos.xyz;
        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        float fogDist = -mvPos.z;
        vFog = smoothstep(fogNear, fogFar, fogDist);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying float vFog;
      uniform vec3 fogColor;
      uniform vec3 moonDir;
      uniform float time;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
                   mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
      }

      void main() {
        float h = vPosition.z;
        vec3 deepGreen = vec3(0.01, 0.04, 0.02);
        vec3 forestGreen = vec3(0.03, 0.1, 0.04);
        vec3 mossGreen = vec3(0.05, 0.15, 0.06);
        vec3 brightGreen = vec3(0.08, 0.22, 0.09);

        vec3 col = mix(deepGreen, forestGreen, smoothstep(-1.0, 0.0, h));
        col = mix(col, mossGreen, smoothstep(0.0, 0.8, h));
        col = mix(col, brightGreen, smoothstep(0.8, 1.8, h));

        float light = dot(vNormal, normalize(moonDir));
        light = light * 0.35 + 0.65;
        col *= light;

        float rimLight = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
        rimLight = pow(rimLight, 3.0) * 0.15;
        col += vec3(0.1, 0.3, 0.15) * rimLight;

        float n1 = noise(vWorldPos.xz * 5.0);
        float n2 = noise(vWorldPos.xz * 12.0 + 31.0);
        float moss = n1 * 0.6 + n2 * 0.4;
        vec3 mossColor = vec3(0.04, 0.12, 0.03);
        vec3 dirtColor = vec3(0.06, 0.04, 0.02);
        col = mix(col, mossColor, moss * 0.2);
        col = mix(col, dirtColor, (1.0 - moss) * 0.08);

        float pathNoise = noise(vWorldPos.xz * vec2(0.3, 0.8) + vec2(0.0, time * 0.01));
        float path = smoothstep(0.45, 0.55, pathNoise) * 0.06;
        col = mix(col, dirtColor * 1.3, path);

        col = mix(col, fogColor, vFog);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    side: THREE.DoubleSide,
  }), []);

  useFrame((state) => {
    material.uniforms.time.value = state.clock.elapsedTime;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -3, -5]}
    />
  );
}

function ProceduralTree({ position, scale = 1, seed = 0, variant = 0 }) {
  const group = useRef();
  const windOffset = useMemo(() => seed * 2.5, [seed]);

  const trunkGeo = useMemo(() => {
    const taperTop = variant === 2 ? 0.04 : 0.08;
    const taperBot = variant === 2 ? 0.1 : 0.15;
    const height = variant === 2 ? 4 : 3;
    return new THREE.CylinderGeometry(taperTop * scale, taperBot * scale, height * scale, 6);
  }, [scale, variant]);

  const foliageGeos = useMemo(() => {
    const geos = [];
    if (variant === 0) {
      const r = (0.9 + Math.sin(seed) * 0.3) * scale;
      geos.push({ geo: new THREE.IcosahedronGeometry(r, 1), y: 1.8 * scale, x: 0 });
      const r2 = (0.55 + Math.cos(seed * 2) * 0.2) * scale;
      geos.push({ geo: new THREE.IcosahedronGeometry(r2, 1), y: 2.6 * scale, x: Math.sin(seed * 4) * 0.3 * scale });
      const r3 = (0.35 + Math.sin(seed * 3) * 0.1) * scale;
      geos.push({ geo: new THREE.IcosahedronGeometry(r3, 1), y: 3.1 * scale, x: Math.cos(seed * 5) * 0.2 * scale });
    } else if (variant === 1) {
      for (let i = 0; i < 4; i++) {
        const r = (0.9 - i * 0.2) * scale;
        const y = (1.2 + i * 0.55) * scale;
        geos.push({ geo: new THREE.ConeGeometry(r, 0.8 * scale, 6), y, x: 0 });
      }
    } else {
      const r = (0.6 + Math.sin(seed * 2) * 0.15) * scale;
      geos.push({ geo: new THREE.SphereGeometry(r, 6, 5), y: 2.5 * scale, x: 0 });
      const r2 = (0.7 + Math.cos(seed) * 0.2) * scale;
      geos.push({ geo: new THREE.SphereGeometry(r2, 6, 5), y: 2.8 * scale, x: 0.4 * scale });
      const r3 = (0.5 + Math.sin(seed * 5) * 0.1) * scale;
      geos.push({ geo: new THREE.SphereGeometry(r3, 6, 5), y: 2.9 * scale, x: -0.3 * scale });
    }
    return geos;
  }, [scale, seed, variant]);

  const trunkMat = useMemo(() => {
    const darkness = 0.8 + Math.sin(seed * 7) * 0.2;
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.15 * darkness, 0.08 * darkness, 0.04 * darkness),
      roughness: 0.95,
    });
  }, [seed]);

  const foliageMat = useMemo(() => {
    const hue = 0.27 + Math.sin(seed * 3) * 0.06;
    const sat = 0.45 + Math.cos(seed * 7) * 0.2;
    const light = 0.1 + Math.sin(seed * 5) * 0.05;
    const c = new THREE.Color();
    c.setHSL(hue, sat, light);
    return new THREE.MeshStandardMaterial({
      color: c,
      roughness: 0.8,
      metalness: 0.02,
    });
  }, [seed]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const windStrength = 0.5 + Math.sin(t * 0.1) * 0.3;
    group.current.rotation.z = Math.sin(t * 0.35 + windOffset) * 0.02 * windStrength;
    group.current.rotation.x = Math.cos(t * 0.25 + windOffset) * 0.01 * windStrength;
  });

  return (
    <group ref={group} position={position}>
      <mesh geometry={trunkGeo} material={trunkMat} position={[0, 1.5 * scale, 0]} />
      {foliageGeos.map((f, i) => (
        <mesh key={i} geometry={f.geo} material={foliageMat} position={[f.x, f.y, 0]} />
      ))}
    </group>
  );
}

function Bush({ position, scale = 1, seed = 0 }) {
  const group = useRef();

  const geos = useMemo(() => {
    const arr = [];
    const count = 2 + Math.floor(Math.abs(Math.sin(seed * 3)) * 3);
    for (let i = 0; i < count; i++) {
      const r = (0.25 + Math.random() * 0.2) * scale;
      const x = (Math.sin(seed * (i + 1) * 2.3) * 0.3) * scale;
      const z = (Math.cos(seed * (i + 1) * 1.7) * 0.25) * scale;
      const y = r * 0.5;
      arr.push({ geo: new THREE.SphereGeometry(r, 5, 4), pos: [x, y, z] });
    }
    return arr;
  }, [scale, seed]);

  const mat = useMemo(() => {
    const hue = 0.3 + Math.sin(seed * 11) * 0.04;
    const c = new THREE.Color();
    c.setHSL(hue, 0.55, 0.08 + Math.sin(seed * 7) * 0.03);
    return new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 });
  }, [seed]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.2 + seed) * 0.02;
  });

  return (
    <group ref={group} position={position}>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g.geo} material={mat} position={g.pos} />
      ))}
    </group>
  );
}

function GlowingMushroom({ position, seed = 0 }) {
  const group = useRef();

  const stemGeo = useMemo(() => new THREE.CylinderGeometry(0.02, 0.03, 0.15, 5), []);
  const capGeo = useMemo(() => new THREE.SphereGeometry(0.06 + Math.sin(seed) * 0.02, 6, 4, 0, Math.PI * 2, 0, Math.PI * 0.6), [seed]);

  const stemMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(0.15, 0.12, 0.08),
    roughness: 0.9,
  }), []);

  const capMat = useMemo(() => {
    const hue = Math.sin(seed * 5) > 0 ? 0.45 : 0.75;
    const c = new THREE.Color();
    c.setHSL(hue, 0.7, 0.35);
    return new THREE.MeshStandardMaterial({
      color: c,
      emissive: c.clone().multiplyScalar(0.4),
      emissiveIntensity: 0.8,
      roughness: 0.6,
    });
  }, [seed]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const pulse = 0.6 + Math.sin(t * 1.5 + seed * 3) * 0.4;
    capMat.emissiveIntensity = pulse;
  });

  return (
    <group ref={group} position={position} scale={0.8 + Math.sin(seed * 7) * 0.3}>
      <mesh geometry={stemGeo} material={stemMat} position={[0, 0.075, 0]} />
      <mesh geometry={capGeo} material={capMat} position={[0, 0.16, 0]} rotation={[0, 0, 0]} />
      <pointLight
        position={[0, 0.15, 0]}
        intensity={0.06}
        color={Math.sin(seed * 5) > 0 ? "#00ffaa" : "#aa44ff"}
        distance={1.5}
        decay={2}
      />
    </group>
  );
}

function Forest({ isMobile }) {
  const { trees, bushes, mushrooms } = useMemo(() => {
    const treeArr = [];
    const bushArr = [];
    const mushArr = [];
    const treeCount = isMobile ? 20 : 40;
    const bushCount = isMobile ? 8 : 18;
    const mushCount = isMobile ? 6 : 14;

    for (let i = 0; i < treeCount; i++) {
      const angle = (i / treeCount) * Math.PI * 2;
      const radius = 5 + Math.random() * 18;
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 5;
      const z = Math.sin(angle) * radius * 0.5 - 8 + (Math.random() - 0.5) * 4;
      const s = 0.5 + Math.random() * 1.4;
      const groundY = -3 + Math.sin(x * 0.12) * Math.cos(z * 0.15) * 1.5 * 0.25;
      const variant = i % 3;
      treeArr.push({ pos: [x, groundY, z], scale: s, seed: i * 1.7, variant });
    }

    for (let i = 0; i < bushCount; i++) {
      const angle = (i / bushCount) * Math.PI * 2 + 0.5;
      const radius = 4 + Math.random() * 14;
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 3;
      const z = Math.sin(angle) * radius * 0.5 - 6 + (Math.random() - 0.5) * 3;
      const groundY = -3 + Math.sin(x * 0.12) * Math.cos(z * 0.15) * 1.5 * 0.25;
      bushArr.push({ pos: [x, groundY, z], scale: 0.6 + Math.random() * 0.8, seed: i * 2.3 + 100 });
    }

    for (let i = 0; i < mushCount; i++) {
      const x = (Math.random() - 0.5) * 20;
      const z = -3 + (Math.random() - 0.5) * 15;
      const groundY = -2.9 + Math.sin(x * 0.12) * Math.cos(z * 0.15) * 1.5 * 0.25;
      mushArr.push({ pos: [x, groundY, z], seed: i * 3.7 + 200 });
    }

    return { trees: treeArr, bushes: bushArr, mushrooms: mushArr };
  }, [isMobile]);

  return (
    <>
      {trees.map((t, i) => (
        <ProceduralTree key={`t${i}`} position={t.pos} scale={t.scale} seed={t.seed} variant={t.variant} />
      ))}
      {bushes.map((b, i) => (
        <Bush key={`b${i}`} position={b.pos} scale={b.scale} seed={b.seed} />
      ))}
      {mushrooms.map((m, i) => (
        <GlowingMushroom key={`m${i}`} position={m.pos} seed={m.seed} />
      ))}
    </>
  );
}

function Fireflies({ count = 60 }) {
  const mesh = useRef();

  const data = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const offsets = new Float32Array(count);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 1] = -2 + Math.random() * 9;
      positions[i * 3 + 2] = -22 + Math.random() * 18;
      speeds[i] = Math.random() * 0.5 + 0.08;
      offsets[i] = Math.random() * Math.PI * 2;
      sizes[i] = Math.random() * 5 + 2;
      const isWarm = Math.random() > 0.7;
      if (isWarm) {
        colors[i * 3] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 1] = 0.7 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.2;
      } else {
        colors[i * 3] = 0.2 + Math.random() * 0.2;
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.4 + Math.random() * 0.3;
      }
    }
    return { positions, speeds, offsets, sizes, colors };
  }, [count]);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying float vAlpha;
      varying vec3 vColor;
      uniform float time;
      void main() {
        vColor = color;
        vAlpha = size / 7.0;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (280.0 / -mvPos.z);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      varying vec3 vColor;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float glow = 1.0 - smoothstep(0.0, 0.5, d);
        glow = pow(glow, 2.0);
        float core = 1.0 - smoothstep(0.0, 0.15, d);
        vec3 col = mix(vColor, vec3(1.0), core * 0.5);
        gl_FragColor = vec4(col, glow * vAlpha * 0.7);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    material.uniforms.time.value = t;
    const pos = mesh.current.geometry.attributes.position.array;
    const sizeAttr = mesh.current.geometry.attributes.size;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const sp = data.speeds[i];
      const off = data.offsets[i];
      pos[i3] += Math.sin(t * sp + off) * 0.005;
      pos[i3 + 1] += Math.cos(t * sp * 0.6 + off) * 0.006;
      pos[i3 + 2] += Math.sin(t * sp * 0.35 + off * 2) * 0.004;
      if (pos[i3 + 1] > 7) pos[i3 + 1] = -2;
      if (pos[i3 + 1] < -3) pos[i3 + 1] = 7;
      const flicker = Math.sin(t * sp * 4 + off) * 0.5 + 0.5;
      const pulse = Math.sin(t * 0.5 + off * 2) * 0.3 + 0.7;
      sizeAttr.array[i] = data.sizes[i] * (0.3 + 0.7 * flicker * pulse);
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
    sizeAttr.needsUpdate = true;
  });

  return (
    <points ref={mesh} material={material}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={data.positions} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-size" array={data.sizes} count={count} itemSize={1} />
        <bufferAttribute attach="attributes-color" array={data.colors} count={count} itemSize={3} />
      </bufferGeometry>
    </points>
  );
}

function FloatingPollen({ count = 80 }) {
  const mesh = useRef();

  const data = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const offsets = new Float32Array(count);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = -2 + Math.random() * 10;
      positions[i * 3 + 2] = -18 + Math.random() * 16;
      speeds[i] = Math.random() * 0.15 + 0.03;
      offsets[i] = Math.random() * Math.PI * 2;
      sizes[i] = Math.random() * 1.5 + 0.5;
    }
    return { positions, speeds, offsets, sizes };
  }, [count]);

  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `
      attribute float size;
      varying float vAlpha;
      void main() {
        vAlpha = size / 2.0;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (120.0 / -mvPos.z);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float glow = 1.0 - smoothstep(0.0, 0.5, d);
        gl_FragColor = vec4(0.85, 0.9, 0.7, glow * vAlpha * 0.15);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    const pos = mesh.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const sp = data.speeds[i];
      const off = data.offsets[i];
      pos[i3] += Math.sin(t * sp * 0.5 + off) * 0.008 + 0.002;
      pos[i3 + 1] += Math.cos(t * sp * 0.3 + off) * 0.003 + 0.001;
      pos[i3 + 2] += Math.sin(t * sp * 0.2 + off * 1.5) * 0.003;
      if (pos[i3] > 15) pos[i3] = -15;
      if (pos[i3 + 1] > 8) pos[i3 + 1] = -2;
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh} material={material}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={data.positions} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-size" array={data.sizes} count={count} itemSize={1} />
      </bufferGeometry>
    </points>
  );
}

function GodRays() {
  const mesh = useRef();

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;

      float hash(float n) { return fract(sin(n) * 43758.5453); }

      void main() {
        float ray1 = smoothstep(0.25, 0.0, abs(vUv.x - 0.25 + sin(time * 0.08) * 0.06));
        float ray2 = smoothstep(0.18, 0.0, abs(vUv.x - 0.5 + cos(time * 0.12) * 0.04)) * 0.8;
        float ray3 = smoothstep(0.12, 0.0, abs(vUv.x - 0.72 + sin(time * 0.1 + 1.0) * 0.05)) * 0.6;
        float ray4 = smoothstep(0.1, 0.0, abs(vUv.x - 0.9 + cos(time * 0.14 + 2.0) * 0.03)) * 0.4;
        float ray5 = smoothstep(0.08, 0.0, abs(vUv.x - 0.1 + sin(time * 0.09 + 3.0) * 0.04)) * 0.35;

        float rays = ray1 + ray2 + ray3 + ray4 + ray5;

        float fade = pow(1.0 - vUv.y, 0.5) * smoothstep(0.0, 0.25, vUv.y);
        float shimmer = 0.85 + 0.15 * sin(time * 0.3 + vUv.y * 8.0);

        float alpha = rays * fade * shimmer * 0.07;

        vec3 warmGreen = vec3(0.4, 0.85, 0.35);
        vec3 coolGreen = vec3(0.3, 0.7, 0.5);
        vec3 col = mix(warmGreen, coolGreen, vUv.x);

        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  }), []);

  useFrame((state) => {
    material.uniforms.time.value = state.clock.elapsedTime;
  });

  const geo = useMemo(() => new THREE.PlaneGeometry(35, 22), []);

  return (
    <mesh ref={mesh} material={material} geometry={geo} position={[0, 5, -14]} rotation={[0.15, 0, 0]} />
  );
}

function FogLayer() {
  const mesh = useRef();

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      fogColor: { value: new THREE.Color(0.025, 0.06, 0.035) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 fogColor;
      varying vec2 vUv;
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p *= 2.0;
          a *= 0.5;
        }
        return v;
      }
      void main() {
        vec2 uv = vUv;
        uv.x += time * 0.015;
        float n = fbm(uv * 3.0 + time * 0.02);
        float edgeFade = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
        edgeFade *= smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.75, vUv.y);
        float layered = n * 0.6 + fbm(uv * 5.0 - time * 0.01) * 0.4;
        float alpha = layered * edgeFade * 0.4;
        vec3 col = mix(fogColor, fogColor * 1.3, n);
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  }), []);

  useFrame((state) => {
    material.uniforms.time.value = state.clock.elapsedTime;
  });

  const geo = useMemo(() => new THREE.PlaneGeometry(45, 10), []);

  return (
    <>
      <mesh ref={mesh} material={material} geometry={geo} position={[0, -1.2, -5]} rotation={[-0.08, 0, 0]} />
      <mesh material={material} geometry={geo} position={[0, 0.5, -10]} rotation={[-0.05, 0.1, 0]} />
    </>
  );
}

function MoonGlow() {
  const mesh = useRef();

  const geo = useMemo(() => new THREE.SphereGeometry(0.6, 16, 12), []);

  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(0.6, 0.8, 0.65),
    transparent: true,
    opacity: 0.15,
  }), []);

  const glowGeo = useMemo(() => new THREE.SphereGeometry(1.8, 12, 10), []);
  const glowMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      uniform float time;
      void main() {
        float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
        float pulse = 0.9 + 0.1 * sin(time * 0.3);
        vec3 col = vec3(0.3, 0.6, 0.4);
        gl_FragColor = vec4(col, intensity * 0.12 * pulse);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
  }), []);

  useFrame((state) => {
    glowMat.uniforms.time.value = state.clock.elapsedTime;
  });

  return (
    <group position={[8, 12, -25]}>
      <mesh geometry={geo} material={mat} />
      <mesh ref={mesh} geometry={glowGeo} material={glowMat} />
      <pointLight intensity={0.4} color="#4ade80" distance={40} decay={2} />
    </group>
  );
}

function MouseCamera() {
  const mouse = useRef({ x: 0, y: 0 });
  const smoothed = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const handleTouch = (e) => {
      if (e.touches.length > 0) {
        mouse.current.x = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
        mouse.current.y = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
      }
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('touchmove', handleTouch, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleTouch);
    };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    smoothed.current.x += (mouse.current.x - smoothed.current.x) * 0.025;
    smoothed.current.y += (mouse.current.y - smoothed.current.y) * 0.025;

    const breathe = Math.sin(t * 0.08) * 0.15;
    const baseX = Math.sin(t * 0.04) * 0.4 + breathe;
    const baseY = 1.8 + Math.cos(t * 0.035) * 0.25;

    state.camera.position.x = baseX + smoothed.current.x * 1.8;
    state.camera.position.y = baseY - smoothed.current.y * 0.9;
    state.camera.position.z = 8;

    state.camera.lookAt(
      smoothed.current.x * 0.6,
      0.3 + Math.sin(t * 0.06) * 0.1,
      -5
    );
  });

  return null;
}

function SceneLighting({ isMobile }) {
  return (
    <>
      <ambientLight intensity={0.12} color="#0d2a0d" />
      <directionalLight
        position={[8, 12, 5]}
        intensity={0.25}
        color="#66d98a"
        castShadow={false}
      />
      <directionalLight
        position={[-4, 10, -3]}
        intensity={0.12}
        color="#88eebb"
      />
      {!isMobile && (
        <directionalLight
          position={[0, -2, 5]}
          intensity={0.06}
          color="#1a4a2a"
        />
      )}
      <pointLight position={[0, 4, -3]} intensity={0.18} color="#22c55e" distance={18} decay={2} />
      {!isMobile && (
        <>
          <pointLight position={[-8, 2, -10]} intensity={0.1} color="#10b981" distance={14} decay={2} />
          <pointLight position={[7, 1, -12]} intensity={0.08} color="#4ade80" distance={12} decay={2} />
          <pointLight position={[0, -2, 2]} intensity={0.05} color="#0ea5e9" distance={8} decay={2} />
        </>
      )}
    </>
  );
}

export function ThreeBackground() {
  const [webglSupported, setWebglSupported] = useState(() => isWebGLAvailable());
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (!webglSupported) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" data-testid="three-background">
      <WebGLErrorBoundary>
        <Canvas
          camera={{ position: [0, 1.8, 8], fov: 55, near: 0.1, far: 80 }}
          dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5)}
          gl={{
            antialias: !isMobile,
            alpha: true,
            powerPreference: "default",
            stencil: false,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color(0, 0, 0), 0);
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.0;
            if (!gl.getContext()) setWebglSupported(false);
          }}
        >
          <fog attach="fog" args={['#010a04', 10, 45]} />

          <MouseCamera />
          <SceneLighting isMobile={isMobile} />
          <MoonGlow />

          <ForestGround isMobile={isMobile} />
          <Forest isMobile={isMobile} />
          <GodRays />
          <FogLayer />

          <Fireflies count={isMobile ? 25 : 60} />
          {!isMobile && <FloatingPollen count={80} />}

          <Stars
            radius={30}
            depth={35}
            count={isMobile ? 600 : 1800}
            factor={2.8}
            saturation={0.15}
            fade
            speed={0.25}
          />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
