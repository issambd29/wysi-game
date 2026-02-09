import { Suspense } from "react";
import { ThreeBackground } from "./ThreeBackground";

export function BackgroundEffects() {
  return (
    <div className="background-effects fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <Suspense fallback={null}>
        <ThreeBackground />
      </Suspense>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-10" />

      <div className="absolute top-[-20%] left-[20%] w-[200px] h-[150vh] bg-white/5 rotate-[25deg] blur-3xl transform-gpu pointer-events-none" />
      <div className="absolute top-[-20%] right-[30%] w-[300px] h-[150vh] bg-accent/5 rotate-[-15deg] blur-3xl transform-gpu pointer-events-none" />
    </div>
  );
}
