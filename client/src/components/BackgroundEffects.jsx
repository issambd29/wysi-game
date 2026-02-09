import { Suspense } from "react";
import { ThreeBackground } from "./ThreeBackground";

function FallbackBackground() {
  return (
    <div className="absolute inset-0" style={{
      background: 'radial-gradient(ellipse at 50% 30%, #0a2a12 0%, #020a04 50%, #000 100%)',
    }} />
  );
}

export function BackgroundEffects() {
  return (
    <div className="background-effects fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <FallbackBackground />
      <Suspense fallback={null}>
        <ThreeBackground />
      </Suspense>
    </div>
  );
}
