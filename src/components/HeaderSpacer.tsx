"use client";

import { usePathname } from "next/navigation";

export default function HeaderSpacer() {
  // Match the additional offset introduced by moving the header from top-3 to top-6 (delta ~ 0.75rem)
  return <div className="h-3" aria-hidden />;
} 