import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Clapperboard, Clock, HeartHandshake, Plane, ShieldCheck } from "lucide-react";
import HeroSlider from "@/components/site/HeroSlider";
import InquiryForm from "@/components/site/InquiryForm";
import { AlbumCard, PackageCard, SectionHeading, ServiceCard, TestimonialCard } from "@/components/site/ui";
import { getAlbums, getGear, getPackages, getServices, getSettings, getTestimonials } from "@/lib/data";
import { IMG } from "@/lib/demo";

const fallback = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

// Category tiles, WedMeGood-style. Images are replaced by the latest album of that type when available.
const CATEGORIES = [
  { label: "Wedding", sub: "Candid & traditional", img: fallback(IMG.indian1) },
  { label: "Pre-Wedding", sub: "Couple shoots & films", img: fallback(IMG.couple1) },
  { label: "Haldi & Mehendi", sub: "Colourful rituals", img: fallback(IMG.haldi) },
  { label: "Engagement", sub: "Ring ceremony", img: fallback(IMG.rings) },
  { label: "Birthday", sub: "Kids & milestones", img: fallback(IMG.birthday) },
  { label: "Corporate Event", sub: "Conferences & launches", img: fallback(IMG.corporate) },
];

const WHY = [
  { icon: Camera, title: "Candid storytellers", text: "Natural moments, real emotions, no stiff poses." },
  { icon: Clapperboard, title: "Cinema-grade films", text: "Full-frame cinema cameras, gimbals and licensed music." },
  { icon: Plane, title: "Licensed drone pilots", text: "Safe, permitted aerial shots of venues and processions." },
  { icon: Clock, title: "Fast delivery", text: "Sneak peek in 48 hours, full gallery in 3 to 4 weeks." },
  { icon: ShieldCheck, title: "Double backup", text: "Dual card recording and cloud backup of every frame." },
  { icon: HeartHandshake, title: "Transparent pricing", text: "Clear packages, no hidden charges on the day." },
];

export default async function HomePage() {
  const [s, services, albums, packages, testimonials, gear] = await Promise.all([
    getSettings(),
    getServices({ featured: true, limit: 6 }),
    getAlbums({ featured: true, limit: 6 }),
    getPackages(),
    getTestimonials(),
    getGear(),
  ]);

  const heroImages = (s.heroImages || []).map((m) => m.url).filter(Boolean);
  const categories = CATEGORIES.map((c) => {
    const a = albums.find((x) => x.eventType === c.label && x.coverImage?.url);
    return { ...c, img: a?.coverImage?.url || c.img };
  });

  const stats = [
    [s.statEvents, "Events shot"],
    [s.statCities, "Cities covered"],
    [s.statYears, "Years of experience"],
    [s.statRating, "Client rating"],
  ].filter(([v]) => v);

  return (
    <>
      <HeroSlider images={heroImages} title={s.heroTitle} subtitle={s.heroSubtitle} cities={s.cities || []} />

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <SectionHeading kicker="Browse by event" title="What are you celebrating?" subtitle="From intimate engagements to three-day destination weddings, we photograph and film it all." />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link key={c.label} href={`/portfolio?type=${encodeURIComponent(c.label)}`} className="group text-center">
              <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-full ring-4 ring-brand-50 transition group-hover:ring-brand-200">
                <Image src={c.img} alt={c.label} fill sizes="(max-width:768px) 50vw, 16vw" className="object-cover transition duration-700 group-hover:scale-110" />
              </div>
              <p className="mt-3 font-bold text-ink group-hover:text-brand-500">{c.label}</p>
              <p className="text-xs text-muted">{c.sub}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Services */}
      {services.length > 0 && (
        <section className="bg-blush py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading kicker="Our services" title="Photography, films and aerial coverage" subtitle="Pick a single service or combine them into a complete package for your event." />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((sv) => (
                <ServiceCard key={sv._id} s={sv} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/services" className="btn-outline">
                View all services <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      {stats.length > 0 && (
        <section className="bg-brand-500 py-12 text-white">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 text-center md:grid-cols-4">
            {stats.map(([v, l]) => (
              <div key={l}>
                <p className="font-display text-4xl md:text-5xl">{v}</p>
                <p className="mt-1 text-sm font-bold uppercase tracking-wider text-brand-100">{l}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Portfolio */}
      {albums.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <SectionHeading kicker="Portfolio" title="Recent stories we have told" subtitle="A few of our favourite weddings and events. Click an album to see the full gallery and film." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((a) => (
              <AlbumCard key={a._id} a={a} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/portfolio" className="btn-primary">
              Explore full portfolio <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Why us */}
      <section className="bg-blush py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl lg:aspect-[5/6]">
            {s.aboutImage?.url && <Image src={s.aboutImage.url} alt="Our crew at work" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />}
            <div className="absolute bottom-5 left-5 rounded-xl bg-white/95 p-4 shadow-lg">
              <p className="font-display text-3xl text-brand-500">{s.statYears || "10+"}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">years behind the lens</p>
            </div>
          </div>
          <div>
            <SectionHeading center={false} kicker="Why WedTheme" title={s.aboutTitle} subtitle={s.aboutText} />
            <div className="grid gap-5 sm:grid-cols-2">
              {WHY.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand-500 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold text-ink">{title}</p>
                    <p className="text-sm text-muted">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gear */}
      {gear.length > 0 && (
        <section className="bg-[#1f1f23] py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading light kicker="Our gear" title="Drones, cinema cameras and more" subtitle="Professional equipment, always backed up, so every frame looks as good as the moment felt." />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gear.slice(0, 6).map((g) => (
                <div key={g._id} className="group overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {g.image?.url && <Image src={g.image.url} alt={g.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover opacity-90 transition duration-700 group-hover:scale-105" />}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-300">{g.category}</p>
                    <h3 className="mt-1 text-lg font-bold text-white">{g.name}</h3>
                    {g.description && <p className="mt-1 text-sm text-gray-400">{g.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Packages */}
      {packages.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <SectionHeading kicker="Packages" title="Simple, transparent pricing" subtitle="Every package can be customised. Tell us your dates and we will tailor a quote." />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packages.slice(0, 3).map((p) => (
              <PackageCard key={p._id} p={p} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/packages" className="btn-outline">
              Compare all packages <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-blush py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading kicker="Love notes" title="What our couples say" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {testimonials.slice(0, 4).map((t) => (
                <TestimonialCard key={t._id} t={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA + form */}
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-800" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2">
          <div className="text-white">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-100">Dates fill up fast</p>
            <h2 className="font-display mt-3 text-4xl md:text-5xl">Check availability for your date</h2>
            <p className="mt-4 max-w-lg text-brand-50">
              Share a few details and our team will call you back with availability, ideas and a custom quote. No obligation.
            </p>
            {s.phone && (
              <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="mt-8 inline-block text-2xl font-black">
                {s.phone}
              </a>
            )}
          </div>
          <InquiryForm cities={s.cities} compact />
        </div>
      </section>
    </>
  );
}
