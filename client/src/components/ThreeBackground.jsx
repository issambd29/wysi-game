import { useRef, useMemo, useState, useEffect, Component } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
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

function EnergyOrbs({ count = 30 }) {
  const mesh = useRef();

  const data = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const offsets = new Float32Array(count);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const ring = Math.floor(i / 8);
      const angleStep = (i % 8) / 8 * Math.PI * 2;
      const radius = 3 + ring * 4 + Math.random() * 2;
      positions[i * 3] = Math.cos(angleStep) * radius + (Math.random() - 0.5) * 3;
      positions[i * 3 + 1] = -1 + Math.random() * 6;
      positions[i * 3 + 2] = -15 + Math.sin(angleStep) * radius * 0.5 + (Math.random() - 0.5) * 4;
      speeds[i] = Math.random() * 0.3 + 0.05;
      offsets[i] = Math.random() * Math.PI * 2;
      sizes[i] = Math.random() * 8 + 3;
      const type = Math.random();
      if (type > 0.6) {
        colors[i * 3] = 0.3;
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 0.5;
      } else if (type > 0.3) {
        colors[i * 3] = 0.2;
        colors[i * 3 + 1] = 0.85;
        colors[i * 3 + 2] = 0.9;
      } else {
        colors[i * 3] = 0.95;
        colors[i * 3 + 1] = 0.85;
        colors[i * 3 + 2] = 0.3;
      }
    }
    return { positions, speeds, offsets, sizes, colors };
  }, [count]);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying float vAlpha;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vAlpha = size / 11.0;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (350.0 / -mvPos.z);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      varying vec3 vColor;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float outerGlow = 1.0 - smoothstep(0.0, 0.5, d);
        outerGlow = pow(outerGlow, 1.8);
        float core = 1.0 - smoothstep(0.0, 0.12, d);
        vec3 col = mix(vColor, vec3(1.0), core * 0.7);
        gl_FragColor = vec4(col, outerGlow * vAlpha * 0.8);
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
      pos[i3] += Math.sin(t * sp + off) * 0.006;
      pos[i3 + 1] += Math.cos(t * sp * 0.5 + off) * 0.008;
      pos[i3 + 2] += Math.sin(t * sp * 0.3 + off * 2) * 0.004;
      if (pos[i3 + 1] > 7) pos[i3 + 1] = -1;
      if (pos[i3 + 1] < -2) pos[i3 + 1] = 6;
      const flicker = Math.sin(t * sp * 3 + off) * 0.4 + 0.6;
      const pulse = Math.sin(t * 0.4 + off * 2) * 0.3 + 0.7;
      sizeAttr.array[i] = data.sizes[i] * flicker * pulse;
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

function SpiralVines({ count = 5 }) {
  const group = useRef();

  const vines = useMemo(() => {
    const arr = [];
    for (let v = 0; v < count; v++) {
      const points = [];
      const baseX = (v - count / 2) * 5 + (Math.random() - 0.5) * 3;
      const baseZ = -8 - Math.random() * 10;
      const turns = 2 + Math.random() * 2;
      const height = 6 + Math.random() * 4;
      const radius = 0.5 + Math.random() * 0.8;
      for (let i = 0; i <= 60; i++) {
        const t = i / 60;
        const angle = t * turns * Math.PI * 2;
        const r = radius * (1 - t * 0.3);
        points.push(new THREE.Vector3(
          baseX + Math.cos(angle) * r,
          -3 + t * height,
          baseZ + Math.sin(angle) * r
        ));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const geo = new THREE.TubeGeometry(curve, 40, 0.03, 5, false);
      arr.push({ geo, seed: v * 2.7 });
    }
    return arr;
  }, [count]);

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(0.05, 0.25, 0.1),
    emissive: new THREE.Color(0.02, 0.12, 0.04),
    emissiveIntensity: 0.5,
    roughness: 0.7,
  }), []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.03) * 0.02;
  });

  return (
    <group ref={group}>
      {vines.map((v, i) => (
        <mesh key={i} geometry={v.geo} material={mat} />
      ))}
    </group>
  );
}

function GlowingRunes() {
  const mesh = useRef();

  const geo = useMemo(() => {
    const count = 8;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const offsets = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 6 + Math.sin(i * 1.5) * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = -2.5 + Math.sin(i * 2.3) * 0.3;
      positions[i * 3 + 2] = -5 + Math.sin(angle) * radius * 0.4;
      sizes[i] = 6 + Math.random() * 4;
      offsets[i] = i * 0.8;
    }
    return { positions, sizes, offsets, count };
  }, []);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      attribute float size;
      attribute float offset;
      varying float vAlpha;
      varying float vOffset;
      uniform float time;
      void main() {
        vOffset = offset;
        float pulse = 0.5 + 0.5 * sin(time * 0.8 + offset * 2.0);
        vAlpha = pulse;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * pulse * (200.0 / -mvPos.z);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      varying float vOffset;
      uniform float time;
      void main() {
        vec2 p = gl_PointCoord - vec2(0.5);
        float d = length(p);
        if (d > 0.5) discard;
        float ring = abs(d - 0.3);
        float ringGlow = smoothstep(0.08, 0.0, ring);
        float inner = 1.0 - smoothstep(0.0, 0.15, d);
        float cross1 = smoothstep(0.04, 0.0, abs(p.x)) * smoothstep(0.35, 0.0, abs(p.y));
        float cross2 = smoothstep(0.04, 0.0, abs(p.y)) * smoothstep(0.35, 0.0, abs(p.x));
        float pattern = max(ringGlow, max(inner, (cross1 + cross2) * 0.5));
        vec3 col = mix(vec3(0.1, 0.9, 0.4), vec3(0.3, 1.0, 0.7), inner);
        gl_FragColor = vec4(col, pattern * vAlpha * 0.25);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  useFrame((state) => {
    material.uniforms.time.value = state.clock.elapsedTime;
  });

  return (
    <points ref={mesh} material={material}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={geo.positions} count={geo.count} itemSize={3} />
        <bufferAttribute attach="attributes-size" array={geo.sizes} count={geo.count} itemSize={1} />
        <bufferAttribute attach="attributes-offset" array={geo.offsets} count={geo.count} itemSize={1} />
      </bufferGeometry>
    </points>
  );
}

function AuroraSheet() {
  const mesh = useRef();

  const geo = useMemo(() => new THREE.PlaneGeometry(50, 15, 80, 1), []);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      varying float vWave;
      uniform float time;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float wave = sin(pos.x * 0.3 + time * 0.2) * 0.8 +
                     sin(pos.x * 0.7 + time * 0.15) * 0.4 +
                     cos(pos.x * 0.15 + time * 0.1) * 1.2;
        pos.y += wave;
        vWave = wave;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying float vWave;
      uniform float time;
      void main() {
        float edgeFade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
        float vertFade = smoothstep(0.0, 0.4, vUv.y) * smoothstep(1.0, 0.6, vUv.y);

        vec3 green = vec3(0.1, 0.8, 0.3);
        vec3 cyan = vec3(0.1, 0.5, 0.8);
        vec3 teal = vec3(0.05, 0.6, 0.5);
        float t = sin(vUv.x * 3.0 + time * 0.1) * 0.5 + 0.5;
        vec3 col = mix(green, cyan, t);
        col = mix(col, teal, sin(vUv.x * 5.0 + time * 0.15) * 0.5 + 0.5);

        float shimmer = sin(vUv.x * 20.0 + time * 0.5) * 0.15 + 0.85;
        float alpha = edgeFade * vertFade * shimmer * 0.06;
        alpha *= smoothstep(-1.0, 1.0, vWave) * 0.8 + 0.2;

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

  return (
    <mesh ref={mesh} material={material} geometry={geo} position={[0, 8, -20]} rotation={[0.3, 0, 0]} />
  );
}

function GodRays() {
  const mesh = useRef();

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
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
        float ray1 = smoothstep(0.22, 0.0, abs(vUv.x - 0.2 + sin(time * 0.06) * 0.08)) * 1.0;
        float ray2 = smoothstep(0.16, 0.0, abs(vUv.x - 0.45 + cos(time * 0.1) * 0.05)) * 0.8;
        float ray3 = smoothstep(0.12, 0.0, abs(vUv.x - 0.65 + sin(time * 0.08 + 1.0) * 0.06)) * 0.6;
        float ray4 = smoothstep(0.1, 0.0, abs(vUv.x - 0.85 + cos(time * 0.12 + 2.0) * 0.04)) * 0.5;
        float rays = ray1 + ray2 + ray3 + ray4;
        float fade = pow(1.0 - vUv.y, 0.4) * smoothstep(0.0, 0.2, vUv.y);
        float shimmer = 0.8 + 0.2 * sin(time * 0.25 + vUv.y * 6.0);
        float alpha = rays * fade * shimmer * 0.12;
        vec3 col = mix(vec3(0.5, 0.95, 0.4), vec3(0.2, 0.7, 0.6), vUv.x);
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

  const geo = useMemo(() => new THREE.PlaneGeometry(40, 25), []);

  return (
    <mesh ref={mesh} material={material} geometry={geo} position={[0, 6, -16]} rotation={[0.1, 0, 0]} />
  );
}

function FloatingLeaves({ count = 20 }) {
  const group = useRef();

  const leaves = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 25,
        y: Math.random() * 10 - 2,
        z: -15 + Math.random() * 14,
        speed: Math.random() * 0.3 + 0.1,
        rotSpeed: Math.random() * 2 + 0.5,
        offset: Math.random() * Math.PI * 2,
        size: 0.06 + Math.random() * 0.08,
      });
    }
    return arr;
  }, [count]);

  const leafGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.3, 0.2, 0.3, 0.6, 0, 1);
    shape.bezierCurveTo(-0.3, 0.6, -0.3, 0.2, 0, 0);
    return new THREE.ShapeGeometry(shape, 4);
  }, []);

  const leafMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(0.15, 0.5, 0.2),
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  }), []);

  const refs = useRef([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((ref, i) => {
      if (!ref) return;
      const leaf = leaves[i];
      ref.position.x = leaf.x + Math.sin(t * leaf.speed + leaf.offset) * 2;
      ref.position.y = leaf.y + Math.cos(t * leaf.speed * 0.5 + leaf.offset) * 0.5 - t * 0.05 % 12;
      ref.position.z = leaf.z;
      ref.rotation.x = t * leaf.rotSpeed * 0.3;
      ref.rotation.y = t * leaf.rotSpeed * 0.5;
      ref.rotation.z = Math.sin(t * leaf.speed + leaf.offset) * 0.5;
      if (ref.position.y < -3) ref.position.y = 8;
    });
  });

  return (
    <group ref={group}>
      {leaves.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (refs.current[i] = el)}
          geometry={leafGeo}
          material={leafMat}
          scale={leaves[i].size}
        />
      ))}
    </group>
  );
}

function MistLayer() {
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
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
                   mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
      }
      float fbm(vec2 p) {
        float v = 0.0; float a = 0.5;
        for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.1; a *= 0.48; }
        return v;
      }
      void main() {
        vec2 uv = vUv;
        uv.x += time * 0.012;
        float n = fbm(uv * 4.0 + time * 0.015);
        float edgeFade = smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.75, vUv.x);
        edgeFade *= smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
        float alpha = n * edgeFade * 0.18;
        vec3 col = vec3(0.08, 0.2, 0.12);
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

  const geo = useMemo(() => new THREE.PlaneGeometry(50, 12), []);

  return (
    <>
      <mesh material={material} geometry={geo} position={[0, -1, -6]} rotation={[-0.1, 0, 0]} />
      <mesh material={material} geometry={geo} position={[2, 1, -12]} rotation={[-0.05, 0.08, 0]} />
    </>
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

    const drift = Math.sin(t * 0.06) * 0.3;
    const baseX = drift + smoothed.current.x * 2.0;
    const baseY = 2 + Math.cos(t * 0.04) * 0.3 - smoothed.current.y * 1.0;

    state.camera.position.x = baseX;
    state.camera.position.y = baseY;
    state.camera.position.z = 10;

    state.camera.lookAt(
      smoothed.current.x * 0.8,
      0.5 + Math.sin(t * 0.05) * 0.15,
      -6
    );
  });

  return null;
}

export function ThreeBackground() {
  const [webglSupported, setWebglSupported] = useState(() => isWebGLAvailable());
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (!webglSupported) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" data-testid="three-background">
      <WebGLErrorBoundary>
        <Canvas
          camera={{ position: [0, 2, 10], fov: 50, near: 0.1, far: 80 }}
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
            gl.toneMappingExposure = 1.1;
            if (!gl.getContext()) setWebglSupported(false);
          }}
        >
          <MouseCamera />

          <ambientLight intensity={0.08} color="#0a1f0a" />
          <directionalLight position={[5, 12, 4]} intensity={0.2} color="#55dd88" />
          <pointLight position={[0, 5, -5]} intensity={0.15} color="#22c55e" distance={20} decay={2} />
          {!isMobile && (
            <pointLight position={[-6, 2, -10]} intensity={0.08} color="#10b981" distance={15} decay={2} />
          )}

          <GodRays />
          <AuroraSheet />
          <MistLayer />

          <EnergyOrbs count={isMobile ? 18 : 30} />
          {!isMobile && <SpiralVines count={5} />}
          {!isMobile && <GlowingRunes />}
          <FloatingLeaves count={isMobile ? 10 : 20} />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
