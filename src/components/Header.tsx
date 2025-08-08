"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/music", label: "Music" },
  { href: "/writings", label: "Writings" },
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
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-transparent backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2 md:py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Krish"
            width={56}
            height={56}
            priority
          />
          <span className="sr-only">krish.dev</span>
        </Link>
        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <NavButton key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
      </div>
    </header>
  );
} 