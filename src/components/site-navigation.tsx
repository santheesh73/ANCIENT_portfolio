"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/work", "Work"],
  ["/about", "About"],
  ["/contact", "Contact"],
] as const;

export function SiteNavigation() {
  const path = usePathname();
  return (
    <nav aria-label="Main navigation">
      {links.map(([href, label]) => (
        <Link
          key={href}
          href={href}
          aria-current={path === href || path.startsWith(href + "/") ? "page" : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
