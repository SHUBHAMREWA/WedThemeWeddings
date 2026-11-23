"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Menu, Phone, X } from "lucide-react";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/packages", label: "Packages" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header({ siteName, phone, email }: { siteName: string; phone?: string; email?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      {/* Top strip */}
      <div className="hidden bg-brand-500 text-xs text-white md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <p>Wedding & event photography, cinematography and drone shoots across India</p>
          <div className="flex items-center gap-5">
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:underline">
                <Phone className="h-3.5 w-3.5" /> {phone}
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:underline">
                <Mail className="h-3.5 w-3.5" /> {email}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className={cn("border-b border-line bg-white transition-shadow", scrolled && "shadow-sm")}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-24">
          <Link href="/" className="flex items-center" onClick={() => setOpen(false)} aria-label={siteName}>
            <Logo priority className="h-12 md:h-[72px]" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "relative px-3 py-2 text-[15px] font-bold transition hover:text-brand-500",
                    active ? "text-brand-500" : "text-ink"
                  )}
                >
                  {l.label}
                  {active && <span className="absolute inset-x-3 -bottom-[27px] h-[3px] rounded-t bg-brand-500" />}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/contact" className="btn-primary hidden sm:inline-flex">
              Get a Quote
            </Link>
            <button className="p-2 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-line bg-white px-4 pb-4 lg:hidden">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block border-b border-line py-3 font-bold",
                  (l.href === "/" ? pathname === "/" : pathname.startsWith(l.href)) ? "text-brand-500" : "text-ink"
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/contact" onClick={() => setOpen(false)} className="btn-primary mt-4 w-full">
              Get a Quote
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
