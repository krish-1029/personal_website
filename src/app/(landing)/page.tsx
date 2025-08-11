import Link from "next/link";
import FadeContent from "~/components/FadeContent";

export default function LandingPage() {
  return (
    <section className="px-4 h-full">
      <div className="mx-auto flex w-full max-w-5xl min-h-[80svh] flex-col items-center justify-center gap-6 text-center">
        <FadeContent blur duration={800} easing="ease-out" initialOpacity={0} delay={0}>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            Krish · Developer, Musician, Writer
          </h1>
        </FadeContent>
        <FadeContent blur duration={800} easing="ease-out" initialOpacity={0} delay={80}>
          <p className="max-w-2xl text-white/80">
            &ldquo;The day you teach someone the name of a bird, they will never see that bird again&rdquo;
          </p>
          <p className="max-w-2xl italic text-white/80">~ J.Krishnamurti</p>
        </FadeContent>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <FadeContent blur duration={800} easing="ease-out" initialOpacity={0} delay={0}>
            <Link href="/portfolio" className="rounded bg-white px-4 py-2 font-medium text-[#15162c] hover:bg-white/90">
              View Portfolio
            </Link>
          </FadeContent>
          <FadeContent blur duration={800} easing="ease-out" initialOpacity={0} delay={120}>
            <Link href="/music" className="rounded border border-white/30 px-4 py-2 font-medium text-white hover:bg-white/10">
              Listen to Music
            </Link>
          </FadeContent>
          <FadeContent blur duration={800} easing="ease-out" initialOpacity={0} delay={240}>
            <Link href="/contact" className="rounded border border-white/30 px-4 py-2 font-medium text-white hover:bg-white/10">
              Contact Me
            </Link>
          </FadeContent>
        </div>
      </div>
    </section>
  );
} 