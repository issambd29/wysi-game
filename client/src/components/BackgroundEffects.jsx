import { Suspense } from "react";
import { ThreeBackground } from "./ThreeBackground";
import forestBg from "@/assets/images/forest-bg.png";

function FallbackBackground() {
  return (
    <>
      <div className="absolute inset-0">
        <img
          src={forestBg}
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.7) saturate(0.9)" }}
        />
      </div>
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 40%, transparent 0%, rgba(2,10,4,0.3) 70%, rgba(0,0,0,0.5) 100%)',
      }} />
    </>
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
