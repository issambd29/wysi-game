import { useRef, useMemo, useState, Component } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
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

function Fireflies({ count = 40 }) {
  const mesh = useRef();
  const light = useRef();

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const offsets = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      speeds[i] = Math.random() * 0.3 + 0.1;
      offsets[i] = Math.random() * Math.PI * 2;
      sizes[i] = Math.random() * 3 + 1.5;
    }

    return { positions, speeds, offsets, sizes };
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.elapsedTime;
    const posArray = mesh.current.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const speed = particles.speeds[i];
      const offset = particles.offsets[i];

      posArray[i3] += Math.sin(time * speed + offset) * 0.003;
      posArray[i3 + 1] += Math.cos(time * speed * 0.7 + offset) * 0.004;
      posArray[i3 + 2] += Math.sin(time * speed * 0.5 + offset * 2) * 0.002;

      if (posArray[i3] > 12) posArray[i3] = -12;
      if (posArray[i3] < -12) posArray[i3] = 12;
      if (posArray[i3 + 1] > 8) posArray[i3 + 1] = -8;
      if (posArray[i3 + 1] < -8) posArray[i3 + 1] = 8;
    }

    mesh.current.geometry.attributes.position.needsUpdate = true;

    const sizeAttr = mesh.current.geometry.attributes.size;
    for (let i = 0; i < count; i++) {
      sizeAttr.array[i] = particles.sizes[i] * (0.6 + 0.4 * Math.sin(time * particles.speeds[i] * 2 + particles.offsets[i]));
    }
    sizeAttr.needsUpdate = true;
  });

  const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0.29, 0.87, 0.5) },
      time: { value: 0 },
    },
    vertexShader: `
      attribute float size;
      varying float vAlpha;
      void main() {
        vAlpha = size / 4.5;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (200.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying float vAlpha;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float glow = 1.0 - smoothstep(0.0, 0.5, dist);
        glow = pow(glow, 2.0);
        gl_FragColor = vec4(color, glow * vAlpha * 0.7);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  return (
    <points ref={mesh} material={shaderMaterial}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particles.positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          array={particles.sizes}
          count={count}
          itemSize={1}
        />
      </bufferGeometry>
    </points>
  );
}

function FloatingSpores({ count = 60 }) {
  const mesh = useRef();

  const data = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
      sizes[i] = Math.random() * 1.5 + 0.5;
      speeds[i] = Math.random() * 0.2 + 0.05;
    }

    return { positions, sizes, speeds };
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.elapsedTime;
    const posArray = mesh.current.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      posArray[i3 + 1] += data.speeds[i] * 0.008;
      posArray[i3] += Math.sin(time * 0.3 + i) * 0.002;

      if (posArray[i3 + 1] > 8) {
        posArray[i3 + 1] = -8;
        posArray[i3] = (Math.random() - 0.5) * 24;
      }
    }

    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0.45, 0.85, 0.35) },
    },
    vertexShader: `
      attribute float size;
      varying float vSize;
      void main() {
        vSize = size;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (120.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying float vSize;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.1, 0.5, dist);
        alpha *= 0.25;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  return (
    <points ref={mesh} material={material}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={data.positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          array={data.sizes}
          count={count}
          itemSize={1}
        />
      </bufferGeometry>
    </points>
  );
}

const orbGeometry = new THREE.SphereGeometry(1, 16, 16);

function EnergyOrb({ position, color, speed = 1, size = 0.3 }) {
  const meshRef = useRef();
  const material = useMemo(() => new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
  }), [color]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed;
    meshRef.current.position.y = position[1] + Math.sin(t) * 0.5;
    meshRef.current.position.x = position[0] + Math.cos(t * 0.7) * 0.3;
    const s = size * (1 + Math.sin(t * 2) * 0.15);
    meshRef.current.scale.setScalar(s);
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position} geometry={orbGeometry} material={material} />
    </Float>
  );
}

function NatureTerrain() {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(30, 30, 40, 40);
    const posAttr = geo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = Math.sin(x * 0.3) * Math.cos(y * 0.3) * 0.8
        + Math.sin(x * 0.8 + y * 0.5) * 0.3;
      posAttr.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    meshRef.current.rotation.z = Math.sin(time * 0.05) * 0.02;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2.5, 0, 0]}
      position={[0, -5, -8]}
    >
      <meshBasicMaterial
        color={new THREE.Color(0.04, 0.2, 0.08)}
        wireframe
        transparent
        opacity={0.08}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

const vineMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color(0.2, 0.6, 0.3),
  transparent: true,
  opacity: 0.12,
  blending: THREE.AdditiveBlending,
});

function VineSpiral({ position, rotation }) {
  const geometry = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 60; i++) {
      const t = i / 60;
      const angle = t * Math.PI * 4;
      const radius = 0.3 + t * 1.2;
      pts.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        t * 4 - 2,
        Math.sin(angle) * radius
      ));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 60, 0.02, 6, false);
  }, []);

  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} geometry={geometry} material={vineMaterial} />
  );
}

function CameraRig() {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    state.camera.position.x = Math.sin(t * 0.08) * 0.5;
    state.camera.position.y = Math.cos(t * 0.06) * 0.3;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export function ThreeBackground() {
  const [webglSupported, setWebglSupported] = useState(() => isWebGLAvailable());
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const fireflyCount = isMobile ? 20 : 40;
  const sporeCount = isMobile ? 30 : 60;

  if (!webglSupported) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" data-testid="three-background">
      <WebGLErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5)}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: "low-power",
            stencil: false,
            depth: false,
          }}
          style={{ background: 'transparent' }}
          onCreated={({ gl }) => {
            if (!gl.getContext()) setWebglSupported(false);
          }}
        >
          <CameraRig />

          <ambientLight intensity={0.05} color="#4ade80" />

          <Fireflies count={fireflyCount} />
          <FloatingSpores count={sporeCount} />

          <EnergyOrb position={[-4, 2, -3]} color="#4ade80" speed={0.8} size={0.4} />
          <EnergyOrb position={[5, -1, -4]} color="#22c55e" speed={1.2} size={0.3} />
          <EnergyOrb position={[0, 3, -5]} color="#10b981" speed={0.6} size={0.5} />
          <EnergyOrb position={[-3, -2, -2]} color="#86efac" speed={1.0} size={0.25} />

          <NatureTerrain />

          {!isMobile && (
            <>
              <VineSpiral position={[-6, -2, -4]} rotation={[0, 0, 0.3]} />
              <VineSpiral position={[7, -1, -5]} rotation={[0, Math.PI, -0.2]} />
            </>
          )}

          <Stars
            radius={15}
            depth={20}
            count={isMobile ? 800 : 2000}
            factor={2}
            saturation={0.3}
            fade
            speed={0.5}
          />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
