"use client";

import Beams from "~/components/Beams";

export default function BeamsHero() {
  return (
    <section className="relative w-full h-[80vh]">
      <Beams
        beamWidth={2}
        beamHeight={60}
        beamNumber={12}
        lightColor="#ffffff"
        speed={2}
        noiseIntensity={1.75}
        scale={0.2}
        rotation={0}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0f1020]/40 to-[#0f1020]" />
    </section>
  );
} 