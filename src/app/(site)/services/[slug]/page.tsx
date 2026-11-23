import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Phone } from "lucide-react";
import Gallery from "@/components/site/Gallery";
import InquiryForm from "@/components/site/InquiryForm";
import { PageBanner, SectionHeading, ServiceCard } from "@/components/site/ui";
import { getServiceBySlug, getServices, getSettings } from "@/lib/data";
import { formatINR } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = await getServiceBySlug(slug);
  return s ? { title: s.title, description: s.shortDescription } : { title: "Service not found" };
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const [service, settings, all] = await Promise.all([getServiceBySlug(slug), getSettings(), getServices()]);
  if (!service) notFound();
  const related = all.filter((x) => x._id !== service._id).slice(0, 3);

  return (
    <>
      <PageBanner title={service.title} subtitle={service.shortDescription} image={service.coverImage?.url} />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-[1fr_400px]">
        <div>
          <p className="section-kicker">{service.category}</p>
          <h2 className="font-display mt-2 text-3xl text-ink">About this service</h2>
          {service.description && (
            <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted">
              {service.description.split(/\n+/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}

          {service.features?.length > 0 && (
            <>
              <h3 className="mt-10 text-xl font-bold text-ink">What&apos;s included</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {service.features.map((f) => (
                  <li key={f} className="flex gap-3 rounded-lg bg-blush p-3 text-sm text-ink">
                    <Check className="h-5 w-5 shrink-0 text-brand-500" /> {f}
                  </li>
                ))}
              </ul>
            </>
          )}

          {service.gallery?.length > 0 && (
            <div className="mt-12">
              <h3 className="mb-5 text-xl font-bold text-ink">Gallery</h3>
              <Gallery images={service.gallery} title={service.title} />
            </div>
          )}
          {!service.gallery?.length && service.coverImage?.url && (
            <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl">
              <Image src={service.coverImage.url} alt={service.title} fill sizes="(max-width:1024px) 100vw, 60vw" className="object-cover" />
            </div>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl bg-brand-500 p-6 text-white">
            <p className="text-sm text-brand-100">Starting at</p>
            <p className="text-3xl font-black">{service.startingPrice ? formatINR(service.startingPrice) : "On request"}</p>
            {service.priceUnit && <p className="text-sm text-brand-100">{service.priceUnit}</p>}
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="btn mt-5 w-full bg-white text-brand-600 hover:bg-brand-50">
                <Phone className="h-4 w-4" /> Call {settings.phone}
              </a>
            )}
          </div>
          <InquiryForm cities={settings.cities} compact defaults={{ message: `I am interested in ${service.title}.` }} />
        </aside>
      </section>

      {related.length > 0 && (
        <section className="bg-blush py-14">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading kicker="You may also like" title="Other services" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((s) => (
                <ServiceCard key={s._id} s={s} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/services" className="btn-outline">All services</Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
