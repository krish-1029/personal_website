"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import FadeContent from "@/components/FadeContent";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/music", label: "Music" },
  // { href: "/writings", label: "Writings" }, // temporarily hidden
  { href: "/contact", label: "Contact" },
];

function NavButton({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link href={href} className="inline-flex">
      <Button variant={isActive ? "default" : "ghost"} size="lg">
        {label}
      </Button>
    </Link>
  );
}

export default function Header() {
  return (
    <header className="sticky top-6 z-50 w-full bg-transparent">
      <FadeContent duration={800} easing="ease-out" initialOpacity={0}>
        <div className="mx-auto w-fit max-w-[92vw] rounded-2xl border border-white/10 bg-white/10 pl-4 pr-2 py-1 backdrop-blur-md supports-[backdrop-filter]:bg-white/10">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Krish" width={45} height={45} priority />
              <span className="sr-only">krish.dev</span>
            </Link>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <NavButton key={item.href} href={item.href} label={item.label} />
              ))}
            </nav>
          </div>
        </div>
      </FadeContent>
    </header>
  );
} 