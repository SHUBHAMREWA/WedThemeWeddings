import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageBanner, SectionHeading, TestimonialCard } from "@/components/site/ui";
import { getGear, getSettings, getTestimonials } from "@/lib/data";
import { IMG } from "@/lib/demo";

export const metadata: Metadata = { title: "About us" };

const STEPS = [
  ["Say hello", "Tell us your dates, venues and the vibe you want."],
  ["Plan together", "We visit or video-call to plan shots, timelines and crew."],
  ["Shoot day", "Our crew arrives early with backup gear and a shot list."],
  ["Delivery", "Sneak peek in 48 hours, then the full gallery, films and album."],
];

export default async function AboutPage() {
  const [s, testimonials, gear] = await Promise.all([getSettings(), getTestimonials(), getGear()]);
  return (
    <>
      <PageBanner title="About us" subtitle={s.tagline} image={`https://images.unsplash.com/photo-${IMG.shooter}?auto=format&fit=crop&w=1800&q=80`} />

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-2">
        <div>
          <SectionHeading center={false} kicker="Our story" title={s.aboutTitle} />
          <div className="space-y-4 text-[15px] leading-relaxed text-muted">
            {s.aboutText.split(/\n+/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              [s.statEvents, "Events"],
              [s.statCities, "Cities"],
              [s.statYears, "Years"],
              [s.statRating, "Rating"],
            ].map(([v, l]) =>
              v ? (
                <div key={l} className="rounded-xl bg-blush p-4 text-center">
                  <p className="font-display text-2xl text-brand-500">{v}</p>
                  <p className="text-xs font-bold uppercase text-muted">{l}</p>
                </div>
              ) : null
            )}
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
          {s.aboutImage?.url && <Image src={s.aboutImage.url} alt="Our team" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />}
        </div>
      </section>

      <section className="bg-blush py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading kicker="How it works" title="From first call to final film" />
          <ol className="grid gap-6 md:grid-cols-4">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="rounded-2xl bg-white p-6 ring-1 ring-line">
                <span className="font-display text-4xl text-brand-300">0{i + 1}</span>
                <p className="mt-2 text-lg font-bold text-ink">{t}</p>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {gear.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <SectionHeading kicker="Equipment" title="The gear we bring" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gear.map((g) => (
              <div key={g._id} className="flex gap-4 rounded-xl p-4 ring-1 ring-line">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-brand-50">
                  {g.image?.url && <Image src={g.image.url} alt={g.name} fill sizes="96px" className="object-cover" />}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-brand-500">{g.category}</p>
                  <p className="font-bold text-ink">{g.name}</p>
                  {g.description && <p className="text-sm text-muted">{g.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="bg-blush py-16">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading kicker="Reviews" title="Kind words from our clients" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <TestimonialCard key={t._id} t={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="font-display text-3xl text-ink">Let&apos;s create something beautiful</h2>
        <Link href="/contact" className="btn-primary mt-6">Talk to us</Link>
      </section>
    </>
  );
}
