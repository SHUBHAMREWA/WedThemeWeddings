import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, FileDown, MapPin, Star } from "lucide-react";
import type { Album, Pkg, Service, Testimonial } from "@/lib/data";
import { cn, formatINR } from "@/lib/utils";

export function SectionHeading({
  kicker,
  title,
  subtitle,
  center = true,
  light,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <div className={cn("mb-10", center && "mx-auto max-w-2xl text-center")}>
      {kicker && <p className="section-kicker">{kicker}</p>}
      <h2 className={cn("font-display mt-2 text-3xl md:text-4xl", light ? "text-white" : "text-ink")}>{title}</h2>
      <div className={cn("mt-3 flex items-center gap-2", center && "justify-center")}>
        <span className="h-px w-10 bg-brand-300" />
        <span className="h-1.5 w-1.5 rotate-45 bg-brand-500" />
        <span className="h-px w-10 bg-brand-300" />
      </div>
      {subtitle && <p className={cn("mt-4 text-[15px] leading-relaxed", light ? "text-gray-300" : "text-muted")}>{subtitle}</p>}
    </div>
  );
}

export function PageBanner({ title, subtitle, image }: { title: string; subtitle?: string; image?: string }) {
  return (
    <section className="relative flex min-h-[260px] items-center overflow-hidden bg-[#1f1f23] md:min-h-[320px]">
      {image && <Image src={image} alt="" fill priority sizes="100vw" className="object-cover opacity-45" />}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-brand-900/40" />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 text-white">
        <p className="section-kicker !text-brand-300">WedTheme Weddings</p>
        <h1 className="font-display mt-2 text-4xl md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-gray-200">{subtitle}</p>}
      </div>
    </section>
  );
}

export function ServiceCard({ s }: { s: Service }) {
  return (
    <Link href={`/services/${s.slug}`} className="group block overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-line transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
        {s.coverImage?.url && (
          <Image src={s.coverImage.url} alt={s.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-600">{s.category}</span>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-ink group-hover:text-brand-500">{s.title}</h3>
        {s.shortDescription && <p className="mt-2 line-clamp-2 text-sm text-muted">{s.shortDescription}</p>}
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          {s.startingPrice ? (
            <p className="text-sm text-muted">
              Starts at <span className="text-base font-black text-ink">{formatINR(s.startingPrice)}</span>
              {s.priceUnit && <span className="text-xs"> {s.priceUnit}</span>}
            </p>
          ) : (
            <p className="text-sm text-muted">Price on request</p>
          )}
          <ArrowRight className="h-4 w-4 text-brand-500 transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export function AlbumCard({ a, tall }: { a: Album; tall?: boolean }) {
  return (
    <Link href={`/portfolio/${a.slug}`} className="group relative block overflow-hidden rounded-xl bg-gray-100">
      <div className={cn("relative", tall ? "aspect-[3/4]" : "aspect-[4/3]")}>
        {a.coverImage?.url && (
          <Image src={a.coverImage.url} alt={a.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider">{a.eventType}</span>
        <h3 className="font-display mt-2 text-xl leading-snug">{a.title}</h3>
        {a.location && (
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-200">
            <MapPin className="h-3.5 w-3.5" /> {a.location}
          </p>
        )}
      </div>
    </Link>
  );
}

export function PackageCard({ p }: { p: Pkg }) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl bg-white p-7 ring-1 transition hover:shadow-xl",
        p.highlighted ? "shadow-xl shadow-brand-100 ring-2 ring-brand-500" : "ring-line"
      )}
    >
      {p.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
          Most popular
        </span>
      )}
      {p.eventType && <p className="section-kicker">{p.eventType}</p>}
      <h3 className="font-display mt-1 text-2xl text-ink">{p.name}</h3>
      {p.description && <p className="mt-2 text-sm text-muted">{p.description}</p>}
      <div className="mt-5">
        {p.price ? (
          <p className="text-3xl font-black text-ink">{formatINR(p.price)}</p>
        ) : (
          <p className="text-2xl font-black text-ink">On request</p>
        )}
        {p.priceNote && <p className="text-xs text-muted">{p.priceNote}</p>}
      </div>
      <ul className="mt-6 flex-1 space-y-2.5">
        {p.features?.map((f) => (
          <li key={f} className="flex gap-2 text-sm text-ink">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> {f}
          </li>
        ))}
      </ul>
      <div className="mt-7 space-y-2">
        <Link href={`/contact?package=${encodeURIComponent(p.name)}`} className={cn("w-full", p.highlighted ? "btn-primary" : "btn-outline")}>
          Book this package
        </Link>
        {p.brochure?.url && (
          <a href={p.brochure.url} target="_blank" rel="noreferrer" className="btn-ghost w-full text-brand-600">
            <FileDown className="h-4 w-4" /> Download brochure
          </a>
        )}
      </div>
    </div>
  );
}

export function Stars({ n = 5 }: { n?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn("h-4 w-4", i < n ? "fill-gold text-gold" : "text-gray-300")} />
      ))}
    </div>
  );
}

export function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line">
      <Stars n={t.rating ?? 5} />
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink">&ldquo;{t.message}&rdquo;</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        {t.avatar?.url ? (
          <Image src={t.avatar.url} alt={t.name} width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">{t.name[0]}</span>
        )}
        <div>
          <p className="font-bold text-ink">{t.name}</p>
          <p className="text-xs text-muted">{[t.eventType, t.location].filter(Boolean).join(" · ")}</p>
        </div>
      </figcaption>
    </figure>
  );
}
