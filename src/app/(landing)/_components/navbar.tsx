"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/client";

const NAV_LINKS = [
  { label: "Work", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: profile } = useQuery(orpc.profile.get.queryOptions());

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const brandName = profile?.fullName?.split(" ")[0] ?? "Portfolio";

  return (
    <>
      <nav
        data-scrolled={scrolled}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 transition-all duration-500
          data-[scrolled=true]:bg-background/90 data-[scrolled=true]:backdrop-blur-md
          data-[scrolled=true]:border-b data-[scrolled=true]:border-border
          data-[scrolled=false]:bg-transparent"
      >
        <Link
          href="/"
          className="text-foreground text-lg font-bold tracking-tight no-underline hover:text-primary transition-colors"
        >
          {brandName}
          <span className="text-primary">.</span>
        </Link>

        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className="text-muted-foreground hover:text-foreground text-xs uppercase tracking-widest transition-colors no-underline"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground text-xs uppercase tracking-wider transition-colors no-underline"
          >
            Sign in
          </Link>
          <a
            href="#contact"
            className="bg-primary text-primary-foreground text-xs uppercase tracking-wider font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-opacity no-underline"
          >
            Hire me
          </a>
        </div>

        <button
          className="md:hidden flex flex-col justify-center gap-1.5 p-2 cursor-pointer bg-transparent border-none"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span
            className="block w-5 h-px bg-foreground transition-all duration-300"
            style={{
              transform: menuOpen ? "rotate(45deg) translateY(4px)" : "none",
            }}
          />
          <span
            className="block w-5 h-px bg-foreground transition-all duration-300"
            style={{ opacity: menuOpen ? 0 : 1 }}
          />
          <span
            className="block w-5 h-px bg-foreground transition-all duration-300"
            style={{
              transform: menuOpen ? "rotate(-45deg) translateY(-4px)" : "none",
            }}
          />
        </button>
      </nav>

      <div
        className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 transition-all duration-500 md:hidden bg-background/98 backdrop-blur-xl"
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
        }}
      >
        {NAV_LINKS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            onClick={() => setMenuOpen(false)}
            className="text-foreground text-4xl font-bold hover:text-primary transition-colors no-underline"
          >
            {label}
          </a>
        ))}
        <Link
          href="/login"
          onClick={() => setMenuOpen(false)}
          className="mt-4 text-muted-foreground hover:text-foreground text-sm transition-colors no-underline"
        >
          Sign in →
        </Link>
      </div>
    </>
  );
}
