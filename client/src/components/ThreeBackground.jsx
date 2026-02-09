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

function ForestGround() {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(60, 40, 80, 60);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const height =
        Math.sin(x * 0.15) * Math.cos(y * 0.2) * 1.2 +
        Math.sin(x * 0.4 + y * 0.3) * 0.4 +
        Math.sin(x * 0.8) * Math.cos(y * 0.6) * 0.15 +
        (Math.random() - 0.5) * 0.08;
      pos.setZ(i, height);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      fogColor: { value: new THREE.Color(0.01, 0.04, 0.02) },
      fogNear: { value: 8 },
      fogFar: { value: 30 },
    },
    vertexShader: `
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying float vFog;
      uniform float fogNear;
      uniform float fogFar;
      void main() {
        vPosition = position;
        vNormal = normal;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        float fogDist = -mvPos.z;
        vFog = smoothstep(fogNear, fogFar, fogDist);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying float vFog;
      uniform vec3 fogColor;
      uniform float time;
      void main() {
        float h = vPosition.z;
        vec3 darkGreen = vec3(0.02, 0.08, 0.03);
        vec3 medGreen = vec3(0.04, 0.14, 0.06);
        vec3 lightGreen = vec3(0.06, 0.2, 0.08);
        vec3 col = mix(darkGreen, medGreen, smoothstep(-0.5, 0.5, h));
        col = mix(col, lightGreen, smoothstep(0.5, 1.5, h));
        float light = dot(vNormal, normalize(vec3(0.3, 0.5, 1.0)));
        light = light * 0.3 + 0.7;
        col *= light;
        float moss = sin(vPosition.x * 3.0) * cos(vPosition.y * 4.0) * 0.5 + 0.5;
        col = mix(col, col * vec3(0.8, 1.1, 0.7), moss * 0.15);
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

function ProceduralTree({ position, scale = 1, seed = 0 }) {
  const group = useRef();
  const windOffset = useMemo(() => seed * 2.5, [seed]);

  const trunkGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.08 * scale, 0.15 * scale, 3 * scale, 6);
    return geo;
  }, [scale]);

  const foliageGeo = useMemo(() => {
    const r = (0.8 + Math.sin(seed) * 0.3) * scale;
    return new THREE.IcosahedronGeometry(r, 1);
  }, [scale, seed]);

  const foliage2Geo = useMemo(() => {
    const r = (0.5 + Math.cos(seed * 2) * 0.2) * scale;
    return new THREE.IcosahedronGeometry(r, 1);
  }, [scale, seed]);

  const trunkMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(0.15, 0.08, 0.04),
    roughness: 0.95,
  }), []);

  const foliageMat = useMemo(() => {
    const hue = 0.28 + Math.sin(seed * 3) * 0.05;
    const sat = 0.5 + Math.cos(seed * 7) * 0.15;
    const light = 0.12 + Math.sin(seed * 5) * 0.04;
    const c = new THREE.Color();
    c.setHSL(hue, sat, light);
    return new THREE.MeshStandardMaterial({
      color: c,
      roughness: 0.85,
    });
  }, [seed]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.z = Math.sin(t * 0.3 + windOffset) * 0.015;
    group.current.rotation.x = Math.cos(t * 0.2 + windOffset) * 0.008;
  });

  const foliageY = 1.8 * scale;
  const foliage2Y = 2.5 * scale;
  const foliage2X = (Math.sin(seed * 4) * 0.3) * scale;

  return (
    <group ref={group} position={position}>
      <mesh geometry={trunkGeo} material={trunkMat} position={[0, 1.5 * scale, 0]} />
      <mesh geometry={foliageGeo} material={foliageMat} position={[0, foliageY, 0]} />
      <mesh geometry={foliage2Geo} material={foliageMat} position={[foliage2X, foliage2Y, 0]} />
    </group>
  );
}

function Forest({ isMobile }) {
  const trees = useMemo(() => {
    const arr = [];
    const count = isMobile ? 18 : 35;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 6 + Math.random() * 16;
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 4;
      const z = Math.sin(angle) * radius * 0.5 - 8 + (Math.random() - 0.5) * 3;
      const s = 0.6 + Math.random() * 1.2;
      const dist = Math.sqrt(x * x + (z + 5) * (z + 5));
      const groundY = -3 + Math.sin(x * 0.15) * Math.cos(z * 0.2) * 1.2 * 0.3;
      arr.push({ pos: [x, groundY, z], scale: s, seed: i * 1.7 });
    }
    return arr;
  }, [isMobile]);

  return (
    <>
      {trees.map((t, i) => (
        <ProceduralTree key={i} position={t.pos} scale={t.scale} seed={t.seed} />
      ))}
    </>
  );
}

function Fireflies({ count = 50 }) {
  const mesh = useRef();

  const data = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const offsets = new Float32Array(count);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = -2 + Math.random() * 8;
      positions[i * 3 + 2] = -20 + Math.random() * 15;
      speeds[i] = Math.random() * 0.4 + 0.1;
      offsets[i] = Math.random() * Math.PI * 2;
      sizes[i] = Math.random() * 4 + 2;
    }
    return { positions, speeds, offsets, sizes };
  }, [count]);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0.35, 0.95, 0.5) },
    },
    vertexShader: `
      attribute float size;
      varying float vAlpha;
      void main() {
        vAlpha = size / 6.0;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (250.0 / -mvPos.z);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float glow = 1.0 - smoothstep(0.0, 0.5, d);
        glow = pow(glow, 2.5);
        gl_FragColor = vec4(color, glow * vAlpha * 0.6);
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
    const sizeAttr = mesh.current.geometry.attributes.size;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const sp = data.speeds[i];
      const off = data.offsets[i];
      pos[i3] += Math.sin(t * sp + off) * 0.004;
      pos[i3 + 1] += Math.cos(t * sp * 0.7 + off) * 0.005;
      pos[i3 + 2] += Math.sin(t * sp * 0.4 + off * 2) * 0.003;
      if (pos[i3 + 1] > 6) pos[i3 + 1] = -2;
      sizeAttr.array[i] = data.sizes[i] * (0.4 + 0.6 * Math.sin(t * sp * 3 + off));
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
    sizeAttr.needsUpdate = true;
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
      void main() {
        float ray1 = smoothstep(0.3, 0.0, abs(vUv.x - 0.3 + sin(time * 0.1) * 0.05));
        float ray2 = smoothstep(0.2, 0.0, abs(vUv.x - 0.6 + cos(time * 0.15) * 0.03)) * 0.7;
        float ray3 = smoothstep(0.15, 0.0, abs(vUv.x - 0.8 + sin(time * 0.12) * 0.04)) * 0.5;
        float rays = ray1 + ray2 + ray3;
        float fade = pow(1.0 - vUv.y, 0.6) * smoothstep(0.0, 0.3, vUv.y);
        float alpha = rays * fade * 0.08;
        vec3 col = vec3(0.5, 0.9, 0.4);
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

  const geo = useMemo(() => new THREE.PlaneGeometry(30, 18), []);

  return (
    <mesh ref={mesh} material={material} geometry={geo} position={[0, 4, -12]} rotation={[0.2, 0, 0]} />
  );
}

function FogLayer() {
  const mesh = useRef();

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      fogColor: { value: new THREE.Color(0.03, 0.08, 0.04) },
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
      void main() {
        vec2 uv = vUv;
        uv.x += time * 0.02;
        float n = noise(uv * 3.0) * 0.5 + noise(uv * 6.0 + time * 0.03) * 0.3;
        float edgeFade = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
        edgeFade *= smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
        float alpha = n * edgeFade * 0.35;
        gl_FragColor = vec4(fogColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  }), []);

  useFrame((state) => {
    material.uniforms.time.value = state.clock.elapsedTime;
  });

  const geo = useMemo(() => new THREE.PlaneGeometry(40, 8), []);

  return (
    <mesh ref={mesh} material={material} geometry={geo} position={[0, -1.5, -6]} rotation={[-0.1, 0, 0]} />
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
    smoothed.current.x += (mouse.current.x - smoothed.current.x) * 0.03;
    smoothed.current.y += (mouse.current.y - smoothed.current.y) * 0.03;

    const baseX = Math.sin(t * 0.05) * 0.3;
    const baseY = 1.5 + Math.cos(t * 0.04) * 0.2;

    state.camera.position.x = baseX + smoothed.current.x * 1.5;
    state.camera.position.y = baseY - smoothed.current.y * 0.8;
    state.camera.position.z = 8;

    state.camera.lookAt(
      smoothed.current.x * 0.5,
      0.5,
      -5
    );
  });

  return null;
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.15} color="#1a3a1a" />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.3}
        color="#4ade80"
        castShadow={false}
      />
      <directionalLight
        position={[-3, 8, -2]}
        intensity={0.15}
        color="#86efac"
      />
      <pointLight position={[0, 3, -3]} intensity={0.2} color="#22c55e" distance={15} decay={2} />
      <pointLight position={[-6, 1, -8]} intensity={0.1} color="#10b981" distance={12} decay={2} />
      <pointLight position={[6, 2, -10]} intensity={0.08} color="#4ade80" distance={10} decay={2} />
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
          camera={{ position: [0, 1.5, 8], fov: 55, near: 0.1, far: 80 }}
          dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5)}
          gl={{
            antialias: !isMobile,
            alpha: false,
            powerPreference: "default",
            stencil: false,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color(0.01, 0.04, 0.02), 1);
            if (!gl.getContext()) setWebglSupported(false);
          }}
        >
          <fog attach="fog" args={['#020a04', 8, 35]} />

          <MouseCamera />
          <SceneLighting />

          <ForestGround />
          <Forest isMobile={isMobile} />
          <GodRays />
          <FogLayer />

          <Fireflies count={isMobile ? 25 : 50} />

          <Stars
            radius={25}
            depth={30}
            count={isMobile ? 500 : 1500}
            factor={2.5}
            saturation={0.2}
            fade
            speed={0.3}
          />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
