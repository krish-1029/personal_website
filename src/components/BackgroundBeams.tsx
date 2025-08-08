"use client";

import Beams from "~/components/Beams";

export default function BackgroundBeams() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Beams
        beamWidth={2}
        beamHeight={80}
        beamNumber={12}
        lightColor="#ffffff"
        speed={2}
        noiseIntensity={1.75}
        scale={0.2}
        rotation={0}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0f1020]/20 via-transparent to-[#0f1020]/60" />
    </div>
  );
} 