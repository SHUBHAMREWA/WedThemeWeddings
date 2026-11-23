import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import Logo from "@/components/Logo";
import type { Settings } from "@/lib/data";
import { SERVICE_CATEGORIES } from "@/lib/constants";

function Social({ href, label, children }: { href?: string; label: string; children: React.ReactNode }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-brand-500"
    >
      {children}
    </a>
  );
}

export default function Footer({ s }: { s: Settings }) {
  return (
    <footer className="bg-[#1f1f23] text-gray-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" aria-label={s.siteName} className="inline-block">
            <Logo variant="white" className="h-16" />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">{s.tagline}. Candid photography, cinematic films and aerial drone coverage for every celebration.</p>
          <div className="mt-5 flex gap-2">
            <Social href={s.instagram} label="Instagram">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.1a6.7 6.7 0 100 13.4 6.7 6.7 0 000-13.4zm0 11a4.3 4.3 0 110-8.6 4.3 4.3 0 010 8.6zm6.9-11.3a1.6 1.6 0 11-3.1 0 1.6 1.6 0 013.1 0z"/></svg>
            </Social>
            <Social href={s.youtube} label="YouTube">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>
            </Social>
            <Social href={s.facebook} label="Facebook">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.2-1.4 1.5-1.4h1.5V4.5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.3H8v3h2.6V21h2.9z"/></svg>
            </Social>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">Services</h3>
          <ul className="space-y-2 text-sm">
            {SERVICE_CATEGORIES.map((c) => (
              <li key={c}>
                <Link href={`/services?category=${encodeURIComponent(c)}`} className="hover:text-brand-300">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">Explore</h3>
          <ul className="space-y-2 text-sm">
            {[
              ["/portfolio", "Portfolio"],
              ["/packages", "Packages & pricing"],
              ["/about", "About us"],
              ["/contact", "Book a shoot"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-brand-300">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          {s.cities?.length > 0 && (
            <>
              <h3 className="mb-3 mt-6 text-sm font-bold uppercase tracking-widest text-white">We shoot in</h3>
              <p className="text-sm text-gray-400">{s.cities.join(" · ")}</p>
            </>
          )}
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">Contact</h3>
          <ul className="space-y-3 text-sm">
            {s.phone && (
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="hover:text-brand-300">{s.phone}</a>
              </li>
            )}
            {s.email && (
              <li className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <a href={`mailto:${s.email}`} className="hover:text-brand-300">{s.email}</a>
              </li>
            )}
            {s.address && (
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <span>{s.address}</span>
              </li>
            )}
          </ul>
          <Link href="/contact" className="btn-primary mt-6">
            Check availability
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-4 py-5 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} {s.siteName}. All rights reserved.</p>
          <p>Wedding photography · Cinematography · Drone shoots · Event coverage</p>
        </div>
      </div>
    </footer>
  );
}
