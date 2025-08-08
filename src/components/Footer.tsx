export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-white/10 py-8 text-center text-sm text-white/60">
      <div className="mx-auto max-w-5xl px-4">
        © {year} Krish · Built with Next.js · Deployed on Vercel
      </div>
    </footer>
  );
} 